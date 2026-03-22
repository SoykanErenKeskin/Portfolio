import { supabase } from "./supabase";

export type ProfileRow = {
  name: string;
  tagline: string;
  value_prop: string | null;
  supporting: string | null;
  email: string;
  github: string;
  linkedin: string;
  website: string;
  locale: string;
};

/** Chatbot context için profil alır (tek dil) */
export async function getProfilesForChatbot(): Promise<ProfileRow[]> {
  try {
    const { data, error } = await supabase
      .from("profile")
      .select("name, tagline, value_prop, supporting, email, github, linkedin, website, locale")
      .eq("locale", "en")
      .maybeSingle();

    if (error) throw error;
    return data ? [data as ProfileRow] : [];
  } catch {
    return [];
  }
}
