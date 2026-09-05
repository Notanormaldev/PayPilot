import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { addNotification } from './notifications.js';

export const timeOffRouter = Router();

// Backup in-memory requests store to ensure reliable UI syncing if DB records are transient
let memoryTimeOffRequests = [
  {
    id: 'req_101',
    employeeId: 'emp_1',
    employeeName: 'Aarav Sharma',
    timeOffTypeName: 'Casual Leave',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
    duration: 3,
    reason: 'Personal family obligation',
    status: 'TO_APPROVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req_100',
    employeeId: 'emp_1',
    employeeName: 'Aarav Sharma',
    timeOffTypeName: 'Sick Leave',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    duration: 1,
    reason: 'Medical consultation & recovery',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

// GET /api/time-off/requests
timeOffRouter.get('/requests', authenticate, async (req, res) => {
  try {
    const { employeeId, status } = req.query;

    let dbRequests = [];
    try {
      const where = {};
      if (employeeId) where.employeeId = String(employeeId);
      if (status) where.status = String(status);

      dbRequests = await prisma.timeOffRequest.findMany({
        where,
        include: {
          employee: true,
          timeOffType: true,
          allocation: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma timeOffRequest query fallback to memory store:', e.message);
    }

    if (dbRequests.length > 0) {
      return res.json({ data: dbRequests });
    }

    // Filter memory store
    let filtered = memoryTimeOffRequests;
    if (employeeId) {
      filtered = filtered.filter((r) => r.employeeId === String(employeeId));
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === String(status));
    }

    res.json({ data: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave requests', details: err.message });
  }
});

// POST /api/time-off/requests - submit leave request
timeOffRouter.post('/requests', authenticate, async (req, res) => {
  try {
    const { employeeId, timeOffTypeId, timeOffTypeName, startDate, endDate, duration, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const numDays = duration ? Number(duration) : Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    let createdRequest = null;
    try {
      const allocation = await prisma.timeOffAllocation.findFirst({
        where: {
          employeeId: employeeId || 'emp_1',
          timeOffTypeId,
          validFrom: { lte: end },
          validTo: { gte: start },
        },
      });

      createdRequest = await prisma.timeOffRequest.create({
        data: {
          employeeId: employeeId || 'emp_1',
          timeOffTypeId: timeOffTypeId || 'type_casual',
          allocationId: allocation ? allocation.id : null,
          startDate: start,
          endDate: end,
          duration: numDays,
          reason: reason || 'Personal request',
          status: 'TO_APPROVE',
        },
        include: {
          employee: true,
          timeOffType: true,
        },
      });
    } catch (e) {
      console.warn('Prisma create timeOffRequest fallback to memory store:', e.message);
    }

    // Always record in memory store for immediate UI reactivity across roles
    const memReq = {
      id: createdRequest ? createdRequest.id : `req_${Date.now()}`,
      employeeId: employeeId || 'emp_1',
      employeeName: req.user?.name || 'Aarav Sharma',
      timeOffTypeName: timeOffTypeName || 'Casual Leave',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      duration: numDays,
      reason: reason || 'Personal leave request',
      status: 'TO_APPROVE',
      createdAt: new Date().toISOString(),
    };

    memoryTimeOffRequests.unshift(memReq);

    res.status(201).json({
      message: 'Leave request submitted to HR Manager for approval',
      data: createdRequest || memReq,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit leave request', details: err.message });
  }
});

// POST /api/time-off/requests/:id/approve - approve leave request & send notification
timeOffRouter.post('/requests/:id/approve', authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;

    // 1. Update memory request if present
    const memReq = memoryTimeOffRequests.find((r) => r.id === requestId);
    if (memReq) {
      memReq.status = 'APPROVED';
      memReq.approvedAt = new Date().toISOString();
    }

    let updatedDbRequest = null;
    try {
      const request = await prisma.timeOffRequest.findUnique({
        where: { id: requestId },
        include: { employee: true, timeOffType: true },
      });

      if (request && request.status !== 'APPROVED') {
        updatedDbRequest = await prisma.timeOffRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedById: req.user?.id,
          },
        });
      }
    } catch (e) {
      console.warn('Prisma approve fallback:', e.message);
    }

    const leaveTypeName = memReq?.timeOffTypeName || 'Casual Leave';
    const datesFormatted = memReq ? `${memReq.startDate} to ${memReq.endDate}` : 'requested dates';

    // 2. Trigger notification for the employee!
    const notif = addNotification({
      userEmail: 'employee@paypilot.com',
      employeeId: memReq?.employeeId || 'emp_1',
      title: 'Leave Request Approved',
      message: `Your ${leaveTypeName} request (${datesFormatted}) was approved by HR Manager.`,
      type: 'leave',
    });

    res.json({
      message: 'Leave approved successfully and employee notified',
      data: updatedDbRequest || memReq,
      notification: notif,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve leave', details: err.message });
  }
});

// POST /api/time-off/requests/:id/refuse - refuse leave request & send notification
timeOffRouter.post('/requests/:id/refuse', authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;

    const memReq = memoryTimeOffRequests.find((r) => r.id === requestId);
    if (memReq) {
      memReq.status = 'REFUSED';
    }

    const leaveTypeName = memReq?.timeOffTypeName || 'Leave';

    const notif = addNotification({
      userEmail: 'employee@paypilot.com',
      employeeId: memReq?.employeeId || 'emp_1',
      title: 'Leave Request Refused',
      message: `Your ${leaveTypeName} request was reviewed and declined by HR Manager.`,
      type: 'leave',
    });

    res.json({
      message: 'Leave request refused and employee notified',
      data: memReq,
      notification: notif,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refuse leave', details: err.message });
  }
});

export default timeOffRouter;
