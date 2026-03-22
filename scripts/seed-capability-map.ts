/**
 * Capability map: seed from messages/en.json and messages/tr.json.
 * npm run db:seed-capability-map
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import en from "../messages/en.json";
import tr from "../messages/tr.json";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

const supabase = createClient(url, serviceKey);

type SystemsCategory = {
  key: string;
  label: string;
  items: string[];
};

function getCategories(locale: "en" | "tr"): SystemsCategory[] {
  const messages = locale === "en" ? en : tr;
  return (messages as { home: { systemsCategories: SystemsCategory[] } }).home
    .systemsCategories;
}

async function main() {
  const enCats = getCategories("en");
  const trCats = getCategories("tr");

  const categories = enCats.map((enCat, i) => {
    const trCat = trCats.find((c) => c.key === enCat.key);
    return {
      key: enCat.key,
      label_en: enCat.label,
      label_tr: trCat?.label ?? enCat.label,
      items_en: enCat.items,
      items_tr: trCat?.items ?? enCat.items,
      sort_order: i,
    };
  });

  console.log("Seeding capability_map_category with", categories.length, "categories");

  const { data: existing } = await supabase
    .from("capability_map_category")
    .select("id");
  if (existing?.length) {
    await supabase
      .from("capability_map_category")
      .delete()
      .in("id", existing.map((r) => r.id));
  }

  const { error } = await supabase
    .from("capability_map_category")
    .insert(categories);

  if (error) {
    console.error("Insert error:", error);
    return;
  }

  console.log("Capability map seeded:", categories.length, "categories");
}

main().catch(console.error);
