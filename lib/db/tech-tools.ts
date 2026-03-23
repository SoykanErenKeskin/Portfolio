import { supabase } from "./supabase";

/** Sync tech/tools from a published project into tech_tool_registry.
 * Adds new keys as "pending" (label_tr empty). Does not overwrite existing entries. */
export async function syncTechToolsFromProject(
  tech: string[],
  tools: string[]
): Promise<void> {
  const techKeys = [...new Set(tech.map((t) => t.trim()).filter(Boolean))];
  const toolKeys = [...new Set(tools.map((t) => t.trim()).filter(Boolean))];

  for (const key of techKeys) {
    const { data: existing } = await supabase
      .from("tech_tool_registry")
      .select("id")
      .eq("key", key)
      .maybeSingle();
    if (!existing) {
      const { data: maxRow } = await supabase
        .from("tech_tool_registry")
        .select("sort_order")
        .eq("type", "tech")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      await supabase.from("tech_tool_registry").insert({
        key,
        label_en: key,
        label_tr: "",
        type: "tech",
        sort_order: (maxRow?.sort_order ?? -1) + 1,
      });
    }
  }

  for (const key of toolKeys) {
    const { data: existing } = await supabase
      .from("tech_tool_registry")
      .select("id")
      .eq("key", key)
      .maybeSingle();
    if (!existing) {
      const { data: maxRow } = await supabase
        .from("tech_tool_registry")
        .select("sort_order")
        .eq("type", "tool")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      await supabase.from("tech_tool_registry").insert({
        key,
        label_en: key,
        label_tr: "",
        type: "tool",
        sort_order: (maxRow?.sort_order ?? -1) + 1,
      });
    }
  }
}
