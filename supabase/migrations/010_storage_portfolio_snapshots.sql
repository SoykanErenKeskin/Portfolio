-- Public-read bucket for portfolio case snapshots (Kocaeli real estate).
-- Dashboard (Electron) writes with service role. Website reads via public HTTPS URL only
-- (no service role on the Next.js read path).
--
-- Run manually: Supabase Dashboard → SQL Editor → paste → Run
-- Do not auto-apply against production from this repo.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-snapshots',
  'portfolio-snapshots',
  true,
  2097152,
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for objects in this bucket (write remains service-role only).
DROP POLICY IF EXISTS "Public read portfolio snapshots" ON storage.objects;
CREATE POLICY "Public read portfolio snapshots"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'portfolio-snapshots');
