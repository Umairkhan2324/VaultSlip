"use client";
import { LineItemRow } from "./LineItemRow";
import { AddLineItemButton } from "./AddLineItemButton";

type ReceiptItem = {
  id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  subtotal?: number;
};

type LineItemsEditorProps = {
  items: ReceiptItem[];
  onItemUpdate: (index: number, updates: Partial<ReceiptItem>) => void;
  onItemDelete: (index: number) => void;
  onItemAdd: (item: ReceiptItem) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
};

export function LineItemsEditor({
  items,
  onItemUpdate,
  onItemDelete,
  onItemAdd,
  onDragStart,
  onDragOver,
  onDrop,
}: LineItemsEditorProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-2">Line items</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <LineItemRow
            key={item.id || i}
            item={item}
            index={i}
            onUpdate={onItemUpdate}
            onDelete={onItemDelete}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
        ))}
      </ul>
      <AddLineItemButton onAdd={onItemAdd} />
    </div>
  );
}
