/**
 * Profile ve FAQ tablolarını data/profile.ts'den doldurur.
 * npm run db:seed-profile-faq
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { profile } from "../data/profile";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

const supabase = createClient(url, serviceKey);

async function main() {
  // Profile – tek dil (chatbot için)
  const { error: profileError } = await supabase.from("profile").upsert(
    {
      locale: "en",
      name: profile.name,
      tagline: "Data · Operations · ML",
      value_prop: profile.shortBio,
      supporting: profile.careerInterests,
      email: profile.email,
      github: profile.github,
      linkedin: profile.linkedin,
      website: profile.website,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "locale" }
  );
  if (profileError) {
    console.error("Profile upsert error:", profileError);
  } else {
    console.log("Profile upserted (en)");
  }

  // FAQ – mevcut en FAQ'leri ekle (varsa güncelleme yok, sadece eksikse ekle)
  const { data: existing } = await supabase
    .from("faq")
    .select("id")
    .eq("locale", "en")
    .limit(1);

  if (!existing?.length) {
    for (let i = 0; i < profile.faq.length; i++) {
      const f = profile.faq[i];
      await supabase.from("faq").insert({
        locale: "en",
        question: f.q,
        answer: f.a,
        sort_order: i,
      });
    }
    console.log("FAQ inserted:", profile.faq.length, "items (en)");
  } else {
    console.log("FAQ already has data, skipping.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
