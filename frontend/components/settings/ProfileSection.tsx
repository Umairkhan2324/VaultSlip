"use client";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { updateProfile } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function ProfileSection({ email, displayName: initialDisplayName }: { email: string; displayName: string | null }) {
  const { token } = useSession();
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (!displayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await updateProfile(token, { display_name: displayName.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input type="email" value={email} disabled className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm text-slate-600" />
          <p className="mt-1 text-xs text-slate-500">Your email is managed by Supabase Auth.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        {error && <Alert variant="error" title="Error">{error}</Alert>}
        {success && <Alert variant="success" title="Success">Profile updated successfully</Alert>}
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}
