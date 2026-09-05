# HRMS OXP — Hackathon Winning Development Blueprint

---

## Phase 1 — Complete Analysis of Inputs

### 1A. Problem Statement — What Is Actually Required

The brief asks for a **connected payroll operational flow**, not siloed modules: Employee is the hub; Contracts + Working Schedules give payroll context; Attendance + Time Off capture daily activity; Salary Structures/Rules define computation; Payruns turn eligible employees into validated, PDF-able, emailable Payslips; a live Dashboard aggregates all of it. The organizers explicitly flag the anti-pattern to avoid: *storing employee/attendance/leave/salary as separate, disconnected records*.

**Explicit requirements:** 5 roles (Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin) with layered permissions · Kanban+List+Form for Employees · List+Form for Contracts/Schedules/TimeOff/Structures/Rules · auto-computed weekly hours from schedule lines · exactly one active-for-period contract per employee · Time Off Types define unit/allocation-requirement/approval/payroll-linkage; approved requests auto-deduct allocations · Salary Rules sequenced, categorized (Basic/Allowance/Gross/Deduction/Net), fixed/percentage/formula computation · Payrun two-step wizard (scope+period → employee selection; no record until Step 2 completes) · Compute/Validate/Mark Paid/Send Payslips actions with pre-finalization warnings (missing bank details, duplicates) · PDF + bulk email · live (not static) Dashboard with KPIs, salary-cost-by-department, monthly trend, attendance/leave overview, alerts, department breakdown.

**Implicit requirements:** business logic in code, not hardcoded values (explicitly called out) · a real formula/rule interpreter, not a cosmetic rules table · dashboard computed from live rows · immutability of finalized/paid records for history.

**Judging criteria (inferred):** unified data flow · business-logic complexity (period contracts, rule sequencing, leave consumption, error detection) · architecture quality (RBAC, relationships, history, live analytics) · technical execution · demo clarity across two end-to-end scenarios · roadmap articulation.

### 1B. Critique of the Excalidraw PDF ("Current OXP Design")

The PDF is a faithful, well-thought-through Odoo-style translation of the brief — it is **not wrong**, but it is exactly what a large fraction of the 2,000+ teams will independently converge on, because it mirrors Odoo's own HR/Payroll information architecture almost screen-for-screen (Kanban→Form, smart buttons, Payrun wizard, Compute/Validate/Mark Paid/Send, salary-rule sequence table, Fixed/Percentage/Formula computation methods). That means: **build it faithfully — it's correct and required — but do not mistake faithful execution of it for differentiation.**

