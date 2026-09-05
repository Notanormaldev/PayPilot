# HRMS OXP — Data Model

> Complete Prisma schema, entity relationships, and business-logic constraints.
> Database: **PostgreSQL 16**. ORM: **Prisma 5**.

---

## 1. Entity Relationship Diagram

```
Organization
    │
    ├── WorkingSchedule ──► ScheduleLine[]
    │        │
    │        └── Employee ◄─────────────────────────────────────┐
    │               │                                            │
    │         ┌─────┼──────────────────────────────┐            │
    │         │     │                              │            │
    │         ▼     ▼                              ▼            │
    │     Contract  Attendance            TimeOffAllocation      │
    │         │                            TimeOffRequest        │
    │         │                            TimeOffType           │
    │         │                                                  │
    │         └──► Payslip ◄── Payrun ◄── SalaryStructure       │
    │                  │              └── SalaryRule[]           │
    │                  │                                         │
    │                  ├── PayslipLine[]                         │
    │                  └── SentinelFlag[]                        │
    │                                                            │
    └── User ──────────────────────────────────────────────────►┘
            │
            └── PayrollAuditEvent[]
```

---

## 2. Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────────────────────────
// ADMINISTRATION
// ─────────────────────────────────────────────────────────────────

model Organization {
  id               String            @id @default(cuid())
  name             String
  timezone         String            @default("Asia/Kolkata")
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  workingSchedules WorkingSchedule[]
  employees        Employee[]
}

enum Role {
  EMPLOYEE
  HR_MANAGER
  HR_PAYROLL_USER
  HR_PAYROLL_MANAGER
  ADMIN
}

model User {
  id              String    @id @default(cuid())
  clerkId         String    @unique   // Provider/External ID
  email           String    @unique
  role            Role      @default(EMPLOYEE)
  isActive        Boolean   @default(true)
  employeeId      String?   @unique
  employee        Employee? @relation(fields: [employeeId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Observer relations
  correctedAttendances   Attendance[]        @relation("CorrectedBy")
  approvedTimeOffRequests TimeOffRequest[]   @relation("ApprovedBy")
  resolvedFlags          SentinelFlag[]      @relation("ResolvedBy")
  auditEvents            PayrollAuditEvent[]
}

// ─────────────────────────────────────────────────────────────────
// CORE HR
// ─────────────────────────────────────────────────────────────────

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
}

model Employee {
  id            String         @id @default(cuid())
  name          String
  workEmail     String         @unique
  department    String
  jobPosition   String
  managerId     String?
  manager       Employee?      @relation("EmployeeManager", fields: [managerId], references: [id])
  reports       Employee[]     @relation("EmployeeManager")
  scheduleId    String?
  schedule      WorkingSchedule? @relation(fields: [scheduleId], references: [id])
  status        EmployeeStatus @default(ACTIVE)
  bankAccount   String?        // IBAN / account number
  bankName      String?
  orgId         String
  organization  Organization   @relation(fields: [orgId], references: [id])
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  user          User?
  contracts     Contract[]
  attendance    Attendance[]
  timeOffRequests    TimeOffRequest[]
  timeOffAllocations TimeOffAllocation[]
  payslips      Payslip[]
}

enum ContractStatus {
  DRAFT
  RUNNING
  EXPIRED
}

model Contract {
  id                  String          @id @default(cuid())
  employeeId          String
  employee            Employee        @relation(fields: [employeeId], references: [id])
  startDate           DateTime
  endDate             DateTime?       // NULL = open-ended
  wage                Decimal         @db.Decimal(12, 2)
  department          String
  jobPosition         String
  salaryStructureId   String
  salaryStructure     SalaryStructure @relation(fields: [salaryStructureId], references: [id])
  status              ContractStatus  @default(DRAFT)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  payslips            Payslip[]

  // NOTE: Uniqueness enforced at service layer:
  // No two RUNNING contracts for the same employee may have overlapping [startDate, endDate).
  // Postgres EXCLUDE USING gist may be added via raw migration if time allows.
  @@index([employeeId, status])
}

// ─────────────────────────────────────────────────────────────────
// WORKFORCE OPERATIONS
// ─────────────────────────────────────────────────────────────────

model WorkingSchedule {
  id         String         @id @default(cuid())
  name       String
  orgId      String
  org        Organization   @relation(fields: [orgId], references: [id])
  isActive   Boolean        @default(true)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  lines      ScheduleLine[]
  employees  Employee[]

  // weeklyHours is COMPUTED on read: SUM((endTime - startTime) - breakMinutes) across lines
}

enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
  SUN
}

