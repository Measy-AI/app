import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getModelConfig, isModelKey, type ModelKey } from "@/lib/models";
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
  };

  if (!payload.prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const modelKey: ModelKey = isModelKey(payload.modelKey) ? payload.modelKey : "core";
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
  const createdConversation = await createConversation(
    session.user.id,
    deriveConversationTitle(trimmedPrompt),
    modelKey,
  );

  await db.insert(message).values({
    conversationId: createdConversation.id,
    role: "user",
    content: trimmedPrompt,
    createdAt: new Date(),
  });

  const modelConfig = getModelConfig(modelKey);
  const openrouter = createOpenRouterProvider();

  const result = await generateText({
    model: openrouter(modelConfig.engine),
    system: modelConfig.systemPrompt,
    messages: [
      {
        role: "user",
        content: trimmedPrompt,
      },
    ],
  });

  await db.insert(message).values({
    conversationId: createdConversation.id,
    role: "assistant",
    content: result.text,
    createdAt: new Date(),
  });

  await db
    .update(conversation)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(conversation.id, createdConversation.id));

  if (modelKey === "pro" && dbUser?.plan !== "pro") {
    await incrementUsage(session.user.id, "pro");
  }

  const nextWorkspace = await getWorkspaceState(session.user.id, createdConversation.id);

  return NextResponse.json({
    conversation: nextWorkspace.activeConversation,
    conversations: nextWorkspace.conversations,
    messages: nextWorkspace.messages,
    usage: nextWorkspace.usage,
  });
}
