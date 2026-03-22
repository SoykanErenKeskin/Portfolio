import { supabase } from "./supabase";

export type FaqRow = {
  locale: string;
  question: string;
  answer: string;
  sort_order: number;
};

/** Public FAQ sayfası için locale'e göre FAQ'leri alır */
export async function getFaqByLocale(locale: string): Promise<FaqRow[]> {
  try {
    const { data, error } = await supabase
      .from("faq")
      .select("locale, question, answer, sort_order")
      .eq("locale", locale)
      .order("sort_order");

    if (error) throw error;
    return (data ?? []) as FaqRow[];
  } catch {
    return [];
  }
}

/** Chatbot context için tüm locale'lerdeki FAQ'leri alır */
export async function getFaqForChatbot(): Promise<FaqRow[]> {
  try {
    const { data, error } = await supabase
      .from("faq")
      .select("locale, question, answer, sort_order")
      .in("locale", ["en", "tr"])
      .order("locale")
      .order("sort_order");

    if (error) throw error;
    return (data ?? []) as FaqRow[];
  } catch {
    return [];
  }
}