model ScheduleLine {
  id           String          @id @default(cuid())
  scheduleId   String
  schedule     WorkingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  dayOfWeek    DayOfWeek
  startTime    String          // "HH:MM" (e.g. "09:00")
  endTime      String          // "HH:MM" (e.g. "18:00")
  breakMinutes Int             @default(60)
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  INCOMPLETE
}

model Attendance {
  id           String           @id @default(cuid())
  employeeId   String
  employee     Employee         @relation(fields: [employeeId], references: [id])
  date         DateTime         @db.Date
  checkIn      DateTime?
  checkOut     DateTime?
  // workedHours and overtimeHours are computed server-side on write, stored for performance
  workedHours  Decimal?         @db.Decimal(5, 2)
  overtimeHours Decimal?        @db.Decimal(5, 2)
  status       AttendanceStatus @default(ABSENT)
  isCorrected  Boolean          @default(false)
  correctedById String?
  correctedBy  User?            @relation("CorrectedBy", fields: [correctedById], references: [id])
  correctedAt  DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@unique([employeeId, date])
  @@index([employeeId, date])
}

// ─────────────────────────────────────────────────────────────────
// TIME OFF
// ─────────────────────────────────────────────────────────────────

enum LeaveUnit {
  DAYS
  HOURS
}

model TimeOffType {
  id                  String              @id @default(cuid())
  name                String
  unit                LeaveUnit           @default(DAYS)
  requiresAllocation  Boolean             @default(true)
  requiresApproval    Boolean             @default(true)
  affectsPayroll      Boolean             @default(true)  // if true, approved leave reduces worked_days
  isActive            Boolean             @default(true)
  createdAt           DateTime            @default(now())
  allocations         TimeOffAllocation[]
  requests            TimeOffRequest[]
}

model TimeOffAllocation {
  id             String      @id @default(cuid())
  employeeId     String
  employee       Employee    @relation(fields: [employeeId], references: [id])
  timeOffTypeId  String
  timeOffType    TimeOffType @relation(fields: [timeOffTypeId], references: [id])
  allocated      Decimal     @db.Decimal(6, 2)
  taken          Decimal     @db.Decimal(6, 2)  @default(0)
  // remaining = allocated - taken (computed on read, never stored)
  validFrom      DateTime    @db.Date
  validTo        DateTime    @db.Date
  status         String      @default("active")
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  requests       TimeOffRequest[]
  @@index([employeeId, timeOffTypeId])
}

enum TimeOffRequestStatus {
  TO_APPROVE
  APPROVED
  REFUSED
}

model TimeOffRequest {
  id             String               @id @default(cuid())
  employeeId     String
  employee       Employee             @relation(fields: [employeeId], references: [id])
  timeOffTypeId  String
  timeOffType    TimeOffType          @relation(fields: [timeOffTypeId], references: [id])
  allocationId   String?
  allocation     TimeOffAllocation?   @relation(fields: [allocationId], references: [id])
  startDate      DateTime             @db.Date
  endDate        DateTime             @db.Date
  duration       Decimal              @db.Decimal(6, 2)  // in type's unit
  reason         String?
  status         TimeOffRequestStatus @default(TO_APPROVE)
  approvedById   String?
  approvedBy     User?                @relation("ApprovedBy", fields: [approvedById], references: [id])
  approvedAt     DateTime?
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@index([employeeId, status])
}

// ─────────────────────────────────────────────────────────────────
// SALARY CONFIGURATION
// ─────────────────────────────────────────────────────────────────

model SalaryStructure {
  id        String       @id @default(cuid())
  name      String
  isActive  Boolean      @default(true)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  rules     SalaryRule[]
  contracts Contract[]
  payruns   Payrun[]
}

enum SalaryCategory {
  BASIC
  ALLOWANCE
  GROSS
  DEDUCTION
  NET
}

enum ComputationMethod {
  FIXED
  PERCENTAGE
  FORMULA
}

