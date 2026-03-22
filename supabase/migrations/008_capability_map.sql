-- Capability map: categories with key, label_en, label_tr, items_en, items_tr
CREATE TABLE IF NOT EXISTS capability_map_category (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT NOT NULL UNIQUE,
  label_en TEXT NOT NULL DEFAULT '',
  label_tr TEXT NOT NULL DEFAULT '',
  items_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  items_tr JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capability_map_category_sort ON capability_map_category(sort_order);
