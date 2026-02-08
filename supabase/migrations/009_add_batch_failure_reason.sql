-- Store sanitized extraction failure reason for partial batches (user-facing).
ALTER TABLE batches ADD COLUMN IF NOT EXISTS failure_reason TEXT;
