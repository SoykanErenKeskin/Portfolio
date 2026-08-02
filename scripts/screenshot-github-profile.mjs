import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base =
  process.env.PROFILE_PREVIEW_URL ??
  "http://127.0.0.1:3000/dev/github-profile-preview";
const outDir = path.resolve(
  process.env.PROFILE_SCREENSHOT_DIR ??
    "docs/github-profile/phase2-screenshots"
);

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".profile-experience");
  const file = path.join(outDir, `profile-${vp.name}-${vp.width}.png`);
  await page.locator(".profile-experience").screenshot({ path: file });
  console.log(`wrote ${file}`);
}

await browser.close();
