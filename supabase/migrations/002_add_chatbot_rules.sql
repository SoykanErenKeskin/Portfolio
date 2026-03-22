-- Add rules column to chatbot_prompt (editable from admin)
ALTER TABLE chatbot_prompt ADD COLUMN IF NOT EXISTS rules TEXT;
