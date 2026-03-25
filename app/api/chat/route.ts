import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getModelConfig,
  getCoreVariantConfig,
  getProVariantConfig,
  isModelKey,
  isProVariantKey,
  type ModelKey,
  type ProVariantKey,
} from "@/lib/models";
import { conversation, message, user } from "@/lib/schema";
import {
  createConversation,
  deriveConversationTitle,
  getWorkspaceState,
  incrementUsage,
} from "@/lib/workspace";

export const maxDuration = 30;

function createOpenRouterProvider() {
  const appUrl = process.env.OPENROUTER_HTTP_REFERER ?? process.env.NEXT_PUBLIC_APP_URL;
  const appTitle = process.env.OPENROUTER_APP_TITLE ?? "MeasyAI";

  return createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    headers: {
      ...(appUrl ? { "HTTP-Referer": appUrl } : {}),
      ...(appTitle ? { "X-Title": appTitle } : {}),
    },
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is missing" }, { status: 500 });
  }

  const payload = (await request.json()) as {
    prompt?: string;
    modelKey?: string;
    variant?: string;
    proVariant?: string;
    conversationId?: string;
  };

  if (!payload.prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const modelKey: ModelKey = isModelKey(payload.modelKey) ? payload.modelKey : "core";
  const variant = payload.variant || payload.proVariant;
  
  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const workspace = await getWorkspaceState(session.user.id);

  if (modelKey === "pro" && dbUser?.plan !== "pro" && workspace.usage.proRemaining <= 0) {
    return NextResponse.json(
      {
        error: "Daily Pro limit reached. Upgrade to unlock more premium chats.",
        upgradeRequired: true,
        usage: workspace.usage,
      },
      { status: 402 },
    );
  }

  const trimmedPrompt = payload.prompt.trim();
  let activeConversationId = payload.conversationId;

  if (!activeConversationId) {
    const created = await createConversation(
      session.user.id,
      deriveConversationTitle(trimmedPrompt),
      modelKey,
    );
    activeConversationId = created.id;
  }

  // Insert user message
  await db.insert(message).values({
    conversationId: activeConversationId,
    role: "user",
    content: trimmedPrompt,
    createdAt: new Date(),
  });

  // Fetch full message history for the AI
  const history = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, activeConversationId))
    .orderBy(message.createdAt);

  const isPro = modelKey === "pro" && dbUser?.plan === "pro";
  let selectedEngine: string;
  let selectedSystemPrompt: string;

  if (isPro) {
    const config = getProVariantConfig(variant);
    selectedEngine = config.engine;
    selectedSystemPrompt = config.systemPrompt;
  } else {
    const config = getCoreVariantConfig(variant);
    selectedEngine = config.engine;
    selectedSystemPrompt = config.systemPrompt;
  }

  const openrouter = createOpenRouterProvider();

  const result = await generateText({
    model: openrouter(selectedEngine),
    system: selectedSystemPrompt,
    maxTokens: 4000,
    messages: history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content || "",
    })),
  });

  // Insert AI message
  const assistantMsg = {
    conversationId: activeConversationId!,
    role: "assistant",
    content: result.text,
    createdAt: new Date(),
  };
  await db.insert(message).values(assistantMsg);

  // Final record update
  const isNewConversation = !payload.conversationId;
  let updatedTitle: string | null = null;

  if (isNewConversation) {
    try {
      const { text: aiTitle } = await generateText({
        model: openrouter("openai/gpt-4o-mini"),
        system: "Generate a catchy, very short (max 3 words) chat title. Match the user's language (e.g. German if he peaks German). DONT use robotic phrases like 'Assistance Request' or 'User Inquiry'. Be brief and creative. No quotes.",
        messages: [
          { role: "user", content: trimmedPrompt },
          { role: "assistant", content: result.text }
        ],
        maxTokens: 15,
      });

      if (aiTitle && aiTitle.trim().length > 2) {
        updatedTitle = aiTitle.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      console.error("AI Title Gen Failure:", e);
    }
  }

  await db
    .update(conversation)
    .set({ 
      updatedAt: new Date(),
      ...(updatedTitle ? { title: updatedTitle } : {})
    })
    .where(eq(conversation.id, activeConversationId!));

  if (modelKey === "pro" && dbUser?.plan !== "pro") {
    await incrementUsage(session.user.id, "pro");
  }

  const nextWorkspace = await getWorkspaceState(session.user.id, activeConversationId);

  return NextResponse.json({
    conversation: nextWorkspace.activeConversation,
    conversations: nextWorkspace.conversations,
    messages: nextWorkspace.messages,
    usage: nextWorkspace.usage,
  });
}