model SalaryRule {
  id                  String            @id @default(cuid())
  structureId         String
  structure           SalaryStructure   @relation(fields: [structureId], references: [id], onDelete: Cascade)
  name                String
  code                String            // Unique per structure. E.g. "BASIC", "HRA", "NET"
  category            SalaryCategory
  sequence            Int               // Execution order; lower = earlier
  computationMethod   ComputationMethod
  amount              Decimal?          @db.Decimal(12, 2)   // For FIXED
  percentageOf        String?           // Code of the base rule (e.g. "BASIC") for PERCENTAGE
  percentageValue     Decimal?          @db.Decimal(6, 4)    // e.g. 0.12 = 12%
  formulaExpression   String?           // Safe expr-eval expression (e.g. "BASIC + HRA")
  isActive            Boolean           @default(true)
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  payslipLines        PayslipLine[]

  @@unique([structureId, code])
  @@index([structureId, sequence])
}

// ─────────────────────────────────────────────────────────────────
// PAYROLL
// ─────────────────────────────────────────────────────────────────

enum PayrunStatus {
  DRAFT
  COMPUTED
  VALIDATED
  PAID
}

model Payrun {
  id                  String          @id @default(cuid())
  name                String          // E.g. "September 2026 Payrun"
  salaryStructureId   String
  salaryStructure     SalaryStructure @relation(fields: [salaryStructureId], references: [id])
  periodStart         DateTime        @db.Date
  periodEnd           DateTime        @db.Date
  status              PayrunStatus    @default(DRAFT)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  payslips            Payslip[]
}

enum PayslipStatus {
  DRAFT
  COMPUTED
  VALIDATED
  PAID
}

model Payslip {
  id           String        @id @default(cuid())
  payrunId     String
  payrun       Payrun        @relation(fields: [payrunId], references: [id])
  employeeId   String
  employee     Employee      @relation(fields: [employeeId], references: [id])
  contractId   String
  contract     Contract      @relation(fields: [contractId], references: [id])
  workedDays   Decimal       @db.Decimal(5, 2)  @default(0)
  status       PayslipStatus @default(DRAFT)
  pdfUrl       String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  lines        PayslipLine[]
  flags        SentinelFlag[]

  @@unique([payrunId, employeeId])
}

model PayslipLine {
  id           String     @id @default(cuid())
  payslipId    String
  payslip      Payslip    @relation(fields: [payslipId], references: [id], onDelete: Cascade)
  salaryRuleId String
  salaryRule   SalaryRule @relation(fields: [salaryRuleId], references: [id])
  code         String     // Snapshot of rule code at compute time
  name         String     // Snapshot of rule name
  category     SalaryCategory
  sequence     Int
  amount       Decimal    @db.Decimal(12, 2)
  createdAt    DateTime   @default(now())
}

// ─────────────────────────────────────────────────────────────────
// SENTINEL
// ─────────────────────────────────────────────────────────────────

enum FlagType {
  DUPLICATE_PAYSLIP
  MISSING_BANK_DETAILS
  NO_ACTIVE_CONTRACT
  UNAPPROVED_LEAVE_MISMATCH
  STATISTICAL_ANOMALY
}

enum FlagSeverity {
  LOW
  MEDIUM
  HIGH
}

enum FlagStatus {
  OPEN
  RESOLVED
  OVERRIDDEN
}

model SentinelFlag {
  id                    String      @id @default(cuid())
  payslipId             String
  payslip               Payslip     @relation(fields: [payslipId], references: [id])
  flagType              FlagType
  severity              FlagSeverity
  deterministicReasonJson Json      // Structured fact object {flagType, values…}
  aiExplanation         String?     // LLM-generated prose (phrase-only)
  status                FlagStatus  @default(OPEN)
  resolvedById          String?
  resolvedBy            User?       @relation("ResolvedBy", fields: [resolvedById], references: [id])
  resolvedAt            DateTime?
  overrideNote          String?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([payslipId, status])
}

// ─────────────────────────────────────────────────────────────────
// AUDIT
// ─────────────────────────────────────────────────────────────────

model PayrollAuditEvent {
  id          String   @id @default(cuid())
  entityType  String   // "Contract" | "TimeOffRequest" | "Payrun" | "SentinelFlag"…
  entityId    String
  action      String   // "created" | "status_changed" | "resolved"…
  actorId     String
  actor       User     @relation(fields: [actorId], references: [id])
  meta        Json     // Before/after state snapshot, relevant context
  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([actorId])
}
```

---

## 3. Key Business Logic Constraints

### Contract Period Exclusivity

```typescript
// contracts/contracts.service.ts

