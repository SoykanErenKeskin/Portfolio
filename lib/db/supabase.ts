import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

/** Server-side Supabase client with service role (bypasses RLS). */
export const supabase: SupabaseClient = createClient(url, serviceKey);
