"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createReceiptTemplate, getReceiptTemplates, applyReceiptTemplate, deleteReceiptTemplate } from "@/lib/api";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { TemplateList } from "./TemplateList";
import type { EditableReceiptCanvasProps } from "./EditableReceiptCanvas";

type Template = {
  id: string;
  name: string;
  description?: string;
  template_data: Record<string, unknown>;
  created_at: string;
};

type ReceiptTemplateManagerProps = {
  receiptId: string;
  receiptData: EditableReceiptCanvasProps;
  onTemplateApplied?: () => void;
};

export function ReceiptTemplateManager({ receiptId, receiptData, onTemplateApplied }: ReceiptTemplateManagerProps) {
  const { token } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await getReceiptTemplates(token);
      setTemplates(data.templates || []);
    } catch {
      setTemplates([]);
    }
  }

  async function handleSaveTemplate(name: string, description: string) {
    setLoading(true);
    setError("");
    try {
      await createReceiptTemplate(token, {
        name,
        description: description || undefined,
        template_data: {
          vendor: receiptData.vendor,
          category: receiptData.category,
          date: receiptData.date,
          total: receiptData.total,
          tax: 0,
          currency: receiptData.currency,
          items: receiptData.items || [],
        },
      });
      setShowSaveDialog(false);
      await loadTemplates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save template");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyTemplate(templateId: string) {
    setLoading(true);
    setError("");
    try {
      await applyReceiptTemplate(token, receiptId, templateId);
      onTemplateApplied?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply template");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    if (!confirm("Delete this template?")) return;
    setError("");
    try {
      await deleteReceiptTemplate(token, templateId);
      await loadTemplates();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete template");
    }
  }

  return (
    <div className="space-y-3">
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Templates</h3>
        <Button variant="secondary" onClick={() => setShowSaveDialog(true)} className="text-xs">
          Save as template
        </Button>
      </div>
      {showSaveDialog && (
        <SaveTemplateDialog onSave={handleSaveTemplate} onCancel={() => setShowSaveDialog(false)} loading={loading} />
      )}
      <TemplateList templates={templates} onApply={handleApplyTemplate} onDelete={handleDeleteTemplate} loading={loading} />
    </div>
  );
}
