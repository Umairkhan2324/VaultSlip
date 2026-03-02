"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { getMe, getOrganization, updateOrganization } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function OrganizationSection() {
  const { token } = useSession();
  const [orgName, setOrgName] = useState("");
  const [plan, setPlan] = useState("free");
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    getMe(token)
      .then((me) => {
        if (!active) return;
        setPlan(me.plan || "free");
        const id = me.org_id || "";
        setOrgId(id);
        if (id) {
          return getOrganization(token, id)
            .then((org) => {
              if (!active) return;
              setOrgName(org.name || "");
            })
            .catch(() => {
              // ignore org load errors, user can still type a name
            });
        }
        return undefined;
      })
      .catch(() => {
        // ignore me load errors here; page will handle globally
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleUpdate() {
    if (!orgName.trim()) {
      setError("Organization name cannot be empty");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await updateOrganization(token, orgId, { name: orgName.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="capitalize">
              {plan}
            </Badge>
            <span className="text-xs text-slate-500">All features enabled during beta</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization name</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your organization"
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" title="Success">
            Organization updated successfully
          </Alert>
        )}
        <Button variant="secondary" className="w-full" onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update organization"}
        </Button>
      </div>
    </Card>
  );
}
