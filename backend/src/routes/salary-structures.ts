import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

export const salaryStructuresRouter = Router();

// Get salary structures with rules
salaryStructuresRouter.get('/', authenticate, async (req, res) => {
  try {
    const structures = await prisma.salaryStructure.findMany({
      include: {
        rules: { orderBy: { sequence: 'asc' } },
        _count: { select: { contracts: true } },
      },
    });

    res.json({ data: structures });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create salary structure with rules
salaryStructuresRouter.post('/', authenticate, requireRole('ADMIN', 'PAYROLL_OFFICER'), async (req, res) => {
  try {
    const { name, rules } = req.body;

    const structure = await prisma.salaryStructure.create({
      data: {
        name,
        rules: {
          create: (rules || []).map((r: any, idx: number) => ({
            name: r.name,
            code: r.code,
            category: r.category,
            sequence: r.sequence || idx + 1,
            computationMethod: r.computationMethod || 'FIXED',
            amount: r.amount ? Number(r.amount) : null,
            percentageOf: r.percentageOf || null,
            percentageValue: r.percentageValue ? Number(r.percentageValue) : null,
            formulaExpression: r.formulaExpression || null,
          })),
        },
      },
      include: { rules: true },
    });

    res.status(201).json({ data: structure });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
