import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { invalidateCache } from '../lib/redis';

export const timeOffRouter = Router();

// List time-off requests
timeOffRouter.get('/requests', authenticate, async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    const requests = await prisma.timeOffRequest.findMany({
      where: {
        status: status ? (status as any) : undefined,
        employeeId: employeeId ? String(employeeId) : undefined,
      },
      include: {
        employee: { select: { id: true, name: true, department: true } },
        timeOffType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: requests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create time-off request
timeOffRouter.post('/requests', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { employeeId, timeOffTypeId, startDate, endDate, duration, reason } = req.body;

    const targetEmpId = employeeId || req.user?.employeeId;
    if (!targetEmpId) {
      res.status(400).json({ error: 'Target employeeId is required' });
      return;
    }

    const allocation = await prisma.timeOffAllocation.findFirst({
      where: {
        employeeId: targetEmpId,
        timeOffTypeId,
        status: 'active',
      },
    });

    const newRequest = await prisma.timeOffRequest.create({
      data: {
        employeeId: targetEmpId,
        timeOffTypeId,
        allocationId: allocation?.id || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: Number(duration || 1),
        reason: reason || null,
        status: 'TO_APPROVE',
      },
    });

    await invalidateCache('kpi:*');
    res.status(201).json({ data: newRequest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Atomic Approval with balance decrement
timeOffRouter.post('/requests/:id/approve', authenticate, requireRole('ADMIN', 'HR_OFFICER'), async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const request = await prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    if (request.status !== 'TO_APPROVE') {
      res.status(400).json({ error: `Cannot approve request in ${request.status} status` });
      return;
    }

    // Atomic transaction: approve request + decrement allocation
    const [updatedRequest] = await prisma.$transaction([
      prisma.timeOffRequest.update({
        where: { id: request.id },
        data: {
          status: 'APPROVED',
          approvedById: req.user?.id || null,
          approvedAt: new Date(),
        },
      }),
      ...(request.allocationId
        ? [
            prisma.timeOffAllocation.update({
              where: { id: request.allocationId },
              data: {
                taken: { increment: request.duration },
              },
            }),
          ]
        : []),
    ]);

    await invalidateCache('kpi:*');
    res.json({ message: 'Time off approved and balance decremented atomically', data: updatedRequest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
