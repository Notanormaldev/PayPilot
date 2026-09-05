import { z } from 'zod';

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

export const RoleSchema = z.enum([
  'ADMIN',
  'HR_OFFICER',
  'PAYROLL_OFFICER',
  'LINE_MANAGER',
  'EMPLOYEE',
]);

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

export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  joiningDate: z.string().or(z.date()),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  panNumber: z.string().optional(),
  uanNumber: z.string().optional(),
  managerId: z.string().optional().nullable(),
});

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;

export const CreateContractSchema = z.object({
  employeeId: z.string().min(1),
  salaryStructureId: z.string().min(1),
  workingScheduleId: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  wageType: z.enum(['MONTHLY', 'HOURLY']).default('MONTHLY'),
  wageAmount: z.number().positive('Wage amount must be positive'),
  status: z.enum(['DRAFT', 'RUNNING', 'EXPIRED', 'CANCELLED']).default('DRAFT'),
});

export type CreateContractDTO = z.infer<typeof CreateContractSchema>;

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

export const CreateTimeOffSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(['PAID_LEAVE', 'SICK_LEAVE', 'CASUAL_LEAVE', 'UNPAID_LEAVE']),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  isHalfDay: z.boolean().default(false),
});

export type CreateTimeOffDTO = z.infer<typeof CreateTimeOffSchema>;

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

export const CreateSalaryRuleSchema = z.object({
  structureId: z.string().min(1),
  code: z.string().regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, and underscores'),
  name: z.string().min(1),
  category: z.enum(['BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'NET']),
  sequence: z.number().int().min(1),
  condition: z.string().default('true'),
  computationType: z.enum(['FIXED', 'PERCENTAGE', 'PYTHON_EXPR']).default('PYTHON_EXPR'),
  amountExpr: z.string().min(1, 'Computation expression is required'),
  isTaxable: z.boolean().default(false),
  affectsNet: z.boolean().default(true),
});

export type CreateSalaryRuleDTO = z.infer<typeof CreateSalaryRuleSchema>;

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

export const CreatePayrunSchema = z.object({
  periodStart: z.string().or(z.date()),
  periodEnd: z.string().or(z.date()),
  paymentDate: z.string().or(z.date()).optional(),
  departmentId: z.string().optional().nullable(),
});

export type CreatePayrunDTO = z.infer<typeof CreatePayrunSchema>;

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
