/**
 * Learning timeline: seed existing tech stacks and tools with random years.
 * Tool names are English only (tool_tr = tool_en).
 * npm run db:seed-learning-timeline
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import en from "../messages/en.json";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

const supabase = createClient(url, serviceKey);

const TECHNICAL_TOOLS = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "SAP",
  "Power BI",
  "AutoCAD",
  "EasyEDA",
  "Altium",
];

function getAllTools(): string[] {
  const fromCategories = (en as { home: { systemsCategories: { items: string[] }[] } }).home
    .systemsCategories.flatMap((c) => c.items);
  const combined = [...new Set([...TECHNICAL_TOOLS, ...fromCategories])];
  return combined.sort();
}

function randomYear(): number {
  return 2020 + Math.floor(Math.random() * 5);
}

function randomLevel(): "basic" | "intermediate" | "advanced" {
  const r = Math.random();
  if (r < 0.3) return "basic";
  if (r < 0.7) return "intermediate";
  return "advanced";
}

async function main() {
  const tools = getAllTools();
  console.log("Seeding learning_timeline with", tools.length, "tools (English only)");

  const { data: existing } = await supabase.from("learning_timeline").select("id");
  if (existing?.length) {
    await supabase.from("learning_timeline").delete().in("id", existing.map((r) => r.id));
  }

  const entries = tools.map((tool, i) => ({
    tool_en: tool,
    tool_tr: tool,
    year: randomYear(),
    level: randomLevel(),
    sort_order: i,
  }));

  const { error } = await supabase.from("learning_timeline").insert(entries);

  if (error) {
    console.error("Insert error:", error);
    return;
  }

  console.log("Learning timeline seeded:", entries.length, "entries");
}

main().catch(console.error);
