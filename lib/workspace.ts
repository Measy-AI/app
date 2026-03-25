import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversation, message } from "@/lib/schema";

export const DEFAULT_SYSTEM_PROMPT =
  "You are MeasyAI, a sharp product copilot. Respond in clean markdown, stay useful, and keep formatting readable.";

export type ConversationRecord = typeof conversation.$inferSelect;
export type MessageRecord = typeof message.$inferSelect;

export function deriveConversationTitle(input: string) {
  const cleaned = input.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "New chat";
  }

  const normalized = cleaned
    .replace(/^[#>\-\d\.\)\s]+/, "")
    .replace(/[?!.,;:]+$/, "")
    .trim();

  const firstSegment = normalized.split(/[.!?]/)[0]?.trim() || normalized;
  const concise = firstSegment.length > 56 ? `${firstSegment.slice(0, 53).trim()}...` : firstSegment;

  return concise || "New chat";
}

export async function createConversation(userId: string, title = "New chat") {
  const now = new Date();
  const [created] = await db
    .insert(conversation)
    .values({
      userId,
      title,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function listConversations(userId: string) {
  return db
    .select()
    .from(conversation)
    .where(eq(conversation.userId, userId))
    .orderBy(desc(conversation.updatedAt));
}

export async function getConversationById(userId: string, conversationId: string) {
  const [record] = await db
    .select()
    .from(conversation)
    .where(and(eq(conversation.id, conversationId), eq(conversation.userId, userId)))
    .limit(1);

  return record ?? null;
}

export async function getConversationMessages(conversationId: string) {
  return db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(asc(message.createdAt));
}

export async function getWorkspaceState(userId: string, requestedConversationId?: string | null) {
  const conversations = await listConversations(userId);
  const activeConversation =
    (requestedConversationId ? conversations.find((item) => item.id === requestedConversationId) : null) ?? null;
  const messages = activeConversation ? await getConversationMessages(activeConversation.id) : [];

  return {
    conversations,
    activeConversation,
    messages,
  };
}
