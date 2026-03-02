"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { getPreferences, updateExportPreferences } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function ExportPreferencesSection() {
  const { token } = useSession();
  const [format, setFormat] = useState("CSV");
  const [autoExport, setAutoExport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPreferences(token).then((prefs) => {
      setFormat(prefs.default_export_format || "CSV");
      setAutoExport(prefs.auto_export_enabled || false);
    });
  }, [token]);

  async function handleSave() {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await updateExportPreferences(token, {
        default_export_format: format,
        auto_export_enabled: autoExport,
        auto_export_frequency: "weekly",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update preferences");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Export Preferences</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Default export format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          >
            <option>CSV</option>
            <option>JSON</option>
            <option>Excel</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-export"
            checked={autoExport}
            onChange={(e) => setAutoExport(e.target.checked)}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-300"
          />
          <label htmlFor="auto-export" className="text-sm text-slate-700">Auto-export receipts weekly</label>
        </div>
        {error && <Alert variant="error" title="Error">{error}</Alert>}
        {success && <Alert variant="success" title="Success">Preferences saved</Alert>}
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </Card>
  );
}
