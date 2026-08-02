import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.PROFILE_SVG_BASE ?? "http://127.0.0.1:3000";
const outDir = path.resolve(
  process.env.PROFILE_SCREENSHOT_DIR ??
    "docs/github-profile/phase3-2-screenshots"
);

const blocks = ["hero", "work", "system"];
const widths = [
  { name: "desktop", width: 840 },
  { name: "mobile", width: 390 },
  { name: "native", width: 880 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

async function fetchSvg(block) {
  const url = `${base}/api/profile/cards/${block}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

async function renderSvg(block, width, label) {
  const svg = await fetchSvg(block);
  const m = svg.match(/viewBox="0 0 880 (\d+)"/);
  const height = m ? Number(m[1]) : 400;
  const scale = width / 880;
  const renderH = Math.round(height * scale);

  const html = `<!doctype html><html><body style="margin:0;background:#e8eaef;padding:24px">
    <div style="display:inline-block;outline:1px dashed #888;background:#111">
      <img id="card" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="${width}" height="${renderH}" style="display:block"/>
    </div>
  </body></html>`;

  await page.setViewportSize({
    width: width + 80,
    height: Math.min(renderH + 80, 14000),
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.locator("#card").screenshot({
    path: path.join(outDir, `${block}-${label}-${width}.png`),
  });
  return { svg, height };
}

const stackCache = { desktop: [], mobile: [] };

for (const width of widths) {
  for (const block of blocks) {
    const { svg, height } = await renderSvg(block, width.width, width.name);
    if (width.name === "desktop" || width.name === "mobile") {
      stackCache[width.name].push({ svg, height });
    }
    console.log(`wrote ${block}-${width.name}-${width.width}`);
  }
}

for (const name of ["desktop", "mobile"]) {
  const width = name === "desktop" ? 840 : 390;
  const parts = stackCache[name];
  const scale = width / 880;
  const imgs = parts
    .map((p) => {
      const h = Math.round(p.height * scale);
      return `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(p.svg)}" width="${width}" height="${h}" style="display:block;margin:0 0 16px 0;outline:1px dashed #666"/>`;
    })
    .join("");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#e8eaef">${imgs}</body></html>`;
  const totalH = parts.reduce(
    (sum, p) => sum + Math.round(p.height * scale) + 16,
    80
  );
  await page.setViewportSize({
    width: width + 60,
    height: Math.min(totalH + 40, 14000),
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({
    path: path.join(outDir, `readme-stack-${name}.png`),
    fullPage: true,
  });
  console.log(`wrote readme-stack-${name}`);
}

await browser.close();
