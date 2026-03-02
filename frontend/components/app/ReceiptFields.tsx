"use client";
import { EditableField } from "./EditableField";

type ReceiptFieldsProps = {
  currency: string;
  total: number | null | undefined;
  category: string;
  onCurrencyChange: (value: string) => void;
  onTotalChange: (value: number) => void;
  onCategoryChange: (value: string) => void;
};

export function ReceiptFields({
  currency,
  total,
  category,
  onCurrencyChange,
  onTotalChange,
  onCategoryChange,
}: ReceiptFieldsProps) {
  return (
    <dl className="grid gap-2 text-sm">
      <div>
        <dt className="font-medium text-slate-500">Total</dt>
        <dd className="flex items-center gap-2">
          <EditableField value={currency} onSave={onCurrencyChange} placeholder="USD" className="w-16" />
          <EditableField value={total?.toString()} onSave={(v) => onTotalChange(Number(v) || 0)} placeholder="0.00" className="tabular-nums" />
        </dd>
      </div>
      <div>
        <dt className="font-medium text-slate-500">Category</dt>
        <dd>
          <EditableField value={category} onSave={onCategoryChange} placeholder="Category" />
        </dd>
      </div>
    </dl>
  );
}
