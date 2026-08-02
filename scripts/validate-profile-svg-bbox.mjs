/**
 * Playwright bounding-box validation for profile SVG cards.
 * Run: node scripts/validate-profile-svg-bbox.mjs
 * Requires local next dev at PROFILE_SVG_BASE (default http://127.0.0.1:3000).
 */
import { chromium } from "playwright";

const base = process.env.PROFILE_SVG_BASE ?? "http://127.0.0.1:3000";
const SVG_W = 880;
const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error("FAIL:", msg);
}

function ok(msg) {
  console.log("OK:", msg);
}

const PANELS = {
  hero: {
    height: 480,
    zones: {
      "hero-last-update-value": { x: 436, y: 34, w: 408, h: 412 },
      "hero-r2-value": { x: 436, y: 34, w: 408, h: 412 },
      "hero-eder-description": { x: 436, y: 34, w: 408, h: 412 },
      "hero-status-value": { x: 436, y: 34, w: 408, h: 412 },
    },
  },
  work: {
    height: null, // dynamic
    zones: {
      "work-eder-description": { x: 32, y: 0, w: 816, h: null },
      "work-eder-modules": { x: 32, y: 0, w: 816, h: null },
    },
  },
  system: {
    height: null,
    zones: {
      "system-tech-data-heading": { x: 32, y: 0, w: 816, h: null },
      "system-tech-data-items": { x: 32, y: 0, w: 816, h: null },
    },
  },
};

const FORBIDDEN_TEXT = ["VIEW PROJECT", "TECHNICAL OVERVIEW", "SOURCE"];

async function fetchSvg(block) {
  const res = await fetch(`${base}/api/profile/cards/${block}`);
  if (!res.ok) throw new Error(`${block} -> ${res.status}`);
  return res.text();
}

async function validateBlock(page, block) {
  const svgText = await fetchSvg(block);
  const m = svgText.match(/viewBox="0 0 880 (\d+)"/);
  const height = m ? Number(m[1]) : 400;

  for (const phrase of FORBIDDEN_TEXT) {
    if (block === "work" && svgText.includes(phrase)) {
      fail(`${block}: forbidden CTA text present: ${phrase}`);
    }
  }

  if (svgText.includes("<ellipse cx=\"0\" cy=\"-10\"")) {
    fail(`${block}: clover-geometry redraw detected`);
  }

  const html = `<!doctype html><html><body style="margin:0;background:#ccc">
    <div id="host">${svgText.replace(/^<\?xml[^>]*>/, "")}</div>
  </body></html>`;

  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(50);

  const report = await page.evaluate(
    ({ svgW, svgH, zoneMap }) => {
      const svg = document.querySelector("svg");
      if (!svg) return { error: "no svg" };
      const out = { texts: [], images: [], overflows: [], zoneFails: [] };

      for (const el of svg.querySelectorAll("text")) {
        let box;
        try {
          box = el.getBBox();
        } catch {
          continue;
        }
        const id = el.id || "(no-id)";
        const right = box.x + box.width;
        const bottom = box.y + box.height;
        out.texts.push({ id, ...box, right, bottom });
        if (right > svgW + 0.5) {
          out.overflows.push(`${id} right=${right.toFixed(1)} > ${svgW}`);
        }
        if (bottom > svgH + 0.5) {
          out.overflows.push(`${id} bottom=${bottom.toFixed(1)} > ${svgH}`);
        }
        if (box.x < -0.5) {
          out.overflows.push(`${id} x=${box.x.toFixed(1)} < 0`);
        }

        const zone = zoneMap[id];
        if (zone) {
          const zRight = zone.x + zone.w;
          const zBottom = zone.h == null ? svgH : zone.y + zone.h;
          if (
            box.x < zone.x - 1 ||
            right > zRight + 1 ||
            box.y < zone.y - 1 ||
            bottom > zBottom + 1
          ) {
            out.zoneFails.push(
              `${id} bbox=(${box.x.toFixed(1)},${box.y.toFixed(1)},${right.toFixed(1)},${bottom.toFixed(1)}) outside panel`
            );
          }
        }
      }

      for (const el of svg.querySelectorAll("image")) {
        let box;
        try {
          box = el.getBBox();
        } catch {
          continue;
        }
        const id = el.id || "(image)";
        const attrW = parseFloat(el.getAttribute("width") || "0");
        const attrH = parseFloat(el.getAttribute("height") || "0");
        const par = el.getAttribute("preserveAspectRatio") || "";
        out.images.push({ id, attrW, attrH, par, ...box });
        if (!par.includes("meet")) {
          out.overflows.push(`${id} missing preserveAspectRatio meet`);
        }
        if (box.x + box.width > svgW + 1 || box.y + box.height > svgH + 1) {
          out.overflows.push(`${id} image clipped/outside canvas`);
        }
        if (box.x < 1 || box.y < 1) {
          // allow inset; flag only if touching absolute edge
        }
        if (
          id.includes("watermark") &&
          (box.x < 24 ||
            box.y < 24 ||
            box.x + box.width > svgW - 24 ||
            box.y + box.height > svgH - 24)
        ) {
          out.overflows.push(`${id} too close to canvas edge`);
        }
      }

      // Known zone pair overlap check (heading vs items)
      const heading = out.texts.find((t) => t.id === "system-tech-data-heading");
      const items = out.texts.find((t) => t.id === "system-tech-data-items");
      if (heading && items) {
        const overlap =
          heading.y < items.bottom &&
          items.y < heading.bottom &&
          heading.x < items.right &&
          items.x < heading.right;
        if (overlap && Math.abs(heading.y - items.y) < 10) {
          out.zoneFails.push("system tech heading overlaps items");
        }
      }

      return out;
    },
    { svgW: SVG_W, svgH: height, zoneMap: PANELS[block].zones }
  );

  if (report.error) {
    fail(`${block}: ${report.error}`);
    return;
  }

  for (const o of report.overflows) fail(`${block}: ${o}`);
  for (const z of report.zoneFails) fail(`${block}: ${z}`);

  if (!report.overflows.length && !report.zoneFails.length) {
    ok(`${block}: no overflow / zone failures (${report.texts.length} texts, ${report.images.length} images)`);
  }

  // Aspect sanity: eder-house / quarox-nodes should be ~square attrs
  for (const img of report.images) {
    if (img.id.includes("eder-house") || img.id.includes("quarox-node")) {
      const ratio = img.attrW / img.attrH;
      if (Math.abs(ratio - 1) > 0.05) {
        fail(`${block}: ${img.id} aspect distorted attr ratio=${ratio.toFixed(3)}`);
      } else {
        ok(`${block}: ${img.id} aspect ok (${img.attrW}x${img.attrH})`);
      }
    }
    if (img.id.includes("watermark")) {
      const ratio = img.attrW / img.attrH;
      if (ratio < 4 || ratio > 8) {
        fail(`${block}: watermark aspect unexpected ${ratio.toFixed(3)}`);
      } else {
        ok(`${block}: watermark aspect ok (${ratio.toFixed(2)})`);
      }
    }
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  for (const block of ["hero", "work", "system"]) {
    await validateBlock(page, block);
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} validation failure(s)`);
  process.exit(1);
}

console.log("\nvalidate-profile-svg-bbox: all checks passed");
