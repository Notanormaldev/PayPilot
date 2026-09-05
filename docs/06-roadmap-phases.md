# HRMS OXP — Roadmap & Development Phases

> 24-hour hackathon execution plan + post-hackathon production roadmap.

---

## Part A — Hackathon Execution Plan (24 Hours)

### Overview

```
Hour 0         4         8        12        16     18.5     20      21.5  22.5  24
  │────────────│─────────│────────│─────────│──────│────────│───────│─────│─────│
  │ Phase 1    │ Phase 2 │Phase 3 │Phase 4  │Phase5│ Phase 6│Phase 7│P8   │P9   │
  │ Foundation │ Workflows│Frontend│Payroll  │Senti-│ AI     │Dash-  │QA   │Demo │
  │            │         │        │ Core    │nel   │ Layer  │board  │     │Prep │
```

---

### Phase 1 — Foundation (Hours 0–4)

**Goal:** Running skeleton deployed, all DB tables created, pure JWT auth working.

| Task | Time | Owner Area |
|---|---|---|
| Monorepo scaffold (pnpm + turbo) | 30min | Infra |
| `docker-compose.yml` (Postgres + Redis) | 20min | Infra |
| Prisma schema (all tables) | 45min | DB |
| `prisma db push` — verify schema | 15min | DB |
| Pure JWT Secret setup + `.env` | 20min | Auth |
| Express app factory + middleware stack | 30min | Backend |
| `authenticate` + `requireRole` middleware | 20min | Backend |
| Vite + React scaffold + Mantine theme | 30min | Frontend |
| Redux store + root layout + auth guard | 30min | Frontend |
| Deploy to Railway/Render (smoke test) | 20min | Infra |

**Deliverable:** `GET /health → 200`, JWT login/refresh flow works, protected route rejects unauthenticated requests.


**Cut if behind:** Fewer Contract edge cases — but period-resolver service must be done by end of Phase 2.

---

### Phase 2 — Core Workflows (Hours 4–8)

**Goal:** All business-logic services coded and unit-tested (in isolation, not E2E).

| Task | Time | Dependencies |
|---|---|---|
| Employee service (CRUD + related-counts) | 45min | Auth |
| Working Schedule service (CRUD + weekly hours calc) | 30min | — |
| Contract service (CRUD + **period-resolver** + overlap check) | 75min | Employee |
| Attendance service (CRUD + worked/overtime calc + correction) | 45min | Employee, Schedule |
| Time Off service (types + allocations + **balance-ledger transaction**) | 60min | Employee |
| Salary Rule Engine (expr-eval evaluator + save-time validation) | 60min | — |

> ⚠️ **Critical path:** Contract period-resolver and Time Off balance-ledger are the two most judge-visible business-logic pieces. Unit-test both in isolation before building on top.

```typescript
// Unit test: contract period-resolver
describe('resolveContractForPeriod', () => {
  it('returns the contract whose date range contains the period', ...);
  it('returns null if no running contract covers the period', ...);
  it('does not return expired contracts', ...);
});
```

**Deliverable:** All service functions pass unit tests. No frontend needed yet.

**Cut if behind:** Formula method (FORMULA) → implement FIXED and PERCENTAGE only for now; add FORMULA in Phase 3.

---

### Phase 3 — Frontend (Hours 8–12)

**Goal:** Navigable app with all non-payroll screens functional.

| Task | Time |
|---|---|
| Sidebar + top nav with role guards | 30min |
| Employee Kanban/List + Form | 60min |
| Contract List/Form (incl. conflict modal) | 45min |
| Working Schedule List/Form (live weekly hours) | 30min |
| Attendance List/Form + Quick Widget (check-in/out) | 60min |
| Time Off Requests/Allocations/Types screens | 60min |
| TanStack Query hooks for all above modules | 30min |

**Deliverable:** HR Manager can perform the full onboarding-to-first-attendance flow in the UI.

**Cut if behind:** Kanban drag-and-drop → static list view (still shows all employees, still scores well).

---

### Phase 4 — Payroll Core (Hours 12–16)

**Goal:** End-to-end employee → payslip flow works.