| PDF Idea | Verdict | Why |
|---|---|---|
| Employee Kanban+List+Form with smart buttons to Contracts/Attendance/Time Off | **Keep** | Matches brief exactly; smart buttons are cheap to build (filtered list link) and score well |
| Contract list highlighting "Running" status, one active contract note | **Keep, harden** | Correct concept; must be enforced as a real DB/service constraint, not just a UI label — this is the most-checked business rule in the brief |
| Working Schedule with day/start/end/break rows, auto Total Weekly Hours | **Keep** | Correct; simple to compute, good "we did the business logic right" signal |
| Attendance list/form with worked hours + overtime + manual correction | **Keep** | Matches brief; keep overtime as a simple `worked_hours - scheduled_hours` derived value, don't over-engineer shift rules |
| Time Off Types/Allocations/Requests under one "Time Off" nav item, approval reduces balance | **Keep** | Correct and matches brief precisely |
| Payrun list showing per-period warning counts; Payrun form with Compute/Validate/Mark Paid/Send + payslip summary table with per-row warnings ("A/C missing", "Duplicate") | **Keep, extend** | This is exactly where the differentiator plugs in — extend the static warning badges into explainable, resolvable Sentinel cards (Phase 7) |
| Salary Structure → ordered Salary Rules, computation methods Fixed / Percentage of (Wage/Basic/Gross) / **Python Code formula** (`result = categories['BASIC']`) | **Keep concept, replace unsafe part** | The three computation methods are the right model — but literally evaluating arbitrary Python/JS in a Node backend is a real security and time risk. **Replace** raw code-eval with a small, safe expression parser (e.g. `expr-eval`) fed a whitelist of variables (`BASIC`, `GROSS`, `contract_wage`, `worked_days`, prior rule codes) — same authoring experience for the user, zero code-injection risk, far less time to build correctly than a sandboxed interpreter |
| Payrun creation wizard: Step 1 (structure+period) → Continue → Step 2 (employee checklist) → Create Payrun | **Keep** | Matches brief's explicit two-step, no-record-until-Step-2 requirement precisely |
| Payslip detail with rule-by-rule computation table | **Keep, extend** | Extend into the "Explain this payslip" plain-language trace (Phase 7) — the table already has everything needed as the data source |
| Payroll Dashboard: KPI cards, salary-by-department, monthly trend, alerts list, attendance overview, time-off overview, department overview | **Keep, extend** | Solid base; extend with a constrained natural-language Q&A over the same live queries (Phase 7/8) |
| Company filter on Dashboard (multi-company hint) | **Simplify** | Keep a single `company` field on the schema for completeness, but do not build multi-company switching UI — no time payoff for a single-org demo |
| Separate User accounts (Admin-created) linked to Employee, with roles assigned by Admin, self-elevation blocked | **Keep** | Correct and matches brief's Admin-only user management; cheap to build, and "users cannot self-elevate roles" is a nice, checkable security detail worth calling out live if asked |
| Attendance Quick Widget (Check In/Out popup with elapsed time, red/green status) | **Keep, minor scope** | Great, cheap UX touch that makes Employee-role screens feel like a real product rather than a form; keep it to check-in/out + elapsed timer only, no geofencing/photo capture |
| Role names inconsistent across screens (PDF shows "Payroll User", "Payroll Admin", "Time Off Admin", "Time Off User" on the User Management screen vs. the brief's official "HR Manager / HR Payroll User / HR Payroll Manager") | **Replace** | Normalize to the brief's exact 5 role names everywhere — a judge cross-checking role names against the brief and finding a mismatch is an easy, avoidable deduction |
| Nothing in the PDF proposes any AI/intelligence layer | **Add** | This is the single biggest gap — the PDF is a complete, correct *administrative* system with zero differentiation; Phase 7 closes this gap deliberately and narrowly |

**Redundant/over-engineered in the PDF:** none, notably — the design is disciplined and doesn't over-build. The only real risk is treating the literal Python-code rule field as something to build exactly as drawn (security/time risk, addressed above).

---

## Phase 2 — Problem Statement → OXP Solution Reconciliation

| Requirement | Current OXP (PDF) Solution | Status | Missing? | Improvement Needed | Priority |
|---|---|---|---|---|---|
| Employee Kanban/List/Form | Present, matches | ✅ Covered | No | None | P0 |
| Contract history + active-period exclusivity | Present as UI label ("Running") | ⚠️ Partial | Yes — DB-level enforcement | Add partial-unique/overlap constraint + service-layer period resolver | P0 |
| Working Schedule auto weekly hours | Present, correct | ✅ Covered | No | None | P0 |
| Attendance + manual correction | Present, correct | ✅ Covered | No | Add `is_corrected`/`corrected_by` audit fields | P0 |
| Time Off types/allocations/requests + balance deduction | Present, correct | ✅ Covered | No | None | P0 |
| Salary Structures & sequenced Rules (fixed/%/formula) | Present, but formula method unsafe as literally drawn | ⚠️ Partial | Yes — safe formula engine | Swap raw code-eval for `expr-eval` + variable whitelist | P0 |
| Payrun 2-step wizard | Present, correct | ✅ Covered | No | None | P0 |
| Compute/Validate/Mark Paid/Send + pre-finalization warnings | Present as static badges | ⚠️ Partial | Yes — explainability & resolution | Sentinel layer (Phase 7) | P0 → P1 extension |
| Payslip PDF + bulk email | Implied ("PDF"/"Send Payslips") not detailed | ⚠️ Partial | Yes — actual generation pipeline | `pdf-lib`/`puppeteer` + `nodemailer`/`resend` | P0 |
| Live Payroll Dashboard | Present, detailed, correct | ✅ Covered | No | Wire natural-language Q&A on top (Phase 7) | P0 → P1 extension |
| RBAC (5 roles) | Present but role names inconsistent | ⚠️ Partial | Yes — name normalization | Use brief's exact 5 role names everywhere | P0 |
| User management (Admin-only, linked to Employee, no self-elevation) | Present, correct | ✅ Covered | No | None | P0 |
| Business logic in code (not hardcoded) | Implied by design, not yet built | 🔲 Not yet built | Yes | This *is* the backend build (Phase 5/16) | P0 |
| Intelligence/differentiation layer | **Absent from PDF entirely** | 🔲 Missing | Yes | Build Sentinel (explainable exception detection + live recompute) | P1 |

**Gaps:** no intelligence layer at all; contract exclusivity and formula safety are drawn as UI concepts without the underlying enforcement mechanism specified.
**Weaknesses (things that read as "just another HRMS"):** as drawn, the PDF has no feature that a judge hasn't seen in Odoo itself — it needs the Phase 7 layer to stop being a faithful clone and start being a product.
**Scope risks:** literally building a Python-code-eval rule engine (security + time sink); over-building the Attendance Quick Widget with geofencing/photo; multi-company switching UI.
**Opportunities:** the warning badges already drawn on the Payrun/Payslip screens ("A/C missing," "Duplicate") are the perfect visual seam to upgrade into explainable, resolvable Sentinel cards — almost no extra screen design needed, just smarter backend logic behind an existing UI element.

---

## Phase 3 — Final Product Vision

**Product Name:** HRMS OXP
**Product Category:** Not "HR Management Software" — OXP is a **payroll integrity and workforce-operations platform**: it runs the full Odoo-style HR/payroll lifecycle correctly, and adds a narrow, explainable intelligence layer (**Sentinel**) at the one moment that actually matters organizationally — the moment money is about to move.

**One-line pitch:** "HRMS OXP runs your entire employee-to-payslip flow — and unlike every other payroll system, it tells you *why* something's wrong before you pay it, and shows you the fix's impact instantly."

**Product Vision:** OXP is not trying to out-feature Workday or out-cheap Deel. It is the platform that treats payroll finalization as a moment worth explaining, not just validating — closing the trust gap that every mainstream HR/payroll tool (including Odoo, its own structural ancestor) currently leaves open.

**Core Philosophy:** *From static validation → explainable, resolvable intelligence.* Every other system in this space either computes silently (Odoo) or explains via a disconnected general-purpose chatbot (Workday Illuminate, Rippling AI). OXP's explanations are generated **from the actual rule-execution trace of that specific payslip** — they can never be wrong about the underlying numbers, because the numbers were never a guess.

**Core Value Proposition:** A real HR/payroll team adopting OXP gets the same correct, auditable computation as a mature ERP payroll module, plus a validation step that actually reduces payroll disputes and audit risk, because every flag is explainable, reversible, and shows its impact before the payment is final — not after.

---

## Phase 4 — Complete Module Architecture

| Module | Category | Purpose | Primary Users | Key Features | Priority | Complexity | Demo Value |
|---|---|---|---|---|---|---|---|
| Auth & User Management | Administration & Security | Login, RBAC, Admin-only user provisioning | All / Admin | JWT login, role assignment, no self-elevation | **MUST BUILD** | Low | Low |
| Employee Master | Core HR | Central employee hub | HR Mgr, Employee | Kanban/List/Form, smart buttons | **MUST BUILD** | Low | Medium |
| Contract Management | Core HR | Historical + period-active contract | HR Mgr, Payroll | List/Form, active-period enforcement | **MUST BUILD** | Medium | Medium |
| Working Schedule | Workforce Operations | Weekly time pattern | HR Mgr | Day/start/end/break rows, auto hours | **MUST BUILD** | Low | Low |
| Attendance | Workforce Operations | Daily presence tracking | HR Mgr, Employee | List/Form, correction, Quick Widget check-in/out | **MUST BUILD** | Medium | Medium |
| Time Off (Types/Allocations/Requests) | Workforce Operations | Leave lifecycle | HR Mgr, Employee | Approval flow, balance auto-deduction | **MUST BUILD** | Medium | Medium |
| Salary Structures & Rules | Payroll & Finance | Defines pay computation | Payroll Mgr | Sequenced rules, Fixed/%/Formula (safe engine) | **MUST BUILD** | High | Medium |
| Payrun & Payslip Engine | Payroll & Finance | Batch payroll processing | Payroll User/Mgr | 2-step wizard, Compute/Validate/Mark Paid/Send | **MUST BUILD** | High | High |
| Payslip PDF & Email | Payroll & Finance | Artifact delivery | Payroll, Employee | PDF gen, bulk email | **MUST BUILD** | Low-Med | Medium |
| Payroll Dashboard | Analytics & Insights | Live aggregated reporting | Payroll, Leadership | KPIs, charts, alerts, drill-downs | **MUST BUILD** | Medium | High |
| **Sentinel — Explainable Exception Engine** | AI & Automation | Deterministic + statistical payroll anomaly detection | Payroll User/Mgr | Flag cards, plain-language reason, one-click resolve | **WOW / DIFFERENTIATOR** | Medium | Very High |
| **Live Recompute-on-Resolve** | AI & Automation | Instant payslip impact of a fix | Payroll User | Before/after diff animation | **WOW / DIFFERENTIATOR** | Medium | Very High |
| **"Explain This Payslip" Trace** | Employee Experience / Analytics | Plain-language rule trace | Employee, Auditor | Rule-by-rule narration | **WOW / DIFFERENTIATOR** | Low-Med | High |
| **Dashboard Copilot** | Manager/Leadership Intelligence | Constrained NL→insight over live data | Leadership | Fixed query templates, grounded answers | **WOW / DIFFERENTIATOR** | Medium | High |
| Attendance heatmap / leave calendar | Employee Experience | Visual polish | Employee | Calendar view | **ONLY IF TIME** | Low | Low-Med |
| Exportable audit-trail PDF | Administration & Security | Compliance artifact | Payroll Mgr | One-click export | **ONLY IF TIME** | Low | Low |
| Recruitment / ATS / Performance / LMS / Benefits | — | — | — | — | **DO NOT BUILD** | — | — |
| Multi-country tax localization, multi-currency | — | — | — | — | **DO NOT BUILD** | — | — |
| Custom permission-builder UI | — | — | — | — | **DO NOT BUILD** | — | — |
| Free-text "chat with the database" SQL AI | — | — | — | — | **DO NOT BUILD** | — | — |

---

## Phase 5 — Complete Workflow Design (Key Modules)

### Module: Contract Management
- **Actors:** HR Manager, Payroll (read), system
- **Trigger:** New hire, renewal, promotion/wage change
- **Input:** employee, start/end date, wage, department, position, salary structure
- **Process:** on create/update, service layer checks for any existing contract with overlapping `[start_date, end_date)` and `status='active'` for the same employee; rejects or requires the existing one to be closed first
- **Business Rules:** exactly one active contract per employee per date; payroll always resolves the contract whose date range contains the *payslip period*, never "the latest contract"
- **Automation:** auto-close previous contract's `end_date` when a new one is confirmed active, if organizer intends seamless transition (configurable)
- **AI/Intelligence:** none — this must be 100% deterministic
- **Human Decision:** HR Manager confirms contract terms
- **Output:** Contract record, updated Employee "active contract" pointer (derived, not stored redundantly)
- **Notifications:** none required for demo
- **Audit:** `PayrollAuditEvent` on create/status change
- **Exception Handling:** attempted overlapping active contract → 409 with explanation of the conflicting record
- **End State:** exactly one unambiguous active contract resolvable for any given date

### Module: Attendance
- **Actors:** Employee (self check-in/out via widget), HR Manager (correction)
- **Trigger:** Daily check-in/out, or manual entry/correction
- **Input:** employee, date, check-in/out timestamps
- **Process:** worked hours = checkout − checkin; overtime = max(0, worked − scheduled hours from assigned Working Schedule for that weekday); missing checkout → status "Incomplete"
- **Business Rules:** only HR Manager/Payroll roles may edit another employee's record; Employee role can only self check-in/out
- **Automation:** status auto-set (Present/Absent/Late/Incomplete) from timestamps vs. schedule
- **AI/Intelligence:** none at this layer — feeds Sentinel later as raw signal
- **Human Decision:** HR Manager approves/corrects flagged exceptions (missing checkout, unusually long session)
- **Output:** Attendance record feeding Payslip worked-days/hours and the Dashboard's attendance overview
- **Notifications:** none required for demo
- **Audit:** `is_corrected`/`corrected_by`/`corrected_at` on the record itself
- **Exception Handling:** missing checkout flagged in list view with a distinct status, not silently zeroed
- **End State:** a clean, correction-audited daily record usable by payroll and the dashboard

### Module: Time Off (Types / Allocations / Requests)
- **Actors:** Employee (request), HR Manager (approve/refuse)
- **Trigger:** Employee submits a Time Off Request
- **Input:** type, start/end date, reason
- **Process:** if type `requires_allocation`, check `TimeOffAllocation.remaining ≥ requested duration` before allowing submission; on approval, decrement `remaining`/increment `taken` in the same transaction as the status change
- **Business Rules:** cannot approve a request that would drive `remaining` negative; type's `unit` (days/hours) governs duration math
- **Automation:** balance math is derived, never manually edited
- **AI/Intelligence:** none — deterministic ledger logic only
- **Human Decision:** HR Manager approve/refuse
- **Output:** updated allocation balance, request status; if `affects_payroll`, an unpaid/paid-leave flag feeds the Payslip worked-days calc
- **Notifications:** (nice-to-have) toast/badge to requester on decision
- **Audit:** `PayrollAuditEvent` on approval/refusal
- **Exception Handling:** insufficient balance → request blocked at submission with a clear reason, not discovered later at payroll time
- **End State:** an approved request that has already, correctly, adjusted the balance ledger — payroll never has to re-derive this

### Module: Salary Structures & Rules (the computation core)
- **Actors:** HR Payroll Manager (config), system (execution)
- **Trigger:** Payslip Compute action
- **Input:** ordered list of Salary Rules for the Payrun's structure; contract wage; worked days/hours; approved-leave flags
- **Process:** iterate rules by `sequence`; for each, evaluate its computation method against a **variable context** built from: contract fields, worked days/hours, and every prior rule's output keyed by its `code` (e.g. `BASIC`, `GROSS`) — mirroring Odoo's `categories['BASIC']` pattern but via a safe expression evaluator, not raw code execution
- **Business Rules:** rules execute strictly in `sequence` order; a rule may only reference codes with a lower sequence (validated at structure-save time to prevent forward references)
- **Automation:** Compute Sheet fully recalculates all lines from scratch every time (idempotent, matches Odoo's own behavior)
- **AI/Intelligence:** none in the computation itself — this is the one place hallucination is entirely unacceptable
- **Human Decision:** Payroll User reviews the computed breakdown before Validate
- **Output:** ordered `PayslipLine` rows: Basic → Allowances → Gross → Deductions → Net
- **Notifications:** none
- **Audit:** the full line-item trace *is* the audit trail
- **Exception Handling:** a malformed formula fails structure save-time validation, never at payslip-compute-time in front of a judge
- **End State:** a deterministic, re-computable, fully explainable payslip

### Module: Payrun & Payslip Lifecycle
- **Actors:** Payroll User/Manager
- **Trigger:** New Payrun click
- **Input:** Step 1 — salary structure + period; Step 2 — selected employees (only those with a resolvable active contract for the period are eligible/shown)
- **Process:** Create Payrun (only after Step 2) → generates one draft Payslip per selected employee → Compute (runs the rule engine per payslip) → Validate (runs Sentinel, Phase 7) → Mark Paid (locks records) → Send Payslips (bulk email + PDF)
- **Business Rules:** status machine `Draft → Computed → Validated → Paid`, no skipping backward once Paid
- **Automation:** Compute and Sentinel checks run automatically on their respective action clicks — no manual per-line intervention needed for the happy path
- **AI/Intelligence:** Sentinel (Phase 7) runs at Validate
- **Human Decision:** Payroll User/Manager reviews flags, resolves or overrides, then proceeds to Mark Paid
- **Output:** finalized, historically-preserved Payrun + Payslips + PDFs + sent emails
- **Notifications:** (nice-to-have) email to employees on Send
- **Audit:** every status transition logged
- **Exception Handling:** unresolved high-severity Sentinel flags block Mark Paid until acknowledged/resolved
- **End State:** an immutable, paid payroll batch with a full audit and explanation trail

### Module: Sentinel — Explainable Exception Engine
- **Actors:** system (detection), Payroll User (resolution)
- **Trigger:** Validate action on a Payrun
- **Input:** all payslips in the run + each employee's trailing payslip history + attendance/leave state for the period
- **Process:** run deterministic checks (missing bank details, duplicate payslip, no resolvable active contract, unapproved-leave-counted-as-worked) and one statistical check (this payslip's net pay deviates beyond a threshold from the employee's own trailing average) → for each hit, generate a structured fact object → pass the fact object (never raw payslip data) to the LLM for one-sentence phrasing → render as a card with severity, reason, and a "Resolve" action where a deterministic fix exists (e.g., re-flag leave as approved and recompute)
- **Business Rules:** the LLM only ever receives already-computed facts and only ever produces prose — it cannot alter a number
- **Automation:** flags recalculate automatically on every Compute; Resolve triggers a scoped recompute of just that payslip
- **AI/Intelligence:** LLM narration only; detection itself is 100% rules/statistics
- **Human Decision:** Payroll User decides whether to Resolve, override with a note, or escalate
- **Output:** `SentinelFlag` rows with status (open/resolved/overridden), an audit-linked resolution
- **Notifications:** flag counts surfaced on the Payrun list (extending the PDF's existing warning-count badge)
- **Audit:** resolution actor + timestamp + before/after payslip snapshot
- **Exception Handling:** LLM call failure → fall back to a hardcoded phrasing template keyed by `flag_type`, so the demo never breaks on a network hiccup
- **End State:** zero open high-severity flags before Mark Paid is allowed

### Module: Payroll Dashboard + Copilot
- **Actors:** Payroll, Leadership
- **Trigger:** navigation to Dashboard; optional NL question typed in Copilot box
- **Input:** filters (period, department, employee type); free-text question
- **Process:** KPIs/charts computed via live Postgres aggregate queries; Copilot maps the NL question to the closest of a small fixed set of parameterized query templates (e.g. "cost by department," "trend explanation," "attendance summary"), executes it, and asks the LLM to phrase the *already-retrieved* numbers into an answer
- **Business Rules:** Copilot never executes arbitrary SQL generated by the LLM — only pre-defined, parameterized templates
- **Automation:** dashboard refetches on filter change
- **AI/Intelligence:** LLM phrasing only, same constraint as Sentinel
- **Human Decision:** none required — informational
- **Output:** charts, KPI cards, alerts list, Copilot answer text grounded in the numbers shown
- **Notifications:** n/a
- **Audit:** n/a
- **Exception Handling:** unmatched question → Copilot says plainly it can only answer about cost, trend, attendance, and leave for now, and suggests one of those
- **End State:** a dashboard that is demonstrably live and a Copilot that is demonstrably grounded, never hallucinatory

---

## Phase 6 — Cross-Module Workflows

**1. Onboarding-to-first-payslip:** Employee created → Contract signed (active, period-scoped) → Working Schedule assigned → Attendance begins accruing → (next Payrun) employee appears as eligible in Step 2 of the wizard → Payslip computed against their contract + schedule-derived worked days. *Modules: Employee, Contract, Schedule, Attendance, Payrun/Payslip. No AI. Human approval: contract confirmation only.*

**2. Leave-to-payroll-impact (the brief's second named scenario):** Time Off Request submitted → HR Manager approves → Allocation balance decremented → if `affects_payroll`, the leave period is marked non-worked → next payslip Compute reflects it in worked-days → if the payslip was *already* computed before the approval landed, Sentinel's statistical check flags the resulting deviation and offers Resolve→recompute. *Modules: Time Off, Attendance/worked-days, Salary Rules, Sentinel. AI: narration only. Human approval: leave approval + flag resolution.*

**3. Payroll-signal-to-action (the core "wow" cross-module flow):** Payrun Validate triggers Sentinel across all payslips → deterministic + statistical flags generated → Payroll User resolves one → scoped recompute updates that Payslip's lines → Dashboard's live queries immediately reflect the corrected total on next refresh → Mark Paid only proceeds once flags are cleared. *Modules: Payrun/Payslip, Sentinel, Dashboard. AI: narration. Human approval: resolve or override, then Mark Paid.*

**4. Dashboard-question-to-grounded-answer:** Leadership asks "why did Engineering's cost jump" → Copilot resolves to the department/period cost-driver template → query returns actual contributing payslips/new hires/overtime → LLM phrases the grounded numbers → answer displayed alongside the underlying chart segment highlighted. *Modules: Dashboard, Contract, Attendance, Payslip. AI: template-matching + narration. Human approval: none, purely informational.*

These four are what make OXP feel like **one intelligent platform**, not a stack of CRUD screens connected only by foreign keys.

---

## Phase 7 — Winning Features Beyond the Problem Statement

| Feature | Problem Solved | User Value | Innovation | Wow Factor | Tech Difficulty | 24h Feasibility | Demo Impact |
|---|---|---|---|---|---|---|---|
| **Sentinel explainable exception engine** | Static warnings explain nothing | High | High | High | Medium | High | Very High |
| **Live recompute-on-resolve** | Validation is one-directional, no visible impact | High | Medium-High | High | Low-Medium | High | Very High |
| **"Explain this payslip" trace** | Payroll is a black box to employees/auditors | High | Medium | Medium-High | Low | High | Medium-High |
| **Dashboard Copilot (constrained NL→insight)** | Reporting requires manual filter-hunting | Medium-High | Medium | High | Low-Medium | High | High |
| Attendance leave-calendar heatmap | Cosmetic, low differentiation | Low-Medium | Low | Low-Medium | Low | High | Low |
| Predictive payroll-cost forecast (ML) | Interesting but unproven in demo data | Medium | Medium | Medium | High | Low | Medium |
| Free-text SQL chatbot | Looks flashy, ungoverned | Low | Low (crowded, over-hyped) | Medium (fades fast) | Medium | Medium | Medium — risky |

**Top 1 Killer Feature:** Sentinel — explainable, resolvable, live-recomputing exception detection wired into Validate.
**Top 3 Winning Features:** (1) Sentinel detection+explanation, (2) live recompute-on-resolve, (3) a correctly-enforced, testable period-based contract + sequenced formula engine underneath it (invisible in the demo, but the entire differentiator collapses without it).
**Top 5 Supporting Differentiators:** add "Explain this payslip" and the Dashboard Copilot as (4) and (5); the leave-calendar heatmap only if hours remain.

**Why other teams likely won't build this:** most teams building the same Odoo-shaped skeleton will spend the full 24 hours reaching a *working* CRUD system and treat "warnings" as a static badge — exactly what the PDF itself currently draws. Very few will (a) get the period-contract/sequenced-rule logic robust enough to feed a *statistical* check meaningfully, and (b) additionally invest in a live recompute interaction rather than a static alert list. The differentiator requires the unglamorous plumbing to be right first — that's the actual moat.

---

## Phase 8 — AI Strategy

| Capability | Approach | Input | Processing | Output | Model/API | Latency | Failure Scenario | Hallucination Risk | Validation | Fallback | 24h Feasible? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Duplicate/missing-data flags | Deterministic rules | Payslip + Payrun rows | SQL/JS predicate checks | Boolean flag + structured reason | none | ~0ms | n/a | None (no LLM) | n/a | n/a | Yes |
| Statistical anomaly flag | Statistical logic | Employee's trailing payslips | mean/std-dev or percentile deviation query | Boolean flag + deviation % | none (pure SQL/JS) | ~ms | Insufficient history for new hires → skip check gracefully | None (no LLM) | Guard: require ≥2 prior payslips | Skip check silently if insufficient data | Yes |
| Flag phrasing (Sentinel cards) | AI + deterministic rules | `{flagType, deviationPct, comparisonBasis}` structured fact only | Single short LLM call, phrase-only prompt | One sentence, plain language | Any current Claude/GPT model via one small wrapper | 1–2s | API timeout/error | Low — LLM never sees or invents a number outside the input object | Regex/number-match check: output must not contain a number absent from input | Hardcoded per-`flagType` template sentence | Yes |
| Resolve → recompute | Deterministic + human-in-the-loop | Resolution action + payslip id | Re-run rule engine for that payslip only | Updated `PayslipLine`s + diff | none | ~ms | Formula error → surfaced, not silently swallowed | None | Re-validated against same structure-save-time checks | Show error, keep prior state | Yes |
| "Explain this payslip" trace | AI + deterministic | Ordered `PayslipLine` rows | LLM narrates the existing ordered list in prose | Rule-by-rule plain-language paragraph | Same LLM wrapper | 1–2s | API failure | Low — same input-is-the-only-source-of-truth constraint | Same number-match check | Fall back to showing the raw table only (already useful) | Yes |
| Dashboard Copilot | AI (template match) + SQL | NL question | Match to nearest of ~4-6 fixed query templates → execute → phrase result | Grounded prose + highlighted chart | Same LLM wrapper | 1–3s | Unmatched question | Low — LLM never writes SQL itself | Templates are parameterized, not generated | "I can currently answer questions about X, Y, Z" | Yes |

**Governing principle across every row:** the LLM is used exactly twice in kind — to *phrase* an already-computed fact, and to *select* among a small fixed set of pre-built queries. It is never used to compute a payroll number, decide whether something is an anomaly, or generate SQL. This keeps OXP's AI narrow and auditable, matching how the industry itself frames responsible payroll AI in 2026 — narrow, human-reviewed, explainable — rather than a broad, harder-to-govern "AI does everything" pitch.

---

## Phase 9 — Complete Database Blueprint

```
Organization(id, name, company_timezone)                       -- single row is fine for the demo

Role(id, name)                                                   -- Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin
User(id, email, password_hash, role_id FK→Role, employee_id FK→Employee NULL, is_active)

Employee(id, name, work_email, department, job_position, manager_id FK→Employee NULL,
         schedule_id FK→WorkingSchedule, status)

Contract(id, employee_id FK→Employee, start_date, end_date NULL, wage, department, job_position,
         salary_structure_id FK→SalaryStructure, status['running','expired','draft'])
   -- constraint: no two rows for the same employee_id with status='running' and overlapping [start_date,end_date)
   -- implement via EXCLUDE USING gist on daterange(start_date, end_date) WHERE status='running', OR a service-layer transactional check if the exclusion constraint proves too time-costly

WorkingSchedule(id, name, company_id FK→Organization, status)
ScheduleLine(id, schedule_id FK→WorkingSchedule, day_of_week[0-6], start_time, end_time, break_minutes)
   -- weekly hours are a computed value: SUM((end_time-start_time)-break_minutes) across lines, never stored as raw input

Attendance(id, employee_id FK→Employee, date, check_in, check_out NULL, worked_hours (generated/computed),
           overtime_hours (computed), status['present','absent','late','incomplete'],
           is_corrected bool, corrected_by FK→User NULL, corrected_at NULL)

TimeOffType(id, name, unit['days','hours'], requires_allocation bool, requires_approval bool,
            affects_payroll bool, status)
TimeOffAllocation(id, employee_id FK→Employee, timeoff_type_id FK→TimeOffType,
                   allocated numeric, taken numeric, remaining numeric (computed = allocated-taken),
                   valid_from, valid_to, status)
TimeOffRequest(id, employee_id FK→Employee, timeoff_type_id FK→TimeOffType, start_date, end_date,
               duration numeric, status['to_approve','approved','refused'], approved_by FK→User NULL,
               allocation_id FK→TimeOffAllocation NULL)

SalaryStructure(id, name, is_active bool)
SalaryRule(id, structure_id FK→SalaryStructure, name, code (unique per structure), category['basic','allowance','gross','deduction','net'],
           sequence int, computation_method['fixed','percentage','formula'], amount NULL, percentage_of NULL,
           formula_expression NULL)
   -- validated at save-time: any variable referenced in formula_expression must be a code with a strictly lower sequence, or a known contract/attendance field

Payrun(id, name, salary_structure_id FK→SalaryStructure, period_start, period_end,
       status['draft','computed','validated','paid'])
Payslip(id, payrun_id FK→Payrun, employee_id FK→Employee, contract_id FK→Contract,
        worked_days numeric, status['draft','done'])
PayslipLine(id, payslip_id FK→Payslip, salary_rule_id FK→SalaryRule, code, category, amount, sequence)

SentinelFlag(id, payslip_id FK→Payslip, flag_type['duplicate','missing_bank','no_active_contract',
             'unapproved_leave_mismatch','statistical_anomaly'], severity['low','medium','high'],
             deterministic_reason_json jsonb, ai_explanation text NULL,
             status['open','resolved','overridden'], resolved_by FK→User NULL, resolved_at NULL)

PayrollAuditEvent(id, entity_type, entity_id, action, actor_user_id FK→User, created_at, meta_json jsonb)
```

**Explicitly excluded tables (per Rule 1/3):** Performance, Benefits enrollment, Document/e-signature storage, Recruitment/ATS, Multi-currency/exchange-rate tables — none are required by the brief and each would consume build hours for zero judging payoff.

### Entity Relationship Overview
Employee is the hub, referenced by Contract, Attendance, TimeOffRequest/Allocation, and (indirectly, via Contract) Payslip. Contract is the payroll-time bridge: Payslip always resolves its Contract via a period-match query, never a stored FK chosen at creation time only. SalaryStructure→SalaryRule is a pure configuration tree, referenced by both Contract (default structure) and Payrun (the structure actually used for that batch) — the brief allows these to differ, and the payslip always uses the **Payrun's** structure. SentinelFlag and PayrollAuditEvent are both keyed off Payslip/other entities purely as observers — they never gate the core write path except at the Mark Paid transition.

### Core Data Flow
`Employee → resolved active Contract (for Payrun's period) + assigned Schedule (worked-hours basis) → Attendance (actual worked) + approved TimeOff (leave deductions) → Payrun's SalaryStructure's ordered SalaryRules (each may reference prior rule codes + contract/worked-day fields) → PayslipLine rows → SentinelFlag checks over the same Payslip + that employee's Payslip history → Dashboard aggregate queries over Payslip/Attendance/TimeOff tables, filtered by Period/Department/Employee Type.`

---

## Phase 10 — Complete API Blueprint

| Method | Endpoint | Purpose | Auth | Role(s) | Request | Response |
|---|---|---|---|---|---|---|
| POST | `/auth/login` | Authenticate | Public | All | `{email, password}` | `{token, role}` |
| GET/POST | `/users` | List/create users | JWT | Admin | `{employeeId, email, roleId}` | User[] |
| GET/POST/PUT | `/employees` | Employee CRUD | JWT | HR Mgr+ (read: Employee self) | Employee fields | Employee(+related counts) |
| GET | `/employees/:id/related` | Smart-button counts/links | JWT | HR Mgr+, self | — | `{contracts, attendance, timeoff}` |
| GET/POST/PUT | `/contracts` | Contract CRUD w/ period-resolver | JWT | HR Mgr+ | Contract fields | Contract(+conflict error) |
| GET/POST/PUT | `/schedules` | Working Schedule CRUD | JWT | HR Mgr+ | Schedule + lines | Schedule (computed weekly hours) |
| GET/POST/PUT | `/attendance` | Attendance CRUD/correction | JWT | HR Mgr+ (self: create own check-in/out) | Attendance fields | Attendance |
| POST | `/attendance/checkin` `/checkout` | Quick Widget action | JWT | Employee (self) | — | `{status, elapsed}` |
| GET/POST | `/timeoff/types` | Time Off Type CRUD | JWT | HR Mgr+ (payroll: read-only) | Type fields | TimeOffType |
| GET/POST | `/timeoff/allocations` | Allocation CRUD | JWT | HR Mgr+ | Allocation fields | Allocation |
| GET/POST/PUT | `/timeoff/requests` | Request + approve/refuse | JWT | Employee (create own), HR Mgr (approve/refuse) | Request fields / `{status}` | Request |
| GET/POST/PUT | `/salary-structures` | Structure CRUD | JWT | Payroll Mgr (User: read-only) | Structure fields | Structure(+rules) |
| GET/POST/PUT | `/salary-rules` | Rule CRUD + save-time validation | JWT | Payroll Mgr (User: read-only) | Rule fields | Rule(+validation errors) |
| POST | `/payruns` | Create (Step 2 completion only) | JWT | Payroll User+ | `{structureId, period, employeeIds[]}` | Payrun(+payslips) |
| GET | `/payruns/:id/eligible-employees` | Step 2 candidate list | JWT | Payroll User+ | `{period}` | Employee[] (only those with a resolvable active contract) |
| POST | `/payruns/:id/compute` | Run rule engine on all payslips | JWT | Payroll User+ | — | Payrun(+lines) |
| POST | `/payruns/:id/validate` | Run Sentinel | JWT | Payroll User+ | — | `{flags: SentinelFlag[]}` |
| POST | `/payruns/:id/mark-paid` | Finalize (blocked if open high-sev flags) | JWT | Payroll Mgr | — | Payrun |
| POST | `/payruns/:id/send-payslips` | Bulk email | JWT | Payroll User+ | — | `{sent, failed}` |
| GET | `/payslips/:id` | Payslip detail | JWT | Payroll, self (employee) | — | Payslip(+lines) |
| GET | `/payslips/:id/pdf` | Print action | JWT | Payroll, self | — | PDF stream |
| GET | `/payslips/:id/explain` | "Explain this payslip" | JWT | Payroll, self | — | `{narration}` |
| POST | `/sentinel/flags/:id/resolve` | One-click resolve | JWT | Payroll User+ | `{resolutionType}` | `{updatedPayslip, diff}` |
| GET | `/dashboard` | KPIs/charts/alerts | JWT | Payroll, Leadership | `{period, department, employeeType}` | Dashboard payload |
| POST | `/dashboard/copilot` | NL question | JWT | Payroll, Leadership | `{question}` | `{answer, chartRef}` |
| GET | `/audit` | Audit log view | JWT | Payroll Mgr, Admin | filters | AuditEvent[] |

Only these endpoints are built — no generic admin-CRUD for tables that don't need direct exposure (e.g., no raw `PayslipLine` write endpoint; lines are only ever produced by `/compute`).

---

## Phase 11 — Authentication & Authorization

**Flow:** email+password → bcrypt verify → JWT `{userId, roleId, employeeId}` signed with `JWT_SECRET`, short expiry (e.g. 8h, enough for a demo/session) → client attaches `Authorization: Bearer <token>` → Express `requireRole([...])` middleware on every protected route.

**Password handling:** bcrypt with a standard cost factor (10–12); never log or return the hash.

**RBAC (exact brief mapping):**
- **Employee** — read own Employee/Attendance/TimeOff/Payslip; create own Attendance (check-in/out) and TimeOffRequest; no write access elsewhere.
- **HR Manager** — full CRUD on Employee/Contract/Schedule/Attendance/TimeOff; approve/refuse requests; **no** payroll route access (enforced server-side, not just hidden in UI).
- **HR Payroll User** — all HR Manager permissions + create/read/update on Payrun/Payslip; read-only on Salary Structures/Rules.
- **HR Payroll Manager** — all of the above + full CRUD on Payrun/Payslip/Salary Structures/Rules.
- **Admin** — full access to all routes + `/users`.

**Organization-level isolation:** single-organization for the demo (`Organization` table exists for schema completeness, not enforced as a tenant boundary — explicitly a hackathon simplification, stated as such if asked).

**Sensitive payroll-data protection:** wage/bank-detail fields are never returned in any Employee-role-scoped response (field-level filtering in the serializer, not just route-level gating) — this is a cheap, concrete detail worth calling out to a judge who asks about data protection.

---

## Phase 12 — Frontend Information Architecture

**Top navigation:** Employees · Contracts · Attendance · Time Off (Requests / Allocations / Types) · Payroll (Payruns / Payslips / Structures / Rules) · Reports (Dashboard) — matching the PDF's own menu grouping.

**Role-based navigation:**
- **Employee:** Home (attendance widget + own dashboard tile), My Attendance, My Time Off, My Payslips.
- **HR Manager:** Employees, Contracts, Schedules, Attendance, Time Off (incl. approvals).
- **HR Payroll User:** everything above + Payruns/Payslips (read/create/update), Structures/Rules (read-only).
- **HR Payroll Manager:** everything + full Structures/Rules CRUD.
- **Admin:** everything + User Management.

**Key screens (each with the standard states):**

| Screen | Purpose | Primary User | Key Components | APIs | Empty/Loading/Error |
|---|---|---|---|---|---|
| Employee Kanban/List | Browse/find employees | HR Mgr | Board + Table, smart-button counts | `/employees` | "No employees yet — add your first" / skeleton cards / retry banner |
| Employee Form | Central hub | HR Mgr, self | Tabs (Work/Private), smart buttons | `/employees/:id`, `/employees/:id/related` | n/a mostly always populated |
| Contract List/Form | Manage employment terms | HR Mgr | Highlighted "Running" row, conflict warning modal | `/contracts` | Conflict error surfaced inline, not a generic toast |
| Schedule List/Form | Define weekly pattern | HR Mgr | Day rows, live-computed weekly hours | `/schedules` | — |
| Attendance List/Form + Quick Widget | Daily tracking | HR Mgr, Employee | Table, correction modal, floating check-in widget | `/attendance`, `/attendance/checkin` | Missing-checkout rows visually distinct |
| Time Off Requests/Allocations/Types | Leave lifecycle | HR Mgr, Employee | Approve/Refuse buttons, balance bar | `/timeoff/*` | Insufficient-balance inline error at submission |
| Salary Structures/Rules | Payroll config | Payroll Mgr | Ordered rule table, formula editor w/ safe-variable autocomplete | `/salary-structures`, `/salary-rules` | Save-time validation errors shown per-field |
| Payrun Wizard | Create batch | Payroll User | 2-step modal, employee checklist | `/payruns`, `/payruns/:id/eligible-employees` | Continue disabled until Step 1 valid |
| Payrun Processing | Run the batch | Payroll User | Compute/Validate/Mark Paid/Send buttons, **Sentinel flag cards**, recompute diff animation | `/payruns/:id/*` | Loading spinner per action, not a full-page block |
| Payslip Detail | Individual breakdown | Payroll, self | Rule table, **Explain** panel, Print button | `/payslips/:id`, `/explain`, `/pdf` | — |
| Dashboard | Live reporting | Payroll, Leadership | KPI cards, 2 charts, alerts list, **Copilot input** | `/dashboard`, `/dashboard/copilot` | Skeleton cards while loading, "ask about cost/trend/attendance/leave" hint on unmatched Copilot question |
| User Management | Admin | Admin | Table + create/edit modal | `/users` | — |

---

## Phase 13 — Dashboards (Per-Role Real Questions)

- **Employee — "What do I need to know today?"** own attendance status, remaining leave balance, latest payslip status, one-line Sentinel-style note if their own payslip has an open, employee-visible issue (e.g., "your bank details are missing — update before the next pay run").
- **Payroll User/Manager — "What could cause payroll problems?"** this is the primary OXP dashboard from the PDF, extended with a Sentinel-flags-by-severity summary and the Copilot box.
- **Leadership — "What is happening across the organization?"** department cost breakdown, monthly trend, attendance health %, approved-leave volume — same data as the Payroll dashboard, filtered to a leadership-appropriate read-only view (no per-employee drill-in needed for the demo).

*(HR Manager and dedicated Manager-of-a-team dashboards are explicitly out of scope — the brief doesn't name a "Manager" role distinct from HR Manager, so inventing one is scope creep.)*

---

## Phase 14 — System Architecture (Final Stack)

**Frontend:** React 18 + Vite · Mantine (fastest path to Kanban-capable boards + data tables + forms under time pressure) or shadcn/ui+Tailwind if the team prefers Tailwind-first styling — pick one, don't mix · TanStack Query for server state/cache invalidation (critical for "approve leave → balance updates" and "resolve flag → payslip recomputes" interactions feeling instant) · TanStack Table for List views · Recharts for the two dashboard charts · React Hook Form + Zod for all forms.

**Backend:** Node 22 LTS + Express 4 · **Prisma** ORM (schema-first, fast migrations, typed relation queries map naturally onto Employee→Contract→Payslip traversal) · Zod for request validation · `jsonwebtoken` + `bcrypt` for auth · one centralized error-handling middleware · `pino`/`morgan` for logging (don't over-invest here).

**AI Layer:** one small `/lib/ai.ts` wrapper around a single current LLM API (Claude or GPT) · prompt strategy = structured-fact-in, prose-out only (never free generation of numbers or SQL) · output validated by a simple number-match check against the input facts before rendering · fallback to hardcoded per-case template text on any API failure or timeout.

**Infrastructure:** Postgres (already hosted) · Node API + built React app deployed as one service where possible (Render/Railway) to minimize deployment steps · env vars: `DATABASE_URL`, `JWT_SECRET`, `AI_API_KEY` · PDF generation via `pdf-lib` (or headless Puppeteer if richer layout is wanted and time allows) · email via `nodemailer` (SMTP) or `resend`, with a console-log fallback in dev so the demo never depends on real email deliverability · no background job queue — everything for a 30–60 employee demo dataset runs synchronously fast enough · no dedicated monitoring, a `/health` endpoint is sufficient.

---

## Phase 15 — Production vs. Hackathon Architecture

| Aspect | Production | Hackathon (24h) |
|---|---|---|
| Tax/deduction rules | Country-specific localization engine | 3–4 generic, clearly-labeled illustrative rules (PF/PT-style) |
| Contract overlap enforcement | DB exclusion constraint + service layer + admin override workflow | Service-layer transactional check (add the Postgres `EXCLUDE USING gist` constraint too if time allows — cheap, impressive) |
| Formula engine | Fully sandboxed interpreter with debugging tools | `expr-eval`-based safe evaluator, whitelist of variables |
| Sentinel anomaly detection | Trained ML model, tunable thresholds, feedback loop | Fixed threshold (e.g. >150% or <50% of trailing 3-payslip average) computed live via SQL |
| Payroll batch processing | Async job queue, retries, partial-failure handling | Synchronous compute loop over demo-sized data |
| Email delivery | Dedicated transactional email service w/ bounce/retry handling | Single send call + console-log fallback |
| Audit/compliance | Full retention policy, exportable compliance reports | One `PayrollAuditEvent` table, simple filtered view |
| Multi-tenant isolation | Full org-scoped row-level security | Single `Organization` row, schema present but not enforced |

**What's fully functional (not mocked) for the demo:** the entire Employee→Contract→Schedule→Attendance→TimeOff→SalaryRule→Payslip chain, Sentinel's detection+resolve+recompute loop, and the live dashboard queries — none of these should be faked with static JSON.
**What's seeded/demo data:** the historical payslips used as Sentinel's "trailing average" comparison basis, and the organization's employee roster.
**What's architected-for-future-but-not-built:** country-specific tax localization, async job processing, full multi-tenant isolation.

---

## Phase 16 — Development Blueprint (Units)

| Unit | Backend | DB | Frontend | API Deps | Est. Time | Priority | Depends On | Demo Importance |
|---|---|---|---|---|---|---|---|---|
| Auth & Users | JWT, role middleware | User, Role | Login, User Mgmt screen | — | 1.5h | P0 | — | Low |
| Employee | CRUD + related-counts service | Employee | Kanban/List/Form | Auth | 1.5h | P0 | Auth | Medium |
| Contract | CRUD + period-resolver service | Contract | List/Form + conflict modal | Employee | 2h | P0 | Employee | Medium |
| Schedule | CRUD + hours-calc | WorkingSchedule, ScheduleLine | List/Form | Employee | 1h | P0 | — | Low |
| Attendance | CRUD + correction + widget endpoints | Attendance | List/Form + Quick Widget | Employee, Schedule | 2h | P0 | Employee, Schedule | Medium |
| Time Off | CRUD + balance-ledger transaction | TimeOffType/Allocation/Request | List/Form + approve/refuse | Employee | 2h | P0 | Employee | Medium |
| Salary Rule Engine | safe expr evaluator + sequenced execution service | SalaryStructure/Rule | Structure/Rule config UI | — | 3h | P0 | — | Medium |
| Payrun/Payslip | wizard endpoints, Compute service | Payrun/Payslip/PayslipLine | Wizard + Processing screen | Contract, Rule Engine | 3h | P0 | Contract, Rule Engine | High |
| PDF/Email | pdf-lib + nodemailer | — | Print button, Send action | Payrun/Payslip | 1.5h | P0 | Payrun/Payslip | Medium |
| Dashboard | aggregate queries | — (reads existing tables) | KPI/charts/alerts | Payrun/Payslip, Attendance, TimeOff | 1.5h | P0 | Payrun/Payslip | High |
| **Sentinel** | rule+stat checks, LLM wrapper | SentinelFlag | Flag cards + Resolve action | Payrun/Payslip | 2.5h | P1 | Payrun/Payslip | Very High |
| **Recompute-on-Resolve** | scoped recompute + diff | — | Diff animation | Sentinel | 1h | P1 | Sentinel | Very High |
| **Explain This Payslip** | LLM narration endpoint | — | Trace panel | Payrun/Payslip | 1h | P1 | Payrun/Payslip | High |
| **Dashboard Copilot** | template-match + LLM wrapper | — | Chat input on Dashboard | Dashboard | 1.5h | P1 | Dashboard | High |

**Recommended implementation order:** Auth → Employee → Schedule → Contract → Attendance → Time Off → Salary Rule Engine → Payrun/Payslip → PDF/Email → Dashboard → Sentinel → Recompute → Explain → Copilot → polish/demo prep.

---

## Phase 17 — 24-Hour Execution Plan

| Hours | Phase | Tasks | Deliverable | Must Complete | Cut If Behind |
|---|---|---|---|---|---|
| 0–1 | Architecture Freeze | Repo scaffold, Prisma schema (all tables), seed skeleton, deploy pipeline smoke-tested once | Running skeleton | Yes | Nothing |
| 1–4 | DB + Backend Foundation | Auth, Employee, Schedule, Contract (incl. period-resolver) | Core non-payroll APIs | Yes | Fewer Contract edge cases, keep the resolver |
| 4–8 | Core Workflows | Attendance, Time Off (balance ledger), Salary Rule Engine (safe evaluator) | All business-logic services working, manually tested | Yes | Simplify formula method support to Fixed+Percentage only if truly stuck; keep sequencing |
| 8–12 | Frontend + Major Workflows | Employee/Contract/Schedule/Attendance/TimeOff screens, nav, role guards | Navigable app | Yes | Kanban drag-and-drop → static board |
| 12–16 | Payroll Core | Payrun wizard, Compute, Payslip screen, PDF/email | End-to-end employee→payslip works | Yes | PDF styling stays plain |
| 16–18.5 | **Sentinel (Differentiator)** | Deterministic rules, statistical check, Resolve+recompute UI | Wow-feature demo path works | This is the win condition | Ship deterministic-only, drop statistical check |
| 18.5–20 | AI Layer | LLM wrapper for flag phrasing, Explain panel, Copilot | AI narration live | High priority, not P0 | Hardcode 2–3 phrasings, keep Copilot for 3–4 fixed questions only |
| 20–21.5 | Dashboard | KPIs, 2 charts, alerts, live queries | Live dashboard | Yes | Cut to 1 chart if needed, never fake with static data |
| 21.5–22.5 | Integration + Bug Fixing | Cross-module smoke test, per-role RBAC test | Stable build | Yes | — |
| 22.5–23.5 | Demo Prep | Seed a *story* dataset matching Phase 19's script, rehearse once | Rehearsed demo | Yes | — |
| 23.5–24 | Buffer | Deployment double-check, one-slide pitch, breathe | Deployed + ready | Yes | — |

**Golden rule:** if you're behind at hour 18.5, ship deterministic-rules-only Sentinel with the recompute interaction intact — that pairing alone is still the strongest demoable feature in the room.

---

## Phase 18 — Demo-Ready Data (The Story, Not Random Faker Data)

- **Organization:** OXP Pvt Ltd, ~5 departments (Finance, HR, Engineering, Sales, Support), ~30–40 employees.
- **Employees:** include the PDF's own named cast (Aarav Mehta – Payroll Specialist/Finance, Sara Khan – HR Officer, John Dsouza – Developer/Engineering, Neha Patel – Recruiter/HR) as recognizable demo anchors, plus enough filler to make department charts look real.
- **Contracts:** each anchor employee has 2 contracts (one expired, one running) to visibly prove the period-resolver works.
- **Payroll history:** 4–5 prior *paid* Payruns (e.g. Apr–Aug 2026) with realistic, gently trending net-salary totals — this trailing history is what makes Sentinel's statistical check meaningful and non-arbitrary.
- **The planted scenario:** one employee (say, Sara Khan) has a **pending** Time Off Request as the demo opens; her draft payslip for the current period is already computed *without* that leave reflected — this is the exact seam Sentinel will catch live. Another employee has **missing bank details**; a third has an accidental **duplicate payslip** in the current draft Payrun.
- **Attendance:** a few realistic exceptions (one missing checkout, one manually corrected entry) to make the Attendance screen feel lived-in.
- **Avoid:** uniform, randomly-generated Faker rows with no narrative — a judge notices immediately when nothing in the dataset connects to anything else.

---

## Phase 19 — Winning Demo Story (5–7 Minutes)

**Scene 1 — What the judge sees:** the live Payroll Dashboard, already populated, mid-cycle: "It's the last day of payroll for OXP Pvt Ltd's 38 employees."

**Scene 2 — What happens:** Sara Khan's pending Time Off Request (already sitting in the queue) gets approved on screen; her leave balance visibly decrements.

**Scene 3 — What OXP detects:** switch to the Payrun in progress — her payslip currently shows leave as unworked absence, computed *before* this approval.

**Scene 4 — What intelligence is applied:** click Validate on the Payrun. Sentinel surfaces three explainable cards: duplicate payslip, missing bank details, and a statistical flag on Sara's payslip ("net pay is 340% above her trailing 3-month average — likely because the leave you just approved isn't reflected yet").

**Scene 5 — What recommendation appears:** each card shows a plain-language reason and a **Resolve** button.

**Scene 6 — What the user does:** click Resolve on Sara's flag — the payslip **recomputes live**, before/after net-pay diff animates.

**Scene 7 — What changes in the organization:** clear remaining flags, Mark Paid, Send Payslips (bulk email + one downloaded PDF shown); the Dashboard's totals update to reflect the finalized run.

**Final Scene — the "WOW" moment:** type into the Dashboard Copilot, "Why did Engineering's cost change this month?" — get a grounded, numbers-cited answer drawn from the exact data just processed.

**Explicitly avoided:** no Login screen shown live, no basic "add employee" CRUD walkthrough, no static dashboard — every screen shown is either mid-story or reacting live to an action just taken.

---

## Phase 20 — Judge Perspective (Honest Self-Scoring)

| Category | Score /10 | Reason |
|---|---:|---|
| Problem Understanding | 9 | Faithfully covers every named requirement; period-contract and rule-sequencing logic explicitly addressed |
| Innovation | 8 | Explainable, resolvable exception detection at the Validate step is a genuinely underserved angle, not a generic AI bolt-on |
| Technical Complexity | 8 | Safe formula engine + period-resolution + live recompute is real, demonstrable business logic, not surface CRUD |
| Real-World Value | 8 | Directly mirrors where the 2026 payroll-AI industry conversation is heading — narrow, auditable, human-in-the-loop |
| UX | 7 | Strong if the Resolve/recompute animation is polished; risk is time pressure degrading visual polish |
| AI/Intelligence | 8 | Deliberately narrow and explainable rather than a flashy but ungoverned chatbot — reads as mature judgment |
| Scalability | 6 | Honestly hackathon-scoped (single-org, sync processing) — fine for this brief, not pretending otherwise |
| Feasibility (24h) | 8 | Every P0/P1 item has a concrete, time-boxed plan; explicit cut-order if behind |
| Demo Impact | 9 | The Resolve→recompute moment is a strong, memorable, non-generic wow beat |
| Differentiation | 9 | Very few of 2,000+ teams will both nail the deterministic core *and* layer explainable, resolvable intelligence on top |
| **Overall Winning Potential** | **8/10** | Strong, honest, buildable — the main execution risk is time discipline on Sentinel, not the idea itself |

**Would this stand out among 2,000+ participants?** Yes, *if and only if* the core (Phase 1 must-builds) is genuinely completed correctly first — the differentiator has zero value bolted onto a broken or shallow foundation. The honest risk isn't the concept; it's whether the team protects the last ~4–5 hours for Sentinel rather than letting Tier-1 polish eat into it.

---

## Phase 21 — Scope & Risk Management

**Must Build:** Auth/RBAC, Employee/Contract/Schedule/Attendance/TimeOff CRUD with correct business logic, Salary Rule Engine, Payrun/Payslip lifecycle, PDF/email, live Dashboard.
**Should Build:** Sentinel deterministic checks + Resolve/recompute (this is what separates a pass from a win).
**Build Only If Ahead:** statistical anomaly check, Explain-this-payslip, Dashboard Copilot, audit-trail export, attendance heatmap.
**Do Not Build:** multi-country/currency, custom permission builder, recruitment/performance/LMS, free-text SQL chatbot, literal Python-code-eval formula field.

| Risk | Category | Mitigation |
|---|---|---|
| Contract-period logic bug found live by a judge | Technical | Unit-test the resolver function in isolation at hour 3, before building anything on top of it |
| Formula engine security/complexity blowout | Technical | Use `expr-eval` (safe, no code execution) instead of literal code eval from the start — never attempt a sandboxed interpreter |
| LLM call fails/slow during live demo | AI | Pre-warm the exact demo questions before presenting; hardcoded fallback phrasing per flag type |
| Statistical anomaly check needs seeded history to be meaningful | AI/Data | Seed 4–5 realistic prior Payruns specifically to make this check non-arbitrary (Phase 18) |
| Dashboard queries slow/incorrect under time pressure | Database | Keep queries to simple aggregates (`SUM`/`AVG`/`GROUP BY`) — no premature materialized views |
| Deployment breaks right before judging | Deployment | Deploy early (by hour ~12) and redeploy incrementally, never a single big-bang deploy at hour 23 |
| Demo runs long/short | Demo | Rehearse once at hour 23.5 with a stopwatch; Scene 7 (Mark Paid/Send) is the first thing to compress if running long |
| Team spends too long polishing Tier-1 CRUD | Time management | Hard time-box per Phase 17 row; Sentinel's hour range is protected, not "if time remains" |

---

## Phase 22 — Final Consolidated Blueprint

1. **Product Vision:** OXP is a payroll integrity and workforce-operations platform, not a generic HRMS — it runs the full Odoo-style lifecycle correctly and adds explainable intelligence at the moment money moves.
2. **Product Positioning:** "It doesn't just calculate — it explains, and shows you the impact of every fix, live."
3. **Target Users:** Employee, HR Manager, HR Payroll User, HR Payroll Manager, Admin (brief's exact 5 roles).
4. **Complete Module List:** Phase 4 table — Core HR, Workforce Ops, Payroll & Finance, Employee Experience, AI & Automation (Sentinel/Recompute/Explain/Copilot), Analytics, Administration.
5. **Module Priorities:** all Tier-1 modules P0; Sentinel+Recompute P1 (the actual win condition); everything else optional or excluded.
6. **Complete Workflow Map:** Phase 5 — 9 fully specified module workflows (Contract, Attendance, Time Off, Rule Engine, Payrun/Payslip, Sentinel, Dashboard/Copilot, plus Auth).
7. **Cross-Module Workflows:** Phase 6 — onboarding-to-payslip, leave-to-payroll-impact, signal-to-action (the core wow loop), question-to-grounded-answer.
8. **Problem Statement → Feature Mapping:** Phase 2 — every brief requirement mapped, gaps identified and closed.
9. **Winning Features Beyond the Brief:** Sentinel, Recompute, Explain, Copilot (Phase 7).
10. **AI Strategy:** narrow, auditable, phrase-only/select-only LLM usage; all decisions deterministic or statistical (Phase 8).
11. **Frontend Architecture:** React/Vite/Mantine-or-shadcn, TanStack Query+Table, Recharts (Phase 14/12).
12. **Backend Architecture:** Node/Express/Prisma/Zod, JWT+role middleware (Phase 14).
13. **Database Schema:** ~16 tables, period-exclusive Contract constraint, safe-evaluated SalaryRule formulas, SentinelFlag/AuditEvent as observer tables (Phase 9).
14. **API Architecture:** ~25 purposeful REST endpoints, no incidental CRUD (Phase 10).
15. **Authentication & RBAC:** JWT + 5-role server-side enforcement + field-level payroll-data protection (Phase 11).
16. **Dashboard Architecture:** per-role real questions, not generic card grids (Phase 13).
17. **Screen/UX Architecture:** Phase 12 full screen table with empty/loading/error states specified.
18. **Infrastructure:** single hosted Postgres, one deployable Node+React service, no queues/microservices (Phase 14/15).
19. **Development Architecture:** Phase 16 unit breakdown, dependency-ordered.
20. **24-Hour Development Plan:** Phase 17 hour-by-hour, with an explicit protected window for Sentinel.
21. **Demo Data Strategy:** a planted, narrative dataset, not random Faker rows (Phase 18).
22. **5–7 Minute Winning Demo:** Phase 19 — leave approval → Sentinel reveal → live resolve/recompute → Mark Paid/Send → grounded Copilot answer.
23. **Judge Evaluation:** honest 8/10 overall, contingent on protecting Sentinel's build window (Phase 20).
24. **Risk Management:** Phase 21 risk table, each with a concrete mitigation.
25. **Scope Cut Strategy:** statistical check → AI narration → Kanban drag-and-drop → PDF styling → Tier-3 items, in that order, if time runs short.
26. **Final Winning Recommendation:** build the mandatory Odoo-shaped core completely and correctly (most competitors will fumble the business logic, not the screens), then protect roughly 4–5 hours near the end exclusively for Sentinel's explainable, resolvable, live-recomputing exception engine — that single, narrow, well-executed capability is what turns a competent submission into a remembered one.

---

## Final Answer to the Explicit Question

**Exactly what should we build:** the complete, correctly-modeled Odoo-shaped core from the brief (Employee→Contract→Schedule→Attendance/TimeOff→SalaryRules→Payrun/Payslip→Dashboard) — this is mandatory and where most competitors will actually lose points, not where they'll win them — plus Sentinel: an explainable, deterministic+statistical exception-detection layer wired into Validate, with one-click Resolve and a live recompute showing before/after impact.

**Exactly what should we avoid:** multi-country/currency payroll, a custom permission-builder, recruitment/performance/LMS modules, a free-text "ask my database anything" chatbot, and literally evaluating user-submitted code as the salary-rule formula engine.

**What the judge should remember after the demo:** not "another HR+Payroll CRUD system with a dashboard," but the specific moment a Sentinel card was resolved and the payslip's net pay recomputed live in front of them, with the underlying reasoning stated in plain language the whole time — the moment OXP stopped looking like Odoo and started looking like a product.