async function assertNoOverlappingRunningContract(
  employeeId: string,
  startDate: Date,
  endDate: Date | null,
  excludeId?: string
) {
  const overlapping = await prisma.contract.findFirst({
    where: {
      employeeId,
      status: 'RUNNING',
      id: excludeId ? { not: excludeId } : undefined,
      // Overlap check: existing.start < new.end AND existing.end > new.start
      AND: [
        { startDate: { lt: endDate ?? new Date('9999-12-31') } },
        {
          OR: [
            { endDate: null },
            { endDate: { gt: startDate } },
          ],
        },
      ],
    },
  });

  if (overlapping) {
    throw new ConflictError(
      `Employee already has a running contract (${overlapping.id}) ` +
      `from ${overlapping.startDate.toISOString().slice(0,10)} ` +
      `to ${overlapping.endDate?.toISOString().slice(0,10) ?? 'open-ended'}. ` +
      `Set it to Expired before creating a new Running contract.`
    );
  }
}
```

### Period-Correct Contract Resolution

```typescript
// Used at Payrun Step 2 (eligible employees) and at Payslip compute time.
async function resolveContractForPeriod(employeeId: string, periodStart: Date, periodEnd: Date) {
  return prisma.contract.findFirst({
    where: {
      employeeId,
      status: 'RUNNING',
      startDate: { lte: periodEnd },
      OR: [
        { endDate: null },
        { endDate: { gte: periodStart } },
      ],
    },
  });
}
```

### Time Off Balance — Transactional Deduction

```typescript
// Applied atomically on approval to prevent race conditions
await prisma.$transaction([
  prisma.timeOffRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED', approvedById: actorId, approvedAt: new Date() },
  }),
  prisma.timeOffAllocation.update({
    where: { id: allocationId },
    data: { taken: { increment: request.duration } },
  }),
]);
```

---

## 4. Computed / Derived Fields

These are **never stored** — always computed on read or at service layer:

| Field | Derived From | Computed In |
|---|---|---|
| `WorkingSchedule.weeklyHours` | Sum of `(endTime - startTime - breakMinutes)` across `ScheduleLine[]` | API response serializer |
| `TimeOffAllocation.remaining` | `allocated - taken` | API response serializer |
| `Attendance.workedHours` | `checkOut - checkIn` (in hours) | Service on write |
| `Attendance.overtimeHours` | `max(0, workedHours - scheduledHoursForDay)` | Service on write |
| `PayslipLine.amount` (PERCENTAGE) | `percentageValue × referencedRuleAmount` | Rule engine at Compute |
| `PayslipLine.amount` (FORMULA) | `expr-eval.evaluate(formulaExpression, context)` | Rule engine at Compute |

---

## 5. Indexing Strategy

```sql
-- Contract lookup by employee + status (most frequent query)
CREATE INDEX idx_contract_employee_status ON "Contract"("employeeId", "status");

-- Attendance by employee + date (daily check-in/out, payroll)
CREATE UNIQUE INDEX idx_attendance_employee_date ON "Attendance"("employeeId", "date");

-- Payslip lookup by payrun (payslip list, dashboard aggregates)
CREATE UNIQUE INDEX idx_payslip_payrun_employee ON "Payslip"("payrunId", "employeeId");

-- SalaryRule execution order
CREATE INDEX idx_rule_structure_sequence ON "SalaryRule"("structureId", "sequence");

-- SentinelFlag open flags for a payrun (Validate screen)
CREATE INDEX idx_sentinel_payslip_status ON "SentinelFlag"("payslipId", "status");

-- Audit log by entity
CREATE INDEX idx_audit_entity ON "PayrollAuditEvent"("entityType", "entityId");
```

---

## 6. Seed Data Summary

```
Organization: OXP Pvt Ltd
Departments: Finance (8), HR (6), Engineering (12), Sales (8), Support (6) = 40 employees

Named anchor employees (from blueprint §18):
  - Aarav Mehta    — Finance, 2 contracts (1 expired Oct 2025, 1 running Nov 2025–)
  - Sara Khan      — HR, 2 contracts, pending TimeOffRequest (the Sentinel demo trigger)
  - John Dsouza    — Engineering, missing bank details (Sentinel trigger)
  - Neha Patel     — HR, duplicate payslip planted in current draft Payrun

Historical Payruns: Apr–Aug 2026 (5 paid payruns)
Current Period:     Sep 2026 (1 draft payrun, 3 Sentinel flags planted)
```
