"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type AddLineItemButtonProps = {
  onAdd: (item: { description: string; quantity?: number; unit_price?: number; subtotal?: number }) => void;
};

export function AddLineItemButton({ onAdd }: AddLineItemButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  function handleSubmit() {
    if (!description.trim()) return;
    const qty = Number(quantity) || 1;
    const price = Number(unitPrice) || 0;
    onAdd({
      description: description.trim(),
      quantity: qty,
      unit_price: price,
      subtotal: qty * price,
    });
    setDescription("");
    setQuantity("1");
    setUnitPrice("");
    setIsAdding(false);
  }

  if (isAdding) {
    return (
      <div className="rounded border border-slate-200 bg-white p-3 space-y-2">
        <input
          type="text"
          placeholder="Item description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Unit price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSubmit} className="text-xs">
            Add
          </Button>
          <Button variant="secondary" onClick={() => setIsAdding(false)} className="text-xs">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={() => setIsAdding(true)} className="w-full text-sm">
      + Add line item
    </Button>
  );
}
