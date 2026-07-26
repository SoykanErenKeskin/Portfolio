-- Private bucket for portfolio case study snapshots (Kocaeli real estate, etc.).
-- Server-side only via SUPABASE_SERVICE_ROLE_KEY. No public read/write policies.
--
-- Run manually: Supabase Dashboard → SQL Editor → paste → Run
-- Do not auto-apply against production from this repo.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-snapshots',
  'portfolio-snapshots',
  false,
  2097152,
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Intentionally no storage.objects policies for anon/authenticated.
-- Service role bypasses RLS and is used only from Next.js server routes.
