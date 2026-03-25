"use client";

import { type ComponentPropsWithoutRef, type FormEvent, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ConversationItem = {
  id: string;
  title: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
};

type MessageItem = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type WorkspacePayload = {
  conversation: ConversationItem | null;
  conversations: ConversationItem[];
  messages: MessageItem[];
};

type DashboardWorkspaceProps = {
  initialConversation: ConversationItem | null;
  initialConversations: ConversationItem[];
  initialMessages: MessageItem[];
  userName: string;
  plan: string;
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="markdown-body text-sm leading-7 text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mb-3 mt-5 font-display text-2xl font-bold tracking-tight" {...props} />,
          h2: (props) => <h2 className="mb-3 mt-5 font-display text-xl font-bold tracking-tight" {...props} />,
          h3: (props) => <h3 className="mb-2 mt-4 font-display text-lg font-bold tracking-tight" {...props} />,
          p: (props) => <p className="mb-3 last:mb-0" {...props} />,
          ul: (props) => <ul className="mb-3 list-disc space-y-2 pl-5" {...props} />,
          ol: (props) => <ol className="mb-3 list-decimal space-y-2 pl-5" {...props} />,
          li: (props) => <li className="marker:text-accent2" {...props} />,
          code: ({ inline, className, children, ...props }: MarkdownCodeProps) =>
            inline ? (
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-accent2" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            ),
          pre: (props) => (
            <pre className="mb-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="mb-3 border-l-2 border-accent/50 pl-4 text-zinc-300" {...props} />
          ),
          a: (props) => <a className="text-accent2 underline decoration-accent/40 underline-offset-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function DashboardWorkspace({
  initialConversation,
  initialConversations,
  initialMessages,
  userName,
  plan,
}: DashboardWorkspaceProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadConversation(conversationId: string) {
    setError(null);

    const response = await fetch(`/api/conversations/${conversationId}`);

    if (!response.ok) {
      setError("Unable to load the selected chat.");
      return;
    }

    const payload = (await response.json()) as WorkspacePayload;
    setActiveConversation(payload.conversation);
    setConversations(payload.conversations);
    setMessages(payload.messages);
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    const content = prompt;
    setPrompt("");
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
        }),
      });

      if (!response.ok) {
        setError("The model could not respond right now.");
        return;
      }

      const payload = (await response.json()) as WorkspacePayload;
      setActiveConversation(payload.conversation);
      setConversations(payload.conversations);
      setMessages(payload.messages);
    });
  }

  function resetComposer() {
    setActiveConversation(null);
    setMessages([]);
    setError(null);
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1480px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="glass rounded-[28px] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-accent2/80">Workspace</p>
              <h1 className="font-display text-2xl font-bold tracking-tight">MeasyAI</h1>
            </div>
            <button
              onClick={resetComposer}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
            >
              Fresh
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Operator</p>
            <p className="mt-2 text-lg font-semibold text-white">{userName}</p>
            <p className="text-sm text-zinc-400">Plan: {plan}</p>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Chats</p>
            <p className="text-xs text-zinc-600">{conversations.length}</p>
          </div>

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-500">
                Your saved chats will appear here.
              </div>
            ) : null}

            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversation?.id;

              return (
                <button
                  key={conversation.id}
                  onClick={() => void loadConversation(conversation.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-accent/50 bg-accent/10 shadow-[0_0_0_1px_rgba(79,142,247,0.2)]"
                      : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="truncate text-sm font-medium text-white">{conversation.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(conversation.updatedAt).toLocaleString([], {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="glass flex min-h-[calc(100vh-2rem)] flex-col rounded-[28px] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))]">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-accent2/80">Chat</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-white">
                  {activeConversation?.title ?? "Start a new chat"}
                </h2>
                <p className="text-sm text-zinc-400">
                  Every prompt starts a fresh saved conversation. Open any thread from the sidebar to revisit it.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                {isPending ? "Thinking..." : "Ready"}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-2xl rounded-[28px] border border-dashed border-white/10 bg-black/20 p-10 text-center">
                <p className="text-[11px] uppercase tracking-[0.24em] text-accent2/80">Blank chat</p>
                <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">Prompt the AI</h3>
                <p className="mt-3 text-sm text-zinc-400">
                  Send a message below and MeasyAI will create a new thread, name it from your prompt, and save it to the sidebar.
                </p>
              </div>
            ) : null}

            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-3xl rounded-[24px] border px-5 py-4 ${
                  message.role === "user"
                    ? "ml-auto border-accent/30 bg-accent/10 text-right"
                    : "mr-auto border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                  {message.role === "user" ? "You" : "MeasyAI"}
                </p>
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-100">{message.content}</p>
                ) : (
                  <MarkdownMessage content={message.content} />
                )}
              </article>
            ))}
          </div>

          <div className="border-t border-white/10 px-6 py-5">
            <form onSubmit={submitPrompt} className="rounded-[28px] border border-white/10 bg-black/30 p-3">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask MeasyAI anything. This will create a new saved chat..."
                className="min-h-[110px] w-full resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />
              <div className="flex items-center justify-between border-t border-white/10 px-3 pt-3">
                <p className="text-xs text-zinc-500">Responses are rendered in markdown. Chats save automatically.</p>
                <button
                  type="submit"
                  disabled={isPending || !prompt.trim()}
                  className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
                >
                  Start chat
                </button>
              </div>
            </form>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
