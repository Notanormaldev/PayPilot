# HRMS OXP — API Specification

> REST API reference for the Node 22 + Express 4 backend.
> Base URL: `https://api.oxp.io/api/v1`
> Auth: Clerk JWT via `Authorization: Bearer <token>`

---

## Global Conventions

| Convention | Detail |
|---|---|
| **Format** | JSON request/response bodies |
| **Auth** | All routes (except `/webhooks/*`) require `Authorization: Bearer <clerk_jwt>` |
| **IDs** | CUID strings |
| **Dates** | ISO 8601 (`2026-09-01`, `2026-09-01T09:00:00Z`) |
| **Pagination** | `?page=1&limit=20` → response includes `{ data, total, page, limit }` |
| **Errors** | `{ error: string, message: string, details?: object }` |
| **Money** | Decimal strings (e.g. `"42500.00"`) — never floats |

### Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthenticated |
| `403` | Forbidden (wrong role or resource ownership) |
| `404` | Not Found |
| `409` | Conflict (e.g. overlapping contract) |
| `422` | Unprocessable Entity (business rule violation) |
| `500` | Internal Server Error |

---

## AUTH

### `POST /auth/sync`
Called by Clerk webhook on user creation. Syncs the Clerk user to internal DB.

> Not called by clients directly. Clerk-signed only.

---

## USERS

### `GET /users`
List all users.
- **Auth:** ADMIN
- **Response:** `User[]` (clerkId excluded)

### `POST /users`
Create a new user and link to an employee.
- **Auth:** ADMIN
- **Body:** `{ email: string, employeeId?: string, role: Role }`
- **Response 201:** `User`

### `GET /users/:id`
Get a single user.
- **Auth:** ADMIN

### `PUT /users/:id/role`
Change a user's role.
- **Auth:** ADMIN (cannot self-elevate)
- **Body:** `{ role: Role }`
- **Response:** `User`

### `PUT /users/:id/status`
Activate or deactivate a user.
- **Auth:** ADMIN
- **Body:** `{ isActive: boolean }`

---

## EMPLOYEES

### `GET /employees`
List all employees with smart-button counts.
- **Auth:** HR_MANAGER+
- **Query:** `?department=string&status=ACTIVE|INACTIVE&search=string&page=1&limit=20`
- **Response:** `{ data: Employee[], total, page, limit }`

```json
// Employee shape
{
  "id": "cuid",
  "name": "Aarav Mehta",
  "workEmail": "aarav@oxp.io",
  "department": "Finance",
  "jobPosition": "Payroll Specialist",
  "status": "ACTIVE",
  "schedule": { "id": "...", "name": "Standard 40h" },
  "_counts": {
    "contracts": 2,
    "attendance": 22,
    "timeOffRequests": 1,
    "payslips": 5
  }
}
```

### `POST /employees`
Create an employee.
- **Auth:** HR_MANAGER+
- **Body:** `{ name, workEmail, department, jobPosition, scheduleId?, managerId? }`
- **Response 201:** `Employee`

### `GET /employees/:id`
Get a single employee (full detail).
- **Auth:** HR_MANAGER+ or self (EMPLOYEE — wage fields excluded)

### `PUT /employees/:id`
Update employee.
- **Auth:** HR_MANAGER+

### `GET /employees/:id/related`
Smart-button counts + recent items for sidebar.
- **Auth:** HR_MANAGER+ or self
- **Response:** `{ contracts: Contract[], recentAttendance: Attendance[], leaveBalance: Allocation[], latestPayslip: Payslip }`

---

## CONTRACTS

### `GET /contracts`
List contracts.
- **Auth:** HR_MANAGER+
- **Query:** `?employeeId=string&status=RUNNING|EXPIRED|DRAFT`

### `POST /contracts`
Create a contract. Validates no overlapping RUNNING contract for the same employee.
- **Auth:** HR_MANAGER+
- **Body:** `{ employeeId, startDate, endDate?, wage, department, jobPosition, salaryStructureId, status }`
- **Response 201:** `Contract`
- **Response 409:** Conflict with details of the blocking contract

