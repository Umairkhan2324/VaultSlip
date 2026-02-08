-- Run in Supabase SQL Editor after creating bucket "receipts" in Dashboard.
-- RLS: users can read/write only under path {org_id}/

INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

CREATE POLICY receipts_storage_org ON storage.objects FOR ALL
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = public.current_org_id()::text
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = public.current_org_id()::text
  );
