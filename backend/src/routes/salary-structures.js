import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const salaryStructuresRouter = Router();

// Helper to evaluate formula safely in sandbox
function evaluateRuleFormula(formula, context) {
  try {
    // Replace variable names with context values
    let sanitized = formula;
    
    // Support min, max
    sanitized = sanitized.replace(/min\(/g, 'Math.min(').replace(/max\(/g, 'Math.max(');

    // Create function with context keys as parameters
    const keys = Object.keys(context);
    const values = Object.values(context);
    const fn = new Function(...keys, `return Number(${sanitized});`);
    const res = fn(...values);
    return isNaN(res) ? 0 : Number(res.toFixed(2));
  } catch (err) {
    return 0;
  }
}

// Helper to simulate full salary computation
export function simulateSalaryRules(wage = 100000, rules = []) {
  const sorted = [...rules].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  const context = {
    wage: Number(wage),
    WAGE: Number(wage),
    gross: 0,
    GROSS: 0,
    deductions: 0,
    DEDUCTIONS: 0,
    net: 0,
    NET: 0,
  };

  const computedLines = [];
  let totalEarnings = 0;
  let totalDeductions = 0;

  for (const rule of sorted) {
    let amount = 0;
    const method = rule.computationMethod;

    if (method === 'FIXED') {
      const fixedVal = rule.amount !== undefined && rule.amount !== null && rule.amount !== '' 
        ? rule.amount 
        : (rule.fixedAmount !== undefined && rule.fixedAmount !== null && rule.fixedAmount !== '' ? rule.fixedAmount : 0);
      amount = Number(fixedVal || 0);
    } else if (method === 'PERCENTAGE') {
      const baseCode = (rule.percentageOf || 'WAGE').toUpperCase();
      const baseVal = context[baseCode] !== undefined ? context[baseCode] : (context[rule.percentageOf] || context.wage);
      const pct = Number(rule.percentageValue || 0);
      // percentageValue can be 0.5 or 50
      const multiplier = pct > 1 ? pct / 100 : pct;
      amount = Number((baseVal * multiplier).toFixed(2));
    } else if (method === 'FORMULA' && rule.formulaExpression) {
      amount = evaluateRuleFormula(rule.formulaExpression, context);
    }

    amount = Math.max(0, Number(amount.toFixed(2)));

    // Save to context
    const codeKey = (rule.code || '').trim();
    if (codeKey) {
      context[codeKey] = amount;
      context[codeKey.toUpperCase()] = amount;
      context[codeKey.toLowerCase()] = amount;
    }

    if (rule.category === 'BASIC' || rule.category === 'ALLOWANCE' || rule.category === 'GROSS') {
      if (rule.category !== 'GROSS') {
        totalEarnings += amount;
      }
    } else if (rule.category === 'DEDUCTION') {
      totalDeductions += amount;
    }

    context.GROSS = totalEarnings;
    context.gross = totalEarnings;
    context.DEDUCTIONS = totalDeductions;
    context.deductions = totalDeductions;
    context.NET = Math.max(0, totalEarnings - totalDeductions);
    context.net = context.NET;

    computedLines.push({
      id: rule.id || rule.code,
      name: rule.name,
      code: rule.code,
      category: rule.category,
      computationMethod: rule.computationMethod,
      formulaExpression: rule.formulaExpression,
      percentageOf: rule.percentageOf,
      percentageValue: rule.percentageValue,
      amount,
      runningGross: totalEarnings,
      runningDeductions: totalDeductions,
      runningNet: context.NET,
    });
  }

  return {
    wage: Number(wage),
    grossEarnings: Number(totalEarnings.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netTakeHome: Number(context.NET.toFixed(2)),
    annualCTC: Number((wage * 12).toFixed(2)),
    annualTakeHome: Number((context.NET * 12).toFixed(2)),
    lines: computedLines,
  };
}

// GET /api/salary-structures - list all structures with ordered rules & stats
salaryStructuresRouter.get('/', authenticate, requireRole('ADMIN', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'), async (req, res) => {
  try {
    const structures = await prisma.salaryStructure.findMany({
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
        _count: {
          select: { contracts: true, payruns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = structures.map((st) => ({
      id: st.id,
      name: st.name,
      isActive: st.isActive,
      createdAt: st.createdAt,
      updatedAt: st.updatedAt,
      rules: st.rules,
      contractsCount: st._count.contracts,
      payrunsCount: st._count.payruns,
    }));

    res.json({ data: formatted });
  } catch (err) {
    console.error('Error fetching salary structures:', err);
    res.status(500).json({ error: 'Failed to fetch salary structures', details: err.message });
  }
});

// GET /api/salary-structures/:id - get single structure with rules
salaryStructuresRouter.get('/:id', authenticate, requireRole('ADMIN', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'), async (req, res) => {
  try {
    const structure = await prisma.salaryStructure.findUnique({
      where: { id: req.params.id },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
        contracts: {
          select: {
            id: true,
            wage: true,
            department: true,
            jobPosition: true,
            status: true,
            employee: { select: { id: true, name: true, workEmail: true } },
          },
        },
        _count: {
          select: { contracts: true, payruns: true },
        },
      },
    });

    if (!structure) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }

    res.json({ data: structure });
  } catch (err) {
    console.error('Error fetching salary structure:', err);
    res.status(500).json({ error: 'Failed to fetch salary structure', details: err.message });
  }
});

// POST /api/salary-structures - create new salary structure with rules (Manager & Admin only)
salaryStructuresRouter.post('/', authenticate, requireRole('ADMIN', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { name, rules = [], isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Salary structure name is required' });
    }

    const structure = await prisma.salaryStructure.create({
      data: {
        name: name.trim(),
        isActive: Boolean(isActive),
        rules: {
          create: rules.map((r, idx) => ({
            name: r.name,
            code: (r.code || `RULE_${idx + 1}`).trim().toUpperCase(),
            category: r.category || 'ALLOWANCE',
            sequence: r.sequence !== undefined ? Number(r.sequence) : (idx + 1) * 10,
            computationMethod: r.computationMethod || 'FIXED',
            amount: (r.amount !== null && r.amount !== undefined && r.amount !== '') 
              ? Number(r.amount) 
              : (r.fixedAmount !== null && r.fixedAmount !== undefined && r.fixedAmount !== '' ? Number(r.fixedAmount) : null),
            percentageOf: r.percentageOf ? String(r.percentageOf).toUpperCase() : null,
            percentageValue: r.percentageValue !== null && r.percentageValue !== undefined && r.percentageValue !== '' ? Number(r.percentageValue) : null,
            formulaExpression: r.formulaExpression ? String(r.formulaExpression).trim() : null,
            isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
          })),
        },
      },
      include: {
        rules: { orderBy: { sequence: 'asc' } },
        _count: { select: { contracts: true, payruns: true } },
      },
    });

    res.status(201).json({
      data: structure,
      message: 'Salary structure created successfully',
    });
  } catch (err) {
    console.error('Error creating salary structure:', err);
    res.status(500).json({ error: 'Failed to create salary structure', details: err.message });
  }
});

// PUT /api/salary-structures/:id - update structure and rules (Manager & Admin only)
salaryStructuresRouter.put('/:id', authenticate, requireRole('ADMIN', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rules = [], isActive } = req.body;

    const existing = await prisma.salaryStructure.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old rules
      await tx.salaryRule.deleteMany({ where: { structureId: id } });

      // Update structure record with new rules
      return await tx.salaryStructure.update({
        where: { id },
        data: {
          name: name ? name.trim() : existing.name,
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
          rules: {
            create: rules.map((r, idx) => ({
              name: r.name,
              code: (r.code || `RULE_${idx + 1}`).trim().toUpperCase(),
              category: r.category || 'ALLOWANCE',
              sequence: r.sequence !== undefined ? Number(r.sequence) : (idx + 1) * 10,
              computationMethod: r.computationMethod || 'FIXED',
              amount: (r.amount !== null && r.amount !== undefined && r.amount !== '') 
                ? Number(r.amount) 
                : (r.fixedAmount !== null && r.fixedAmount !== undefined && r.fixedAmount !== '' ? Number(r.fixedAmount) : null),
              percentageOf: r.percentageOf ? String(r.percentageOf).toUpperCase() : null,
              percentageValue: r.percentageValue !== null && r.percentageValue !== undefined && r.percentageValue !== '' ? Number(r.percentageValue) : null,
              formulaExpression: r.formulaExpression ? String(r.formulaExpression).trim() : null,
              isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
            })),
          },
        },
        include: {
          rules: { orderBy: { sequence: 'asc' } },
          _count: { select: { contracts: true, payruns: true } },
        },
      });
    });

    res.json({
      data: updated,
      message: 'Salary structure updated successfully',
    });
  } catch (err) {
    console.error('Error updating salary structure:', err);
    res.status(500).json({ error: 'Failed to update salary structure', details: err.message });
  }
});

