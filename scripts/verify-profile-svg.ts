/**
 * Unit checks for profile SVG generators.
 * Run: npm run test:profile-svg
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ProfileData } from "../lib/profile/types";
import { escapeXml } from "../lib/profile/svg/escape";
import { FORBIDDEN_PROVIDER_SNIPPETS } from "../lib/profile/svg/constants";
import { renderHeroCard, HERO_HEIGHT } from "../lib/profile/svg/hero";
import { renderWorkCard } from "../lib/profile/svg/work";
import { renderSystemCard } from "../lib/profile/svg/system";

function baseData(overrides: Partial<ProfileData> = {}): ProfileData {
  const data: ProfileData = {
    version: "profile-v3",
    generatedAt: "2026-08-01T00:00:00.000Z",
    identity: {
      name: "SOYKAN EREN KESKIN",
      role: "Industrial Engineer building data-driven solutions",
      statement: "Solving complex systems through data and design.",
    },
    eder: {
      projectName: "EDER",
      description: "Real estate intelligence powered by machine learning.",
      projectStatus: "published",
      scope: "Global model",
      globalR2: 0.6523,
      modelVersion: "ps-test",
      snapshotUpdatedAt: "2026-07-29T15:38:25.685Z",
      latestMeaningfulUpdate: "2026-07-29T15:38:25.685Z",
      isActive: true,
      viewProjectHref: "/en/projects/kocaeli-real-estate",
      technicalOverviewHref: "/en/projects/kocaeli-real-estate",
      sourcePrivate: true,
    },
    whatIBuild: [
      {
        id: "a",
        title: "Engineering Systems",
        description: "desc",
        modules: ["PROCESS DESIGN"],
      },
    ],
    projects: [
      {
        id: "eder",
        title: "Eder",
        problem: "p",
        solution: "s",
        architecture: ["ML"],
        viewProjectHref: "/en/projects/kocaeli-real-estate",
        sourceHref: null,
        technicalOverviewHref: "/en/projects/kocaeli-real-estate",
        showMetric: true,
        emphasized: true,
        status: "published",
      },
      {
        id: "order-tracking",
        title: "Order Tracking App",
        problem: "p",
        solution: "s",
        architecture: ["React Native"],
        viewProjectHref: "/en/projects/order-tracking-system",
        sourceHref: null,
        technicalOverviewHref: null,
        showMetric: false,
      },
      {
        id: "reservoir-forecasting",
        title: "Reservoir Forecasting",
        problem: "p",
        solution: "s",
        architecture: ["Python"],
        viewProjectHref: "/en/projects",
        sourceHref: null,
        technicalOverviewHref: null,
        showMetric: false,
      },
    ],
    activity: [],
    techMap: {
      centerLabel: "ENGINEERING × DATA × PRODUCT",
      clusters: [
        {
          id: "d",
          label: "Data & Intelligence",
          nodes: [
            { id: "python", label: "Python", mark: "Py" },
            { id: "pandas", label: "Pandas", mark: "Pd" },
          ],
        },
        {
          id: "p",
          label: "Product Development",
          nodes: [
            { id: "ts", label: "TypeScript", mark: "Ts" },
            { id: "react", label: "React", mark: "Re" },
          ],
        },
        {
          id: "i",
          label: "Infrastructure & Workflow",
          nodes: [
            { id: "pg", label: "PostgreSQL", mark: "Pg" },
            { id: "git", label: "Git", mark: "Gt" },
          ],
        },
      ],
    },
    contact: {
      statement:
        "Good products begin with understanding the system behind the problem.",
      openTo: "meaningful problems, ambitious products, thoughtful collaboration",
      connect: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/soykanerenkeskin" },
        { label: "Portfolio", href: "/en" },
        { label: "Email", href: "mailto:soykanerenkeskin@gmail.com" },
      ],
      status: "available",
      prompt: "connect with soykan_",
    },
    meta: { sources: { github: "ok", eder: "ok" } },
  };
  return { ...data, ...overrides };
}

test("generator returns valid SVG for all three blocks", () => {
  for (const svg of [
    renderHeroCard(baseData()),
    renderWorkCard(baseData()),
    renderSystemCard(baseData()),
  ]) {
    assert.match(svg, /^<\?xml/);
    assert.match(svg, /<svg[\s>]/);
    assert.match(svg, /<\/svg>\s*$/);
  }
});

test("correct viewBox exists on all generators", () => {
  assert.match(renderHeroCard(baseData()), new RegExp(`viewBox="0 0 880 ${HERO_HEIGHT}"`));
  assert.match(renderWorkCard(baseData()), /viewBox="0 0 880 \d+"/);
  assert.match(renderSystemCard(baseData()), /viewBox="0 0 880 \d+"/);
});

test("title and desc exist on all generators", () => {
  for (const svg of [
    renderHeroCard(baseData()),
    renderWorkCard(baseData()),
    renderSystemCard(baseData()),
  ]) {
    assert.match(svg, /<title>.+<\/title>/);
    assert.match(svg, /<desc>.+<\/desc>/);
  }
});

test("XML-special characters are escaped", () => {
  assert.equal(escapeXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
});

test("script-like activity input cannot inject SVG markup", () => {
  const svg = renderSystemCard(
    baseData({
      activity: [
        {
          projectKey: "x",
          projectLabel: "ORDER TRACKING APP",
          items: [{ text: '<script>alert(1)</script> & more' }],
          relativeTime: "1d ago",
        },
      ],
    })
  );
  assert.doesNotMatch(svg, /<script>alert/);
  assert.match(svg, /&lt;script&gt;/);
  assert.match(svg, /&amp; more/);
});

test("missing R² renders an honest unavailable state", () => {
  const svg = renderHeroCard(
    baseData({
      eder: { ...baseData().eder, globalR2: null },
    })
  );
  assert.match(svg, /METRIC UNAVAILABLE/);
  assert.doesNotMatch(svg, />0\.65</);
});

test("empty activity renders an honest empty state", () => {
  const svg = renderSystemCard(baseData({ activity: [] }));
  assert.match(svg, /NO RECENT MEANINGFUL ACTIVITY/);
});

test("forbidden internal/provider names are absent", () => {
  const poisoned = baseData({
    eder: {
      ...baseData().eder,
      scope: "Global model",
      description: "safe public description",
    },
  });
  for (const svg of [
    renderHeroCard(poisoned),
    renderWorkCard(poisoned),
    renderSystemCard(poisoned),
  ]) {
    for (const snippet of FORBIDDEN_PROVIDER_SNIPPETS) {
      assert.ok(
        !svg.toLowerCase().includes(snippet),
        `forbidden snippet present: ${snippet}`
      );
    }
  }
});

test("foreignObject is absent", () => {
  for (const svg of [
    renderHeroCard(baseData()),
    renderWorkCard(baseData()),
    renderSystemCard(baseData()),
  ]) {
    assert.doesNotMatch(svg, /foreignObject/i);
  }
});

test("external font URLs are absent", () => {
  for (const svg of [
    renderHeroCard(baseData()),
    renderWorkCard(baseData()),
    renderSystemCard(baseData()),
  ]) {
    assert.doesNotMatch(svg, /fonts\.googleapis/i);
    assert.doesNotMatch(svg, /fonts\.gstatic/i);
    assert.doesNotMatch(svg, /@import/i);
  }
});

test("same ProfileData produces deterministic output", () => {
  const data = baseData();
  assert.equal(renderHeroCard(data), renderHeroCard(data));
  assert.equal(renderWorkCard(data), renderWorkCard(data));
  assert.equal(renderSystemCard(data), renderSystemCard(data));
});

test("hero R² uses two-decimal formatting", () => {
  const svg = renderHeroCard(baseData());
  assert.match(svg, />0\.65</);
  assert.doesNotMatch(svg, />0\.6523</);
});

console.log("verify-profile-svg: all checks passed");
