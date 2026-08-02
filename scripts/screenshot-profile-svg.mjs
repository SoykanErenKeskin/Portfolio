import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PROFILE_SVG_BASE ?? "http://127.0.0.1:3000";
const outDir = path.resolve(
  process.env.PROFILE_SCREENSHOT_DIR ??
    "docs/github-profile/phase3-1-screenshots"
);

const blocks = ["hero", "work", "system"];
const widths = [
  { name: "desktop", width: 840 },
  { name: "mobile", width: 390 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

async function renderSvg(block, width) {
  const url = `${base}/api/profile/cards/${block}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const svg = await res.text();
  // Parse intrinsic height from viewBox
  const m = svg.match(/viewBox="0 0 880 (\d+)"/);
  const height = m ? Number(m[1]) : 400;
  const scale = width / 880;
  const renderH = Math.round(height * scale);

  const html = `<!doctype html><html><body style="margin:0;background:#111">
    <img id="card" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="${width}" height="${renderH}" />
  </body></html>`;

  await page.setViewportSize({ width: width + 20, height: renderH + 40 });
  await page.setContent(html, { waitUntil: "load" });
  await page.locator("#card").screenshot({
    path: path.join(outDir, `${block}-${widths.find((w) => w.width === width).name}-${width}.png`),
  });
  return { svg, height, renderH };
}

const stackSvgs = { desktop: [], mobile: [] };

for (const width of widths) {
  const parts = [];
  for (const block of blocks) {
    const { svg, height } = await renderSvg(block, width.width);
    parts.push({ svg, height });
    console.log(`wrote ${block}-${width.name}-${width.width}`);
  }
  stackSvgs[width.name] = parts;
}

for (const width of widths) {
  const parts = stackSvgs[width.name];
  const scale = width.width / 880;
  const totalH = parts.reduce((sum, p) => sum + Math.round(p.height * scale) + 16, 40);
  const imgs = parts
    .map((p, i) => {
      const h = Math.round(p.height * scale);
      return `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(p.svg)}" width="${width.width}" height="${h}" style="display:block;margin:0 0 16px 0"/>`;
    })
    .join("");
  const html = `<!doctype html><html><body style="margin:0;padding:20px;background:#0a0c12">${imgs}</body></html>`;
  await page.setViewportSize({ width: width.width + 40, height: Math.min(totalH + 40, 12000) });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({
    path: path.join(outDir, `readme-stack-${width.name}.png`),
    fullPage: true,
  });
  console.log(`wrote readme-stack-${width.name}`);
}

await browser.close();
