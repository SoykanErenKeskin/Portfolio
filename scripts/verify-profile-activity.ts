/**
 * Unit checks for deterministic profile activity pipeline.
 * Run: npm run test:profile-activity
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildMeaningfulActivity,
  cleanCommitMessage,
  isLowInformationMessage,
  toActivityGroups,
  type RawCommitInput,
} from "../lib/profile/activity";

function commit(
  partial: Partial<RawCommitInput> & Pick<RawCommitInput, "messageHeadline" | "committedDate">
): RawCommitInput {
  return {
    projectId: partial.projectId ?? "order-tracking",
    projectName: partial.projectName ?? "ORDER TRACKING APP",
    repositoryUrl: partial.repositoryUrl ?? "https://github.com/example/repo",
    messageHeadline: partial.messageHeadline,
    committedDate: partial.committedDate,
  };
}

test("exact fix is removed", () => {
  assert.equal(cleanCommitMessage("fix"), null);
  assert.equal(isLowInformationMessage("fix"), true);
});

test("fix valuation pipeline race is retained", () => {
  assert.equal(
    cleanCommitMessage("fix valuation pipeline race"),
    "fix valuation pipeline race"
  );
});

test("merge commits are removed", () => {
  assert.equal(cleanCommitMessage("Merge branch 'main' into develop"), null);
  assert.equal(cleanCommitMessage("Merge pull request #12 from x"), null);
  assert.equal(cleanCommitMessage("Merge remote-tracking branch 'origin/main'"), null);
});

test("conventional commit prefixes are cleaned", () => {
  assert.equal(
    cleanCommitMessage("feat: improve mobile analysis layout"),
    "improve mobile analysis layout"
  );
  assert.equal(
    cleanCommitMessage("fix(api): add snapshot cache invalidation"),
    "add snapshot cache invalidation"
  );
});

test("exact update is removed", () => {
  assert.equal(cleanCommitMessage("update"), null);
  assert.equal(cleanCommitMessage("updates"), null);
});

test("update regional insight flow is retained", () => {
  assert.equal(
    cleanCommitMessage("update regional insight flow"),
    "update regional insight flow"
  );
});

test("dependency-bot noise is removed when matched", () => {
  assert.equal(cleanCommitMessage("chore(deps): bump lodash"), null);
  assert.equal(cleanCommitMessage("dependabot: bump react"), null);
  assert.equal(cleanCommitMessage("Bump foo from 1.0.0 to 2.0.0"), null);
});

test("related nearby commits group deterministically", () => {
  const items = buildMeaningfulActivity(
    [
      commit({
        messageHeadline: "improve mobile analysis layout",
        committedDate: "2026-08-01T12:00:00.000Z",
      }),
      commit({
        messageHeadline: "improve mobile analysis layout spacing",
        committedDate: "2026-08-01T10:00:00.000Z",
      }),
      commit({
        projectId: "eder",
        projectName: "EDER",
        messageHeadline: "synced model snapshot",
        committedDate: "2026-07-30T08:00:00.000Z",
      }),
    ],
    5
  );
  assert.equal(items.length, 2);
  assert.equal(items[0]?.displayText, "improve mobile analysis layout");
});

test("output never exceeds five entries", () => {
  const commits = Array.from({ length: 12 }, (_, i) =>
    commit({
      messageHeadline: `improve pipeline step ${i}`,
      committedDate: new Date(Date.UTC(2026, 7, 1, i)).toISOString(),
    })
  );
  const items = buildMeaningfulActivity(commits, 5);
  assert.ok(items.length <= 5);
});

test("empty input returns a valid empty array", () => {
  assert.deepEqual(buildMeaningfulActivity([]), []);
  assert.deepEqual(buildMeaningfulActivity(null as unknown as RawCommitInput[]), []);
});

test("unknown or malformed commit data does not crash", () => {
  const items = buildMeaningfulActivity([
    null as unknown as RawCommitInput,
    commit({ messageHeadline: "", committedDate: "bad-date" }),
    commit({
      messageHeadline: "test county fallback behavior",
      committedDate: "2026-08-01T00:00:00.000Z",
    }),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0]?.displayText, "test county fallback behavior");
});

test("toActivityGroups preserves project grouping", () => {
  const groups = toActivityGroups(
    [
      {
        projectId: "order-tracking",
        projectName: "ORDER TRACKING APP",
        displayText: "refined delivery state management",
        sourceTimestamp: "2026-08-01T12:00:00.000Z",
        repositoryUrl: null,
      },
    ],
    Date.parse("2026-08-01T14:00:00.000Z")
  );
  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.projectLabel, "ORDER TRACKING APP");
  assert.equal(groups[0]?.items[0]?.text, "refined delivery state management");
});

console.log("verify-profile-activity: all checks passed");
