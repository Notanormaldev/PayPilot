import { Parser } from 'expr-eval';
import { prisma } from './prisma.js';

const parser = new Parser({
  operators: {
    in: true,
    assignment: false,
  },
});

/**
 * Deterministically compute salary line values for an employee's payslip
 */
export async function computePayslipLines(employeeId, contractId, periodStart, periodEnd) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      salaryStructure: {
        include: {
          rules: {
            where: { isActive: true },
            orderBy: { sequence: 'asc' },
          },
        },
      },
    },
  });

  if (!contract) {
    throw new Error(`Contract ${contractId} not found`);
  }

  const baseWage = Number(contract.wage);
  const context = {
    WAGE: baseWage,
    BASIC: 0,
    GROSS: 0,
    NET: 0,
  };

  const computedLines = [];

  for (const rule of contract.salaryStructure.rules) {
    let amount = 0;

    switch (rule.computationMethod) {
      case 'FIXED':
        amount = rule.amount ? Number(rule.amount) : 0;
        break;

      case 'PERCENTAGE': {
        const baseKey = rule.percentageOf || 'WAGE';
        const baseVal = context[baseKey] !== undefined ? context[baseKey] : baseWage;
        const pct = rule.percentageValue ? Number(rule.percentageValue) : 0;
        amount = baseVal * pct;
        break;
      }

      case 'FORMULA': {
        if (!rule.formulaExpression) {
          amount = 0;
        } else {
          try {
            const expr = parser.parse(rule.formulaExpression);
            amount = expr.evaluate(context);
          } catch (err) {
            console.error(`Formula error in rule ${rule.code}:`, err.message);
            amount = 0;
          }
        }
        break;
      }
    }

    // Round to 2 decimal places
    amount = Math.round((amount + Number.EPSILON) * 100) / 100;
    context[rule.code] = amount;

    computedLines.push({
      salaryRuleId: rule.id,
      code: rule.code,
      name: rule.name,
      category: rule.category,
      sequence: rule.sequence,
      amount,
    });
  }

  // Calculate Gross, Deductions, and Net
  let grossPay = 0;
  let totalDeductions = 0;

  for (const line of computedLines) {
    if (line.category === 'BASIC' || line.category === 'ALLOWANCE' || line.category === 'GROSS') {
      if (line.code !== 'GROSS') grossPay += line.amount;
    } else if (line.category === 'DEDUCTION') {
      totalDeductions += line.amount;
    }
  }

  const netPay = Math.max(0, grossPay - totalDeductions);

  return {
    grossPay,
    totalDeductions,
    netPay,
    lines: computedLines,
  };
}

/**
 * Period-correct active contract resolver
 */
export async function getActiveContractForPeriod(employeeId, periodStart, periodEnd) {
  const contracts = await prisma.contract.findMany({
    where: {
      employeeId,
      status: 'RUNNING',
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
    orderBy: { startDate: 'desc' },
  });

  return contracts.length > 0 ? contracts[0] : null;
}
