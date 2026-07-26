# Kocaeli portfolio snapshot publish (Supabase Storage)

Electron dashboard publishes a public-safe aggregate JSON to this website. The website stores it in **this** Supabase project and serves the Kocaeli case page from Storage — not from Neon, Railway Admin API, or a remote URL.

## Canonical publish URL

```http
POST https://<YOUR_PRODUCTION_HOST>/api/portfolio-snapshot/kocaeli-real-estate
Authorization: Bearer <PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN>
Content-Type: application/json
```

Local:

```http
POST http://localhost:3000/api/portfolio-snapshot/kocaeli-real-estate
```

Optional monitoring read (sanitized latest only):

```http
GET https://<YOUR_PRODUCTION_HOST>/api/portfolio-snapshot/kocaeli-real-estate
```

## Environment variables (website host)

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=   # server only — never NEXT_PUBLIC_

# Snapshot publish (shared secret with Electron dashboard)
PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN=

# Optional override (default: portfolio-snapshots)
# PORTFOLIO_SNAPSHOTS_BUCKET=portfolio-snapshots
```

`KOCAELI_SNAPSHOT_URL` is **removed** — do not set it.

## Supabase Storage layout

| Item | Value |
|------|--------|
| Bucket | `portfolio-snapshots` (**private**) |
| Latest | `kocaeli-real-estate/latest.json` |
| Versions | `kocaeli-real-estate/versions/{snapshotVersion}.json` |

### Manual setup (required once)

1. Open Supabase Dashboard → **SQL Editor**
2. Run [`supabase/migrations/010_storage_portfolio_snapshots.sql`](../supabase/migrations/010_storage_portfolio_snapshots.sql)
3. Confirm bucket `portfolio-snapshots` exists and is **not** public
4. Ensure no anon/authenticated write policies on this bucket

This repo does **not** auto-apply the migration to production.

## Publish behavior

1. Bearer token checked (constant-time); never logged
2. Body size capped (~1.5 MiB); `Content-Type: application/json`
3. Zod + privacy scan (`containsRowLevelData: false`, no listing PII, density must be `unit_price_gross` / `TL/m²` with suppression metadata)
4. Write versioned object → re-validate → upsert `latest.json`
5. If latest write fails, previous `latest.json` is kept
6. Same `snapshotVersion` → idempotent success
7. Older `generatedAt` than current latest → `409`
8. Case pages revalidated via cache tag / path

Safe response fields only: `success`, `snapshotVersion`, `publishedAt`, `dataAsOf`, `object` (logical name).

## Case page read

`getKocaeliSnapshot()` downloads `latest.json` server-side (cached ~60s, tag `kocaeli-portfolio-snapshot`).

- Valid → `source: live` (density chart if bins present)
- Missing/invalid → checked-in **fallback-reference** (no synthetic density)

## Local test

```bash
# 1. Set PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN in .env and restart next
# 2. Ensure bucket exists (migration SQL)
# 3. Publish a fixture that includes containsRowLevelData: false

curl -sS -X POST http://localhost:3000/api/portfolio-snapshot/kocaeli-real-estate \
  -H "Authorization: Bearer $PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @path/to/public-safe-snapshot.json
```

Without token → `401`. Invalid unit/PII → `422`.

Unit-style checks (no Storage):

```bash
npx tsx scripts/verify-kocaeli-snapshot.ts
npx tsx scripts/verify-kocaeli-snapshot-publish.ts
```

## First publish checklist

1. Migration applied; bucket private
2. `PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN` set on website host **and** dashboard
3. Dashboard POSTs to production URL above
4. Open `/en/projects/kocaeli-real-estate` — badge should show live / Data as of
5. Density appears only if exporter bins passed validation

## Token rotation

1. Generate a new random secret (32+ bytes)
2. Update website env `PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN` and redeploy/restart
3. Update Electron dashboard to the same value
4. Old token stops working immediately (no dual-token window unless you add one)

Never commit the token. Never put it in `NEXT_PUBLIC_*`.
