# HRMS OXP — System Architecture

> **Stack:** React 18 + Vite · Node 22 + Express 4 · PostgreSQL 16 · Redis 7 · Clerk (Auth)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                                   │
│                                                                                │
│   React 18 + Vite  ·  TanStack Query  ·  Mantine UI  ·  Recharts             │
│   Clerk Frontend SDK  ·  React Hook Form + Zod  ·  TanStack Router            │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │  HTTPS / REST + JSON
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / NGINX                                   │
│          Rate limiting · SSL termination · Static asset serving               │
└──────────────────────────────┬─────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       NODE 22 + EXPRESS 4 API SERVER                          │
│                                                                                │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐ │
│   │  Auth    │  │ Business │  │  Payroll  │  │ Sentinel │  │  Dashboard  │ │
│   │  Layer   │  │  Layer   │  │  Engine   │  │  Engine  │  │  Copilot    │ │
│   │ (Clerk)  │  │ Services │  │(Rule Eval)│  │(Anomaly) │  │  (AI Layer) │ │
│   └──────────┘  └──────────┘  └───────────┘  └──────────┘  └─────────────┘ │
│                                                                                │
│   Middleware: requireRole · errorHandler · requestLogger · rateLimiter        │
└───────────┬──────────────────────────────┬──────────────────────────────────┘
            │                              │
            ▼                              ▼
┌────────────────────┐         ┌──────────────────────┐
│   PostgreSQL 16    │         │     Redis 7            │
│                    │         │                        │
│  Primary store for │         │  · Session cache       │
│  all entities.     │         │  · Dashboard KPI cache │
│  Prisma ORM with   │         │  · Rate-limit counters │
│  typed migrations. │         │  · Sentinel flag cache │
└────────────────────┘         └──────────────────────┘
```

---

## 2. Tech Stack Decision Matrix

| Layer | Choice | Why |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Fast HMR, ecosystem breadth |
| **UI Library** | Mantine v7 | Kanban-capable, rich data table, form support — all built-in |
| **Server State** | TanStack Query v5 | Automatic cache invalidation; resolve-flag→recompute feels instant |
| **Routing** | TanStack Router | File-based, type-safe, nested layouts per role |
| **Forms** | React Hook Form + Zod | Minimal re-renders; Zod schema shared with backend |
| **Charts** | Recharts | Simple API; recharts/area + recharts/bar covers all dashboard needs |
| **Backend Runtime** | Node 22 LTS | Native ESM, `--watch` in dev, excellent Prisma support |
| **Backend Framework** | Express 4 | Minimal overhead; predictable middleware chain |
| **ORM** | Prisma 5 | Schema-first, typed queries, seamless migration |
| **Primary DB** | PostgreSQL 16 | ACID semantics; `EXCLUDE USING gist` for contract-period exclusivity |
| **Cache** | Redis 7 | Dashboard KPI cache (TTL 30s), rate-limit counters |
| **Auth** | Clerk | JWT verified server-side; webhooks sync to internal User table |
| **PDF Generation** | pdf-lib | Pure Node, no headless browser dependency |
| **Email** | Resend + console fallback | Reliable transactional email |
| **AI / LLM** | Single `/lib/ai.ts` wrapper (Claude or GPT) | Phrase-only, never computes numbers |
| **Formula Engine** | `expr-eval` | Safe expression parser; no code-injection risk |

---

## 3. Production-Grade Folder Structure

```
paypilot/
│
├── apps/
│   ├── web/                          # React + Vite frontend
│   │   ├── public/
│   │   └── src/
│   │       ├── assets/
│   │       ├── components/           # Shared/reusable UI components
│   │       │   ├── ui/               # Primitives (Button, Badge, Modal...)
│   │       │   ├── layout/           # AppShell, Sidebar, Topbar
│   │       │   ├── data-display/     # DataTable, KpiCard, Chart wrappers
│   │       │   └── forms/            # FormInput, FormSelect, DatePicker...
│   │       ├── features/             # Feature-sliced modules
│   │       │   ├── auth/
│   │       │   ├── employees/
│   │       │   │   ├── components/   # EmployeeKanban, EmployeeForm...
│   │       │   │   ├── hooks/        # useEmployees, useEmployee
│   │       │   │   ├── api.ts
│   │       │   │   └── types.ts
│   │       │   ├── contracts/
│   │       │   ├── schedules/
│   │       │   ├── attendance/
│   │       │   ├── time-off/
│   │       │   ├── payroll/
│   │       │   │   ├── payrun/
│   │       │   │   ├── payslip/
│   │       │   │   ├── salary-structures/
│   │       │   │   └── sentinel/     # Flag cards, resolve UI, diff animation
│   │       │   └── dashboard/
│   │       │       ├── components/   # KpiCard, SalaryChart, AlertsList...
│   │       │       └── copilot/      # Copilot chat input + response
│   │       ├── hooks/                # Global hooks (useAuth, usePermissions)
│   │       ├── lib/
│   │       │   ├── api-client.ts     # Axios instance with Clerk JWT injection
│   │       │   ├── query-client.ts
│   │       │   └── constants.ts
│   │       ├── routes/               # TanStack Router route definitions
│   │       │   ├── __root.tsx
│   │       │   ├── _auth/            # Protected routes
│   │       │   └── _public/          # Login
│   │       ├── store/                # Zustand for client-side UI state
│   │       ├── types/
│   │       └── utils/
│   │
│   └── api/                          # Node + Express backend
│       └── src/
│           ├── config/
│           │   ├── env.ts            # Zod-validated env vars
│           │   ├── redis.ts          # Redis client singleton
│           │   └── clerk.ts          # Clerk SDK init
│           ├── db/
│           │   ├── prisma/
│           │   │   ├── schema.prisma
│           │   │   └── migrations/
│           │   ├── client.ts         # Prisma client singleton
│           │   └── seed.ts           # Demo data seeder
│           ├── middleware/
│           │   ├── authenticate.ts   # Verify Clerk JWT, attach user to req
│           │   ├── authorize.ts      # requireRole([...]) factory
│           │   ├── rateLimiter.ts    # Redis-backed rate limiting
│           │   ├── requestLogger.ts  # Pino HTTP logger
│           │   ├── errorHandler.ts   # Centralised error handler
│           │   └── validate.ts       # Zod body/query validation
│           ├── modules/
│           │   ├── auth/
│           │   ├── employees/
│           │   │   ├── employees.router.ts
│           │   │   ├── employees.service.ts
│           │   │   └── employees.schema.ts
│           │   ├── contracts/
│           │   ├── schedules/
│           │   ├── attendance/
│           │   ├── time-off/
│           │   ├── salary/
│           │   │   ├── salary.router.ts
│           │   │   ├── salary.service.ts
│           │   │   └── rule-engine/
│           │   │       ├── evaluator.ts    # expr-eval wrapper
│           │   │       └── validator.ts    # Save-time formula validation
│           │   ├── payroll/
│           │   │   ├── payroll.router.ts
│           │   │   ├── payroll.service.ts
│           │   │   ├── compute.service.ts
│           │   │   └── pdf.service.ts
│           │   ├── sentinel/
│           │   │   ├── sentinel.router.ts
│           │   │   ├── sentinel.service.ts
│           │   │   └── sentinel.checks.ts
│           │   └── dashboard/
│           │       ├── dashboard.router.ts
│           │       ├── dashboard.service.ts
│           │       └── copilot.service.ts
│           ├── lib/
│           │   ├── ai.ts             # LLM wrapper (phrase-only)
│           │   ├── email.ts          # Resend + console fallback
│           │   ├── cache.ts          # Redis helpers
│           │   └── pdf.ts            # pdf-lib helpers
│           ├── types/
│           │   └── express.d.ts      # Augmented Request (req.user)
│           ├── utils/
│           │   ├── errors.ts
│           │   ├── pagination.ts
│           │   └── date.ts
│           └── app.ts
│
├── packages/
│   └── shared/
│       └── src/
│           ├── types/                # Shared entity types
│           ├── schemas/              # Shared Zod schemas
│           └── constants/            # Role names, flag types, enums
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml        # Local: postgres + redis
│   └── nginx/
│       └── nginx.conf
│
├── docs/                             # Documentation (this directory)
├── .env.example
├── .gitignore
├── package.json                      # Root workspace (pnpm)
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 4. Request Lifecycle

