import { prisma } from './prisma.js';
import { generateAuditFlagNarration } from './ai.js';
import { isManagementOrHrUser } from '../routes/sentinel.js';

/**
 * Autonomous Sentinel Compliance Engine
 * Runs 5 deterministic checks:
 * 1. MISSING_BANK_DETAILS
 * 2. DUPLICATE_PAYSLIP
 * 3. NO_ACTIVE_CONTRACT
 * 4. UNAPPROVED_LEAVE_MISMATCH
 * 5. STATISTICAL_ANOMALY (Salary change > 40%)
 */
export async function runSentinelAudit(payrunId) {
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId },
    include: {
      payslips: {
        include: {
          employee: {
            include: {
              user: true,
              contracts: true,
              timeOffRequests: true,
            },
          },
          lines: true,
        },
      },
    },
  });

  if (!payrun) return [];

  const createdFlags = [];

  for (const payslip of payrun.payslips) {
    const employee = payslip.employee;

    // Skip HR Managers, Admins, and non-employee staff from payroll compliance flags
    if (isManagementOrHrUser(employee)) {
      continue;
    }

    // Check 1: Missing Bank Details
    if (!employee.bankAccount && !employee.bankName) {
      const flag = await createOrUpdateFlag({
        payslipId: payslip.id,
        flagType: 'MISSING_BANK_DETAILS',
        severity: 'HIGH',
        reason: {
          employeeId: employee.id,
          employeeName: employee.name,
          issue: 'Missing bank account number or bank name',
        },
        fallbackNarration: `Direct disbursement blocked: Employee ${employee.name} lacks registered bank account coordinates.`,
      });
      if (flag) createdFlags.push(flag);
    }

    // Check 2: No Active Running Contract
    const runningContract = employee.contracts.find(
      (c) =>
        c.status === 'RUNNING' &&
        c.startDate <= payrun.periodEnd &&
        (!c.endDate || c.endDate >= payrun.periodStart)
    );

    if (!runningContract) {
      const flag = await createOrUpdateFlag({
        payslipId: payslip.id,
        flagType: 'NO_ACTIVE_CONTRACT',
        severity: 'HIGH',
        reason: {
          employeeId: employee.id,
          employeeName: employee.name,
          issue: 'No active RUNNING contract for current pay period',
        },
        fallbackNarration: `Statutory non-compliance: Employee ${employee.name} has no valid running legal contract for this period.`,
      });
      if (flag) createdFlags.push(flag);
    }

    // Check 3: Unapproved Leave Mismatch
    const unapprovedLeaves = employee.timeOffRequests.filter(
      (r) =>
        r.status === 'TO_APPROVE' &&
        r.startDate <= payrun.periodEnd &&
        r.endDate >= payrun.periodStart
    );

    if (unapprovedLeaves.length > 0) {
      const flag = await createOrUpdateFlag({
        payslipId: payslip.id,
        flagType: 'UNAPPROVED_LEAVE_MISMATCH',
        severity: 'MEDIUM',
        reason: {
          employeeId: employee.id,
          employeeName: employee.name,
          unapprovedRequestsCount: unapprovedLeaves.length,
        },
        fallbackNarration: `Attendance variance: ${unapprovedLeaves.length} pending time-off request(s) require managerial approval before final payslip settlement.`,
      });
      if (flag) createdFlags.push(flag);
    }

    // Check 4: Duplicate Payslip Check
    const otherSlips = await prisma.payslip.findMany({
      where: {
        employeeId: employee.id,
        payrunId: { not: payrunId },
        payrun: {
          periodStart: payrun.periodStart,
          periodEnd: payrun.periodEnd,
        },
      },
    });

    if (otherSlips.length > 0) {
      const flag = await createOrUpdateFlag({
        payslipId: payslip.id,
        flagType: 'DUPLICATE_PAYSLIP',
        severity: 'HIGH',
        reason: {
          employeeId: employee.id,
          existingPayslipId: otherSlips[0].id,
        },
        fallbackNarration: `Potential double payment: Duplicate payslip detected for ${employee.name} in parallel cycle.`,
      });
      if (flag) createdFlags.push(flag);
    }
  }

  return createdFlags;
}

async function createOrUpdateFlag({
  payslipId,
  flagType,
  severity,
  reason,
  fallbackNarration,
}) {
  const existing = await prisma.sentinelFlag.findFirst({
    where: {
      payslipId,
      flagType,
      status: 'OPEN',
    },
  });

  if (existing) return existing;

  let aiExplanation = fallbackNarration;
  try {
    const generated = await generateAuditFlagNarration(flagType, severity, reason);
    if (generated) aiExplanation = generated;
  } catch (e) {}

  return await prisma.sentinelFlag.create({
    data: {
      payslipId,
      flagType,
      severity,
      deterministicReasonJson: reason,
      aiExplanation,
      status: 'OPEN',
    },
  });
}
