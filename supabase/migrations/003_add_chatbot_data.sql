-- Profil/context verisini admin'den düzenlenebilir yap
ALTER TABLE chatbot_prompt ADD COLUMN IF NOT EXISTS chatbot_data TEXT;
