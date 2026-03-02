import { useState } from "react";

export function useDragReorder<T>(items: T[], onReorder: (items: T[]) => void) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const next = [...items];
    const [removed] = next.splice(draggedIndex, 1);
    next.splice(dropIndex, 0, removed);
    onReorder(next);
    setDraggedIndex(null);
  }

  return { handleDragStart, handleDragOver, handleDrop };
}