### `GET /contracts/:id`
Get contract detail.
- **Auth:** HR_MANAGER+ or self (own contract, wage excluded)

### `PUT /contracts/:id`
Update contract. Re-runs overlap check on status/date changes.
- **Auth:** HR_MANAGER+

### `GET /employees/:id/active-contract`
Resolve the period-correct active contract for an employee (used internally and for display).
- **Query:** `?date=YYYY-MM-DD` (defaults to today)

---

## WORKING SCHEDULES

### `GET /schedules`
List all schedules.
- **Auth:** HR_MANAGER+

### `POST /schedules`
Create schedule with lines.
- **Auth:** HR_MANAGER+
- **Body:**
```json
{
  "name": "Standard 40h",
  "lines": [
    { "dayOfWeek": "MON", "startTime": "09:00", "endTime": "18:00", "breakMinutes": 60 }
  ]
}
```
- **Response 201:** `Schedule` (with `weeklyHours` computed)

### `GET /schedules/:id`
Get schedule with lines and computed `weeklyHours`.

### `PUT /schedules/:id`
Update schedule and lines.
- **Auth:** HR_MANAGER+

---

## ATTENDANCE

### `GET /attendance`
List attendance records.
- **Auth:** HR_MANAGER+ (all); EMPLOYEE (own only)
- **Query:** `?employeeId=string&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&status=INCOMPLETE`

### `POST /attendance/checkin`
Employee check-in (Quick Widget).
- **Auth:** Any authenticated user (acts on own record)
- **Response:** `{ id, checkIn, status: "PRESENT", elapsedMinutes: 0 }`

### `POST /attendance/checkout`
Employee check-out.
- **Auth:** Any authenticated user (own record)
- **Response:** `{ id, checkOut, workedHours, overtimeHours, status }`

### `GET /attendance/:id`
Get single attendance record.

### `PUT /attendance/:id`
Correct attendance (HR Manager+). Sets `isCorrected=true`, `correctedById`, `correctedAt`.
- **Auth:** HR_MANAGER+
- **Body:** `{ checkIn?, checkOut?, reason: string }`

---

## TIME OFF

### `GET /timeoff/types`
List time off types.
- **Auth:** All authenticated (read-only for EMPLOYEE)

### `POST /timeoff/types`
Create time off type.
- **Auth:** HR_MANAGER+

### `PUT /timeoff/types/:id`
Update time off type.
- **Auth:** HR_MANAGER+

---

### `GET /timeoff/allocations`
List allocations.
- **Auth:** HR_MANAGER+ (all); EMPLOYEE (own only)
- **Query:** `?employeeId=string&typeId=string`
- **Response:** includes computed `remaining` field

### `POST /timeoff/allocations`
Create allocation.
- **Auth:** HR_MANAGER+

---

### `GET /timeoff/requests`
List requests.
- **Auth:** HR_MANAGER+ (all); EMPLOYEE (own only)
- **Query:** `?employeeId=string&status=TO_APPROVE|APPROVED|REFUSED`

### `POST /timeoff/requests`
Submit a leave request.
- **Auth:** Any (creates for req.user.employeeId)
- **Body:** `{ timeOffTypeId, allocationId?, startDate, endDate, reason? }`
- **Response 201:** `TimeOffRequest`
- **Response 422:** `{ error: "InsufficientBalance", remaining: "2.00", requested: "5.00" }`

### `GET /timeoff/requests/:id`
Get request detail.

### `PUT /timeoff/requests/:id/approve`
Approve a request. Atomically decrements allocation balance.
- **Auth:** HR_MANAGER+
- **Response:** `{ request: TimeOffRequest, updatedAllocation: Allocation }`

### `PUT /timeoff/requests/:id/refuse`
Refuse a request. Does **not** touch allocation.
- **Auth:** HR_MANAGER+
- **Body:** `{ reason?: string }`

---

## SALARY STRUCTURES & RULES

