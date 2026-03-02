"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { getReceipts } from "@/lib/api";
import { ReceiptCanvasCard } from "./ReceiptCanvasCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const PAGE_SIZE = 100;

type Receipt = {
  id: string;
  vendor?: string | null;
  date?: string | null;
  total?: number | null;
  currency?: string | null;
  category?: string | null;
  confidence?: number | null;
  needs_review?: boolean;
};

export function ReceiptsListClient() {
  const { token } = useSession();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [partialMessage, setPartialMessage] = useState<string | null>(null);

  async function load(skip: number, append: boolean) {
    if (!token) return;
    setError("");
    try {
      const data = await getReceipts(token, skip, PAGE_SIZE);
      const list = (data.items ?? []) as Receipt[];
      setItems((prev) => (append ? [...prev, ...list] : list));
      setHasMore(list.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load receipts");
      if (!append) setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      setLoading(true);
      load(0, false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const onVisibility = () => {
      if (document.visibilityState === "visible") load(0, false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [token]);

  useEffect(() => {
    const partial = searchParams.get("partial");
    const processed = searchParams.get("processed");
    const failed = searchParams.get("failed");
    const reason = searchParams.get("reason");
    if (partial === "1" && failed && Number(failed) > 0) {
      const base = `${processed ?? 0} receipt(s) processed. ${failed} file(s) could not be extracted.`;
      setPartialMessage(reason ? `${base} Reason: ${reason}` : `${base} Check backend logs for details.`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  function handleLoadMore() {
    if (!token || !hasMore) return;
    setLoading(true);
    load(items.length, true);
  }

  if (loading && items.length === 0 && !error) {
    return (
      <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
        <p className="text-sm text-slate-500">Loading receipts…</p>
      </Card>
    );
  }

  if (error && items.length === 0) {
    return (
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
        <Alert variant="error" title="Error">{error}</Alert>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
        <p className="text-sm text-slate-500">
          No receipts yet. Upload some from the dashboard to see them here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {partialMessage && (
        <Alert variant="warning" title="Some files could not be processed">
          {partialMessage}
        </Alert>
      )}
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      {items.map((r) => (
        <ReceiptCanvasCard
          key={r.id}
          id={r.id}
          vendor={r.vendor}
          date={r.date}
          total={r.total}
          currency={r.currency}
          category={r.category}
          confidence={r.confidence}
          needs_review={r.needs_review}
        />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
