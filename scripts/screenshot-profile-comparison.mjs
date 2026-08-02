/**
 * Side-by-side Phase 4.1 comparison: admin/dev preview sections vs SVG cards.
 * Requires next dev running.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PROFILE_SVG_BASE ?? "http://127.0.0.1:3000";
const previewUrl =
  process.env.PROFILE_PREVIEW_URL ??
  `${base}/admin/github-profile`;
const outDir = path.resolve("docs/github-profile/phase4-1-comparison");
const stackDir = path.resolve("docs/github-profile/phase4-1-screenshots");

await mkdir(outDir, { recursive: true });
await mkdir(stackDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

async function fetchSvg(block) {
  const res = await fetch(`${base}/api/profile/cards/${block}`);
  if (!res.ok) throw new Error(`${block} -> ${res.status}`);
  return res.text();
}

async function captureSvg(block, width, outPath) {
  const svg = await fetchSvg(block);
  const m = svg.match(/viewBox="0 0 880 (\d+)"/);
  const height = m ? Number(m[1]) : 400;
  const scale = width / 880;
  const renderH = Math.round(height * scale);
  const html = `<!doctype html><html><body style="margin:0;background:#d8dce6;padding:24px">
    <div style="outline:1px dashed #666;display:inline-block;background:#0a0c12">
      <img id="card" width="${width}" height="${renderH}"
        src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"/>
    </div></body></html>`;
  await page.setViewportSize({ width: width + 80, height: Math.min(renderH + 80, 12000) });
  await page.setContent(html, { waitUntil: "load" });
  await page.locator("#card").screenshot({ path: outPath });
  return { svg, height };
}

// Preview sections
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto(previewUrl, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForSelector(".profile-experience", { timeout: 30000 });
await page.waitForTimeout(800);

const sections = [
  { key: "hero", selector: "section[aria-labelledby='profile-hero-heading']" },
  { key: "work", selector: "section[aria-labelledby='what-i-build-heading']" },
  {
    key: "projects",
    selector: "section[aria-labelledby='featured-projects-heading']",
  },
  { key: "system-activity", selector: "section[aria-labelledby='activity-heading']" },
  { key: "system-tech", selector: "section[aria-labelledby='tech-map-heading']" },
  { key: "system-contact", selector: "section[aria-labelledby='contact-heading']" },
];

for (const s of sections) {
  const loc = page.locator(s.selector).first();
  if (await loc.count()) {
    await loc.screenshot({
      path: path.join(outDir, `${s.key}-preview.png`),
    });
    console.log(`wrote ${s.key}-preview`);
  } else {
    console.warn(`missing preview section ${s.key}`);
  }
}

// Combined work preview
await page.evaluate(() => {
  const ids = ["what-i-build-heading", "featured-projects-heading"];
  const els = ids
    .map((id) => document.querySelector(`section[aria-labelledby='${id}']`))
    .filter(Boolean);
  let host = document.getElementById("gp-work-capture");
  if (host) host.remove();
  host = document.createElement("div");
  host.id = "gp-work-capture";
  host.style.cssText =
    "padding:24px;background:rgb(10,12,18);display:flex;flex-direction:column;gap:56px;";
  for (const el of els) host.appendChild(el.cloneNode(true));
  document.querySelector(".profile-experience")?.appendChild(host);
});
await page.locator("#gp-work-capture").screenshot({
  path: path.join(outDir, "work-preview.png"),
});
console.log("wrote work-preview");

// Combined system preview: isolate the three sections in a temp container
await page.evaluate(() => {
  const root = document.querySelector(".profile-experience");
  const ids = ["activity-heading", "tech-map-heading", "contact-heading"];
  const els = ids
    .map((id) => document.querySelector(`section[aria-labelledby='${id}']`))
    .filter(Boolean);
  let host = document.getElementById("gp-system-capture");
  if (host) host.remove();
  host = document.createElement("div");
  host.id = "gp-system-capture";
  host.style.cssText =
    "padding:24px;background:rgb(10,12,18);display:flex;flex-direction:column;gap:56px;";
  for (const el of els) host.appendChild(el.cloneNode(true));
  (root || document.body).appendChild(host);
});
await page.locator("#gp-system-capture").screenshot({
  path: path.join(outDir, "system-preview.png"),
});
console.log("wrote system-preview");

// Also alias hero-preview
await page.locator("section[aria-labelledby='profile-hero-heading']").screenshot({
  path: path.join(outDir, "hero-preview.png"),
});
console.log("wrote hero-preview");

// SVG cards at ~preview width
const svgWidth = 880;
for (const block of ["hero", "work", "system"]) {
  await captureSvg(block, svgWidth, path.join(outDir, `${block}-svg.png`));
  console.log(`wrote ${block}-svg`);
}

// README stacks
const stackWidths = [
  { name: "desktop", width: 840 },
  { name: "mobile", width: 390 },
];
for (const w of stackWidths) {
  const parts = [];
  for (const block of ["hero", "work", "system"]) {
    const { svg, height } = await captureSvg(
      block,
      w.width,
      path.join(stackDir, `${block}-${w.name}-${w.width}.png`)
    );
    parts.push({ svg, height });
  }
  const scale = w.width / 880;
  const imgs = parts
    .map((p) => {
      const h = Math.round(p.height * scale);
      return `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(p.svg)}" width="${w.width}" height="${h}" style="display:block;margin:0 0 16px;outline:1px dashed #666"/>`;
    })
    .join("");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#d8dce6">${imgs}</body></html>`;
  const totalH = parts.reduce((s, p) => s + Math.round(p.height * scale) + 16, 80);
  await page.setViewportSize({ width: w.width + 60, height: Math.min(totalH + 40, 14000) });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({
    path: path.join(stackDir, `readme-stack-${w.name}.png`),
    fullPage: true,
  });
  console.log(`wrote readme-stack-${w.name}`);
}

// Simple comparison sheet HTML snapshot note
await writeFile(
  path.join(outDir, "README.txt"),
  [
    "Phase 4.1 comparison captures",
    "- *-preview.png from /dev/github-profile-preview",
    "- *-svg.png from /api/profile/cards/* at 880px",
    "Review color, type hierarchy, spacing, panels, icons, borders.",
  ].join("\n")
);

await browser.close();
console.log("comparison complete");
