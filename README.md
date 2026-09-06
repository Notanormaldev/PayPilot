<div align="center">

# PayPilot

**Autonomous HRMS & Sentinel Payroll Platform**

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Effortless autonomous payroll — deterministic rule calculation, Sentinel statutory anomaly detection, and live-recomputing payslips.*

</div>

---

## Overview

PayPilot is a full-stack HR & Payroll platform that **explains and defends every number it produces** at the exact moment that number is about to become a real payment. Built on a unified operational core and powered by the Sentinel Audit Engine, PayPilot turns a correct payroll system into a trustworthy one.

**Four pillars:**

| Pillar | Description |
|---|---|
| **Unified Operational Core** | One employee record as the hub for contracts, schedules, attendance, and leave |
| **Governed Payroll Processing** | 4-stage lifecycle — Compute → Validate → Mark Paid → Send Payslips |
| **Sentinel Audit Engine** | Explainable anomaly detection with live one-click resolution |
| **Executive Intelligence Hub** | Live cost dashboards with MoM variance and statutory reporting |

---

## Screenshots

### Landing Page

![Landing Page](./frontend/public/ss-landing.png)

### Login — 1-Click Demo Access

![Login](./frontend/public/ss-login.png)

### Admin Dashboard

![Admin Dashboard](./frontend/public/ss-dashboard.png)

### Employee Directory

![Employees](./frontend/public/ss-employees.png)

### Pay Runs — 4-Stage Lifecycle

![Pay Runs](./frontend/public/ss-payruns.png)

### Leave & Attendance

![Attendance](./frontend/public/ss-attendance.png)

### Approvals Queue

![Approvals](./frontend/public/ss-approvals.png)

### Sentinel Audit Engine

![Sentinel](./frontend/public/ss-sentinel.png)

### Taxes & Forms — Indian Income Tax Studio

![Taxes](./frontend/public/ss-taxes.png)

### Executive Reports Hub

![Reports](./frontend/public/ss-reports.png)

### System Settings

![Settings](./frontend/public/ss-settings.png)

### Employee Self-Service Portal

![Employee Portal](./frontend/public/paypilot-employee-portal.png)

---

## Features

### Admin Dashboard
- Active payrun status — net pay, payment date, employee breakdown (Active / On Leave / Inactive)
- Statutory obligations — EPF, ESI, TDS with drill-down
- To-Do & Live Approvals with one-click Resolve / Validate
- Payroll Cost Summary — stacked bar chart (Net Pay · TDS · Statutory) across months
- Employee Self-Service mini-panel with shift timer

### Employee Directory
- Kanban view — Active Personnel, On Approved Leave, Inactive/Transitioning columns
- Table View toggle for bulk operations
- Per-card KPIs: designation, salary, bank verification, employment type
- Department filter, Group By, and full-text search
- Add Employee wizard

### Pay Runs
Strict **4-Stage Sequential Lifecycle**:
```
1. Compute Formulas → 2. Validate & Audit → 3. Mark as Paid → 4. Send Bulk Email
```
- 2-step wizard: define scope → select cohort
- Per-payrun: Gross Pay, Net Disbursed, eligible employees, salary structure
- Download batch PDF payslips or view individual slips
- Paid records are immutable — full audit trail preserved

### Leave & Attendance
- Punch Clock Terminal — RFID telemetry simulation with Manual Punch Override and Simulate Punch In/Out
- Real-time attendance logs with hours worked and status
- Leave Requests Queue — Approve / Reject with reason visible to HR
- Configure Leave Types (Earned, Casual, Sick, and custom types)
- Fix Missing Punch flow for attendance regularization

### Approvals
Centralized queue covering:
- Reimbursement claims
- Investment proof submissions
- Salary revision requests
- Time-off requests with date range and reason

### Sentinel Audit Engine
PayPilot's flagship differentiator:
- **25+ active compliance flags** tracked in real time across categories:
  - Critical & High Risk, Banking & KYC, Payroll Computations, Compliance Rulebook
