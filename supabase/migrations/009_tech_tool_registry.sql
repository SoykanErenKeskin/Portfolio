-- Tech & Tools registry: master list of tech stacks and tools with EN/TR labels
CREATE TABLE IF NOT EXISTS tech_tool_registry (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT NOT NULL UNIQUE,
  label_en TEXT NOT NULL DEFAULT '',
  label_tr TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('tech', 'tool')) DEFAULT 'tech',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tech_tool_registry_type ON tech_tool_registry(type);
CREATE INDEX IF NOT EXISTS idx_tech_tool_registry_sort ON tech_tool_registry(sort_order);
