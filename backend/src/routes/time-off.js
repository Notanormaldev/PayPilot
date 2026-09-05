import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const timeOffRouter = Router();

// GET /api/time-off/requests
timeOffRouter.get('/requests', authenticate, async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    const where = {};
    if (employeeId) where.employeeId = String(employeeId);
    if (status) where.status = String(status);

    const requests = await prisma.timeOffRequest.findMany({
      where,
      include: {
        employee: true,
        timeOffType: true,
        allocation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave requests', details: err.message });
  }
});

// POST /api/time-off/requests - submit leave request with balance validation
timeOffRouter.post('/requests', authenticate, async (req, res) => {
  try {
    const { employeeId, timeOffTypeId, startDate, endDate, duration, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const numDays = duration ? Number(duration) : Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    // Check allocation balance
    const allocation = await prisma.timeOffAllocation.findFirst({
      where: {
        employeeId,
        timeOffTypeId,
        validFrom: { lte: end },
        validTo: { gte: start },
      },
    });

    if (allocation) {
      const remaining = Number(allocation.allocated) - Number(allocation.taken);
      if (numDays > remaining) {
        return res.status(422).json({
          error: 'InsufficientBalance',
          message: `Requested ${numDays} days exceeds remaining allocation balance of ${remaining} days`,
          remaining,
          requested: numDays,
        });
      }
    }

    const leaveRequest = await prisma.timeOffRequest.create({
      data: {
        employeeId,
        timeOffTypeId,
        allocationId: allocation ? allocation.id : null,
        startDate: start,
        endDate: end,
        duration: numDays,
        reason,
        status: 'TO_APPROVE',
      },
      include: {
        employee: true,
        timeOffType: true,
      },
    });

    res.status(201).json({ data: leaveRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit leave request', details: err.message });
  }
});

// POST /api/time-off/requests/:id/approve - atomic ledger balance deduction
timeOffRouter.post('/requests/:id/approve', authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.timeOffRequest.findUnique({
        where: { id: requestId },
        include: { allocation: true },
      });

      if (!request) {
        throw new Error('Leave request not found');
      }

      if (request.status === 'APPROVED') {
        return { request, updatedAllocation: request.allocation };
      }

      // Update request status
      const updatedRequest = await tx.timeOffRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedById: req.user?.id,
        },
      });

      // Atomically decrement allocation balance if allocation exists
      let updatedAllocation = null;
      if (request.allocationId) {
        updatedAllocation = await tx.timeOffAllocation.update({
          where: { id: request.allocationId },
          data: {
            taken: {
              increment: Number(request.duration),
            },
          },
        });
      }

      return { request: updatedRequest, updatedAllocation };
    });

    res.json({
      message: 'Leave approved and allocation balance updated atomically',
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve leave', details: err.message });
  }
});

export default timeOffRouter;
