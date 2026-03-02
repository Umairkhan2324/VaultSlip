import { getServerSession } from "@/lib/session";
import { getChatHistory, getMe } from "@/lib/api";
import ChatPanel from "@/components/app/ChatPanel";
import TierGuard from "@/components/app/TierGuard";

export default async function ChatPage() {
  const { token } = await getServerSession();
  const me = await getMe(token).catch(() => ({ plan: "free" }));
  const canChat = (me.plan ?? "free") !== "free";
  const history = canChat ? await getChatHistory(token).catch(() => ({ messages: [] })) : { messages: [] };
  const initialHistory = (history.messages ?? []) as { role: string; content: string }[];

  return (
    <div className="space-y-6">
      <header className="animate-float-up rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-50/90 px-5 py-6 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Chat</h1>
          <p className="text-sm text-slate-600">
            Ask about your receipts: spending by category, top vendors, or receipts that need review.
          </p>
        </div>
      </header>
      <TierGuard feature="chat" plan={me.plan ?? "free"}>
        <ChatPanel initialHistory={initialHistory} />
      </TierGuard>
    </div>
  );
}
