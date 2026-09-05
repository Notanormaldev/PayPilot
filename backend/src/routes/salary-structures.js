import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const salaryStructuresRouter = Router();

// GET /api/salary-structures - list structures with ordered rules
salaryStructuresRouter.get('/', authenticate, async (req, res) => {
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
    });

    res.json({ data: structures });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch salary structures', details: err.message });
  }
});

// POST /api/salary-structures - create structure
salaryStructuresRouter.post('/', authenticate, async (req, res) => {
  try {
    const { name, rules = [] } = req.body;

    const structure = await prisma.salaryStructure.create({
      data: {
        name,
        rules: {
          create: rules.map((r, idx) => ({
            name: r.name,
            code: r.code,
            category: r.category,
            sequence: r.sequence || idx + 1,
            computationMethod: r.computationMethod,
            amount: r.amount ? Number(r.amount) : null,
            percentageOf: r.percentageOf,
            percentageValue: r.percentageValue ? Number(r.percentageValue) : null,
            formulaExpression: r.formulaExpression,
          })),
        },
      },
      include: { rules: true },
    });

    res.status(201).json({ data: structure });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create salary structure', details: err.message });
  }
});

export default salaryStructuresRouter;
