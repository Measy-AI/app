import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isModelKey, type ModelKey } from "@/lib/models";
import { user } from "@/lib/schema";
import { getWorkspaceState } from "@/lib/workspace";

function toConversationClientModel(item: {
  id: string;
  title: string;
  modelKey: string;
  systemPrompt: string;
  createdAt: Date;
  updatedAt: Date;
} | null) {
  if (!item) {
    return null;
  }

  return {
    ...item,
    modelKey: (isModelKey(item.modelKey) ? item.modelKey : "core") as ModelKey,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function toMessageClientModel(item: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
  };
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const workspace = await getWorkspaceState(session.user.id);

  return (
    <DashboardWorkspace
      initialConversation={toConversationClientModel(workspace.activeConversation)}
      initialConversations={workspace.conversations.map((item) => ({
        ...item,
        modelKey: (isModelKey(item.modelKey) ? item.modelKey : "core") as ModelKey,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }))}
      initialMessages={workspace.messages.map(toMessageClientModel)}
      initialUsage={workspace.usage}
      userName={session.user.name}
      plan={dbUser?.plan ?? "free"}
    />
  );
}
