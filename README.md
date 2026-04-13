Portfolio Website

This project is a personal portfolio built with Next.js, TypeScript, and Tailwind CSS. It presents my work across data analysis, machine learning, and decision-oriented systems, with a focus on structured thinking and engineering-driven problem solving.

Overview

The portfolio is designed as a system-oriented interface rather than a traditional landing page. It emphasizes clarity, analytical thinking, and technical breakdowns of projects.

Each project is presented as a case study, including problem definition, approach, technical structure, and outcomes.

Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

Features

- Case-study based project pages
- Technology-based filtering system
- Structured project breakdown (Problem, Approach, Technical Structure, Outcome)
- Light and dark mode support
- Bilingual support (English and Turkish)
- Static export support for deployment

Project Structure

- "app/" – Application routes and pages
- "components/" – Reusable UI components
- "data/" – Project data and content
- "public/projects/" – Project images and assets

Projects

The portfolio includes projects focused on:

- Data analysis and modeling
- Machine learning and model comparison
- Operational and tracking systems
- Decision-making and optimization methods

Each project is treated as a technical case, not just a visual showcase.

Admin (CMS) & image uploads

Project images in the admin panel are stored in **Supabase Storage** when `SUPABASE_UPLOAD_BUCKET` is set (recommended; especially on Vercel or if `public/uploads` fails locally). See **[docs/STORAGE_SETUP.md](docs/STORAGE_SETUP.md)** for bucket creation and `.env` variables.

GitHub activity (home page)

The **Learning timeline** section can show a contribution heatmap and activity summary from your GitHub account. Set in `.env` (server-only, never commit):

- **`GITHUB_TOKEN`** — Personal access token (classic: `read:user` is enough; fine-grained: read access to user metadata). Required for the GraphQL API to return contribution data reliably.
- **`GITHUB_USERNAME`** — Optional. If omitted, the username is parsed from `social.github` in [messages/en.json](messages/en.json) / [messages/tr.json](messages/tr.json).

Without `GITHUB_TOKEN`, the GitHub block is omitted.

Development

To run the project locally:

npm install
npm run dev

Build and Deployment

For static hosting:

npm run build

This generates an "out/" directory which can be deployed to any static hosting service.

Notes

This project prioritizes structure, readability, and clarity over visual complexity. The goal is to reflect how problems are approached and solved, rather than only showcasing final outputs.