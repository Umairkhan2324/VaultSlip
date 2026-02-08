-- Data export jobs table for tracking user data exports

CREATE TABLE data_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  format TEXT CHECK (format IN ('ZIP', 'JSON', 'CSV', 'Excel')) DEFAULT 'ZIP',
  storage_path TEXT,
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_data_export_jobs_user_id ON data_export_jobs(user_id);
CREATE INDEX idx_data_export_jobs_org_id ON data_export_jobs(org_id);
CREATE INDEX idx_data_export_jobs_status ON data_export_jobs(status);
