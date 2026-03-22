# Admin CMS – Architecture Proposal

## 1. Database Schema

### Tables

**`Admin`** (single-admin setup)
| Column       | Type     | Description                    |
|-------------|----------|--------------------------------|
| id          | String   | Primary key                    |
| email       | String   | Unique, login identifier       |
| passwordHash| String   | bcrypt hash                    |
| createdAt   | DateTime |                                |

**`Project`**
| Column      | Type     | Description                    |
|-------------|----------|--------------------------------|
| id          | String   | Primary key (cuid)             |
| slug        | String   | URL slug, unique               |
| date        | DateTime | Project date                   |
| status      | Enum     | `DRAFT` \| `PUBLISHED`         |
| featured    | Boolean  | Highlight on home              |
| sortOrder   | Int      | Manual ordering                |
| createdAt   | DateTime |                                |
| updatedAt   | DateTime |                                |

**`ProjectContent`** (one per locale per project)
| Column          | Type   | Description                    |
|-----------------|--------|--------------------------------|
| id              | String | Primary key                    |
| projectId       | String | FK → Project                   |
| locale          | Enum   | `tr` \| `en`                   |
| title           | String |                                |
| shortDescription| String |                                |
| summary         | String |                                |
| domain          | String?|                                |
| focus           | String?|                                |
| problem         | String |                                |
| approach        | String |                                |
| outcome         | String |                                |
| detail          | String?| Legacy freeform                |
| statusLabel     | String?| e.g. "Completed"               |

**`TechnicalBlock`** (JSON stored on Project)
- Stored as `technicalStructure` JSON on Project for simplicity

**`ProjectDataTable`** (JSON stored on Project)
- Stored as `dataTable` JSON on Project

**`ProjectTech`**
| Column   | Type   | Description                    |
|----------|--------|--------------------------------|
| id       | String | Primary key                    |
| projectId| String | FK → Project                   |
| tag      | String | Tech tag                       |

**`ProjectTool`**
| Column   | Type   | Description                    |
|----------|--------|--------------------------------|
| id       | String | Primary key                    |
| projectId| String | FK → Project                   |
| tool     | String | Tool name                      |

**`ProjectImage`**
| Column   | Type   | Description                    |
|----------|--------|--------------------------------|
| id       | String | Primary key                    |
| projectId| String | FK → Project                   |
| src      | String | Path (e.g. /uploads/...)       |
| altTr    | String | Alt text TR                    |
| altEn    | String | Alt text EN                    |
| type     | Enum   | `IMAGE` \| `VIDEO`             |
| sortOrder| Int    | Display order                  |
| isVideoUrl| Bool  | If true, src is external URL   |

**`ProjectLinks`** (embedded or separate table)
- Stored as JSON on Project: `{ github?, live?, videoUrl? }`

### Simplified Prisma Approach

We will use a slightly flattened schema:
- **Project**: core fields + `technicalStructure` (JSON), `dataTable` (JSON), `links` (JSON)
- **ProjectContent**: per-locale text (title, summary, problem, approach, outcome, etc.)
- **ProjectTech**, **ProjectTool**, **ProjectImage**: separate tables for tags, tools, images

---

## 2. Auth Approach

- **NextAuth.js** with Credentials Provider
- Session: JWT in httpOnly cookie
- Password: bcrypt (cost 12)
- Single admin: one Admin record, email + password
- Environment: `ADMIN_EMAIL`, `ADMIN_PASSWORD` for initial setup (or seed script)
- Protected routes: middleware checks session for `/admin/*` (except `/admin/login`)
- Redirect unauthenticated users to `/admin/login`

---

## 3. Admin Routes & Components

### Routes
| Path                    | Purpose                         |
|-------------------------|---------------------------------|
| `/admin`                | Redirect to login or dashboard  |
| `/admin/login`          | Login form                      |
| `/admin/dashboard`      | Project list + quick actions    |
| `/admin/projects/new`   | Create project form             |
| `/admin/projects/[id]`  | Edit project form               |

### API Routes
| Method | Path                      | Purpose                    |
|--------|---------------------------|----------------------------|
| POST   | `/api/auth/[...nextauth]` | NextAuth handlers          |
| GET    | `/api/admin/projects`     | List projects (admin only) |
| POST   | `/api/admin/projects`     | Create project             |
| GET    | `/api/admin/projects/[id]`| Get single project         |
| PATCH  | `/api/admin/projects/[id]`| Update project             |
| DELETE | `/api/admin/projects/[id]`| Delete project             |
| POST   | `/api/admin/upload`       | Image upload               |
| GET    | `/api/admin/tags`         | Distinct tech & tool tags from DB (admin) |

### Components
- `AdminLayout` – sidebar + header, auth check
- `LoginForm` – email/password, validation
- `ProjectList` – table/cards, status badges, edit/delete actions
- `ProjectForm` – full form with TR/EN tabs, tech tags, tools, images, reorder
- `ImageUpload` – drag-drop, preview, alt text, reorder
- `TechTagInput` – add/remove tags

---

## 4. Media Management

- **Storage**: `public/uploads/projects/[projectId]/` – files served statically (local dev). For serverless/production (e.g. Vercel), set `SUPABASE_UPLOAD_BUCKET` to a **public** Supabase Storage bucket name; uploads go there and the API returns the public URL.
- **Tags API**: `GET /api/admin/tags` returns `{ tech, tools }` from all projects for the admin tag pickers.
- **Upload API**: multipart/form-data, validate MIME (image/*, video/*), max size (e.g. 5MB)
- **Video URL**: optional field for external video (YouTube, Vimeo, etc.)
- **Images**: multiple per project, `sortOrder` for ordering
- **Fallback**: empty arrays when no media; UI handles gracefully

---

## 5. Public Portfolio Integration

- Replace `lib/projects.ts` with `lib/db/projects.ts` that queries Prisma
- `getAllProjects()` → filter by `status === PUBLISHED`
- `getProjectById(id)` → by id or slug
- `getLatestProjects(n)` → published, sorted by date, limit n
- Remove `generateStaticParams` for project pages (dynamic routing)
- Keep existing components (`ProjectCase`, `ProjectRegistry`, etc.) – they receive `ProjectRecord` shape from DB adapter

---

## 6. Implementation Order

1. **Database**: Prisma + SQLite schema, migrate, seed admin + optional data import
2. **Auth**: NextAuth setup, credentials provider, middleware for `/admin`
3. **API**: Projects CRUD, upload endpoint
4. **Admin UI**: Layout, login, project list, project form
5. **Public integration**: Replace `lib/projects.ts` with DB layer
6. **Data migration**: Script to import `content/projects.json` into DB

---

## 7. Hostinger Notes

- Use **Node.js Web Apps** or **VPS** (not static-only hosting)
- Static export has been removed from `next.config.ts`
- Set env vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- For production DB: use PostgreSQL (Neon, Supabase) or Hostinger MySQL/PostgreSQL; SQLite for local/dev

## 8. Quick Start

```bash
# Install deps
npm install

# Configure .env (copy from .env.example)
# Set ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET

# Create database & admin user
npm run db:migrate
npm run db:seed

# Import existing projects from content/projects.json (optional)
npm run db:import

# Run dev server
npm run dev
```

Then visit:
- Public: http://localhost:3000/en
- Admin: http://localhost:3000/admin (login with ADMIN_EMAIL / ADMIN_PASSWORD)
