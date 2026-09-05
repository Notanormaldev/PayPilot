import { prisma } from './prisma';
import { generateSentinelNarration } from './ai';

export interface SentinelCheckResult {
  flagType: 'DUPLICATE_PAYSLIP' | 'MISSING_BANK_DETAILS' | 'NO_ACTIVE_CONTRACT' | 'UNAPPROVED_LEAVE_MISMATCH' | 'STATISTICAL_ANOMALY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  deterministicReason: Record<string, any>;
  employeeName: string;
}

/**
 * Runs all 5 Sentinel anomaly detection checks on a newly computed payslip
 */
export async function runSentinelAudit(payslipId: string): Promise<void> {
  const payslip = await prisma.payslip.findUnique({
    where: { id: payslipId },
    include: {
      employee: true,
      payrun: true,
      contract: true,
      lines: true,
    },
  });

  if (!payslip) return;

  const employee = payslip.employee;
  const payrun = payslip.payrun;
  const flagsToCreate: SentinelCheckResult[] = [];

  // Check 1: Missing Bank Details
  if (!employee.bankAccount || employee.bankAccount.trim() === '') {
    flagsToCreate.push({
      flagType: 'MISSING_BANK_DETAILS',
      severity: 'HIGH',
      deterministicReason: {
        reason: 'Employee does not have a bank account number registered.',
        bankAccount: employee.bankAccount,
        bankName: employee.bankName,
      },
      employeeName: employee.name,
    });
  }

  // Check 2: Duplicate Payslip
  const countSlips = await prisma.payslip.count({
    where: {
      payrunId: payrun.id,
      employeeId: employee.id,
    },
  });

  if (countSlips > 1) {
    flagsToCreate.push({
      flagType: 'DUPLICATE_PAYSLIP',
      severity: 'HIGH',
      deterministicReason: {
        reason: 'Multiple payslips exist for this employee within the current payrun.',
        duplicateCount: countSlips,
      },
      employeeName: employee.name,
    });
  }

  // Check 3: Active Contract Validation
  const runningContract = await prisma.contract.findFirst({
    where: {
      employeeId: employee.id,
      status: 'RUNNING',
      startDate: { lte: payrun.periodEnd },
      OR: [
        { endDate: null },
        { endDate: { gte: payrun.periodStart } },
      ],
    },
  });

  if (!runningContract) {
    flagsToCreate.push({
      flagType: 'NO_ACTIVE_CONTRACT',
      severity: 'HIGH',
      deterministicReason: {
        reason: 'No active RUNNING contract covers the payrun date window.',
        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
      },
      employeeName: employee.name,
    });
  }

  // Check 4: Unapproved Leave Mismatch
  const absences = await prisma.attendance.findMany({
    where: {
      employeeId: employee.id,
      date: { gte: payrun.periodStart, lte: payrun.periodEnd },
      status: 'ABSENT',
    },
  });

  if (absences.length > 0) {
    const approvedRequests = await prisma.timeOffRequest.findMany({
      where: {
        employeeId: employee.id,
        status: 'APPROVED',
        startDate: { lte: payrun.periodEnd },
        endDate: { gte: payrun.periodStart },
      },
    });

    if (approvedRequests.length === 0 && absences.length > 1) {
      flagsToCreate.push({
        flagType: 'UNAPPROVED_LEAVE_MISMATCH',
        severity: 'MEDIUM',
        deterministicReason: {
          reason: 'Employee has recorded absences with no matching approved leave request.',
          unapprovedAbsenceCount: absences.length,
        },
        employeeName: employee.name,
      });
    }
  }

  // Check 5: Statistical Salary Anomaly (Deviation > 25% from past payslips)
  const netLine = payslip.lines.find((l) => l.code === 'NET' || l.category === 'NET');
  if (netLine) {
    const currentNet = Number(netLine.amount);
    const pastSlips = await prisma.payslip.findMany({
      where: {
        employeeId: employee.id,
        status: 'PAID',
        id: { not: payslip.id },
      },
      include: { lines: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    if (pastSlips.length > 0) {
      const pastNets = pastSlips
        .map((ps) => {
          const nl = ps.lines.find((l) => l.code === 'NET' || l.category === 'NET');
          return nl ? Number(nl.amount) : 0;
        })
        .filter((n) => n > 0);

      if (pastNets.length > 0) {
        const avgNet = pastNets.reduce((sum, val) => sum + val, 0) / pastNets.length;
        const variancePct = Math.round(Math.abs((currentNet - avgNet) / avgNet) * 100);

        if (variancePct >= 25) {
          flagsToCreate.push({
            flagType: 'STATISTICAL_ANOMALY',
            severity: 'MEDIUM',
            deterministicReason: {
              reason: `Calculated net pay (₹${currentNet}) deviates by ${variancePct}% from rolling average (₹${Math.round(avgNet)}).`,
              currentNet,
              historicalAverageNet: Math.round(avgNet),
              variancePercentage: variancePct,
            },
            employeeName: employee.name,
          });
        }
      }
    }
  }

  // Persist flags and trigger AI narration
  for (const flag of flagsToCreate) {
    const aiExplanation = await generateSentinelNarration(
      flag.flagType,
      flag.employeeName,
      flag.deterministicReason
    );

    await prisma.sentinelFlag.create({
      data: {
        payslipId: payslip.id,
        flagType: flag.flagType as any,
        severity: flag.severity as any,
        deterministicReasonJson: flag.deterministicReason,
        aiExplanation,
        status: 'OPEN',
      },
    });
  }
}
