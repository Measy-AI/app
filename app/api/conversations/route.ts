import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWorkspaceState } from "@/lib/workspace";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getWorkspaceState(session.user.id);

  return NextResponse.json({
    conversation: workspace.activeConversation,
    conversations: workspace.conversations,
    messages: workspace.messages,
  });
}
