"use client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Template = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

type TemplateListProps = {
  templates: Template[];
  onApply: (templateId: string) => Promise<void>;
  onDelete: (templateId: string) => Promise<void>;
  loading: boolean;
};

export function TemplateList({ templates, onApply, onDelete, loading }: TemplateListProps) {
  if (templates.length === 0) {
    return <p className="text-xs text-slate-500">No templates saved yet.</p>;
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <Card key={t.id} className="p-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.name}</p>
              {t.description && <p className="text-xs text-slate-500 truncate">{t.description}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="secondary" onClick={() => onApply(t.id)} disabled={loading} className="text-xs">
                Apply
              </Button>
              <Button variant="ghost" onClick={() => onDelete(t.id)} className="text-xs text-red-600">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
