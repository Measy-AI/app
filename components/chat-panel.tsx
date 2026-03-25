"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  const canSubmit = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-4 font-display text-2xl font-bold">AI Playground</h2>
      <div className="mb-4 h-[360px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">Ask anything to test your Vercel AI SDK route.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-lg bg-white/5 p-3 text-sm">
              <p className="mb-1 text-xs uppercase tracking-[0.12em] text-accent2">{message.role}</p>
              <p className="text-zinc-100">{message.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask MeasyAI..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}
