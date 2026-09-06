<div align="center">

<img src="./frontend/public/logo.png" alt="PayPilot" width="220" />

### Autonomous HRMS & Sentinel Payroll Platform

**Payroll that explains itself — deterministic calculations, explainable anomaly detection, and live-recomputing payslips, all in one governed pipeline.**



<br/>

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

 [**Features**](#-features) · [**Tech Stack**](#-tech-stack) · [**API Docs**](#-api-reference) · [**Contributing**](#-contributing)

</div>

<br/>

---

## 🔗 See it in action

<table>
<tr>
<td width="50%">

<img src="./frontend/public/paypilot-payrun-dashboard.jpg" alt="Admin Dashboard" width="100%" />
<p align="center"><b>Admin dashboard & payrun status</b></p>

</td>
<td width="50%">

<img src="./frontend/public/paypilot-reports-analytics.png" alt="Executive Reports" width="100%" />
<p align="center"><b>Executive reports & MoM variance</b></p>

</td>
</tr>
<tr>
<td colspan="2">

<img src="./frontend/public/paypilot-employee-portal.png" alt="Employee Self-Service Portal" width="100%" />
<p align="center"><b>Employee self-service portal</b></p>

</td>
</tr>
</table>



---

## 🎯 Why PayPilot

Most payroll software tells you a number is correct. **PayPilot proves it — at the exact moment that number becomes a real payment.**

Every payrun moves through a governed, four-stage pipeline. Every anomaly is caught, explained in plain language, and resolved with a full audit trail. Every payslip can be previewed *after* a correction, before a single rupee moves.

<div align="center">

| 🧩 Pillar | 💡 What it does |
|:---|:---|
| **Unified Operational Core** | One employee record powers contracts, schedules, attendance & leave |
| **Governed Payroll Processing** | Strict 4-stage lifecycle — `Compute → Validate → Mark Paid → Send Payslips` |
| **Sentinel Audit Engine** | Explainable anomaly detection with live, one-click resolution |
| **Executive Intelligence Hub** | Real-time cost dashboards with MoM variance & statutory reporting |

</div>

---

## ✨ Features

### 📊 Admin Dashboard
- Live payrun status — net pay, payment date, workforce breakdown (Active / On Leave / Inactive)
- Statutory obligations panel — EPF, ESI, TDS with drill-down links
- To-Do & Live Approvals queue with one-click Resolve / Validate
- Payroll Cost Summary — stacked bar chart (Net Pay · TDS · Statutory) across months
- Embedded Employee Self-Service mini-panel with live shift timer

### 👥 Employee Directory
- **Kanban view** — Active Personnel, On Approved Leave, Inactive/Transitioning columns
- **Table view** toggle for bulk operations
- Per-card KPIs: designation, salary, bank verification, employment type
- Department filters, Group By, and full-text search

### 💸 Pay Runs

<div align="center">

```mermaid
graph LR
    A[1️⃣ Compute Formulas] --> B[2️⃣ Validate & Audit]
    B --> C[3️⃣ Mark as Paid]
    C --> D[4️⃣ Send Bulk Email]
```

</div>

- Guided 2-step wizard: define scope → select cohort
- Batch PDF payslip downloads or individual slip views
- Paid records are **immutable** — full audit trail preserved forever

### 🕒 Leave & Attendance
- Punch Clock Terminal — RFID telemetry simulation with Manual Punch Override
- Real-time attendance logs with hours worked & live status
- Leave Requests Queue — Approve / Reject directly from the HR Manager panel
- Configurable Leave Types (Earned, Casual, Sick, and fully custom types)
- Fix Missing Punch flow for attendance regularization

### ✅ Approvals
A centralized queue for reimbursement claims, investment proofs, salary revisions, and time-off requests — all in one place.

### 🛡️ Sentinel Audit Engine
**PayPilot's flagship differentiator — explainable payroll integrity.**

- **25+ active compliance flags** spanning Critical & High Risk, Banking & KYC, Payroll Computations, and the Compliance Rulebook
- **AI Diagnostic Analysis** per flag — plain-language explanations grounded in the actual computed numbers
- **Live Payslip Preview** — see the corrected payslip recomputed *before* you resolve
- **Verify & Authorize** — one-click resolution with an audit timestamp
- Severity filters: `All` · `Critical` · `High` · `Medium`

### 🧮 Taxes & Forms — Indian Income Tax Studio
- ✅ FY 2026-27 Union Budget Reforms compliant
- Toggle between **New Regime (u/s 115BAC)** and **Old Regime** with instant recomputation
- Dynamic slab-by-slab tax distribution, loaded live from DB rules
- Quick statutory scenarios: Zero Tax (87A), Senior Citizen, Super Senior, NRI Expat (Sec 6), Sec 80U, HNI Surcharge, Old Regime Max Saver
- Downloadable Statement PDF, CTC & Gratuity Breakdown, DB Tax Rules Config

### 📈 Executive Reports Hub

- Total Gross Payroll · Net Take-Home · Statutory & Tax Withheld · Gratuity Accrual
- **Month-over-Month Variance** — new hires, salary revisions, overtime, exits
- Monthly Payroll Composition bar chart (Net Pay vs TDS vs EPF/ESI/PT)
- Government Filing Registers & Ledgers tab for statutory compliance
- One-click CSV export and Print Dossier

### 🙋 Employee Self-Service Portal

| Module | Capability |
|:---|:---|
| ⏱️ **Shift Timer** | Web punch-in/out with real-time duration tracking |
| 💰 **Compensation & Payday** | Last disbursed salary, next payday countdown, payslip PDF download |
| 🌴 **Leave Balances** | Earned / Casual / Sick with visual progress bars & Request Time Off |
| 🧾 **Tax & EPFO Status** | Active regime, UAN, standard deduction summary |
| 📋 **Action Center** | Pending items — attendance regularization, document uploads |
| 🎉 **Holidays & Company Pulse** | Upcoming holidays with countdown badges & full calendar |

---

## 🧱 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
| Technology | Purpose |
|:---|:---|
| React 18 + Vite | UI framework — fast HMR |
| Mantine UI v7 | Enterprise component library |
| Redux Toolkit | Global state management |
| TanStack Query v5 | Server-state caching & sync |
| Recharts | Payroll cost charts |
| Tabler Icons | Icon set |
| jsPDF | Client-side PDF generation |
| Day.js | Date utilities |

</td>
<td valign="top" width="50%">

### Backend
| Technology | Purpose |
|:---|:---|
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

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites
`Node.js 22+` · `pnpm 9+` · `PostgreSQL 16` · `Redis 7`

### 1. Clone the repository
```bash
git clone https://github.com/Notanormaldev/PayPilot.git
cd PayPilot
```

### 2. Configure backend environment
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

### 3. Set up the database
```bash
cd backend
pnpm prisma:generate   # Generate Prisma client
pnpm prisma:push       # Sync schema to DB
pnpm prisma:seed       # Seed demo data
```

### 4. Start the dev servers

| Service | Command | Port |
|:---|:---|:---:|
| Backend | `cd backend && pnpm dev` | `4000` |
| Frontend | `cd frontend && pnpm dev` | `5173` |

Then open **[http://localhost:5173](http://localhost:5173)** and use **1-Click Demo Access** on the login page. 🎉

---

## 🔑 Demo Credentials

| Role | Name | Access |
|:---|:---|:---|
| 👑 Admin | Meera Krishnan | Full system |
| 🧭 Payroll Manager | Neha Gupta | Full payroll configuration |
| 🛠️ Payroll User | Rahul Sharma | HR + Payrun operations |
| 🤝 HR Manager | Tanvi Kapoor | People operations |
| 🙋 Employee Portal | Kartik Kumar | Self-service only |

---

## 🗂️ Project Structure

```
PayPilot/
├── frontend/                      # React 18 + Vite
│   ├── public/                    # Static assets
│   └── src/
│       ├── components/layout/     # Sidebar, Header, AppShell
│       └── features/
│           ├── auth/              # JWT auth, login flow
│           ├── dashboard/         # Admin dashboard + charts
│           ├── employees/         # Employee directory & kanban
│           ├── payroll/           # Payrun wizard & lifecycle
│           ├── attendance/        # Punch clock & leave management
│           ├── salary-structures/ # Formula builder
│           ├── sentinel/          # Audit engine & flag resolution
│           ├── taxes/             # Tax calculator & statutory rules
│           ├── reports/           # Executive reporting hub
│           ├── loans/             # Employee loan management
│           ├── approvals/         # Approval workflows
│           ├── employee-portal/   # Self-service portal
│           ├── schedules/         # Work schedule configuration
│           └── settings/          # System settings
│
├── backend/                       # Node.js + Express (ESM)
│   ├── prisma/
│   │   ├── schema.prisma          # Full data model
│   │   └── seed.js                # Demo data seeder
│   └── src/
│       ├── routes/                # 16 API routers
│       ├── middleware/            # Auth, RBAC, rate limiting
│       └── lib/                   # AI wrapper, tax rules, email
│
└── docs/                          # Architecture & design docs
    ├── 00-product-overview.md
    ├── 01-architecture.md
    ├── 03-data-model.md
    ├── 04-rbac.md
    └── 05-api-spec.md
```

---

## 🔐 Role-Based Access Control

<div align="center">

### 📊 Quick Comparison Matrix

| Features / Rights | Employee | HR Manager | HR Payroll User | HR Payroll Manager | Admin |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Self-Service & Own Slips** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Employee & Leave Approvals** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Shift Schedules & Attendance** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Payrun Run & Slips Generation** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Salary Rules / Formulas** | ❌ | ❌ | 👁️ *(Read-Only)* | ✅ *(Full CRUD)* | ✅ *(Full CRUD)* |
| **Bank Disbursal (Mark Paid)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **User Roles & System Settings** | ❌ | ❌ | ❌ | ❌ | ✅ |

</div>

<br/>

<div align="center">

### Module-Level Access

| Role | Dashboard | Employees | Payroll | Sentinel | Reports | Employee Portal |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `HR_PAYROLL_MANAGER` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `HR_PAYROLL_USER` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `HR_MANAGER` | ✅ | ✅ | — | — | ✅ | — |
| `EMPLOYEE` | — | — | — | — | — | ✅ |

</div>

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authenticate via `Authorization: Bearer <token>`.

<details>
<summary><b>Auth</b></summary>

| Route | Description |
|:---|:---|
| `POST /api/auth/login` | Email + password sign-in |
| `POST /api/auth/google` | Google OAuth sign-in |
| `POST /api/auth/refresh` | Refresh access token |

</details>

<details>
<summary><b>Employees</b></summary>

| Route | Description |
|:---|:---|
| `GET /api/employees` | List employees |
| `POST /api/employees` | Create employee |

</details>

<details>
<summary><b>Payroll</b></summary>

| Route | Description |
|:---|:---|
| `GET /api/payruns` | List payrun batches |
| `POST /api/payruns` | Create payrun |
| `POST /api/payruns/:id/compute` | Run formula computation |
| `POST /api/payruns/:id/validate` | Trigger Sentinel audit |
| `POST /api/payruns/:id/mark-paid` | Mark payrun as paid |
| `POST /api/payruns/:id/send-email` | Bulk dispatch payslips |

</details>

<details>
<summary><b>Sentinel</b></summary>

| Route | Description |
|:---|:---|
| `GET /api/sentinel/flags` | List active audit flags |
| `POST /api/sentinel/resolve/:id` | Resolve a Sentinel flag |

</details>

<details>
<summary><b>Attendance & Leave</b></summary>

| Route | Description |
|:---|:---|
| `GET /api/attendance` | Attendance logs |
| `POST /api/attendance/punch` | Record punch in/out |
| `GET /api/time-off` | Leave requests |
| `POST /api/time-off/types` | Configure leave types |

</details>

<details>
<summary><b>Salary, Tax & Reports</b></summary>

| Route | Description |
|:---|:---|
| `GET /api/salary-structures` | List salary structures |
| `GET /api/tax` | Tax computation engine |
| `GET /api/reports` | Executive payroll reports |
| `GET /api/dashboard` | KPI aggregates (Redis-cached) |
| `GET /health` | Health check — DB + Redis status |

</details>

---

## 📜 Scripts

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
```bash
pnpm dev              # Vite dev server — port 5173
pnpm build            # Production bundle
pnpm preview          # Preview production build
```

</td>
<td valign="top" width="50%">

**Backend**
```bash
pnpm dev              # Node --watch (hot reload)
pnpm start            # Production start
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:push      # Sync schema to DB
pnpm prisma:seed      # Seed demo data
pnpm validate:json    # Validate JSON data files
```

</td>
</tr>
</table>

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request against `main`

> **Conventions:** feature-sliced frontend architecture · ESM-only backend · Prisma for all DB access · Zod for all request validation.

---

<div align="center">

## 📄 License

Released under the **MIT License**.

Made with ❤️ by **[PayPilot](https://github.com/Notanormaldev/PayPilot)**

</div>
