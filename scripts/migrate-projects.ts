/**
 * Migrate projects from content/projects.json to Supabase.
 * Run with: npx tsx scripts/migrate-projects.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import data from "../content/projects.json";
import type { ProjectRecord } from "../types/project";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

const supabase = createClient(url, serviceKey);

async function main() {
  const { projects } = data as { projects: ProjectRecord[] };

  for (const p of projects) {
    const slug = p.slug ?? p.id;
    const { data: existing } = await supabase
      .from("project")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      console.log("Skip (exists):", slug);
      continue;
    }

    const { data: proj, error: projErr } = await supabase
      .from("project")
      .insert({
        slug,
        date: p.date + "T12:00:00Z",
        status: "PUBLISHED",
        featured: p.featured ?? false,
        technical_structure: p.technicalStructure
          ? JSON.stringify(p.technicalStructure)
          : null,
        data_table: p.dataTable ? JSON.stringify(p.dataTable) : null,
        links: p.links ? JSON.stringify(p.links) : null,
      })
      .select("id")
      .single();

    if (projErr || !proj) {
      console.error("Failed:", slug, projErr);
      continue;
    }

    await supabase.from("project_content").insert([
      {
        project_id: proj.id,
        locale: "en",
        title: p.title.en,
        short_description: p.shortDescription.en,
        summary: p.summary.en,
        domain: p.domain?.en ?? null,
        focus: p.focus?.en ?? null,
        problem: p.problem.en,
        approach: p.approach.en,
        outcome: p.outcome.en,
        detail: p.detail?.en ?? null,
        status_label: p.status?.en ?? null,
      },
      {
        project_id: proj.id,
        locale: "tr",
        title: p.title.tr,
        short_description: p.shortDescription.tr,
        summary: p.summary.tr,
        domain: p.domain?.tr ?? null,
        focus: p.focus?.tr ?? null,
        problem: p.problem.tr,
        approach: p.approach.tr,
        outcome: p.outcome.tr,
        detail: p.detail?.tr ?? null,
        status_label: p.status?.tr ?? null,
      },
    ]);

    if (p.tech?.length) {
      await supabase
        .from("project_tech")
        .insert(p.tech.map((tag) => ({ project_id: proj.id, tag })));
    }
    if (p.tools?.length) {
      await supabase
        .from("project_tool")
        .insert(p.tools.map((tool) => ({ project_id: proj.id, tool })));
    }
    if (p.images?.length) {
      await supabase.from("project_image").insert(
        p.images.map((img, i) => ({
          project_id: proj.id,
          src: img.src,
          alt_tr: img.alt?.tr ?? "",
          alt_en: img.alt?.en ?? "",
          type: img.type === "video" ? "VIDEO" : "IMAGE",
          sort_order: i,
          is_video_url: img.src.startsWith("http"),
        }))
      );
    }

    console.log("Migrated:", slug);
  }

  console.log("Done. Processed", projects.length, "projects.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
