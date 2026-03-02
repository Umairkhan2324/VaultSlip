"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LineItemsEditor } from "./LineItemsEditor";
import { ReceiptHeader } from "./ReceiptHeader";
import { ReceiptFields } from "./ReceiptFields";
import { useDragReorder } from "./useDragReorder";
import { updateReceipt, updateReceiptItems } from "@/lib/api";

type ReceiptItem = {
  id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  subtotal?: number;
};

export type EditableReceiptCanvasProps = {
  id: string;
  vendor?: string | null;
  date?: string | null;
  total?: number | null;
  currency?: string | null;
  category?: string | null;
  confidence?: number | null;
  image_url?: string | null;
  needs_review?: boolean;
  items?: ReceiptItem[];
};

export function EditableReceiptCanvas({
  id,
  vendor: initialVendor,
  date: initialDate,
  total: initialTotal,
  currency: initialCurrency,
  category: initialCategory,
  confidence,
  image_url: _image_url,
  needs_review,
  items: initialItems,
}: EditableReceiptCanvasProps) {
  const { token } = useSession();
  const [vendor, setVendor] = useState(initialVendor || "");
  const [date, setDate] = useState(initialDate || "");
  const [total, setTotal] = useState(initialTotal);
  const [currency, setCurrency] = useState(initialCurrency || "");
  const [category, setCategory] = useState(initialCategory || "");
  const [items, setItems] = useState<ReceiptItem[]>(initialItems || []);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const { handleDragStart, handleDragOver, handleDrop } = useDragReorder(items, setItems);

  useEffect(() => {
    setVendor(initialVendor || "");
    setDate(initialDate || "");
    setTotal(initialTotal);
    setCurrency(initialCurrency || "");
    setCategory(initialCategory || "");
    setItems(initialItems || []);
  }, [initialVendor, initialDate, initialTotal, initialCurrency, initialCategory, initialItems]);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("saving");
    setSaveError("");
    try {
      await updateReceipt(token, id, { vendor, date, category, total: total ?? undefined, currency });
      await updateReceiptItems(token, id, items);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setSaveStatus("error");
      setSaveError(e instanceof Error ? e.message : "Error saving");
    } finally {
      setSaving(false);
    }
  }

  function handleItemUpdate(index: number, updates: Partial<ReceiptItem>) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }

  function handleItemDelete(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleItemAdd(item: ReceiptItem) {
    setItems((prev) => [...prev, item]);
  }

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg space-y-4">
        <ReceiptHeader
          vendor={vendor}
          date={date}
          confidence={confidence}
          needsReview={needs_review || false}
          onVendorChange={setVendor}
          onDateChange={setDate}
        />
        <ReceiptFields
          currency={currency}
          total={total}
          category={category}
          onCurrencyChange={setCurrency}
          onTotalChange={setTotal}
          onCategoryChange={setCategory}
        />
        <LineItemsEditor
          items={items}
          onItemUpdate={handleItemUpdate}
          onItemDelete={handleItemDelete}
          onItemAdd={handleItemAdd}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
          {saveError && <p className="text-xs text-red-600" role="alert">{saveError}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Error saving" : saveStatus === "saving" ? "Saving..." : ""}
            </span>
          <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm">
            {saving ? "Saving..." : "Save changes"}
          </Button>
          </div>
        </div>
    </Card>
  );
}