- **AI Diagnostic Analysis** per flag — plain-language explanation grounded in actual computed numbers
- **Live Payslip Preview** — instantly see the corrected payslip recomputed before resolving
- **Verify & Authorize** — one-click resolution with audit timestamp
- Run Audit Scan on demand or trigger Guided Batch Review
- Severity filter: All · Critical · High · Medium

### Taxes & Forms — Indian Income Tax Studio
- FY 2026-27 Union Budget Reforms compliant
- Toggle between **New Regime (u/s 115BAC)** and **Old Regime** with instant recomputation
- Dynamic Slab-by-Slab Tax Distribution loaded from DB
- Quick statutory scenarios: Zero Tax (87A), Senior Citizen, Super Senior, NRI Expat (Sec 6), Sec 80U Disability Relief, ₹75L HNI Surcharge, Old Regime Max Saver
- KPIs: Taxable Income, Final Tax Payable, Monthly TDS, Monthly Net Take-Home
- Download Statement (PDF), CTC & Gratuity Breakdown, DB Tax Rules Config

### Executive Reports Hub
- Total Gross Payroll · Net Take-Home · Statutory & Tax Withheld · Gratuity Accrual
- **Month-over-Month Variance** — instant reconciliation showing exactly why payroll changed:
  New Hires, Salary Revisions, Overtime & Bonus, Exits & Terminations
- Monthly Payroll Composition bar chart
- Government Filing Registers & Ledgers tab
- Export CSV and Print Dossier

### Employee Self-Service Portal
- **Shift Timer** — web punch-in/out with real-time duration tracking
- **Compensation & Payday** — last disbursed salary, next payday countdown, payslip PDF download
- **Leave Balances** — Earned / Casual / Sick with visual progress bars and Request Time Off
- **Tax & EPFO Status** — active regime, UAN, standard deduction summary
- **Action Center** — pending items (attendance regularization, document uploads)
- **Holidays & Company Pulse** — upcoming holidays with countdown badges and full calendar

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework — fast HMR |
| Mantine UI v7 | Enterprise component library |
| Redux Toolkit | Global state management |
| TanStack Query v5 | Server-state caching & sync |
| Recharts | Payroll cost charts |
| Tabler Icons | Icon set |
| jsPDF | Client-side PDF generation |
| Day.js | Date utilities |

### Backend

| Technology | Purpose |
|---|---|
| Node.js 22 + Express 4 | API server (ESM) |
| Prisma 5 | ORM — schema-first, typed queries |
| PostgreSQL 16 | Primary database (ACID semantics) |
| Redis 7 | KPI cache (30s TTL), rate limiting |
| JWT (Access + Refresh) | Stateless auth with token rotation |
| Google Gemini API | Sentinel diagnostic narration |
| bcryptjs | Password hashing |
| Zod | Request validation |
| pdf-lib | Server-side payslip PDF generation |
| Brevo | Bulk payslip email dispatch |
| Pino | Structured JSON logging |
| expr-eval | Safe formula AST evaluation |

---

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9+
- PostgreSQL 16
- Redis 7

### 1. Clone

```bash
git clone https://github.com/Notanormaldev/PayPilot.git
cd PayPilot
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
PORT=4000
NODE_ENV=development

# PostgreSQL
POSTGRESQL_URI=postgresql://user:pass@localhost:5432/paypilot

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth
JWT=your-256-bit-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sentinel AI narration (optional)
GOOGLE_GEMINI_API=

# Payslip email dispatch (optional)
BREVO_API_KEY=
```

### 3. Set Up Database

```bash
cd backend
pnpm prisma:generate   # Generate Prisma client
pnpm prisma:push       # Sync schema to DB
pnpm prisma:seed       # Seed demo data
```

### 4. Start Dev Servers

**Backend** (port 4000):
```bash
cd backend && pnpm dev
```