### `GET /salary-structures`
List structures.
- **Auth:** HR_PAYROLL_USER+ (read); HR_PAYROLL_MANAGER+ (write)

### `POST /salary-structures`
Create structure.
- **Auth:** HR_PAYROLL_MANAGER+

### `GET /salary-structures/:id`
Get structure with rules ordered by sequence.

### `PUT /salary-structures/:id`
Update structure.
- **Auth:** HR_PAYROLL_MANAGER+

---

### `GET /salary-rules?structureId=:id`
List rules for a structure.

### `POST /salary-rules`
Create a salary rule. Validates formula expressions at save time.
- **Auth:** HR_PAYROLL_MANAGER+
- **Body:**
```json
{
  "structureId": "cuid",
  "name": "HRA",
  "code": "HRA",
  "category": "ALLOWANCE",
  "sequence": 20,
  "computationMethod": "PERCENTAGE",
  "percentageOf": "BASIC",
  "percentageValue": "0.40"
}
```
- **Response 400 (formula error):** `{ error: "InvalidFormula", offendingExpression: "...", hint: "Referenced code 'XYZ' does not exist or has higher sequence" }`

### `PUT /salary-rules/:id`
Update rule. Re-validates formula.
- **Auth:** HR_PAYROLL_MANAGER+

### `DELETE /salary-rules/:id`
Delete rule (only if not referenced in paid payslips).
- **Auth:** HR_PAYROLL_MANAGER+

---

## PAYRUNS

### `GET /payruns`
List payruns.
- **Auth:** HR_PAYROLL_USER+
- **Query:** `?status=DRAFT|COMPUTED|VALIDATED|PAID&year=2026`

### `GET /payruns/:id/eligible-employees`
Step 2 of the wizard — employees with a resolvable active contract for the period.
- **Auth:** HR_PAYROLL_USER+
- **Query:** `?periodStart=YYYY-MM-DD&periodEnd=YYYY-MM-DD&structureId=cuid`
- **Response:** `Employee[]` (only those with a matching contract)

### `POST /payruns`
Create payrun (Step 2 completion only). Creates one draft Payslip per selected employee.
- **Auth:** HR_PAYROLL_USER+
- **Body:** `{ name, salaryStructureId, periodStart, periodEnd, employeeIds: string[] }`
- **Response 201:** `Payrun` with `payslips[]`

### `GET /payruns/:id`
Get payrun detail with payslips, sentinel flag counts.

### `POST /payruns/:id/compute`
Run the salary rule engine for all payslips in this payrun. Idempotent.
- **Auth:** HR_PAYROLL_USER+
- **Response:** `Payrun` with updated `payslips[].lines[]`

### `POST /payruns/:id/validate`
Run Sentinel checks across all payslips.
- **Auth:** HR_PAYROLL_USER+
- **Response:** `{ flags: SentinelFlag[], flagCounts: { high: number, medium: number, low: number } }`

### `POST /payruns/:id/mark-paid`
Finalize the payrun. Blocked if any HIGH-severity flags are OPEN.
- **Auth:** HR_PAYROLL_MANAGER+
- **Response 422 (blocked):** `{ error: "OpenHighSeverityFlags", count: 2, flags: [...] }`
- **Response 200:** `Payrun` (status=PAID)

### `POST /payruns/:id/send-payslips`
Bulk email payslips to all paid employees.
- **Auth:** HR_PAYROLL_USER+
- **Response:** `{ sent: number, failed: { employeeId, reason }[] }`

---

## PAYSLIPS

### `GET /payslips`
List payslips.
- **Auth:** HR_PAYROLL_USER+ (all); EMPLOYEE (own only)
- **Query:** `?payrunId=string&employeeId=string&status=string`

### `GET /payslips/:id`
Get payslip detail with lines and sentinel flags.
- **Auth:** HR_PAYROLL_USER+ or self (EMPLOYEE — own payslip)

### `GET /payslips/:id/pdf`
Stream payslip PDF.
- **Auth:** HR_PAYROLL_USER+ or self
- **Response:** `application/pdf` stream

