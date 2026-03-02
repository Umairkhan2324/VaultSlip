"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type SaveTemplateDialogProps = {
  onSave: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
};

export function SaveTemplateDialog({ onSave, onCancel, loading }: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit() {
    if (!name.trim()) return;
    await onSave(name.trim(), description.trim());
  }

  return (
    <Card className="p-3 space-y-2">
      <input
        type="text"
        placeholder="Template name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
        autoFocus
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSubmit} disabled={loading || !name.trim()} className="text-xs">
          Save
        </Button>
        <Button variant="secondary" onClick={onCancel} className="text-xs">
          Cancel
        </Button>
      </div>
    </Card>
  );
}
