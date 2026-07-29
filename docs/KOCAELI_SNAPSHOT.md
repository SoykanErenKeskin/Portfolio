# Kocaeli portfolio snapshot (Storage read)

Electron dashboard publishes public-safe aggregate JSON **directly** to Supabase Storage. This website **only reads** `latest.json`. It does not accept dashboard POST publish, does not use Neon, and does not put a service role on the snapshot read path.

## Architecture

```text
Electron dashboard
  → generate + validate
  → upload (service role, main process only)
       bucket: portfolio-snapshots
       objects: kocaeli-real-estate/latest.json
                kocaeli-real-estate/{snapshotVersion}.json

Portfolio Next.js
  → HTTPS GET public object latest.json
  → Zod parse
  → case page (metrics, density, counties, optional listingGrowth charts)
  → if missing/invalid → checked-in fallback-reference (no synthetic density, listingGrowth null)
```

## Storage layout

| Item | Value |
|------|--------|
| Bucket | `portfolio-snapshots` (**public read**, write via service role from dashboard only) |
| Latest | `kocaeli-real-estate/latest.json` |
| Versions | `kocaeli-real-estate/{snapshotVersion}.json` |

### Manual setup (once)

1. Supabase Dashboard → SQL Editor
2. Run [`supabase/migrations/010_storage_portfolio_snapshots.sql`](../supabase/migrations/010_storage_portfolio_snapshots.sql)
3. Confirm bucket is public-read and that **no** anon/authenticated **write** policies exist
4. After first dashboard publish, open:

`https://<PROJECT>.supabase.co/storage/v1/object/public/portfolio-snapshots/kocaeli-real-estate/latest.json`

## Website environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co

# Optional overrides
# PORTFOLIO_SNAPSHOTS_BUCKET=portfolio-snapshots
# PORTFOLIO_SNAPSHOT_STORAGE_PREFIX=kocaeli-real-estate
# PORTFOLIO_SNAPSHOT_PUBLIC_URL=https://cdn.example/…/latest.json
```

**Do not set on the website:**

- `PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN` (removed)
- `PORTFOLIO_SNAPSHOT_PUBLISH_URL` (removed)
- Snapshot **service role** for reading (dashboard owns writes)

`SUPABASE_SERVICE_ROLE_KEY` may still exist for **admin CMS / project image uploads**. It must not be required for the Kocaeli case page snapshot read.

## Case page behavior

`getKocaeliSnapshot()` fetches the public `latest.json` (cached ~60s).

| Field | UI |
|-------|-----|
| Global metrics / counties / density | Existing sections |
| `listingGrowth` object | 30-day daily chart + all-time cumulative chart (sale / rental / total) |
| `listingGrowth: null` | Growth section hidden; rest of page works |
| Missing / invalid latest | Fallback reference; density empty; no growth charts |

## Removed (do not restore)

- `POST /api/portfolio-snapshot/kocaeli-real-estate`
- Bearer publish token auth
- Website writing to Storage on behalf of the dashboard

## Local check

```bash
npm run test:kocaeli-snapshot
```

With a published object, open `/en/projects/kocaeli-real-estate` and `/tr/projects/kocaeli-real-estate`.
