-- Add resume_url to profile (PDF public URL)
ALTER TABLE profile ADD COLUMN IF NOT EXISTS resume_url TEXT;
