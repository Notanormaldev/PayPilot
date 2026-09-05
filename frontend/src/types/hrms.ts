// ==========================================
// 1. RBAC & ROLES
// ==========================================
export const Role = {
  ADMIN: 'ADMIN',
  HR_OFFICER: 'HR_OFFICER',
  PAYROLL_OFFICER: 'PAYROLL_OFFICER',
  LINE_MANAGER: 'LINE_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: RoleType;
  employeeId?: string | null;
  departmentId?: string | null;
}

// ==========================================
// 2. EMPLOYEE & CONTRACT ENUMS & SCHEMAS
// ==========================================
export const EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  PROBATION: 'PROBATION',
  NOTICE_PERIOD: 'NOTICE_PERIOD',
  TERMINATED: 'TERMINATED',
} as const;

export type EmployeeStatusType = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
} as const;

export type EmploymentTypeType = (typeof EmploymentType)[keyof typeof EmploymentType];

export const ContractStatus = {
  DRAFT: 'DRAFT',
  RUNNING: 'RUNNING',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type ContractStatusType = (typeof ContractStatus)[keyof typeof ContractStatus];

export const WageType = {
  MONTHLY: 'MONTHLY',
  HOURLY: 'HOURLY',
} as const;

export type WageTypeType = (typeof WageType)[keyof typeof WageType];

// ==========================================
// 3. ATTENDANCE & TIME OFF
// ==========================================
export const AttendanceType = {
  PRESENT: 'PRESENT',
  HALF_DAY: 'HALF_DAY',
  ABSENT: 'ABSENT',
  ON_LEAVE: 'ON_LEAVE',
  WEEKEND: 'WEEKEND',
  HOLIDAY: 'HOLIDAY',
} as const;

export type AttendanceRecordType = (typeof AttendanceType)[keyof typeof AttendanceType];

export const TimeOffType = {
  PAID_LEAVE: 'PAID_LEAVE',
  SICK_LEAVE: 'SICK_LEAVE',
  CASUAL_LEAVE: 'CASUAL_LEAVE',
  UNPAID_LEAVE: 'UNPAID_LEAVE',
} as const;

export type TimeOffTypeValue = (typeof TimeOffType)[keyof typeof TimeOffType];

export const TimeOffStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type TimeOffStatusValue = (typeof TimeOffStatus)[keyof typeof TimeOffStatus];

// ==========================================
// 4. SALARY RULES & FORMULAS
// ==========================================
export const SalaryRuleCategory = {
  BASIC: 'BASIC',
  ALLOWANCE: 'ALLOWANCE',
  GROSS: 'GROSS',
  DEDUCTION: 'DEDUCTION',
  NET: 'NET',
} as const;

export type SalaryRuleCategoryType = (typeof SalaryRuleCategory)[keyof typeof SalaryRuleCategory];

// ==========================================
// 5. PAYROLL & SENTINEL ANOMALIES
// ==========================================
export const PayrunState = {
  DRAFT: 'DRAFT',
  COMPUTING: 'COMPUTING',
  COMPUTED: 'COMPUTED',
  VALIDATED: 'VALIDATED',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type PayrunStateType = (typeof PayrunState)[keyof typeof PayrunState];

export const SentinelFlagType = {
  MISSING_BANK_DETAILS: 'MISSING_BANK_DETAILS',
  DUPLICATE_PAYSLIP: 'DUPLICATE_PAYSLIP',
  NO_ACTIVE_CONTRACT: 'NO_ACTIVE_CONTRACT',
  UNAPPROVED_LEAVE_MISMATCH: 'UNAPPROVED_LEAVE_MISMATCH',
  STATISTICAL_ANOMALY: 'STATISTICAL_ANOMALY',
} as const;

export type SentinelFlagTypeValue = (typeof SentinelFlagType)[keyof typeof SentinelFlagType];

export const SentinelSeverity = {
  BLOCKING: 'BLOCKING',
  WARNING: 'WARNING',
  INFO: 'INFO',
} as const;

export type SentinelSeverityValue = (typeof SentinelSeverity)[keyof typeof SentinelSeverity];

// ==========================================
// 6. DASHBOARD & KPIS
// ==========================================
export interface DashboardKPIs {
  totalEmployees: number;
  activeContracts: number;
  monthlyPayrollCost: number;
  pendingTimeOffRequests: number;
  averageAttendanceRate: number;
  openSentinelFlags: number;
  payrollCostChangePct: number;
}
