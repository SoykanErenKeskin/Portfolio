import { supabase } from "./supabase";

/** Public resume URL. Returns /api/resume (serves PDF with correct filename) or null. */
export async function getResumeUrl(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("profile")
      .select("resume_url")
      .eq("locale", "en")
      .maybeSingle();

    if (error) return null;
    const url = data?.resume_url?.trim();
    return url ? "/api/resume" : null;
  } catch {
    return null;
  }
}