**Frontend** (port 5173):
```bash
cd frontend && pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) — use **1-Click Demo Access** on the login page to explore all roles instantly.

---

## Demo Credentials

| Role | Name | Access |
|---|---|---|
| Admin | Meera Krishnan | Full system |
| Payroll Manager | Neha Gupta | Full payroll configuration |
| Payroll User | Rahul Sharma | HR + Payrun operations |
| HR Manager | Tanvi Kapoor | People operations |
| Employee Portal | Kartik Kumar | Self-service only |

---

## Project Structure

```
PayPilot/
├── frontend/                    # React 18 + Vite
│   ├── public/                  # Static assets & screenshots
│   └── src/
│       ├── components/layout/   # Sidebar, Header, AppShell
│       └── features/
│           ├── auth/            # JWT auth, login flow
│           ├── dashboard/       # Admin dashboard + charts
│           ├── employees/       # Employee directory & kanban
│           ├── payroll/         # Payrun wizard & lifecycle
│           ├── attendance/      # Punch clock & leave management
│           ├── salary-structures/ # Formula builder
│           ├── sentinel/        # Audit engine & flag resolution
│           ├── taxes/           # Tax calculator & statutory rules
│           ├── reports/         # Executive reporting hub
│           ├── loans/           # Employee loan management
│           ├── approvals/       # Approval workflows
│           ├── employee-portal/ # Self-service portal
│           ├── schedules/       # Work schedule configuration
│           └── settings/        # System settings
│
├── backend/                     # Node.js + Express (ESM)
│   ├── prisma/
│   │   ├── schema.prisma        # Full data model
│   │   └── seed.js              # Demo data seeder
│   └── src/
│       ├── routes/              # 16 API routers
│       ├── middleware/          # Auth, RBAC, rate limiting
│       └── lib/                 # AI wrapper, tax rules, email
│
└── docs/                        # Architecture & design docs
    ├── 00-product-overview.md
    ├── 01-architecture.md
    ├── 03-data-model.md
    ├── 04-rbac.md
    └── 05-api-spec.md
```

---

## Role-Based Access Control

| Role | Dashboard | Employees | Payroll | Sentinel | Reports | Employee Portal |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `HR_PAYROLL_MANAGER` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `HR_PAYROLL_USER` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `HR_MANAGER` | ✅ | ✅ | — | — | ✅ | — |
| `EMPLOYEE` | — | — | — | — | — | ✅ |

---

## API Reference

All endpoints prefixed `/api`. Auth via `Authorization: Bearer <token>`.

| Route | Description |
|---|---|
| `POST /api/auth/login` | Email + password sign-in |
| `POST /api/auth/google` | Google OAuth sign-in |
| `POST /api/auth/refresh` | Refresh access token |
| `GET /api/employees` | List employees |
| `POST /api/employees` | Create employee |
| `GET /api/payruns` | List payrun batches |
| `POST /api/payruns` | Create payrun |
| `POST /api/payruns/:id/compute` | Run formula computation |
| `POST /api/payruns/:id/validate` | Trigger Sentinel audit |
| `POST /api/payruns/:id/mark-paid` | Mark payrun as paid |
| `POST /api/payruns/:id/send-email` | Bulk dispatch payslips |
| `GET /api/sentinel/flags` | List active audit flags |
| `POST /api/sentinel/resolve/:id` | Resolve a Sentinel flag |
| `GET /api/attendance` | Attendance logs |
| `POST /api/attendance/punch` | Record punch in/out |
| `GET /api/time-off` | Leave requests |
| `POST /api/time-off/types` | Configure leave types |
| `GET /api/salary-structures` | List salary structures |
| `GET /api/tax` | Tax computation engine |
| `GET /api/reports` | Executive payroll reports |
| `GET /api/dashboard` | KPI aggregates (Redis-cached) |
| `GET /health` | Health check — DB + Redis status |

---

## Scripts

```bash
# Frontend
pnpm dev              # Vite dev server — port 5173
pnpm build            # Production bundle
pnpm preview          # Preview production build

# Backend
pnpm dev              # Node --watch (hot reload)
pnpm start            # Production start
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:push      # Sync schema to DB
pnpm prisma:seed      # Seed demo data
pnpm validate:json    # Validate JSON data files
```

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request against `main`

Conventions — feature-sliced frontend architecture, ESM-only backend, Prisma for all DB access, Zod for all request validation.

---

## License

MIT © [PayPilot](https://github.com/Notanormaldev/PayPilot)
