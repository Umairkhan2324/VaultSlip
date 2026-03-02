export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

/** Parse FastAPI-style error body (detail string or { detail: string | { error: string } }) for user-facing message. */
function parseApiError(text: string, fallback: string): string {
  try {
    const parsed = JSON.parse(text) as { detail?: string | { error?: string }; error?: string };
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.detail === "string") return parsed.detail;
      if (parsed.detail && typeof parsed.detail === "object" && typeof parsed.detail.error === "string")
        return parsed.detail.error;
      if (typeof parsed.error === "string") return parsed.error;
    }
  } catch {
    // not JSON
  }
  return text?.trim() || fallback;
}

export async function api(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<Response> {
  const { token, ...init } = opts;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${getBackendUrl()}${path}`, { ...init, headers });
}

export async function getMe(token: string) {
  const r = await api("/me", { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load profile"));
  return r.json();
}

export async function getReceipts(token: string, skip = 0, limit = 50) {
  const r = await api(`/receipts?skip=${skip}&limit=${limit}`, { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load receipts"));
  return r.json();
}

export async function getReceipt(token: string, id: string) {
  const r = await api(`/receipts/${id}`, { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load receipt"));
  return r.json();
}

export async function getChatHistory(token: string) {
  const r = await api("/chat", { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load chat history"));
  return r.json();
}

export async function postChat(token: string, message: string) {
  const r = await api("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Chat failed"));
  return r.json();
}

export async function getBatch(token: string, batchId: string) {
  const r = await api(`/batches/${batchId}`, { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load batch status"));
  return r.json();
}

export async function uploadReceipts(token: string, files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const r = await api("/upload", { method: "POST", body: form, token });
  const text = await r.text();
  if (!r.ok) throw new Error(parseApiError(text, "Upload failed"));
  return text ? JSON.parse(text) : {};
}

export async function importReceipts(token: string, file: File): Promise<{ batch_id: string; imported: number }> {
  const form = new FormData();
  form.append("file", file);
  const r = await api("/receipts/import", { method: "POST", body: form, token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Import failed"));
  return r.json();
}

export async function updateProfile(token: string, data: { display_name: string }) {
  const r = await api("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to update profile"));
  return r.json();
}

export async function updateOrganization(token: string, orgId: string, data: { name: string }) {
  const r = await api(`/api/organizations/${orgId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to update organization"));
  return r.json();
}

export async function getOrganization(token: string, orgId: string) {
  const r = await api(`/api/organizations/${orgId}`, { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load organization"));
  return r.json();
}

export async function getPreferences(token: string) {
  const r = await api("/api/preferences", { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load preferences"));
  return r.json();
}

export async function updateExportPreferences(
  token: string,
  prefs: { default_export_format: string; auto_export_enabled: boolean; auto_export_frequency: string }
) {
  const r = await api("/api/preferences/export", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to update preferences"));
  return r.json();
}

export async function updateNotificationPreferences(
  token: string,
  prefs: { email_notifications_enabled: boolean; processing_complete_alerts: boolean; weekly_summary: boolean }
) {
  const r = await api("/api/preferences/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to update notifications"));
  return r.json();
}

export async function getApiKeys(token: string) {
  const r = await api("/api/api-keys", { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load API keys"));
  return r.json();
}

export async function createApiKey(token: string, options?: { name?: string; expires_in_days?: number }) {
  const r = await api("/api/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options || {}),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to create API key"));
  return r.json();
}

export async function revokeApiKey(token: string, keyId: string) {
  const r = await api(`/api/api-keys/${keyId}`, {
    method: "DELETE",
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to revoke key"));
  return r.json();
}

export async function requestDataExport(token: string, options?: { format?: string }) {
  const r = await api("/api/data/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options || {}),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to request export"));
  return r.json();
}

export async function getExportJobStatus(token: string, jobId: string) {
  const r = await api(`/api/data/export/${jobId}`, { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load export status"));
  return r.json();
}

export async function deleteAccount(token: string, confirmation: { password: string }) {
  const r = await api("/api/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmation: "DELETE", ...confirmation }),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to delete account"));
  return r.json();
}

export async function updateReceipt(
  token: string,
  receiptId: string,
  data: { vendor?: string; category?: string; date?: string; notes?: string; total?: number; tax?: number; currency?: string }
) {
  const r = await api(`/receipts/${receiptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to update receipt"));
  return r.json();
}

export async function updateReceiptItems(
  token: string,
  receiptId: string,
  items: Array<{ id?: string; description: string; quantity?: number; unit_price?: number; subtotal?: number }>
) {
  const r = await api(`/receipts/${receiptId}/items`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to update items"));
  return r.json();
}

export async function createReceiptTemplate(
  token: string,
  data: { name: string; description?: string; template_data: Record<string, unknown> }
) {
  const r = await api("/receipt-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to create template"));
  return r.json();
}

export async function getReceiptTemplates(token: string) {
  const r = await api("/receipt-templates", { token });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to load templates"));
  return r.json();
}

export async function applyReceiptTemplate(token: string, receiptId: string, templateId: string) {
  const r = await api(`/receipt-templates/apply/${receiptId}/${templateId}`, {
    method: "POST",
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to apply template"));
  return r.json();
}

export async function deleteReceiptTemplate(token: string, templateId: string) {
  const r = await api(`/receipt-templates/${templateId}`, {
    method: "DELETE",
    token,
  });
  if (!r.ok) throw new Error(parseApiError(await r.text(), "Failed to delete template"));
  return r.json();
}
