import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteConversationById, getConversationById, getWorkspaceState } from "@/lib/workspace";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (error) {
    console.error("CONVERSATION_GET_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (error) {
    console.error("CONVERSATION_DELETE_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