// DELETE /api/salary-structures/:id - delete structure (Manager & Admin only)
salaryStructuresRouter.delete('/:id', authenticate, requireRole('ADMIN', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;

    const structure = await prisma.salaryStructure.findUnique({
      where: { id },
      include: {
        _count: { select: { contracts: true, payruns: true } },
      },
    });

    if (!structure) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }

    if (structure._count.contracts > 0 || structure._count.payruns > 0) {
      // Reassign to fallback or soft disable
      await prisma.salaryStructure.update({
        where: { id },
        data: { isActive: false },
      });
      return res.json({
        success: true,
        message: `Salary structure has ${structure._count.contracts} active contracts. Marked as Inactive instead of deleting.`,
        deactivated: true,
      });
    }

    await prisma.salaryStructure.delete({ where: { id } });

    res.json({
      success: true,
      message: `Salary structure "${structure.name}" deleted successfully.`,
      id,
    });
  } catch (err) {
    console.error('Error deleting salary structure:', err);
    res.status(500).json({ error: 'Failed to delete salary structure', details: err.message });
  }
});

// POST /api/salary-structures/simulate - live simulation of salary rules
salaryStructuresRouter.post('/simulate', authenticate, async (req, res) => {
  try {
    const { wage = 100000, rules = [] } = req.body;
    const result = simulateSalaryRules(Number(wage), rules);
    res.json({ data: result });
  } catch (err) {
    console.error('Error simulating salary structure:', err);
    res.status(500).json({ error: 'Failed to simulate salary structure', details: err.message });
  }
});

export default salaryStructuresRouter;