| Task | Time |
|---|---|
| Salary Structure + Rule config UI (with formula editor) | 45min |
| Payrun wizard (Step 1 + Step 2 + Create) | 45min |
| Payrun processing screen (Compute + Validate + Mark Paid + Send) | 45min |
| Payslip detail screen (rule-by-rule breakdown) | 30min |
| PDF generation (pdf-lib, basic layout) | 30min |
| Bulk email send (Resend + console fallback) | 20min |
| Compute service (rule engine orchestration per payrun) | 45min |

**Deliverable:** Payroll User can create a payrun, compute payslips, see the rule-by-rule breakdown, print PDF, send emails.

**Cut if behind:** PDF styling stays plain; email stays console-only.

---

### Phase 5 — Sentinel (Hours 16–18.5) ⭐ PROTECTED WINDOW

**Goal:** The differentiator. Do not let earlier phases eat into this time.

| Task | Time |
|---|---|
| `sentinel.checks.ts` — deterministic checks (missing bank, duplicate, no contract) | 45min |
| Statistical anomaly check (trailing 3-payslip avg, SQL query) | 30min |
| Sentinel flag storage + `/validate` endpoint | 20min |
| Flag cards UI on Payrun processing screen | 30min |
| Resolve endpoint + scoped recompute service | 25min |
| Before/after diff animation on Payslip (the WOW moment) | 20min |

**Deliverable:** Clicking Validate surfaces flag cards with plain-language reasons; clicking Resolve recomputes live with animated diff.

**Cut if behind:** Drop the statistical anomaly check; ship deterministic-rules-only Sentinel with the recompute animation intact. **Never cut the resolve+recompute interaction — this is the demo's money moment.**

---

### Phase 6 — AI Layer (Hours 18.5–20)

**Goal:** LLM narration for flags and payslip traces.

| Task | Time |
|---|---|
| `/lib/ai.ts` wrapper (Claude API, hardcoded fallback) | 20min |
| Sentinel flag phrasing (structured fact → LLM → one sentence) | 30min |
| `/payslips/:id/explain` endpoint (rule trace → LLM narration) | 20min |
| Explain panel on Payslip detail screen | 20min |

**Deliverable:** Sentinel cards show AI-phrased reasons (with number-match validation); Payslip has an "Explain this payslip" panel.

**Cut if behind:** Hardcode 3–5 phrasing templates per flag type; defer the explain panel to Phase 8 (buffer).

---

### Phase 7 — Dashboard (Hours 20–21.5)

**Goal:** Live, filterable payroll dashboard with Copilot.

| Task | Time |
|---|---|
| Dashboard aggregate SQL queries (KPIs, charts, alerts) | 30min |
| Redis caching layer (30s TTL on dashboard endpoints) | 15min |
| Dashboard UI (KPI cards + 2 charts + alerts list) | 30min |
| Copilot template matching + LLM phrasing | 15min |
| Copilot input component on dashboard | 15min |

**Deliverable:** Live dashboard; Copilot answers ~4 pre-defined question types.

**Cut if behind:** 1 chart (salary-by-department) instead of 2; Copilot with 3 hardcoded templates.

---

### Phase 8 — QA + Integration (Hours 21.5–22.5)

| Task | Time |
|---|---|
| Cross-module smoke test (full demo flow) | 30min |
| Per-role RBAC test (Employee, HR Manager, Payroll User, Payroll Manager, Admin) | 20min |
| Fix any critical bugs found | 10min |

---

### Phase 9 — Demo Prep (Hours 22.5–24)

| Task | Time |
|---|---|
| Seed the story dataset (see [07-ai-and-bonus.md](./07-ai-and-bonus.md) §Demo Data) | 30min |
| Rehearse demo flow once with stopwatch | 30min |
| Deploy final build | 20min |
| Buffer / breathe | 10min |

---

## Part B — Post-Hackathon Production Roadmap

> Assuming the hackathon MVP is successfully delivered. Each phase is a 2-4 week sprint.

---

### Sprint 1 — Production Hardening (Weeks 1–2)

**Theme:** Make the MVP production-safe and observable.

