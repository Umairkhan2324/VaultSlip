-- User preferences table for export and notification settings

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_export_format TEXT CHECK (default_export_format IN ('CSV', 'JSON', 'Excel', 'PDF')) DEFAULT 'CSV',
  auto_export_enabled BOOLEAN DEFAULT FALSE,
  auto_export_frequency TEXT CHECK (auto_export_frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  processing_complete_alerts BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();
