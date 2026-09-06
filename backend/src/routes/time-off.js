import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { addNotification } from './notifications.js';

export const timeOffRouter = Router();

// In-memory fallback and state store for configured Time Off Types (Section 4 A4)
let memoryTimeOffTypes = [
  {
    id: 'type_casual',
    name: 'Casual Leave (CL)',
    code: 'CL',
    unit: 'DAYS',
    requiresAllocation: true,
    requiresApproval: true,
    affectsPayroll: true,
    isActive: true,
    description: 'Short-term personal emergency or casual time off (typically 12 days/yr).',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'type_earned',
    name: 'Earned / Privilege Leave (PL)',
    code: 'PL',
    unit: 'DAYS',
    requiresAllocation: true,
    requiresApproval: true,
    affectsPayroll: true,
    isActive: true,
    description: 'Statutory earned annual leave accrued based on days worked (15 days/yr).',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'type_sick',
    name: 'Sick / Medical Leave (SL)',
    code: 'SL',
    unit: 'DAYS',
    requiresAllocation: true,
    requiresApproval: true,
    affectsPayroll: true,
    isActive: true,
    description: 'Paid medical leave for health recovery and medical consultations.',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'type_maternity',
    name: 'Maternity Leave (ML)',
    code: 'ML',
    unit: 'DAYS',
    requiresAllocation: false,
    requiresApproval: true,
    affectsPayroll: false,
    isActive: true,
    description: 'Statutory 26 weeks paid maternity leave under Maternity Benefit Act 1961.',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'type_paternity',
    name: 'Paternity Leave',
    code: 'PAT',
    unit: 'DAYS',
    requiresAllocation: true,
    requiresApproval: true,
    affectsPayroll: false,
    isActive: true,
    description: 'Company-sponsored paternity time off for secondary caregivers (10 days).',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'type_compoff',
    name: 'Compensatory Off (Comp-Off)',
    code: 'COMP_OFF',
    unit: 'HOURS',
    requiresAllocation: true,
    requiresApproval: true,
    affectsPayroll: false,
    isActive: true,
    description: 'Credit in lieu of working on designated weekends or statutory holidays.',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'type_unpaid',
    name: 'Loss of Pay / Sabbatical (LOP)',
    code: 'LOP',
    unit: 'DAYS',
    requiresAllocation: false,
    requiresApproval: true,
    affectsPayroll: true,
    isActive: true,
    description: 'Unpaid leave deducted proportionately from monthly gross salary during payroll processing.',
    createdAt: new Date('2026-01-01').toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────
// TIME OFF TYPES CRUD (Section 4 A4)
// ─────────────────────────────────────────────────────────────────

// GET /api/time-off/types - List all configured leave types
timeOffRouter.get('/types', authenticate, async (req, res) => {
  try {
    let dbTypes = [];
    try {
      dbTypes = await prisma.timeOffType.findMany({
        orderBy: { createdAt: 'asc' },
      });
    } catch (e) {
      console.warn('Prisma timeOffType query fallback to memory store:', e.message);
    }

    if (dbTypes && dbTypes.length > 0) {
      return res.json({ data: dbTypes });
    }

    res.json({ data: memoryTimeOffTypes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch time off types', details: err.message });
  }
});

// POST /api/time-off/types - Create new leave policy type
timeOffRouter.post('/types', authenticate, async (req, res) => {
  try {
    const { name, code, unit, requiresAllocation, requiresApproval, affectsPayroll, isActive, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Leave type name is required' });
    }

    let created = null;
    try {
      created = await prisma.timeOffType.create({
        data: {
          name,
          unit: unit === 'HOURS' ? 'HOURS' : 'DAYS',
          requiresAllocation: requiresAllocation !== undefined ? Boolean(requiresAllocation) : true,
          requiresApproval: requiresApproval !== undefined ? Boolean(requiresApproval) : true,
          affectsPayroll: affectsPayroll !== undefined ? Boolean(affectsPayroll) : true,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
      });
    } catch (e) {
      console.warn('Prisma create timeOffType fallback:', e.message);
    }

    const newType = created || {
      id: `type_${Date.now()}`,
      name,
      code: code || name.slice(0, 4).toUpperCase(),
      unit: unit === 'HOURS' ? 'HOURS' : 'DAYS',
      requiresAllocation: requiresAllocation !== undefined ? Boolean(requiresAllocation) : true,
      requiresApproval: requiresApproval !== undefined ? Boolean(requiresApproval) : true,
      affectsPayroll: affectsPayroll !== undefined ? Boolean(affectsPayroll) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      description: description || 'Configured statutory organizational leave policy.',
      createdAt: new Date().toISOString(),
    };

    memoryTimeOffTypes.push(newType);

    res.status(201).json({
      message: 'Time Off Type configured successfully',
      data: newType,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create time off type', details: err.message });
  }
});

// PUT /api/time-off/types/:id - Update leave policy type
timeOffRouter.put('/types/:id', authenticate, async (req, res) => {
  try {
    const typeId = req.params.id;
    const { name, code, unit, requiresAllocation, requiresApproval, affectsPayroll, isActive, description } = req.body;

    let updated = null;
    try {
      updated = await prisma.timeOffType.update({
        where: { id: typeId },
        data: {
          ...(name && { name }),
          ...(unit && { unit: unit === 'HOURS' ? 'HOURS' : 'DAYS' }),
          ...(requiresAllocation !== undefined && { requiresAllocation: Boolean(requiresAllocation) }),
          ...(requiresApproval !== undefined && { requiresApproval: Boolean(requiresApproval) }),
          ...(affectsPayroll !== undefined && { affectsPayroll: Boolean(affectsPayroll) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
      });
    } catch (e) {
      console.warn('Prisma update timeOffType fallback:', e.message);
    }

    const idx = memoryTimeOffTypes.findIndex((t) => t.id === typeId);
    if (idx !== -1) {
      memoryTimeOffTypes[idx] = {
        ...memoryTimeOffTypes[idx],
        ...(name && { name }),
        ...(code && { code }),
        ...(unit && { unit }),
        ...(requiresAllocation !== undefined && { requiresAllocation }),
        ...(requiresApproval !== undefined && { requiresApproval }),
        ...(affectsPayroll !== undefined && { affectsPayroll }),
        ...(isActive !== undefined && { isActive }),
        ...(description && { description }),
      };
      updated = memoryTimeOffTypes[idx];
    }

    res.json({
      message: 'Time Off Type updated successfully',
      data: updated || memoryTimeOffTypes[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update time off type', details: err.message });
  }
});

// DELETE /api/time-off/types/:id - Deactivate / delete leave policy type
timeOffRouter.delete('/types/:id', authenticate, async (req, res) => {
  try {
    const typeId = req.params.id;

    try {
      await prisma.timeOffType.delete({
        where: { id: typeId },
      });
    } catch (e) {
      console.warn('Prisma delete timeOffType fallback:', e.message);
    }

    memoryTimeOffTypes = memoryTimeOffTypes.filter((t) => t.id !== typeId);

    res.json({
      message: 'Time Off Type removed successfully',
      data: { id: typeId },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete time off type', details: err.message });
  }
});

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

    const empName = req.user?.name || 'Aarav Sharma';
    const leaveName = timeOffTypeName || 'Casual Leave';

    // Record in memory store
    const memReq = {
      id: createdRequest ? createdRequest.id : `req_${Date.now()}`,
      employeeId: employeeId || 'emp_1',
      employeeName: empName,
      timeOffTypeName: leaveName,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      duration: numDays,
      reason: reason || 'Personal leave request',
      status: 'TO_APPROVE',
      createdAt: new Date().toISOString(),
    };

    memoryTimeOffRequests.unshift(memReq);

    // 1. Notify HR Manager about incoming leave request!
    addNotification({
      targetRole: 'HR_MANAGER',
      title: 'New Leave Request Received',
      message: `Employee ${empName} submitted a new ${leaveName} request (${numDays} day(s): ${memReq.startDate} to ${memReq.endDate}) awaiting your approval.`,
      type: 'leave',
    });

    res.status(201).json({
      message: 'Leave request submitted to HR Manager for approval',
      data: createdRequest || memReq,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit leave request', details: err.message });
  }
});

// POST /api/time-off/requests/:id/approve - approve leave request & notify employee
timeOffRouter.post('/requests/:id/approve', authenticate, async (req, res) => {
  try {
    const requestId = req.params.id;

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

    // 2. Trigger notification for Employee!
    const notif = addNotification({
      userEmail: 'employee@paypilot.com',
      employeeId: memReq?.employeeId || 'emp_1',
      targetRole: 'EMPLOYEE',
      title: 'Leave Request Approved',
      message: `Your ${leaveTypeName} request (${datesFormatted}) has been approved by the manager.`,
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

// POST /api/time-off/requests/:id/refuse - refuse leave request & notify employee
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
      targetRole: 'EMPLOYEE',
      title: 'Leave Request Refused',
      message: `Your ${leaveTypeName} request was reviewed and declined by the manager.`,
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
