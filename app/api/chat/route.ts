import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversation, message } from "@/lib/schema";
import {
  DEFAULT_SYSTEM_PROMPT,
  createConversation,
  deriveConversationTitle,
  getConversationMessages,
  getWorkspaceState,
} from "@/lib/workspace";

export const maxDuration = 30;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
  }

  const payload = (await request.json()) as {
    prompt?: string;
  };

  if (!payload.prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const trimmedPrompt = payload.prompt.trim();
  const createdConversation = await createConversation(session.user.id, deriveConversationTitle(trimmedPrompt));

  await db.insert(message).values({
    conversationId: createdConversation.id,
    role: "user",
    content: trimmedPrompt,
    createdAt: new Date(),
  });

  const result = await generateText({
    model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
    system: createdConversation.systemPrompt || DEFAULT_SYSTEM_PROMPT,
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

  const workspace = await getWorkspaceState(session.user.id, createdConversation.id);

  return NextResponse.json({
    conversation: workspace.activeConversation,
    conversations: workspace.conversations,
    messages: workspace.messages,
  });
}
