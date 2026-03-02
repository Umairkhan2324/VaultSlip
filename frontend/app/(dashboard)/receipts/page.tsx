import ExportButton from "@/components/app/ExportButton";
import { ReceiptsListClient } from "@/components/app/ReceiptsListClient";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export default async function ReceiptsPage() {
  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 rounded-2xl border-emerald-200/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-50/90 p-4 shadow-xl shadow-emerald-500/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Receipts</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Browse, export, and review all extracted receipts from your workspace.
          </p>
        </div>
        <ExportButton />
      </Card>
      <ReceiptsListClient />
    </div>
  );
}
