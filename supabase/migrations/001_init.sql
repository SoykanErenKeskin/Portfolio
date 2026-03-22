-- Portfolio CMS - Supabase schema
-- Run this in Supabase SQL Editor or via: supabase db push

-- Admin (credentials auth)
CREATE TABLE IF NOT EXISTS admin (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Project
CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  technical_structure TEXT,
  data_table TEXT,
  links TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project content (locale)
CREATE TABLE IF NOT EXISTS project_content (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  summary TEXT NOT NULL,
  domain TEXT,
  focus TEXT,
  problem TEXT NOT NULL,
  approach TEXT NOT NULL,
  outcome TEXT NOT NULL,
  detail TEXT,
  status_label TEXT,
  UNIQUE(project_id, locale)
);

-- Project tech
CREATE TABLE IF NOT EXISTS project_tech (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

-- Project tools
CREATE TABLE IF NOT EXISTS project_tool (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  tool TEXT NOT NULL
);

-- Project images
CREATE TABLE IF NOT EXISTS project_image (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  alt_tr TEXT NOT NULL DEFAULT '',
  alt_en TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'IMAGE',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_video_url BOOLEAN NOT NULL DEFAULT false
);

-- Profile
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  value_prop TEXT,
  supporting TEXT,
  email TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'en' UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FAQ
CREATE TABLE IF NOT EXISTS faq (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  locale TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Chatbot prompt
CREATE TABLE IF NOT EXISTS chatbot_prompt (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  system_prompt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_slug ON project(slug);
CREATE INDEX IF NOT EXISTS idx_project_status ON project(status);
CREATE INDEX IF NOT EXISTS idx_project_content_project ON project_content(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tech_project ON project_tech(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tool_project ON project_tool(project_id);
CREATE INDEX IF NOT EXISTS idx_project_image_project ON project_image(project_id);
CREATE INDEX IF NOT EXISTS idx_faq_locale ON faq(locale);
