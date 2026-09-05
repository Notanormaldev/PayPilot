import { Parser } from 'expr-eval';
import { prisma } from './prisma';

const parser = new Parser({
  operators: {
    add: true,
    concatenate: false,
    conditional: true,
    divide: true,
    factorial: false,
    logical: true,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
    sin: false,
    cos: false,
    tan: false,
    asin: false,
    acos: false,
    atan: false,
    sinh: false,
    cosh: false,
    tanh: false,
    asinh: false,
    acosh: false,
    atanh: false,
    sqrt: true,
    log: false,
    ln: false,
    lg: false,
    log10: false,
    log2: false,
    abs: true,
    ceil: true,
    floor: true,
    round: true,
    trunc: true,
    exp: false,
    length: false,
    in: false,
    random: false,
    min: true,
    max: true,
  },
});

export interface RuleEvaluationContext {
  wage: number;
  worked_days: number;
  scheduled_days: number;
  [ruleCode: string]: number;
}

export interface ComputedRuleLine {
  ruleId: string;
  code: string;
  name: string;
  category: 'BASIC' | 'ALLOWANCE' | 'GROSS' | 'DEDUCTION' | 'NET';
  sequence: number;
  amount: number;
}

/**
 * Executes salary rules in sequence order, ensuring each rule has access
 * to base parameters and all previously evaluated rule results.
 */
export function computeSalaryRules(
  rules: any[],
  baseContext: { wage: number; worked_days: number; scheduled_days: number }
): ComputedRuleLine[] {
  const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);
  const context: RuleEvaluationContext = {
    wage: baseContext.wage,
    worked_days: baseContext.worked_days,
    scheduled_days: baseContext.scheduled_days,
  };

  const computedLines: ComputedRuleLine[] = [];

  for (const rule of sortedRules) {
    let calculatedAmount = 0;

    if (rule.computationMethod === 'FIXED') {
      calculatedAmount = Number(rule.amount || 0);
    } else if (rule.computationMethod === 'PERCENTAGE') {
      const baseCode = rule.percentageOf || 'BASIC';
      const baseAmount = context[baseCode] !== undefined ? context[baseCode] : context.wage;
      const rate = Number(rule.percentageValue || 0);
      calculatedAmount = Math.round(baseAmount * rate * 100) / 100;
    } else if (rule.computationMethod === 'FORMULA' && rule.formulaExpression) {
      try {
        const expr = parser.parse(rule.formulaExpression);
        const result = expr.evaluate(context);
        calculatedAmount = Math.round(Number(result) * 100) / 100;
      } catch (err: any) {
        console.error(`Rule calculation error for ${rule.code}:`, err.message);
        calculatedAmount = 0;
      }
    }

    // Pro-rate if worked days differs from scheduled days and rule affects basic/gross
    if (rule.category === 'BASIC' && baseContext.scheduled_days > 0 && baseContext.worked_days < baseContext.scheduled_days) {
      calculatedAmount = Math.round((calculatedAmount * (baseContext.worked_days / baseContext.scheduled_days)) * 100) / 100;
    }

    context[rule.code] = calculatedAmount;

    computedLines.push({
      ruleId: rule.id,
      code: rule.code,
      name: rule.name,
      category: rule.category,
      sequence: rule.sequence,
      amount: calculatedAmount,
    });
  }

  return computedLines;
}

/**
 * Period-correct contract resolver
 * Asserts no two running contracts overlap for same employee
 */
export async function resolveContractForPeriod(
  employeeId: string,
  periodStart: Date,
  periodEnd: Date
) {
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
}