- [ ] PostgreSQL `EXCLUDE USING gist` constraint for contract-period exclusivity
- [ ] PgBouncer connection pooling
- [ ] BullMQ job queue for async email sending (replaces synchronous send)
- [ ] Structured logging (Pino) → Datadog / Grafana Loki
- [ ] Error tracking (Sentry)
- [ ] `/health` extended with detailed DB/Redis/external-service checks
- [ ] API rate limiting (Redis-backed) per-user, not just per-IP
- [ ] Input sanitization audit (all user-supplied strings)
- [ ] Automated test suite (Vitest unit tests for all service functions)
- [ ] CI pipeline (GitHub Actions: lint → test → build → deploy)

---

### Sprint 2 — Employee Self-Service (Weeks 3–4)

**Theme:** Give employees a first-class experience.

- [ ] Employee mobile-responsive layout
- [ ] My Dashboard (attendance widget, leave balance, latest payslip status, Sentinel note if flagged)
- [ ] Attendance heatmap / leave calendar
- [ ] Push notifications (web push) on leave approval / payslip sent
- [ ] Password reset + Clerk SSO (Google Workspace)
- [ ] Payslip download history (multiple periods)

---

### Sprint 3 — Payroll Intelligence Depth (Weeks 5–6)

**Theme:** Make Sentinel smarter and more configurable.

- [ ] Configurable Sentinel thresholds (Payroll Manager can set the anomaly deviation % per department)
- [ ] Sentinel flag history + resolution analytics
- [ ] Statistical anomaly: tunable rolling window (3/6/12 months)
- [ ] More flag types: contract wage mismatch, attendance-vs-payslip discrepancy, unexpected new deduction
- [ ] Sentinel flag email digest to Payroll Manager (daily summary of unresolved flags)
- [ ] Exportable audit trail PDF (compliance artifact)

---

### Sprint 4 — Multi-Tenancy Foundation (Weeks 7–8)

**Theme:** Enable multiple organizations on one deployment.

- [ ] Row-level security (Postgres RLS policies) per `orgId`
- [ ] Clerk Organization → internal `Organization` mapping
- [ ] Org-scoped Clerk JWT claims
- [ ] Tenant isolation smoke tests
- [ ] Org-level settings (timezone, currency symbol, working week)

---

### Sprint 5 — Payroll Localization (Weeks 9–10)

**Theme:** Support real Indian payroll compliance.

- [ ] PF (Provident Fund) deduction rule templates
- [ ] ESI (Employee State Insurance) computation
- [ ] Professional Tax (state-wise slabs)
- [ ] TDS (Tax Deducted at Source) with configurable slabs
- [ ] Form 16 / Pay Slip with statutory fields
- [ ] CTC vs. take-home breakdown

---

### Sprint 6 — Advanced Analytics & Reporting (Weeks 11–12)

**Theme:** Give leadership a genuinely useful intelligence layer.

- [ ] Dashboard Copilot: expand from 4–6 to 20+ query templates
- [ ] Payroll cost forecast (linear trend projection, clearly labeled as forecast)
- [ ] Department drill-down (click a bar chart → see individual payslips)
- [ ] Exportable reports (CSV/XLSX) for payroll registers
- [ ] Scheduled report delivery (email PDF every payroll cycle close)

---

## Priority Stack Rank (Post-Hackathon)

| Priority | Sprint | Rationale |
|---|---|---|
| **P0** | Sprint 1 | Production-safe is non-negotiable before any real org uses this |
| **P1** | Sprint 2 | Employee self-service drives adoption; without it, OXP is a payroll-officer-only tool |
| **P1** | Sprint 3 | Sentinel depth is the product's core moat; must deepen before competitors can copy |
| **P2** | Sprint 4 | Multi-tenancy required to serve more than one organization |
| **P2** | Sprint 5 | Indian compliance required for any paying customer |
| **P3** | Sprint 6 | Analytics differentiation; valuable but not a blocking requirement |

---

## What Will Never Be Built

Per the product non-negotiables in [00-product-overview.md](./00-product-overview.md):

- ❌ Recruitment / ATS
- ❌ Performance management and reviews
- ❌ Learning and development (LMS)
- ❌ Benefits administration
- ❌ Free-text "ask my database anything" SQL chatbot
- ❌ Multi-currency payroll (until explicitly scoped)
- ❌ Custom permission-builder UI

Each item above serves a different product for a different set of users and would dilute the payroll integrity focus without serving the defined user set.
