"use client";

import Link from "next/link";
import {
  type ComponentPropsWithoutRef,
  type FormEvent,
  type KeyboardEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SignOutButton } from "@/components/sign-out-button";

type ConversationItem = {
  id: string;
  title: string;
  modelKey: "core" | "pro";
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
};

type MessageItem = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  isError?: boolean;
};

type ProVariantKey = "claude" | "gpt";

type UsageItem = {
  proUsed: number;
  proRemaining: number;
  proLimit: number;
};

type WorkspacePayload = {
  conversation: ConversationItem | null;
  conversations: ConversationItem[];
  messages: MessageItem[];
  usage: UsageItem;
};

type DashboardWorkspaceProps = {
  initialConversation: ConversationItem | null;
  initialConversations: ConversationItem[];
  initialMessages: MessageItem[];
  initialUsage: UsageItem;
  userName: string;
  plan: string;
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

const MODELS = {
  core: {
    label: "Measy Core",
    caption: "Fast everyday model",
  },
  pro: {
    label: "Measy Pro",
    caption: "Premium reasoning",
  },
} as const;

const PRO_VARIANTS: Record<ProVariantKey, { label: string }> = {
  claude: { label: "Claude" },
  gpt: { label: "GPT" },
};

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-sm leading-7 text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mb-3 mt-5 font-display text-2xl font-bold tracking-tight" {...props} />,
          h2: (props) => <h2 className="mb-3 mt-5 font-display text-xl font-bold tracking-tight" {...props} />,
          h3: (props) => <h3 className="mb-2 mt-4 font-display text-lg font-bold tracking-tight" {...props} />,
          p: (props) => <p className="mb-3 last:mb-0 text-zinc-200" {...props} />,
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

function toTimeLabel(value: string) {
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ThinkingBubble() {
  return (
    <article className="mr-auto max-w-[80%] rounded-2xl border border-accent/25 bg-accent/10 p-4">
      <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-accent2">MeasyAI</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:240ms]" />
        <span className="ml-1 text-xs uppercase tracking-[0.12em] text-zinc-300">Thinking...</span>
      </div>
    </article>
  );
}

export function DashboardWorkspace({
  initialConversation,
  initialConversations,
  initialMessages,
  initialUsage,
  userName,
  plan,
}: DashboardWorkspaceProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [usage, setUsage] = useState(initialUsage);
  const [selectedModel, setSelectedModel] = useState<"core" | "pro">(initialConversation?.modelKey ?? "core");
  const [proVariant, setProVariant] = useState<ProVariantKey>("claude");
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return conversations;
    }

    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(term));
  }, [conversations, search]);

  const proLocked = plan !== "pro" && usage.proRemaining <= 0;

  async function loadConversation(conversationId: string) {
    setError(null);
    setIsThinking(false);

    const response = await fetch(`/api/conversations/${conversationId}`);

    if (!response.ok) {
      setError("Unable to load the selected chat.");
      return;
    }

    const payload = (await response.json()) as WorkspacePayload;
    setActiveConversation(payload.conversation);
    setConversations(payload.conversations);
    setMessages(payload.messages);
    setUsage(payload.usage);

    if (payload.conversation?.modelKey) {
      setSelectedModel(payload.conversation.modelKey);
    }
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    if (selectedModel === "pro" && proLocked) {
      setError("Your daily Measy Pro limit is exhausted. Upgrade to keep using premium prompts.");
      return;
    }

    const content = prompt.trim();
    const localUserMessage: MessageItem = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setPrompt("");
    setError(null);
    setActiveConversation(null);
    setMessages([localUserMessage]);
    setIsThinking(true);

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: content,
            modelKey: selectedModel,
            proVariant,
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as WorkspacePayload & {
          error?: string;
          usage?: UsageItem;
        };

        if (!response.ok) {
          if (payload.usage) {
            setUsage(payload.usage);
          }

          const errorMessage = payload.error ?? "The model could not respond right now.";

          setMessages((previous) => [
            ...previous,
            {
              id: `local-ai-error-${Date.now()}`,
              role: "assistant",
              content: errorMessage,
              createdAt: new Date().toISOString(),
              isError: true,
            },
          ]);
          setError(errorMessage);
          return;
        }

        setActiveConversation(payload.conversation);
        setConversations(payload.conversations);
        setMessages(payload.messages);
        setUsage(payload.usage);
        setError(null);
        if (payload.conversation?.modelKey) {
          setSelectedModel(payload.conversation.modelKey);
        }
      } catch {
        const errorMessage = "Network error. Please try again.";
        setMessages((previous) => [
          ...previous,
          {
            id: `local-ai-error-${Date.now()}`,
            role: "assistant",
            content: errorMessage,
            createdAt: new Date().toISOString(),
            isError: true,
          },
        ]);
        setError(errorMessage);
      } finally {
        setIsThinking(false);
      }
    });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function resetComposer() {
    setActiveConversation(null);
    setMessages([]);
    setError(null);
    setIsThinking(false);
  }

  return (
    <main className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0fcc] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl font-bold tracking-tight">
              MeasyAI
            </Link>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-accent2">
              Workspace
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/buy" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
              Upgrade
            </Link>
            <span className="rounded-md border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-zinc-300">
              {plan}
            </span>
            <SignOutButton className="rounded-md border-white/15 px-3 py-2 text-xs" />
          </div>
        </div>
      </header>

      <section className="hero-grid px-4 pb-8 pt-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1400px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="glass flex h-[calc(100vh-7.5rem)] flex-col rounded-2xl">
            <div className="border-b border-white/10 p-4">
              <button
                type="button"
                onClick={resetComposer}
                className="mb-3 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-glow"
              >
                New Chat
              </button>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search chats..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-zinc-500">
                <span>Chat history</span>
                <span>{filteredConversations.length}</span>
              </div>
              {filteredConversations.length === 0 ? (
                <p className="pt-8 text-center text-sm italic text-zinc-500">No chats found.</p>
              ) : null}
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversation?.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void loadConversation(conversation.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-accent/40 bg-accent/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-zinc-100">{conversation.title}</p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                          conversation.modelKey === "pro"
                            ? "border border-accent/30 bg-accent/10 text-accent2"
                            : "border border-white/10 bg-white/[0.03] text-zinc-400"
                        }`}
                      >
                        {conversation.modelKey}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{toTimeLabel(conversation.updatedAt)}</p>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-accent2">Pro model gate</p>
                <p className="mt-2 text-sm text-zinc-200">
                  {plan === "pro"
                    ? "Unlimited Measy Pro access unlocked."
                    : `${usage.proRemaining}/${usage.proLimit} Pro messages left today.`}
                </p>
                <Link href="/buy" className="mt-3 inline-flex rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white">
                  Upgrade now
                </Link>
              </div>
            </div>
          </aside>

          <section className="glass flex h-[calc(100vh-7.5rem)] flex-col rounded-2xl">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold tracking-tight">
                    {activeConversation ? activeConversation.title : "Ready for your prompt"}
                  </p>
                  <p className="text-xs text-zinc-500">User: {userName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(["core", "pro"] as const).map((modelKey) => {
                    const isSelected = selectedModel === modelKey;
                    const isDisabled = modelKey === "pro" && proLocked;

                    return (
                      <button
                        key={modelKey}
                        type="button"
                        onClick={() => setSelectedModel(modelKey)}
                        disabled={isDisabled}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          isSelected
                            ? "border-accent/50 bg-accent/15 text-accent2"
                            : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {MODELS[modelKey].label}
                      </button>
                    );
                  })}
                  {plan === "pro" && selectedModel === "pro" ? (
                    <select
                      value={proVariant}
                      onChange={(event) => setProVariant(event.target.value as ProVariantKey)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 outline-none ring-accent transition focus:ring-2"
                    >
                      {(Object.keys(PRO_VARIANTS) as ProVariantKey[]).map((variant) => (
                        <option key={variant} value={variant} className="bg-[#14151a] text-zinc-100">
                          {PRO_VARIANTS[variant].label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.length === 0 ? (
                <div className="mx-auto mt-24 max-w-lg text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-sm font-bold text-accent2">
                    AI
                  </div>
                  <p className="font-display text-2xl font-bold tracking-tight">Start a new chat</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Pick a model, send a prompt, and we will open a fresh conversation automatically.
                  </p>
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`max-w-[80%] rounded-2xl border p-4 ${
                        message.role === "user"
                          ? "ml-auto border-white/20 bg-white/[0.06] text-right"
                          : message.isError
                            ? "mr-auto border-rose-400/40 bg-rose-500/10"
                            : "mr-auto border-white/10 bg-black/20"
                      }`}
                    >
                      <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                        {message.role === "user" ? "User" : "MeasyAI"}
                      </p>
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-100">{message.content}</p>
                      ) : message.isError ? (
                        <p className="whitespace-pre-wrap text-sm leading-7 text-rose-200">{message.content}</p>
                      ) : (
                        <MarkdownMessage content={message.content} />
                      )}
                    </article>
                  ))}
                  {isThinking ? <ThinkingBubble /> : null}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4 sm:p-5">
              <form onSubmit={submitPrompt}>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Message MeasyAI..."
                  className="mb-3 min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">
                    {selectedModel === "pro"
                      ? plan === "pro"
                        ? `Unlimited premium tier active (${PRO_VARIANTS[proVariant].label}).`
                        : `${usage.proRemaining} premium messages left today.`
                      : MODELS.core.caption}
                  </p>
                  <button
                    type="submit"
                    disabled={isPending || !prompt.trim() || (selectedModel === "pro" && proLocked)}
                    className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-[#6aa0f8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Sending..." : selectedModel === "pro" && proLocked ? "Upgrade required" : "Send"}
                  </button>
                </div>
              </form>
              {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
