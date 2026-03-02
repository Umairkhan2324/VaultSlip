"use client";
import { useState } from "react";
import { EditableField } from "./EditableField";

type LineItem = {
  id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  subtotal?: number;
};

type LineItemRowProps = {
  item: LineItem;
  index: number;
  onUpdate: (index: number, updates: Partial<LineItem>) => void;
  onDelete: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
};

export function LineItemRow({
  item,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: LineItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  function handleSave(field: keyof LineItem, value: string | number) {
    const updates: Partial<LineItem> = { [field]: value };
    if (field === "quantity" || field === "unit_price") {
      const qty = field === "quantity" ? Number(value) : localItem.quantity ?? 1;
      const price = field === "unit_price" ? Number(value) : localItem.unit_price ?? 0;
      updates.subtotal = qty * price;
    }
    setLocalItem((prev) => ({ ...prev, ...updates }));
    onUpdate(index, updates);
    setIsEditing(false);
  }

  return (
    <li
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
      className="group flex items-center gap-2 rounded border border-transparent bg-slate-50/50 p-2 hover:border-slate-200 hover:bg-slate-100/80"
    >
      <span className="cursor-move text-slate-400 group-hover:text-slate-600">⋮⋮</span>
      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
        <EditableField
          value={localItem.description}
          onSave={(v) => handleSave("description", v)}
          placeholder="Item description"
        />
        <div className="flex gap-1">
          <EditableField
            value={localItem.quantity?.toString()}
            onSave={(v) => handleSave("quantity", Number(v) || 0)}
            placeholder="Qty"
            className="w-16"
          />
          <span className="px-1">×</span>
          <EditableField
            value={localItem.unit_price?.toString()}
            onSave={(v) => handleSave("unit_price", Number(v) || 0)}
            placeholder="Price"
            className="w-20"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="tabular-nums text-slate-700">
            {localItem.subtotal != null ? localItem.subtotal.toFixed(2) : "—"}
          </span>
          <button
            onClick={() => onDelete(index)}
            className="ml-2 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
