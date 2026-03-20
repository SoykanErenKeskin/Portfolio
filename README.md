# Portfolio (systems / dashboard UI)

Next.js App Router, TypeScript, Tailwind. Content: `content/projects.json`, UI copy: `messages/en.json` & `messages/tr.json`.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — serve production build

## Customize

- Brand, nav, social URLs, contact email: `messages/*.json`
- Projects (all bilingual fields): `content/projects.json`
- **Project images:** put files under `public/projects/<project-id>/` (same id as in JSON). First entry in `images[]` is the case cover; the rest render in **Supplementary figures**. Paths in JSON are public URLs, e.g. `/projects/order-tracking-system/cover.jpg`. Rename files or edit `src` / `alt` to match what you ship.

