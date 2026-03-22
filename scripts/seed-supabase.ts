import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

const supabase = createClient(url, serviceKey);

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("admin")
    .select("id")
    .eq("email", normalizedEmail)
    .single();

  if (existing) {
    await supabase
      .from("admin")
      .update({ password_hash: passwordHash })
      .eq("email", normalizedEmail);
    console.log("Admin password updated:", normalizedEmail);
  } else {
    await supabase.from("admin").insert({
      email: normalizedEmail,
      password_hash: passwordHash,
    });
    console.log("Admin user created:", normalizedEmail);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
