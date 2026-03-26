import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { PRO_DAILY_LIMIT, getModelConfig, type ModelKey } from "@/lib/models";
import { conversation, dailyUsage, message } from "@/lib/schema";

export type ConversationRecord = typeof conversation.$inferSelect;
export type MessageRecord = typeof message.$inferSelect;

export function deriveConversationTitle(input: string) {
  const cleaned = input.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "New Chat";
  }

  const normalized = cleaned
    .replace(/^[#>\-\d\.\)\s]+/, "")
    .replace(/[?!.,;:]+$/, "")
    .trim();

  const firstSegment = normalized.split(/[.!?]/)[0]?.trim() || normalized;
  const concise = firstSegment.length > 56 ? `${firstSegment.slice(0, 53).trim()}...` : firstSegment;

  return concise || "New chat";
}

export async function createConversation(userId: string, title = "New chat", modelKey: ModelKey = "core") {
  const now = new Date();
  const modelConfig = getModelConfig(modelKey);
  const [created] = await db
    .insert(conversation)
    .values({
      userId,
      title,
      modelKey,
      systemPrompt: modelConfig.systemPrompt,
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

export async function deleteConversationById(userId: string, conversationId: string) {
  const deleted = await db
    .delete(conversation)
    .where(and(eq(conversation.id, conversationId), eq(conversation.userId, userId)))
    .returning({ id: conversation.id });

  return deleted.length > 0;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function incrementUsage(userId: string, modelKey: ModelKey) {
  const now = new Date();
  const dateKey = getTodayKey();

  await db
    .insert(dailyUsage)
    .values({
      userId,
      dateKey,
      modelKey,
      count: 1,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [dailyUsage.userId, dailyUsage.dateKey, dailyUsage.modelKey],
      set: {
        count: sql`${dailyUsage.count} + 1`,
        updatedAt: now,
      },
    });
}

export async function getUsageSummary(userId: string) {
  const dateKey = getTodayKey();
  const usageRows = await db
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.dateKey, dateKey)));

  const proUsed = usageRows.find((item) => item.modelKey === "pro")?.count ?? 0;

  return {
    proUsed,
    proRemaining: Math.max(0, PRO_DAILY_LIMIT - proUsed),
    proLimit: PRO_DAILY_LIMIT,
  };
}

export async function getWorkspaceState(userId: string, requestedConversationId?: string | null) {
  const conversations = await listConversations(userId);
  const activeConversation =
    (requestedConversationId ? conversations.find((item) => item.id === requestedConversationId) : null) ?? null;
  const messages = activeConversation ? await getConversationMessages(activeConversation.id) : [];
  const usage = await getUsageSummary(userId);

  return {
    conversations,
    activeConversation,
    messages,
    usage,
  };
}
