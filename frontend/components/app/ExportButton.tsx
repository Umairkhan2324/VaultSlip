"use client";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { getBackendUrl } from "@/lib/api";

function parseExportError(text: string): string {
  try {
    const p = JSON.parse(text) as { detail?: string };
    return typeof p?.detail === "string" ? p.detail : text?.trim() || "Export failed";
  } catch {
    return text?.trim() || "Export failed";
  }
}

export default function ExportButton() {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${getBackendUrl()}/receipts/export?format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error(parseExportError(await r.text()));
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "receipts.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      <button
        onClick={handleExport}
        disabled={loading}
        className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
      >
        {loading ? "Exporting…" : "Export CSV"}
      </button>
    </div>
  );
}
