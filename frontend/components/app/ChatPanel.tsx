"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { postChat } from "@/lib/api";

type Message = { role: string; content: string };

export default function ChatPanel({ initialHistory }: { initialHistory?: Message[] }) {
  const { token } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialHistory ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const data = await postChat(token, msg);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-emerald-700/50 bg-slate-900/70 shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Ask about your receipts: e.g. &quot;What did I spend on food last month?&quot; or &quot;Summarize my spending.&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] rounded-2xl bg-emerald-500 px-3 py-2 text-sm text-emerald-950 shadow-lg shadow-emerald-500/40"
                : "max-w-[80%] rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-50 border border-slate-700/70"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="inline-flex items-center gap-2 max-w-[80%] rounded-2xl bg-slate-800/80 px-3 py-2 text-sm text-slate-200 border border-slate-700/70">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/70 animate-pulse [animation-delay:120ms]" />
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/40 animate-pulse [animation-delay:240ms]" />
            <span className="ml-2">Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-slate-800/70 bg-slate-950/40 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your receipts…"
            className="flex-1 rounded-xl border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            maxLength={2000}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 shadow-md shadow-emerald-500/40 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400 disabled:opacity-60"
          >
            Send
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