```
Browser                   Nginx            Express                  Postgres/Redis
  │                         │                 │                          │
  │── POST /api/payruns ──► │                 │                          │
  │                         │── forward ────► │                          │
  │                         │                 │── authenticate()          │
  │                         │                 │   (verify Clerk JWT)      │
  │                         │                 │── authorize(['PAYROLL_USER'])
  │                         │                 │── validate(bodySchema)    │
  │                         │                 │── rateLimiter()           │
  │                         │                 │                           │
  │                         │                 │── cache.get(key) ────────►│
  │                         │                 │◄── HIT → return cached ──│
  │                         │                 │                           │
  │                         │                 │── prisma.payrun.create() ►│
  │                         │                 │◄── payrun record ─────── │
  │                         │                 │── cache.set(key, ttl) ───►│
  │                         │                 │                           │
  │◄── 201 { payrun } ──────│◄── 201 ────────│                           │
```

---

## 5. Redis Caching Strategy

| Cache Key Pattern | TTL | Invalidated On |
|---|---|---|
| `dashboard:kpis:{period}:{dept}` | 30s | Payrun status change, Mark Paid |
| `dashboard:chart:{period}:{dept}` | 30s | Same |
| `employee:list` | 60s | Employee create/update/delete |
| `employee:{id}:related` | 60s | Contract/Attendance/TimeOff change |
| `sentinel:flags:{payrunId}` | Until resolve or re-validate | Sentinel resolve action |
| `rate-limit:{ip}` | 60s rolling window | — |

> **Rule:** Cache reads, never cache writes. Invalidate eagerly on mutations.

---

## 6. Environment Variables

```bash
# apps/api/.env

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/paypilot"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="payroll@oxp.io"

# App
NODE_ENV="production"
PORT=3001
CORS_ORIGIN="https://oxp.io"
LOG_LEVEL="info"

# apps/web/.env
VITE_CLERK_PUBLISHABLE_KEY="pk_live_..."
VITE_API_BASE_URL="https://api.oxp.io"
```

---

## 7. Deployment Topology

**Hackathon (MVP):** Single Railway service — API serves built React static files. Managed Postgres + Upstash Redis. Deployed by hour 12, re-deployed incrementally.

**Production target:**
```
Cloudflare CDN
    │
Load Balancer
    │
    ├── Node API Pods (2x, auto-scale)
    │       ├── PostgreSQL (managed + PgBouncer pooling)
    │       └── Redis (ElastiCache / Upstash)
    └── Static Assets (CDN — Vite build)
```
