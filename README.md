# BBA Dashboard

Internal operations dashboard for **Barito Bahalap Agency (BBA)** and its two divisions, **BBT** (Barito Bahalap Tech, Divisi Rancang Bangun) and **BBM** (Barito Bahalap Media, Divisi Media & Komunikasi).

The dashboard is the single source of truth for clients, contracts, projects, payments and recurring revenue. It is an internal tool. It is not client-facing and not a public website.

## What it is and is not

| It is                                                      | It is not                                   |
| ---------------------------------------------------------- | ------------------------------------------- |
| A control layer for money, commitments and delivery health | A task or project-management tool           |
| A read-only supervision view of BBM performance            | A place to write or edit BBM content        |
| A tracker for BBT retainers and out-of-scope work          | A tracker for client credentials or secrets |
| Role-restricted and audited                                | A client portal                             |

## Roles

| Role            | Scope                                                           |
| --------------- | --------------------------------------------------------------- |
| `MASTER_ADMIN`  | Sees everything                                                 |
| `UNIT_ADMIN`    | Sees everything that belongs to own division (BBT or BBM only)  |
| `FINANCE_ADMIN` | Finance, invoices, payments and related records only            |
| `UNIT_MEMBER`   | Assigned tasks, own allocation, own incentive (BBT or BBM only) |

### Access matrix (design intent)

The database RLS policies are the source of truth. This table is the target they must satisfy.

| Module     | MASTER_ADMIN | UNIT_ADMIN                     | FINANCE_ADMIN     | UNIT_MEMBER            |
| ---------- | ------------ | ------------------------------ | ----------------- | ---------------------- |
| Overview   | Full         | Own division                   | Finance tiles     | Own summary            |
| Clients    | Full         | Own division's clients         | Read              | Assigned projects only |
| Contracts  | Full         | Own division                   | Read              | None                   |
| Projects   | Full         | Own division                   | Read              | Assigned only          |
| Finance    | Full         | Own division, read             | Full              | None                   |
| Incentives | Full         | To be decided (see roadmap D3) | Payout view       | Own only               |
| People     | Full         | Own division                   | None              | Own profile            |
| Documents  | Full         | Own division                   | Finance documents | Assigned projects      |
| Audit      | Full         | None                           | None              | None                   |

## Modules and status

Delivery order and exit criteria are in [DEVELOPMENT_STAGES.md](./DEVELOPMENT_STAGES.md).

| Module                                    | Stage   | Notes                                              |
| ----------------------------------------- | ------- | -------------------------------------------------- |
| Login, MFA, session                       | 1       | Scaffolded                                         |
| Clients                                   | 1       | Page scaffolded                                    |
| Contracts                                 | 1       | Page scaffolded                                    |
| Projects and project detail               | 1       | Page scaffolded                                    |
| Finance (invoices, payments, receivables) | 1       | Page scaffolded                                    |
| Overview                                  | 1 and 2 | Page scaffolded, KPIs defined in roadmap           |
| Pipeline                                  | 2       | Not started                                        |
| BBT retainers                             | 2       | Not started                                        |
| BBM read-only overview                    | 3       | Not started. Needs a data feed from the BBM system |
| People and capacity                       | 3       | Page scaffolded                                    |
| Documents                                 | 3       | Page scaffolded                                    |
| Incentives and project payout             | 3       | Scaffolded. Locked until the formula is defined    |
| Assets register (BBT)                     | 4       | Not started                                        |
| Audit                                     | 1 and 4 | Scaffolded. Hardening in Stage 4                   |

Risk and compliance is intentionally out of scope for the early phase.

## Tech stack

- React and TypeScript, built with Vite
- Client-side routing with role-based route guards
- Supabase: Postgres, Auth and Row Level Security
- Plain CSS per component, global styles in `src/styles/app.css`
- pnpm as package manager
- Vercel for hosting (`vercel.json`)

## Project structure

```
bba-dashboard/
  public/                 Static assets
  scripts/                Helper scripts
  src/
    app/                  App root, router, route guards
    components/           Shared components, AppShell layout
    contexts/session/     Session provider and context
    data/                 Static config: navigation, columns, copy, tones
    domain/types.ts       Shared domain types
    hooks/                Data and auth hooks (one per concern)
    pages/                One folder per feature (page plus css)
    styles/app.css        Global styles
    main.tsx              Entry point
  supabase/migrations/    Ordered SQL migrations
  .env.example            Required environment variables
  vercel.json             Deployment config
```

## Getting started

Prerequisites: Node.js (current LTS), pnpm, a Supabase project.

```bash
pnpm install
cp .env.example .env      # Windows: copy .env.example .env
# fill in the values listed in .env.example
pnpm dev
```

Other scripts are defined in `package.json` (typically `build`, `lint` and `preview`).

## Database

Migrations live in `supabase/migrations` and must be applied in order.

| File                   | Purpose                            |
| ---------------------- | ---------------------------------- |
| `0001_core.sql`        | Core tables                        |
| `0002_incentives.sql`  | Incentive tables                   |
| `0003_seed_gov002.sql` | Sample seed data. Development only |
| `0004_audit.sql`       | Audit log and chain                |
| `0005_rls.sql`         | Row Level Security policies        |
| `0006_views.sql`       | Reporting views                    |

Apply with the Supabase CLI (`supabase db push`) or run each file in order in the Supabase SQL editor.

Rules for new migrations:

- One migration per change, numbered sequentially, never edit an applied migration
- Every new table gets RLS enabled and policies for each role in the same migration
- Every policy change gets an RLS test for each role

## Security notes

- `.env` must never be committed. Confirm it is listed in `.gitignore`
- Only the public (anon) Supabase key belongs in the frontend. The service-role key must never reach the browser or the repository
- MFA is required for admin roles
- Do not store client passwords, API keys or tokens. Store ownership, location and rotation date only
- The frontend hides what a role should not see. The database must enforce it. Treat frontend checks as convenience, not security

## Conventions

- One folder per feature under `src/pages`
- Page components do not call the database directly. Use a hook in `src/hooks`
- Static labels, columns and navigation live in `src/data`
- Shared types live in `src/domain/types.ts`
- Build in slices: schema and RLS, hook, page, test, deploy

## Deployment

Hosted on Vercel. Set the same environment variables as `.env.example` in the Vercel project settings. Production uses its own Supabase project, separate from development.

## Documentation

- [DEVELOPMENT_STAGES.md](./_dev/DEVELOPMENT_STAGES.md): staged roadmap, exit criteria, decision log
