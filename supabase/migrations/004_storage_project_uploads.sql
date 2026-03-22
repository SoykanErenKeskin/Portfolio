-- Public bucket for project images (admin uses service role; portfolio uses public URLs).
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- Or: supabase db push (if using CLI)

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-uploads', 'project-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
