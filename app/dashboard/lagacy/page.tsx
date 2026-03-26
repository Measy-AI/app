"use client";

import { useState, useEffect, useMemo, useRef, type FormEvent, type KeyboardEvent } from "react";
import {
  Cpu,
  Power,
  PlusSquare,
  Image as ImageIcon,
  Globe,
  ArrowUpRight,
  Zap,
  ShieldAlert,
  Code2,
  X,
  File as FileIcon,
  Search,
  MessageSquare,
  Trash2,
  ChevronDown,
  Layers,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { cn, toProxyUrl } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import Editor from "@monaco-editor/react";
import { uploadChatImage } from "@/lib/actions/upload";
import { toast } from "sonner";
import remarkGfm from "remark-gfm";

// Translations
const t = {
  sidebar: {
    newSession: "New Chat",
    search: "Search chats...",
    history: "Chat History",
    settings: "Settings",
    noNodes: "No chats found",
    defaultTitle: "New Chat"
  },
  chat: {
    online: "ONLINE",
    module: "Measy Core",
    terminate: "TERMINATE",
    logout: "Log out",
    awaiting: "READY FOR INPUT",
    neural: "Measy Core is initialized and ready",
    placeholder: "Message MeasyAI...",
    latency: "High-speed access",
    sandboxed: "Secure environment",
    engine: "Measy Pro",
    online_status: "ONLINE",
    processing: "MeasyAI is thinking..."
  }
};

// --- Components ---

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

function LegacyMarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-sm leading-8 text-zinc-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mb-4 mt-8 font-display text-2xl font-bold tracking-tight text-white" {...props} />,
          h2: (props) => <h2 className="mb-3 mt-6 font-display text-xl font-bold tracking-tight text-white" {...props} />,
          h3: (props) => <h3 className="mb-2 mt-4 font-display text-lg font-bold tracking-tight text-white" {...props} />,
          p: (props) => <p className="mb-4 last:mb-0 text-zinc-200" {...props} />,
          ul: (props) => <ul className="mb-4 list-disc space-y-2 pl-6" {...props} />,
          ol: (props) => <ol className="mb-4 list-decimal space-y-2 pl-6" {...props} />,
          li: (props) => <li className="marker:text-accent2" {...props} />,
          code: ({ inline, className, children, ...props }: any) => {
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
          table: (props) => <div className="mb-6 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left" {...props} /></div>,
          th: (props) => <th className="bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-white/10" {...props} />,
          td: (props) => <td className="px-4 py-3 text-sm border-b border-white/5" {...props} />,
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

function ChatMessage({ role, content, avatar, name }: { role: string; content: string; avatar?: string; name?: string }) {
  const isAssistant = role === "assistant";

  return (
    <div className={cn(
      "flex w-full gap-5 px-6 py-10 transition-all group border-b border-white/[0.03]",
      isAssistant ? "bg-white/[0.01]" : "bg-transparent"
    )}>
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className={cn(
          "size-12 rounded-2xl flex items-center justify-center border transition-all ring-offset-black group-hover:ring-4",
          isAssistant
            ? "bg-primary/10 border-primary/30 text-primary ring-primary/10 shadow-[0_0_20px_rgba(0,112,243,0.1)]"
            : "bg-zinc-900 border-white/5 text-zinc-500 ring-white/5"
        )}>
          {avatar ? (
            <img src={toProxyUrl(avatar)} alt="Avatar" className="size-full rounded-2xl object-cover" />
          ) : (
            isAssistant ? <Cpu className="size-6 animate-in zoom-in-50 duration-500" /> : <div className="text-[10px] font-black tracking-tighter">USER</div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.3em]",
            isAssistant ? "text-primary" : "text-zinc-500"
          )}>
            {isAssistant ? "MEASY ASSISTANT" : (name || "AUTHORIZED USER")}
          </span>
          <div className="h-1px w-4 bg-white/5"></div>
          <span className="text-[8px] text-white/5 font-black uppercase tracking-[0.4em]">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        {isAssistant ? (
          <LegacyMarkdownMessage content={content} />
        ) : (
          <p className="whitespace-pre-wrap text-[15px] leading-8 text-zinc-100 font-medium">{content}</p>
        )}
      </div>
    </div>
  );
}

function ChatSidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession
}: {
  sessions: any[],
  activeSessionId: string | null,
  onNewChat: () => void,
  onSelectSession: (id: string) => void,
  onDeleteSession: (id: string) => void
}) {
  const [search, setSearch] = useState("");
  const filtered = sessions.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className="w-80 h-full border-r border-white/5 flex flex-col bg-black/20 backdrop-blur-3xl z-30">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]">
            <Cpu className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display font-black text-xs uppercase tracking-[0.3em] italic">Measy<span className="text-primary italic">AI</span></span>
        </div>

        <button
          onClick={onNewChat}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <PlusSquare className="size-4" />
          {t.sidebar.newSession}
        </button>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-3 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.sidebar.search}
            className="w-full h-10 bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 text-[10px] uppercase tracking-widest font-black placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">{t.sidebar.history}</span>
          <span className="size-4 rounded bg-white/5 flex items-center justify-center text-[8px] font-black text-zinc-500">{filtered.length}</span>
        </div>

        {filtered.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer",
              activeSessionId === session.id
                ? "bg-primary/10 border-primary/20 shadow-inner"
                : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
            )}
            onClick={() => onSelectSession(session.id)}
          >
            <div className={cn(
              "size-8 rounded-xl flex items-center justify-center transition-all",
              activeSessionId === session.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-zinc-500"
            )}>
              <MessageSquare className="size-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest truncate",
                activeSessionId === session.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
              )}>
                {session.title || "Untitled Session"}
              </p>
              <p className="text-[8px] text-zinc-600 mt-0.5 font-bold uppercase tracking-widest">
                {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
              className="size-7 rounded-lg bg-red-500/10 text-red-500/60 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-black italic shadow-inner">QP</div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-zinc-100 tracking-widest uppercase">Measy v1.02</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(0,112,243,0.5)]"></span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// --- Main Page ---

export default function LegacyDashboardPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ proUsed: 0, proRemaining: 60, proLimit: 60 });
  const [plan, setPlan] = useState("free");
  const [selectedModel, setSelectedModel] = useState<"core" | "pro">("core");
  const [coreVariant, setCoreVariant] = useState<"gemini" | "gpt">("gemini");
  const [proVariant, setProVariant] = useState<"claude" | "gpt" | "gemini">("gemini");
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = async (sessionId?: string) => {
    try {
      const url = sessionId ? `/api/conversations/${sessionId}` : "/api/conversations";
      const res = await fetch(url);
      const data = await res.json();

      if (sessionId) {
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })));
        }
      } else {
        if (data.conversations) {
          setSessions(data.conversations);
          if (!activeSessionId && data.conversations.length > 0) {
            setActiveSessionId(data.conversations[0].id);
            loadHistory(data.conversations[0].id);
          }
        }
        if (data.usage) setUsage(data.usage);
        if (data.plan) setPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const createNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const selectSession = async (id: string) => {
    setActiveSessionId(id);
    await loadHistory(id);
  };

  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    loadHistory();
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUserProfile(data.user);
      }
    });

    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    if ((!userInput.trim() && attachedFiles.length === 0) || loading) return;

    const currentInput = userInput;
    const currentFiles = attachedFiles;
    setUserInput("");
    setAttachedFiles([]);
    setLoading(true);

    const userMsgPreview = currentInput || (currentFiles.length > 0 ? `[Uploading ${currentFiles.length} files...]` : "");
    setMessages(prev => [...prev, { role: "user", content: userMsgPreview }]);

    if (selectedModel === "pro" && plan !== "pro") {
      setUsage((prev) => ({
        ...prev,
        proUsed: Math.min(prev.proLimit, prev.proUsed + 1),
        proRemaining: Math.max(0, prev.proRemaining - 1),
      }));
    }

    try {
      // Step 1: Initial chat call to ensure we have a conversationId if it's new
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentInput || "[User sent images]", 
          modelKey: selectedModel,
          variant: selectedModel === "pro" ? proVariant : coreVariant,
          conversationId: activeSessionId
        })
      });

      const data = await response.json();
      const chatId = data.conversation?.id || activeSessionId;
      
      if (chatId) {
        if (data.conversation?.id) setActiveSessionId(chatId);
        
        // Step 2: Upload files if any, now that we have a chatId
        if (currentFiles.length > 0) {
          const uploadPromises = currentFiles.map(file => {
            const fd = new FormData();
            fd.append("file", file);
            return uploadChatImage(fd, chatId);
          });
          const uploaded = await Promise.all(uploadPromises);
          const urls = uploaded.map(u => u.url);
          
          // Optionally notify the AI about the images in a follow-up (or skip if first message handled it)
          // For now, let's just show them in UI if possible or just log
          console.log("Uploaded images:", urls);
        }

        if (data.messages && data.messages.length > 0) {
          const lastMsg = data.messages[data.messages.length - 1];
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { role: "user", content: currentInput || "[Media Sent]" };
            return [...next, { role: "assistant", content: lastMsg.content }];
          });

          if (data.conversations) setSessions(data.conversations);
        }
      }
    } catch (e) {
      console.error("Failed to send message", e);
      toast.error("Upload or send failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#080a0c] overflow-hidden selection:bg-primary/20 text-white selection:text-white font-sans">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={createNewChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
      />

      <main className="flex flex-1 flex-col relative justify-between overflow-hidden min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a2a4a_0%,_transparent_100%)] opacity-20 pointer-events-none"></div>

        <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-3xl z-40 shadow-2xl shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={cn(
                "size-2 rounded-full shadow-[0_0_8px_rgba(0,112,243,0.8)] animate-pulse transition-all",
                selectedModel === "pro" ? "bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]" : "bg-primary"
              )}></span>
              <h1 className="text-[11px] font-black tracking-[0.3em] uppercase italic text-white/80">
                {selectedModel === "pro" ? "GEMINI 3.1 PRO" : "GEMINI 3 FLASH"} <span className={cn("italic", selectedModel === "pro" ? "text-accent" : "text-primary")}>{t.chat.online_status}</span>
              </h1>
            </div>
            <span className="text-[8px] text-zinc-500 uppercase tracking-[0.4em] font-bold mt-0.5 whitespace-nowrap">
              {selectedModel === "pro" ? `Neural Engine: ${proVariant.toUpperCase()}` : `Basic Core: ${coreVariant.toUpperCase()}`}
            </span>
          </div>

          <div className="flex items-center bg-black/40 border border-white/5 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setSelectedModel("core")}
              className={cn(
                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                selectedModel === "core" ? "bg-primary/20 text-primary border border-primary/20 shadow-glow" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Zap className="size-3" />
              Measy Core
            </button>
            <div className="h-4 w-px bg-white/5"></div>
            <button
              onClick={() => setSelectedModel("pro")}
              className={cn(
                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                selectedModel === "pro" ? "bg-accent/20 text-accent border border-accent/20" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Cpu className="size-3" />
              Measy Pro
            </button>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5"
            >
              Modern View
            </Link>

            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

            <button onClick={logout} className="group flex items-center gap-2 transition-all hover:scale-105">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[10px] font-black text-white/50 group-hover:text-primary transition-colors tracking-widest uppercase">{t.chat.terminate}</span>
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.4em]">{t.chat.logout}</span>
              </div>
              <div className="size-9 rounded-2xl bg-white/[0.03] hover:bg-destructive/20 border border-white/5 hover:border-destructive/40 flex items-center justify-center transition-all group-hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]">
                <Power className="size-4 text-zinc-500 group-hover:text-destructive transition-all font-bold" />
              </div>
            </button>

            <div className="relative group cursor-help shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <div className="size-10 rounded-2xl ring-2 ring-white/10 hover:ring-primary/40 transition-all bg-[#161b22] border border-white/5 overflow-hidden flex items-center justify-center">
                {userProfile?.image ? (
                  <img src={toProxyUrl(userProfile.image)} alt="Profile" className="size-full object-cover" />
                ) : (
                  <div className="bg-primary/20 text-primary font-black uppercase text-xs size-full flex items-center justify-center">
                    {userProfile?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 w-full min-h-0 bg-transparent overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
          <div className="flex flex-col w-full py-12 px-4 gap-0 max-w-5xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-40">
                <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 backdrop-blur-sm shadow-[0_0_30px_rgba(0,112,243,0.2)]">
                  <Cpu className="size-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xs font-black uppercase tracking-[0.5em] text-primary italic">{t.chat.awaiting}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{t.chat.neural}</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
                  <ChatMessage
                    role={msg.role}
                    content={msg.content}
                    avatar={msg.role === 'user' && userProfile?.image ? userProfile.image : ""}
                    name={msg.role === 'user' ? (userProfile?.name || 'Authorized User') : 'Measy Assistant'}
                  />
                </div>
              ))
            )}

            {loading && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <ChatMessage role="assistant" content={t.chat.processing} />
              </div>
            )}
            <div ref={messagesEndRef} className="h-4 w-full shrink-0"></div>
          </div>
        </div>

        <footer className="p-8 pb-10 bg-gradient-to-t from-[#080a0c] via-[#080a0c]/98 to-transparent relative z-20 shrink-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-20"></div>

          <div className="max-w-4xl mx-auto relative group">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="relative group/file size-16 rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5 flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="preview" className="size-full object-cover" />
                    ) : (
                      <FileIcon className="size-6 text-zinc-500" />
                    )}
                    <button onClick={() => removeFile(i)} className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity hover:bg-red-500">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-20 transition-all duration-1000"></div>

            <div className="relative flex flex-col bg-[#11141a]/90 backdrop-blur-3xl border border-white/5 rounded-3xl p-2.5 transition-all shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/40">
              <div className="flex items-center gap-1.5 px-3 mb-2 pt-1 border-b border-white/5 pb-2 opacity-60 group-focus-within:opacity-100 transition-opacity">
                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="size-7 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-primary flex items-center justify-center transition-colors"
                >
                  <PlusSquare className="size-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="size-7 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-primary flex items-center justify-center transition-colors"
                >
                  <ImageIcon className="size-4" />
                </button>
                <button className="size-7 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-primary flex items-center justify-center transition-colors">
                  <Globe className="size-4" />
                </button>
                <div className="h-4 w-px bg-white/10 mx-1"></div>
                {selectedModel === "pro" ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProviderMenu(!showProviderMenu)}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all group/toggle border border-white/0 hover:border-white/5"
                    >
                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors group-hover/toggle:text-accent flex items-center gap-1.5">
                        <Layers className="size-3" />
                        ENGINE: <span className="text-accent">{proVariant === 'claude' ? 'CLAUDE 4.6' : proVariant === 'gpt' ? 'GPT 5.4' : 'GEMINI 3.1 PRO'}</span>
                        <ChevronDown className={cn("size-3 transition-transform", showProviderMenu && "rotate-180")} />
                      </div>
                    </button>

                    {showProviderMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#11141a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
                        <div className="px-3 py-2 border-b border-white/5 mb-1 text-center">
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Quantum Core Select</span>
                        </div>
                        <button
                          onClick={() => { setProVariant("gemini"); setShowProviderMenu(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            proVariant === "gemini" ? "bg-accent/20 text-accent" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          Gemini 3.1 Pro
                          {proVariant === "gemini" && <div className="size-1 rounded-full bg-accent shadow-[0_0_5px_rgba(var(--accent-rgb),1)]"></div>}
                        </button>
                        <button
                          onClick={() => { setProVariant("gpt"); setShowProviderMenu(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            proVariant === "gpt" ? "bg-accent/20 text-accent" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          ChatGPT 5.4
                          {proVariant === "gpt" && <div className="size-1 rounded-full bg-accent shadow-[0_0_5px_rgba(var(--accent-rgb),1)]"></div>}
                        </button>
                        <button
                          onClick={() => { setProVariant("claude"); setShowProviderMenu(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            proVariant === "claude" ? "bg-accent/20 text-accent" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          Claude Sonnet 4.6
                          {proVariant === "claude" && <div className="size-1 rounded-full bg-accent shadow-[0_0_5px_rgba(var(--accent-rgb),1)]"></div>}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowProviderMenu(!showProviderMenu)}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all group/toggle border border-white/0 hover:border-white/5"
                    >
                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors group-hover/toggle:text-primary flex items-center gap-1.5">
                        <Layers className="size-3" />
                        CORE: <span className="text-primary">{coreVariant === 'gpt' ? 'GPT 5 MINI' : 'GEMINI 3 FLASH'}</span>
                        <ChevronDown className={cn("size-3 transition-transform", showProviderMenu && "rotate-180")} />
                      </div>
                    </button>

                    {showProviderMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#11141a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
                        <div className="px-3 py-2 border-b border-white/5 mb-1 text-center">
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Neural Core Select</span>
                        </div>
                        <button
                          onClick={() => { setCoreVariant("gemini"); setShowProviderMenu(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            coreVariant === "gemini" ? "bg-primary/20 text-primary" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          Gemini 3 Flash
                          {coreVariant === "gemini" && <div className="size-1 rounded-full bg-primary shadow-[0_0_5px_rgba(0,112,243,0.5)]"></div>}
                        </button>
                        <button
                          onClick={() => { setCoreVariant("gpt"); setShowProviderMenu(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            coreVariant === "gpt" ? "bg-primary/20 text-primary" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          ChatGPT 5 Mini
                          {coreVariant === "gpt" && <div className="size-1 rounded-full bg-primary shadow-[0_0_5px_rgba(0,112,243,0.5)]"></div>}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-end gap-3 px-2 pb-1">
                <textarea
                  value={userInput}
                  onKeyDown={handleKeydown}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  placeholder={`Message ${selectedModel === "pro" ? (proVariant === "gemini" ? "Gemini 3.1 Pro" : proVariant === "claude" ? "Claude 4.6" : "ChatGPT 5.4") : (coreVariant === 'gpt' ? 'ChatGPT 5 Mini' : 'Gemini 3 Flash')}...`}
                  className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 shadow-none py-3 text-[15px] font-medium placeholder:text-zinc-600 resize-none max-h-64 h-11 transition-all overflow-hidden focus:outline-none"
                  rows={1}
                ></textarea>

                <button
                  onClick={sendMessage}
                  disabled={(!userInput.trim() && attachedFiles.length === 0) || loading}
                  className={cn(
                    "size-11 rounded-2xl transition-all shadow-xl active:scale-95 shrink-0 flex items-center justify-center",
                    !userInput.trim() && attachedFiles.length === 0 ? "bg-white/[0.04] text-white/20" : "bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(0,112,243,0.3)]",
                    loading && "bg-accent text-white"
                  )}
                >
                  {loading ? (
                    <Cpu className="size-5 animate-spin" />
                  ) : (
                    <ArrowUpRight className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 opacity-30 group-hover:opacity-50 transition-opacity pb-2">
              <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                <Zap className="size-3 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{t.chat.latency}</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                <ShieldAlert className="size-3 text-accent" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{t.chat.sandboxed}</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                <div className="size-1.5 rounded-full bg-primary"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {plan === "pro" ? "Unlimited access" : `${usage.proRemaining} / ${usage.proLimit} Pro Uses`}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 112, 243, 0.2);
        }
      `}</style>
    </div>
  );
}
