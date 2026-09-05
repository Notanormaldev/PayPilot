import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const contractsRouter = Router();

// GET /api/contracts - list contracts with overlap safety
contractsRouter.get('/', authenticate, async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    const where = {};
    if (employeeId) where.employeeId = String(employeeId);
    if (status) where.status = String(status);

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        employee: true,
        salaryStructure: true,
      },
      orderBy: { startDate: 'desc' },
    });

    res.json({ data: contracts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contracts', details: err.message });
  }
});

// POST /api/contracts - create contract with overlap validation
contractsRouter.post('/', authenticate, async (req, res) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      wage,
      department,
      jobPosition,
      salaryStructureId,
      status = 'RUNNING',
    } = req.body;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    // Check for overlapping RUNNING contract
    if (status === 'RUNNING') {
      const overlapping = await prisma.contract.findFirst({
        where: {
          employeeId,
          status: 'RUNNING',
          startDate: end ? { lte: end } : undefined,
          OR: [{ endDate: null }, { endDate: { gte: start } }],
        },
      });

      if (overlapping) {
        return res.status(409).json({
          error: 'OverlappingRunningContract',
          message: 'An active running contract already exists for this employee in the specified period',
          blockingContract: overlapping,
        });
      }
    }

    const contract = await prisma.contract.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        wage: Number(wage),
        department,
        jobPosition,
        salaryStructureId,
        status,
      },
      include: {
        salaryStructure: true,
      },
    });

    res.status(201).json({ data: contract });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contract', details: err.message });
  }
});

export default contractsRouter;
