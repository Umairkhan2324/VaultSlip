"use client";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type ReceiptCanvasCardProps = {
  id: string;
  vendor?: string | null;
  date?: string | null;
  total?: number | null;
  currency?: string | null;
  category?: string | null;
  confidence?: number | null;
  needs_review?: boolean;
};

export function ReceiptCanvasCard({
  id,
  vendor,
  date,
  total,
  currency,
  category,
  confidence,
  needs_review,
}: ReceiptCanvasCardProps) {
  const confidenceText = confidence != null ? `${(confidence * 100).toFixed(0)}%` : "—";
  const totalText = total != null ? `${currency ?? ""} ${total}` : "—";

  return (
    <Link href={`/receipts/${id}`}>
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg space-y-4 hover:border-emerald-200 transition-colors block min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{vendor ?? "—"}</p>
            <p className="text-xs text-slate-500">{date ?? "—"}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {needs_review && <Badge variant="warning">Needs review</Badge>}
            <span className="text-xs text-slate-500">Confidence: {confidenceText}</span>
          </div>
        </div>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Total</dt>
            <dd className="tabular-nums text-slate-900">{totalText}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Category</dt>
            <dd>{category ? <Badge>{category}</Badge> : <span className="text-slate-400">—</span>}</dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">View / Edit receipt →</p>
      </Card>
    </Link>
  );
}
