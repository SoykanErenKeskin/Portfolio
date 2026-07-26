# Test-only density fixtures

Use this folder for offline chart tests only.

- Do **not** import fixtures from `get-snapshot.ts` or production UI.
- Production density charts render only when a live public snapshot passes semantic validation (`targetName=unit_price_gross`, `unit=TL/m²`).
- Never put synthetic diagonal heatmaps in `fallback-snapshot.json`.
