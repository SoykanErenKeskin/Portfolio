import { supabase } from "./supabase";

export type CapabilityCategory = {
  id: string;
  key: string;
  labelEn: string;
  labelTr: string;
  itemsEn: string[];
  itemsTr: string[];
  sortOrder: number;
};

/** Get all capability map categories. Returns [] on error. */
export async function getCapabilityMap(): Promise<CapabilityCategory[]> {
  const { data, error } = await supabase
    .from("capability_map_category")
    .select("id, key, label_en, label_tr, items_en, items_tr, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return [];

  return (data ?? []).map((r) => ({
    id: r.id,
    key: r.key ?? "",
    labelEn: r.label_en ?? "",
    labelTr: r.label_tr ?? "",
    itemsEn: Array.isArray(r.items_en) ? (r.items_en as string[]) : [],
    itemsTr: Array.isArray(r.items_tr) ? (r.items_tr as string[]) : [],
    sortOrder: r.sort_order ?? 0,
  }));
}
