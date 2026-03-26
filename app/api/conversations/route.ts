import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getWorkspaceState } from "@/lib/workspace";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceState(session.user.id);
  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

  return NextResponse.json({
    conversation: workspace.activeConversation,
    conversations: workspace.conversations,
    messages: workspace.messages,
    usage: workspace.usage,
    plan: dbUser?.plan ?? "free",
  });
}
