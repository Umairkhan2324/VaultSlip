"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { getApiKeys, createApiKey, revokeApiKey } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function ApiKeysSection() {
  const { token } = useSession();
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadKeys();
  }, [token]);

  async function loadKeys() {
    try {
      const data = await getApiKeys(token);
      setKeys(data.keys || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load API keys");
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const data = await createApiKey(token);
      setNewKey(data.api_key);
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate API key");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(keyId: string) {
    try {
      await revokeApiKey(token, keyId);
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke key");
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">API & Integrations</h2>
      <div className="space-y-4">
        {newKey && (
          <Alert variant="success" title="New API Key Generated">
            <p className="mt-2 font-mono text-xs break-all">{newKey}</p>
            <p className="mt-1 text-xs">Save this key now. It will not be shown again.</p>
          </Alert>
        )}
        {keys.length > 0 && (
          <div className="space-y-2">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-lg border border-emerald-200 p-2">
                <span className="font-mono text-xs">{key.key_prefix}••••</span>
                {key.is_active ? (
                  <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => handleRevoke(key.id)}>Revoke</Button>
                ) : (
                  <span className="text-xs text-slate-500">Revoked</span>
                )}
              </div>
            ))}
          </div>
        )}
        {error && <Alert variant="error" title="Error">{error}</Alert>}
        <Button variant="secondary" className="w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate new key"}
        </Button>
      </div>
    </Card>
  );
}
