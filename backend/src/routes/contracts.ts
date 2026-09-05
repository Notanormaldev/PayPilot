import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { invalidateCache } from '../lib/redis';

export const contractsRouter = Router();

// List contracts
contractsRouter.get('/', authenticate, async (req, res) => {
  try {
    const { employeeId, status } = req.query;

    const contracts = await prisma.contract.findMany({
      where: {
        employeeId: employeeId ? String(employeeId) : undefined,
        status: status ? (status as any) : undefined,
      },
      include: {
        employee: { select: { id: true, name: true, department: true } },
        salaryStructure: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: contracts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create contract with overlap exclusivity check
contractsRouter.post('/', authenticate, requireRole('ADMIN', 'HR_OFFICER'), async (req, res) => {
  try {
    const { employeeId, startDate, endDate, wage, department, jobPosition, salaryStructureId, status } = req.body;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const contractStatus = status || 'RUNNING';

    // Period exclusivity validation: No two RUNNING contracts can overlap
    if (contractStatus === 'RUNNING') {
      const overlapping = await prisma.contract.findFirst({
        where: {
          employeeId,
          status: 'RUNNING',
          AND: [
            { startDate: { lt: end ?? new Date('9999-12-31') } },
            {
              OR: [
                { endDate: null },
                { endDate: { gt: start } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        res.status(409).json({
          error: `Overlap Conflict: Employee already has an active contract (${overlapping.id}) active from ${overlapping.startDate.toISOString().slice(0, 10)}. Mark previous contract as EXPIRED before creating a new RUNNING contract.`,
        });
        return;
      }
    }

    const contract = await prisma.contract.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        wage,
        department,
        jobPosition,
        salaryStructureId,
        status: contractStatus,
      },
    });

    await invalidateCache('kpi:*');
    res.status(201).json({ data: contract });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update contract status (e.g. Expire / Terminate)
contractsRouter.patch('/:id/status', authenticate, requireRole('ADMIN', 'HR_OFFICER'), async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id as string;
    const updated = await prisma.contract.update({
      where: { id },
      data: { status },
    });

    await invalidateCache('kpi:*');
    res.json({ data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
