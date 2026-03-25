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
  Layers
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
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
    module: "Measy Gemini",
    online: "ONLINE",
    terminate: "TERMINATE",
    logout: "Log out",
    awaiting: "READY FOR INPUT",
    neural: "Gemini is initialized and ready",
    placeholder: "Message Gemini...",
    latency: "High-speed access",
    sandboxed: "Secure environment",
    engine: "Gemini 3.1 Pro",
    online_status: "ONLINE",
    processing: "NovaGPT is thinking..."
  }
};

// --- Components ---

function ChatMessage({ role, content, avatar }: { role: string; content: string; avatar?: string }) {
  const isAssistant = role === "assistant";
  
  return (
    <div className={cn(
      "flex w-full gap-4 px-4 py-8 transition-all group",
      isAssistant ? "bg-white/[0.02]" : "bg-transparent"
    )}>
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "size-10 rounded-2xl flex items-center justify-center border transition-all ring-offset-black group-hover:ring-2",
          isAssistant 
            ? "bg-primary/20 border-primary/40 text-primary ring-primary/20" 
            : "bg-zinc-800/50 border-white/5 text-zinc-400 ring-white/10"
        )}>
          {avatar ? (
            <img src={avatar} alt="Avatar" className="size-full rounded-2xl object-cover" />
          ) : (
            isAssistant ? <Cpu className="size-5" /> : <div className="text-xs font-black">USER</div>
          )}
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            isAssistant ? "text-primary" : "text-zinc-500"
          )}>
            {isAssistant ? "Measy Assistant" : "Authorized User"}
          </span>
          <span className="text-[8px] text-white/10 uppercase tracking-widest">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="text-sm leading-7 text-zinc-100/90 font-medium">
          {isAssistant ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
             <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
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
    
    setMessages(prev => [...prev, { role: "user", content: currentInput || (currentFiles.length > 0 ? "[Media Attached]" : "") }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentInput, 
          modelKey: selectedModel,
          variant: selectedModel === "pro" ? proVariant : coreVariant,
          conversationId: activeSessionId
        })
      });

      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const lastMsg = data.messages[data.messages.length - 1];
        setMessages(prev => [...prev, { role: "assistant", content: lastMsg.content }]);
        
        if (data.conversations) setSessions(data.conversations);
        if (data.conversation?.id) setActiveSessionId(data.conversation.id);
      }
    } catch (e) {
      console.error("Failed to send message", e);
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
              Core
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
                  <img src={userProfile.image} alt="Profile" className="size-full object-cover" />
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
