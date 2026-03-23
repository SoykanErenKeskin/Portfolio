/**
 * Tech & Tools registry: seed from projects, learning timeline, capability map.
 * npm run db:seed-tech-tools
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

const supabase = createClient(url, serviceKey);

type Entry = {
  key: string;
  labelEn: string;
  labelTr: string;
  type: "tech" | "tool";
};

async function main() {
  const seen = new Set<string>();
  const entries: Entry[] = [];

  // 1. Project tech (type: tech)
  const { data: projectTech } = await supabase
    .from("project_tech")
    .select("tag");
  for (const row of projectTech ?? []) {
    const k = (row.tag ?? "").trim();
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase());
      entries.push({ key: k, labelEn: k, labelTr: k, type: "tech" });
    }
  }

  // 2. Project tools (type: tool)
  const { data: projectTools } = await supabase
    .from("project_tool")
    .select("tool");
  for (const row of projectTools ?? []) {
    const k = (row.tool ?? "").trim();
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase());
      entries.push({ key: k, labelEn: k, labelTr: k, type: "tool" });
    }
  }

  // 3. Learning timeline (type: tool)
  const { data: learning } = await supabase
    .from("learning_timeline")
    .select("tool_en, tool_tr");
  for (const row of learning ?? []) {
    const en = (row.tool_en ?? "").trim();
    const tr = (row.tool_tr ?? "").trim();
    const k = en || tr;
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase());
      entries.push({
        key: en || tr,
        labelEn: en || tr,
        labelTr: tr || en,
        type: "tool",
      });
    }
  }

  // 4. Capability map items (type: tool)
  const { data: caps } = await supabase
    .from("capability_map_category")
    .select("items_en, items_tr");
  for (const cat of caps ?? []) {
    const enItems = Array.isArray(cat.items_en) ? (cat.items_en as string[]) : [];
    const trItems = Array.isArray(cat.items_tr) ? (cat.items_tr as string[]) : [];
    const maxLen = Math.max(enItems.length, trItems.length);
    for (let i = 0; i < maxLen; i++) {
      const en = (enItems[i] ?? "").trim();
      const tr = (trItems[i] ?? "").trim();
      const k = en || tr;
      if (k && !seen.has(k.toLowerCase())) {
        seen.add(k.toLowerCase());
        entries.push({
          key: en || tr,
          labelEn: en || tr,
          labelTr: tr || en,
          type: "tool",
        });
      }
    }
  }

  const existing = await supabase.from("tech_tool_registry").select("id");
  if (existing.data?.length) {
    await supabase
      .from("tech_tool_registry")
      .delete()
      .in("id", existing.data.map((r) => r.id));
  }

  if (entries.length === 0) {
    console.log("No tech/tools found in projects, learning timeline, or capability map.");
    return;
  }

  const toInsert = entries.map((e, i) => ({
    key: e.key,
    label_en: e.labelEn,
    label_tr: e.labelTr,
    type: e.type,
    sort_order: i,
  }));

  const { error } = await supabase
    .from("tech_tool_registry")
    .insert(toInsert);

  if (error) {
    console.error("Insert error:", error);
    return;
  }

  const techCount = entries.filter((e) => e.type === "tech").length;
  const toolCount = entries.filter((e) => e.type === "tool").length;
  console.log(
    `Tech & Tools seeded: ${entries.length} total (${techCount} tech, ${toolCount} tools)`
  );
}

main().catch(console.error);
