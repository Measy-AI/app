import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteConversationById, getConversationById, getWorkspaceState } from "@/lib/workspace";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const currentConversation = await getConversationById(session.user.id, id);

  if (!currentConversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const workspace = await getWorkspaceState(session.user.id, id);

  return NextResponse.json({
    conversation: workspace.activeConversation,
    conversations: workspace.conversations,
    messages: workspace.messages,
    usage: workspace.usage,
  });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteConversationById(session.user.id, id);

  if (!deleted) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const workspace = await getWorkspaceState(session.user.id);

  return NextResponse.json({
    conversation: workspace.activeConversation,
    conversations: workspace.conversations,
    messages: workspace.messages,
    usage: workspace.usage,
  });
}
