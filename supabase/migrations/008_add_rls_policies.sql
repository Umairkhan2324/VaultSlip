-- RLS policies for new tables: user_preferences, api_keys, data_export_jobs

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_jobs ENABLE ROW LEVEL SECURITY;

-- user_preferences: users see only their own preferences
CREATE POLICY user_preferences_select ON user_preferences FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY user_preferences_insert ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_preferences_update ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- api_keys: users see only their own keys
CREATE POLICY api_keys_select ON api_keys FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY api_keys_insert ON api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY api_keys_update ON api_keys FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY api_keys_delete ON api_keys FOR DELETE
  USING (user_id = auth.uid());

-- data_export_jobs: users see only their own export jobs
CREATE POLICY data_export_jobs_select ON data_export_jobs FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY data_export_jobs_insert ON data_export_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY data_export_jobs_update ON data_export_jobs FOR UPDATE
  USING (user_id = auth.uid());
