"use client";
import { Badge } from "@/components/ui/Badge";
import { EditableField } from "./EditableField";

type ReceiptHeaderProps = {
  vendor: string;
  date: string;
  confidence: number | null | undefined;
  needsReview: boolean;
  onVendorChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

export function ReceiptHeader({
  vendor,
  date,
  confidence,
  needsReview,
  onVendorChange,
  onDateChange,
}: ReceiptHeaderProps) {
  const confidenceText = confidence != null ? `${(confidence * 100).toFixed(0)}%` : "—";
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <EditableField value={vendor} onSave={onVendorChange} placeholder="Vendor name" className="text-xl font-semibold" />
        <EditableField value={date} onSave={onDateChange} placeholder="Date" className="text-xs text-slate-500" />
      </div>
      <div className="flex flex-col items-end gap-1">
        {needsReview && <Badge variant="warning">Needs review</Badge>}
        <span className="text-xs text-slate-500">Confidence: {confidenceText}</span>
      </div>
    </div>
  );
}
