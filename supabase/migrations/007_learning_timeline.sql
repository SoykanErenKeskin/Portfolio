-- Learning timeline: tech/tools with year and level (basic/intermediate/advanced)
CREATE TABLE IF NOT EXISTS learning_timeline (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tool_en TEXT NOT NULL,
  tool_tr TEXT NOT NULL,
  year INTEGER NOT NULL,
  level TEXT NOT NULL DEFAULT 'intermediate' CHECK (level IN ('basic', 'intermediate', 'advanced')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_timeline_year ON learning_timeline(year);
CREATE INDEX IF NOT EXISTS idx_learning_timeline_sort ON learning_timeline(sort_order);
