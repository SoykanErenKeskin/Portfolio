import type { MeaningfulActivityItem } from "@/lib/profile/schema";
import type { ActivityGroup } from "@/lib/profile/types";

export type RawCommitInput = {
  projectId: string;
  projectName: string;
  repositoryUrl: string | null;
  messageHeadline: string;
  committedDate: string;
};

const EXACT_NOISE = new Set([
  "fix",
  "fixes",
  "update",
  "updates",
  "test",
  "tests",
  "wip",
  "temp",
  "tmp",
  "misc",
  "typo",
  "asdf",
]);

const CONVENTIONAL_PREFIX =
  /^(feat|fix|refactor|perf|docs|chore|style|test|build|ci)(\([^)]*\))?:\s*/i;

const MERGE_NOISE =
  /^(merge branch|merge pull request|merge remote-tracking)\b/i;

const DEPENDENCY_BOT =
  /^(chore\(deps?\)|build\(deps?\)|bump\b|dependabot|renovate)/i;

function stripConventionalPrefix(message: string): string {
  return message.replace(CONVENTIONAL_PREFIX, "").trim();
}

function normalizeWhitespace(message: string): string {
  return message.replace(/\s+/g, " ").trim();
}

/** True when the cleaned message is low-information noise. */
export function isLowInformationMessage(raw: string): boolean {
  const normalized = normalizeWhitespace(raw);
  if (!normalized) return true;

  // Check original before stripping conventional prefixes (chore(deps): …)
  if (MERGE_NOISE.test(normalized)) return true;
  if (DEPENDENCY_BOT.test(normalized)) return true;

  const cleaned = normalizeWhitespace(stripConventionalPrefix(normalized));
  if (!cleaned) return true;

  if (MERGE_NOISE.test(cleaned)) return true;
  if (DEPENDENCY_BOT.test(cleaned)) return true;

  const bare = cleaned
    .replace(/[.!,:;]+$/g, "")
    .trim()
    .toLowerCase();

  if (EXACT_NOISE.has(bare)) return true;

  // Near-exact: single noise token + optional punctuation/emoji only
  if (/^[\W_]*$/.test(cleaned)) return true;

  return false;
}

export function cleanCommitMessage(raw: string): string | null {
  if (typeof raw !== "string") return null;
  const firstLine = raw.split(/\r?\n/, 1)[0] ?? "";
  const normalized = normalizeWhitespace(firstLine);
  if (!normalized) return null;
  if (isLowInformationMessage(normalized)) return null;
  const withoutPrefix = normalizeWhitespace(
    stripConventionalPrefix(normalized)
  );
  if (!withoutPrefix || isLowInformationMessage(withoutPrefix)) return null;
  // Lowercase first letter only if it was a conventional commit cleanup? Keep as-is for readability.
  return withoutPrefix;
}

/**
 * Deterministic filter → group nearby related commits → max N flat items.
 * Never invents development details.
 */
export function buildMeaningfulActivity(
  commits: RawCommitInput[],
  maxEntries = 5
): MeaningfulActivityItem[] {
  if (!Array.isArray(commits) || commits.length === 0) return [];

  const cleaned: MeaningfulActivityItem[] = [];

  for (const commit of commits) {
    if (!commit || typeof commit !== "object") continue;
    const displayText = cleanCommitMessage(commit.messageHeadline ?? "");
    if (!displayText) continue;
    const ts = commit.committedDate;
    if (!ts || Number.isNaN(Date.parse(ts))) continue;

    cleaned.push({
      projectId: String(commit.projectId || "unknown"),
      projectName: String(commit.projectName || "Unknown"),
      displayText,
      sourceTimestamp: ts,
      repositoryUrl: commit.repositoryUrl ?? null,
    });
  }

  // Newest first
  cleaned.sort(
    (a, b) =>
      Date.parse(b.sourceTimestamp) - Date.parse(a.sourceTimestamp)
  );

  // Group nearby related commits (same project, within 36h, similar stem)
  const grouped: MeaningfulActivityItem[] = [];
  const WINDOW_MS = 36 * 60 * 60 * 1000;

  for (const item of cleaned) {
    const last = grouped[grouped.length - 1];
    if (
      last &&
      last.projectId === item.projectId &&
      Math.abs(
        Date.parse(last.sourceTimestamp) - Date.parse(item.sourceTimestamp)
      ) <= WINDOW_MS &&
      relatedMessages(last.displayText, item.displayText)
    ) {
      // Keep the newer (already first) message; omit the related older one
      continue;
    }
    grouped.push(item);
  }

  return grouped.slice(0, maxEntries);
}

function relatedMessages(a: string, b: string): boolean {
  const na = normalizeStem(a);
  const nb = normalizeStem(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function normalizeStem(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatRelativeTime(
  iso: string,
  now = Date.now()
): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "unavailable";
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins <= 1 ? "1m ago" : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return hours === 1 ? "1h ago" : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return days === 1 ? "1d ago" : `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return weeks === 1 ? "1w ago" : `${weeks}w ago`;
  return `${Math.floor(days / 30) || 1}mo ago`;
}

/** Map flat pipeline items into UI ActivityGroup[] (project-grouped). */
export function toActivityGroups(
  items: MeaningfulActivityItem[],
  now = Date.now()
): ActivityGroup[] {
  const order: string[] = [];
  const map = new Map<
    string,
    { label: string; texts: string[]; latestTs: string }
  >();

  for (const item of items) {
    let bucket = map.get(item.projectId);
    if (!bucket) {
      order.push(item.projectId);
      bucket = {
        label: item.projectName,
        texts: [],
        latestTs: item.sourceTimestamp,
      };
      map.set(item.projectId, bucket);
    }
    bucket.texts.push(item.displayText);
    if (Date.parse(item.sourceTimestamp) > Date.parse(bucket.latestTs)) {
      bucket.latestTs = item.sourceTimestamp;
    }
  }

  return order.map((id) => {
    const bucket = map.get(id)!;
    return {
      projectKey: id,
      projectLabel: bucket.label,
      items: bucket.texts.map((text) => ({ text })),
      relativeTime: formatRelativeTime(bucket.latestTs, now),
    };
  });
}
