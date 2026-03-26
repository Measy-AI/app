"use client";

import Link from "next/link";
import {
  type ComponentPropsWithoutRef,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, toProxyUrl } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";
import { 
  Zap, 
  History, 
  PlusSquare, 
  Trash2, 
  User, 
  Settings, 
  CreditCard,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  Copy,
  Check
} from "lucide-react";
import Editor from "@monaco-editor/react";

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

type CoreVariantKey = "gemini" | "gpt";
type ProVariantKey = "claude" | "gpt" | "gemini";

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

type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
  conversationId: string | null;
};

type DashboardWorkspaceProps = {
  initialConversation: ConversationItem | null;
  initialConversations: ConversationItem[];
  initialMessages: MessageItem[];
  initialUsage: UsageItem;
  userName: string;
  userImage?: string | null;
  plan: string;
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

const MODELS = {
  core: {
    label: "Measy Core",
    caption: "Maximum speed",
  },
  pro: {
    label: "Measy Pro",
    caption: "Premium reasoning",
  },
} as const;

const CORE_VARIANTS: Record<CoreVariantKey, { label: string }> = {
  gemini: { label: "Gemini 3 Flash" },
  gpt: { label: "ChatGPT 5 Mini" },
};

const PRO_VARIANTS: Record<ProVariantKey, { label: string }> = {
  gemini: { label: "Gemini 3.1 Pro" },
  gpt: { label: "ChatGPT 5.4" },
  claude: { label: "Claude Sonnet 4.6" },
};

function CodeBlock({ value, language }: { value: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = value.split("\n").length;
  // Dynamic height capped at 600px
  const height = Math.min(Math.max(lineCount * 22 + 45, 100), 600);

  return (
    <div className="relative group/code my-10 rounded-2xl border border-white/10 bg-[#0d0d0e] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Visual Indicator Track */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/20 z-10 group-hover/code:bg-accent/40 transition-colors"></div>
      
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.03] bg-[#0d0d0e]">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5 opacity-60">
            <div className="size-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]"></div>
            <div className="size-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
            <div className="size-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 px-3 py-1.5 transition-colors group-hover/code:bg-white/[0.08]">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent2 underline decoration-accent/20 underline-offset-4">
              {language || "source.md"}
            </span>
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          className={cn(
            "p-2 px-3 rounded-xl transition-all flex items-center gap-2 active:scale-90",
            copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-white/5 hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/5"
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div style={{ height: `${height}px` }} className="pl-1 p-2 bg-[#0d0d0e] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a2a4a_0%,_transparent_100%)] opacity-10 pointer-events-none"></div>
        <Editor
          height="100%"
          language={language || "markdown"}
          value={value}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            renderLineHighlight: "all",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
            fontWeight: "500",
            lineHeight: 22,
            padding: { top: 20, bottom: 20 },
            folding: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            domReadOnly: true,
            cursorStyle: "line",
            contextmenu: false,
            smoothScrolling: true,
            fixedOverflowWidgets: true,
          }}
        />
      </div>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-sm leading-8 text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mb-4 mt-8 font-display text-2xl font-bold tracking-tight text-white" {...props} />,
          h2: (props) => <h2 className="mb-3 mt-6 font-display text-xl font-bold tracking-tight text-white" {...props} />,
          h3: (props) => <h3 className="mb-2 mt-4 font-display text-lg font-bold tracking-tight text-white" {...props} />,
          p: (props) => <div className="mb-4 last:mb-0 text-zinc-200" {...props} />,
          ul: (props) => <ul className="mb-4 list-disc space-y-2 pl-6" {...props} />,
          ol: (props) => <ol className="mb-4 list-decimal space-y-2 pl-6" {...props} />,
          li: (props) => <li className="marker:text-accent2" {...props} />,
          code: ({ inline, className, children, ...props }: MarkdownCodeProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : undefined;
            const codeString = String(children).replace(/\n$/, "");

            return inline ? (
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-accent2 font-mono" {...props}>
                {children}
              </code>
            ) : (
              <CodeBlock value={codeString} language={lang} />
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: (props) => (
            <blockquote className="my-4 border-l-2 border-accent/50 pl-4 text-zinc-300 italic" {...props} />
          ),
          a: (props) => <a className="text-accent2 underline decoration-accent/40 underline-offset-4 hover:decoration-accent2 transition-all" {...props} />,
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
  userImage,
  plan,
}: DashboardWorkspaceProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [usage, setUsage] = useState(initialUsage);
  const [selectedModel, setSelectedModel] = useState<"core" | "pro">("core");
  const [coreVariant, setCoreVariant] = useState<CoreVariantKey>("gemini");
  const [proVariant, setProVariant] = useState<ProVariantKey>("gemini");
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    conversationId: null,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, activeConversation]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return conversations;
    }

    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(term));
  }, [conversations, search]);

  const proLocked = plan !== "pro" && usage.proRemaining <= 0;

  useEffect(() => {
    if (!contextMenu.open) {
      return;
    }

    const closeMenu = () => {
      setContextMenu({
        open: false,
        x: 0,
        y: 0,
        conversationId: null,
      });
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [contextMenu.open]);

  function closeConversationMenu() {
    setContextMenu({
      open: false,
      x: 0,
      y: 0,
      conversationId: null,
    });
  }

  function getMenuPosition(x: number, y: number) {
    const menuWidth = 196;
    const menuHeight = 108;
    const maxX = window.innerWidth - menuWidth - 10;
    const maxY = window.innerHeight - menuHeight - 10;

    return {
      x: Math.max(10, Math.min(x, maxX)),
      y: Math.max(10, Math.min(y, maxY)),
    };
  }

  function openConversationMenu(event: ReactMouseEvent<HTMLElement>, conversationId: string) {
    event.preventDefault();
    event.stopPropagation();
    const position = getMenuPosition(event.clientX + 2, event.clientY + 2);
    setContextMenu({
      open: true,
      x: position.x,
      y: position.y,
      conversationId,
    });
  }

  async function deleteConversation(conversationId: string) {
    closeConversationMenu();
    setError(null);
    setIsThinking(false);

    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: "DELETE",
    });

    const payload = (await response.json().catch(() => ({}))) as WorkspacePayload & { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to delete conversation.");
      return;
    }

    setActiveConversation(payload.conversation);
    setConversations(payload.conversations);
    setMessages(payload.messages);
    setUsage(payload.usage);
  }

  async function loadConversation(conversationId: string) {
    setError(null);
    setIsThinking(false);
    closeConversationMenu();

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

    if (selectedModel === "pro" && plan !== "pro") {
      setUsage((prev) => ({
        ...prev,
        proUsed: Math.min(prev.proLimit, prev.proUsed + 1),
        proRemaining: Math.max(0, prev.proRemaining - 1),
      }));
    }

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
            variant: selectedModel === "pro" ? proVariant : coreVariant,
            conversationId: activeConversation?.id,
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
    closeConversationMenu();
  }

  return (
    <main className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0fcc] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-accent2 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] group-hover:scale-105 transition-transform">
                <Sparkles className="size-4 text-white" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                Measy<span className="text-primary italic">AI</span>
              </h1>
            </Link>
            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
            <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500">
              Workspace v3
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link 
              href="/dashboard/lagacy" 
              className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
            >
              <History className="size-3.5" />
              Legacy Mode
            </Link>
            
            <Link 
              href="/buy" 
              className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
            >
              <CreditCard className="size-3.5" />
              Upgrade
            </Link>

            <div className="h-6 w-px bg-white/10 hidden sm:block mx-1"></div>

            <div className={cn(
              "flex items-center h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border shadow-inner",
              plan === "pro" 
                ? "bg-accent/10 border-accent/20 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]" 
                : "bg-white/5 border-white/10 text-zinc-400"
            )}>
              {plan === "pro" ? <Zap className="size-3 mr-1.5 fill-accent/20" /> : null}
              {plan}
            </div>

            <Link href="/settings" className="group relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent2 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <div className="size-10 rounded-xl ring-2 ring-white/10 group-hover:ring-primary/40 transition-all bg-[#0d1117] border border-white/5 overflow-hidden flex items-center justify-center p-0.5 shadow-2xl">
                {userImage ? (
                  <img src={toProxyUrl(userImage)} alt={userName} className="size-full rounded-lg object-cover" />
                ) : (
                  <div className="bg-primary/20 text-primary font-black uppercase text-sm size-full flex items-center justify-center rounded-lg">
                    {userName[0]}
                  </div>
                ) }
              </div>
            </Link>

            <SignOutButton className="hidden sm:flex" />
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
                  <div
                    key={conversation.id}
                    className={`w-full rounded-xl border p-3 text-left transition ${isActive
                        ? "border-accent/40 bg-accent/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    onContextMenu={(event) => openConversationMenu(event, conversation.id)}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => void loadConversation(conversation.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium text-zinc-100">{conversation.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">{toTimeLabel(conversation.updatedAt)}</p>
                      </button>
                      <div className="flex items-center gap-1">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${conversation.modelKey === "pro"
                              ? "border border-accent/30 bg-accent/10 text-accent2"
                              : "border border-white/10 bg-white/[0.03] text-zinc-400"
                            }`}
                        >
                          {conversation.modelKey}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => openConversationMenu(event, conversation.id)}
                          className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
                        >
                          ...
                        </button>
                      </div>
                    </div>
                  </div>
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
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${isSelected
                            ? "border-accent/50 bg-accent/15 text-accent2"
                            : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {MODELS[modelKey].label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(selectedModel === "pro" ? Object.entries(PRO_VARIANTS) : Object.entries(CORE_VARIANTS)).map(([key, data]) => {
                  const isActive = selectedModel === "pro" ? proVariant === key : coreVariant === key;
                  return (
                    <button
                      key={key}
                      onClick={() => selectedModel === "pro" ? setProVariant(key as ProVariantKey) : setCoreVariant(key as CoreVariantKey)}
                      className={cn(
                        "group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                        isActive
                          ? "bg-accent/10 border-accent2/50 text-white"
                          : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "size-1.5 rounded-full transition-all duration-300",
                        isActive ? "bg-accent shadow-[0_0_8px_rgba(255,255,0,0.5)]" : "bg-zinc-700"
                      )} />
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest">{data.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
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
                      className={`max-w-[80%] rounded-2xl border p-4 ${message.role === "user"
                          ? "ml-auto border-white/20 bg-white/[0.06] text-right"
                          : message.isError
                            ? "mr-auto border-rose-400/40 bg-rose-500/10"
                            : "mr-auto border-white/10 bg-black/20"
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "size-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center shrink-0",
                          message.role === "assistant" ? "bg-accent/20" : "bg-white/5"
                        )}>
                          {message.role === "user" ? (
                            userImage ? (
                              <img src={toProxyUrl(userImage)} alt={userName} className="size-full object-cover" />
                            ) : (
                              <div className="text-[10px] font-black">{userName[0]}</div>
                            )
                          ) : (
                            <div className="text-[10px] font-black text-accent2">AI</div>
                          )}
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                          {message.role === "user" ? userName : "MeasyAI"}
                        </p>
                      </div>
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
      {contextMenu.open && contextMenu.conversationId ? (
        <div className="fixed inset-0 z-[80]" onClick={closeConversationMenu}>
          <div
            className="glass absolute w-48 rounded-xl border border-white/15 p-1 shadow-xl"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => void loadConversation(contextMenu.conversationId!)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/10"
            >
              Open chat
            </button>
            <button
              type="button"
              onClick={() => void deleteConversation(contextMenu.conversationId!)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/15"
            >
              Delete chat
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
