"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { getPreferences, updateNotificationPreferences } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function NotificationPreferencesSection() {
  const { token } = useSession();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [processingAlerts, setProcessingAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPreferences(token).then((prefs) => {
      setEmailEnabled(prefs.email_notifications_enabled ?? true);
      setProcessingAlerts(prefs.processing_complete_alerts ?? true);
      setWeeklySummary(prefs.weekly_summary ?? false);
    });
  }, [token]);

  async function handleUpdate() {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await updateNotificationPreferences(token, {
        email_notifications_enabled: emailEnabled,
        processing_complete_alerts: processingAlerts,
        weekly_summary: weeklySummary,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update notifications");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-700">Email notifications</label>
          <input
            type="checkbox"
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-300"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-700">Processing complete alerts</label>
          <input
            type="checkbox"
            checked={processingAlerts}
            onChange={(e) => setProcessingAlerts(e.target.checked)}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-300"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-700">Weekly summary</label>
          <input
            type="checkbox"
            checked={weeklySummary}
            onChange={(e) => setWeeklySummary(e.target.checked)}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-300"
          />
        </div>
        {error && <Alert variant="error" title="Error">{error}</Alert>}
        {success && <Alert variant="success" title="Success">Notifications updated</Alert>}
        <Button variant="secondary" className="w-full mt-4" onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update notifications"}
        </Button>
      </div>
    </Card>
  );
}
