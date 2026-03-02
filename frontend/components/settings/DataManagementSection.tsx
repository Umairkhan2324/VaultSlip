"use client";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { requestDataExport, deleteAccount } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function DataManagementSection() {
  const { token } = useSession();
  const router = useRouter();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportUrl, setExportUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState("");

  async function handleExport() {
    setExportLoading(true);
    setError("");
    try {
      const data = await requestDataExport(token, { format: "ZIP" });
      setExportUrl(data.download_url);
      window.open(data.download_url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export data");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDelete() {
    if (password.trim() === "") {
      setError("Password is required");
      return;
    }
    setDeleteLoading(true);
    setError("");
    try {
      await deleteAccount(token, { password });
      router.push("/sign-in");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account");
      setDeleteLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-3">Export all your receipts and data in a single archive.</p>
          {exportUrl && <Alert variant="success" title="Export Ready"><a href={exportUrl} className="underline">Download your export</a></Alert>}
          <Button variant="secondary" className="w-full" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? "Exporting..." : "Export all data"}
          </Button>
        </div>
        <div className="border-t border-emerald-100 pt-4">
          {!showDeleteConfirm ? (
            <>
              <p className="text-sm text-slate-600 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <Button variant="ghost" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setShowDeleteConfirm(true)}>
                Delete account
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Type your password to confirm deletion:</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              {error && <Alert variant="error" title="Error">{error}</Alert>}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => { setShowDeleteConfirm(false); setPassword(""); }}>Cancel</Button>
                <Button variant="ghost" className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
