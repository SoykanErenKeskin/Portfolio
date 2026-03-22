import type { CrisisLang } from "@/lib/chat/sensitive-content";

const STORAGE_KEY = "portfolio.chat.crisisLock.v1";
/** Lifetime count of safety (crisis) locks triggered on this device — drives escalating durations */
const STRIKES_KEY = "portfolio.chat.crisisStrikes.v1";

/** 1st crisis lock on this device */
export const CRISIS_LOCK_DURATION_FIRST_MS = 3 * 30_000;
/** 2nd crisis lock */
export const CRISIS_LOCK_DURATION_SECOND_MS = 10 * 60_000;
/** 3rd and further crisis locks */
export const CRISIS_LOCK_DURATION_THIRD_PLUS_MS = 30 * 60_000;

/** @deprecated alias — first-tier default for legacy payloads */
export const CRISIS_LOCK_DURATION_MS = CRISIS_LOCK_DURATION_FIRST_MS;

function loadCrisisStrikeCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STRIKES_KEY);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function persistCrisisStrikeCount(n: number): void {
  try {
    localStorage.setItem(STRIKES_KEY, String(n));
  } catch {
    /* quota / private mode */
  }
}

/**
 * How many crisis locks have already been completed on this device (before the next one).
 * Used to pick 30s → 3min → 30min.
 */
export function getCrisisStrikeCount(): number {
  return loadCrisisStrikeCount();
}

/**
 * Duration for the **next** crisis lock: 1st = 30s, 2nd = 3min, 3+ = 30min.
 * Does not increment — call `recordCrisisStrikeAfterLock` after saving the lock.
 */
export function getNextCrisisLockDurationMs(): number {
  const prior = loadCrisisStrikeCount();
  if (prior === 0) return CRISIS_LOCK_DURATION_FIRST_MS;
  if (prior === 1) return CRISIS_LOCK_DURATION_SECOND_MS;
  return CRISIS_LOCK_DURATION_THIRD_PLUS_MS;
}

/** Call once after a crisis lock is persisted (increments strike count for future locks). */
export function recordCrisisStrikeAfterLock(): void {
  const n = loadCrisisStrikeCount();
  persistCrisisStrikeCount(n + 1);
}

export type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  crisis?: boolean;
  crisisLang?: CrisisLang;
};

export type CrisisLockPayload = {
  until: number;
  messages: StoredChatMessage[];
  /** Lock window length (ms) — stored so the progress ring stays correct after refresh */
  durationMs?: number;
};

export function loadCrisisLock(): CrisisLockPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as CrisisLockPayload;
    if (typeof j.until !== "number" || !Array.isArray(j.messages)) return null;
    if (j.durationMs !== undefined && typeof j.durationMs !== "number") return null;
    if (Date.now() >= j.until) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return j;
  } catch {
    return null;
  }
}

/** Returns true if a lock is active (also refreshes expired entries). */
export function isCrisisLockActive(): boolean {
  return loadCrisisLock() !== null;
}

export function saveCrisisLock(payload: CrisisLockPayload): void {
  try {
    const full: CrisisLockPayload = {
      ...payload,
      durationMs: payload.durationMs ?? CRISIS_LOCK_DURATION_FIRST_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* quota / private mode */
  }
}

export function clearCrisisLock(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Removes active cooldown **and** resets strike tier (next crisis = 1st tier).
 * Intended for admin testing / recovery.
 */
export function resetCrisisSafetyState(): void {
  clearCrisisLock();
  try {
    localStorage.removeItem(STRIKES_KEY);
  } catch {
    /* ignore */
  }
}
