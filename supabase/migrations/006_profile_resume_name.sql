-- Add resume_name to profile (fixed display/download filename)
ALTER TABLE profile ADD COLUMN IF NOT EXISTS resume_name TEXT DEFAULT 'Resume Soykan Eren Keskin';
UPDATE profile SET resume_name = 'Resume Soykan Eren Keskin' WHERE resume_url IS NOT NULL AND (resume_name IS NULL OR resume_name = '');
