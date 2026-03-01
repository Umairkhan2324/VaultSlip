-- RLS: org-scoped access. Backend uses service_role for cross-org (e.g. seed).
-- JWT must include app_metadata.org_id or we resolve from profiles.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Helper: current user's org_id from JWT claim or from profiles (public schema for Supabase)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'org_id')::uuid,
    (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations: users see only their org
CREATE POLICY org_select ON organizations FOR SELECT
  USING (id = public.current_org_id());

-- Profiles: users see profiles in their org
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (org_id = public.current_org_id());
CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (org_id = public.current_org_id());
CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (org_id = public.current_org_id());

-- Batches: org-scoped
CREATE POLICY batches_all ON batches FOR ALL
  USING (org_id = public.current_org_id());

-- Receipts: org-scoped
CREATE POLICY receipts_all ON receipts FOR ALL
  USING (org_id = public.current_org_id());

-- receipt_items: via receipt ownership (no org_id column)
CREATE POLICY receipt_items_all ON receipt_items FOR ALL
  USING (EXISTS (SELECT 1 FROM receipts r WHERE r.id = receipt_id AND r.org_id = public.current_org_id()));

-- usage_tracking: org-scoped
CREATE POLICY usage_tracking_all ON usage_tracking FOR ALL
  USING (org_id = public.current_org_id());

-- enterprise_leads: no org (public form). Allow insert only; select for backend only (service role)
CREATE POLICY enterprise_leads_insert ON enterprise_leads FOR INSERT
  WITH CHECK (true);

-- chat_messages: org-scoped
CREATE POLICY chat_messages_all ON chat_messages FOR ALL
  USING (org_id = public.current_org_id());
