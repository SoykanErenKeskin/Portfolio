import { supabase } from "./supabase";

export type LearningEntry = {
  id: string;
  toolEn: string;
  toolTr: string;
  year: number;
  level: "basic" | "intermediate" | "advanced";
  sortOrder: number;
};

export async function getLearningTimeline(): Promise<LearningEntry[]> {
  const { data, error } = await supabase
    .from("learning_timeline")
    .select("id, tool_en, tool_tr, year, level, sort_order")
    .order("year", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return [];

  return (data ?? []).map((r) => ({
    id: r.id,
    toolEn: r.tool_en ?? "",
    toolTr: r.tool_tr ?? "",
    year: r.year ?? 0,
    level: (r.level as LearningEntry["level"]) ?? "intermediate",
    sortOrder: r.sort_order ?? 0,
  }));
}