### `GET /payslips/:id/explain`
AI-generated plain-language narration of the payslip's rule trace.
- **Auth:** HR_PAYROLL_USER+ or self
- **Response:** `{ narration: string, lines: PayslipLine[] }`

---

## SENTINEL

### `GET /sentinel/flags`
List flags for a payrun.
- **Auth:** HR_PAYROLL_USER+
- **Query:** `?payrunId=string&status=OPEN|RESOLVED|OVERRIDDEN&severity=HIGH|MEDIUM|LOW`
- **Response:** `SentinelFlag[]`

### `POST /sentinel/flags/:id/resolve`
One-click resolve. Triggers a scoped recompute of the affected payslip.
- **Auth:** HR_PAYROLL_USER+
- **Body:** `{ resolutionType: "ADD_BANK_DETAILS" | "RECOMPUTE_WITH_APPROVED_LEAVE" | "REMOVE_DUPLICATE" }`
- **Response:** `{ flag: SentinelFlag, updatedPayslip: Payslip, diff: PayslipLineDiff[] }`

```json
// PayslipLineDiff shape
{
  "code": "NET",
  "name": "Net Salary",
  "before": "95000.00",
  "after": "82500.00",
  "delta": "-12500.00"
}
```

### `POST /sentinel/flags/:id/override`
Override a flag with a note (no recompute).
- **Auth:** HR_PAYROLL_MANAGER+
- **Body:** `{ note: string }`
- **Response:** `SentinelFlag` (status=OVERRIDDEN)

---

## DASHBOARD

### `GET /dashboard`
Aggregated KPIs and chart data for the payroll dashboard.
- **Auth:** HR_PAYROLL_USER+
- **Query:** `?period=2026-09&department=Engineering&employeeType=ACTIVE`
- **Response (cached 30s):**

```json
{
  "kpis": {
    "totalPayrollCost": "1842500.00",
    "employeeCount": 38,
    "pendingPayslips": 3,
    "avgAttendanceRate": "0.94",
    "openSentinelFlags": 2
  },
  "salaryByDepartment": [
    { "department": "Engineering", "total": "720000.00" }
  ],
  "monthlyTrend": [
    { "period": "2026-04", "total": "1750000.00" },
    { "period": "2026-05", "total": "1780000.00" }
  ],
  "payslipStatusBreakdown": {
    "paid": 35, "pending": 3, "draft": 0
  },
  "attendanceOverview": {
    "present": 34, "absent": 2, "late": 2
  },
  "timeOffOverview": [
    { "type": "Paid Time Off", "approved": 25, "pending": 3, "remainingDays": 210 }
  ],
  "alerts": [
    { "type": "OPEN_SENTINEL_FLAGS", "count": 2, "severity": "HIGH" }
  ]
}
```

### `POST /dashboard/copilot`
Natural-language question → grounded answer from pre-defined query templates.
- **Auth:** HR_PAYROLL_USER+
- **Body:** `{ question: string }`
- **Response:**

```json
{
  "answer": "Engineering's payroll cost rose by ₹48,000 (7.2%) in September vs August, driven by 2 new joiners and 14 hours of overtime across the team.",
  "templateUsed": "department_cost_change",
  "data": { "department": "Engineering", "delta": "48000.00", "deltaPercent": 7.2 }
}
```

- **Response (unmatched question):**
```json
{
  "answer": "I can currently answer questions about: payroll cost by department, month-over-month trends, attendance summary, and time-off overview. Try: 'Why did Engineering's cost change?'",
  "templateUsed": null
}
```

---

## AUDIT

### `GET /audit`
List audit events.
- **Auth:** HR_PAYROLL_MANAGER, ADMIN
- **Query:** `?entityType=Contract&entityId=cuid&actorId=cuid&from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Response:** `AuditEvent[]` paginated

---

## HEALTH

### `GET /health`
Health check.
- **Auth:** None
- **Response:** `{ status: "ok", db: "connected", redis: "connected", timestamp: "..." }`
