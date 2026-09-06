import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const attendanceRouter = Router();

// GET /api/attendance - list attendance logs with corrector and employee context
attendanceRouter.get('/', authenticate, async (req, res) => {
  try {
    const { employeeId, dateFrom, dateTo, isCorrected } = req.query;
    const where = {};
    if (employeeId) where.employeeId = String(employeeId);
    if (isCorrected !== undefined) where.isCorrected = isCorrected === 'true';
    if (dateFrom && dateTo) {
      where.date = {
        gte: new Date(String(dateFrom)),
        lte: new Date(String(dateTo)),
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: true,
        correctedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.json({ data: attendances });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance', details: err.message });
  }
});

// POST /api/attendance/punch - live punch in / punch out simulation
attendanceRouter.post('/punch', authenticate, async (req, res) => {
  try {
    const { employeeId, type = 'CHECK_IN' } = req.body;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let targetEmpId = employeeId;
    if (!targetEmpId || targetEmpId === 'demo-emp') {
      const firstEmp = await prisma.employee.findFirst();
      if (firstEmp) targetEmpId = firstEmp.id;
    }

    let record = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: targetEmpId,
          date: today,
        },
      },
    });

    if (!record) {
      record = await prisma.attendance.create({
        data: {
          employeeId: targetEmpId,
          date: today,
          checkIn: type === 'CHECK_IN' ? now : new Date(now.getTime() - 8 * 3600 * 1000),
          checkOut: type === 'CHECK_OUT' ? now : null,
          workedHours: type === 'CHECK_OUT' ? 8.0 : 0.0,
          status: 'PRESENT',
        },
        include: {
          employee: true,
          correctedBy: { select: { id: true, email: true } },
        },
      });
    } else {
      if (type === 'CHECK_OUT') {
        const checkInTime = record.checkIn ? new Date(record.checkIn).getTime() : now.getTime() - 8 * 3600 * 1000;
        const diffHours = Math.max(1, (now.getTime() - checkInTime) / (1000 * 3600));
        record = await prisma.attendance.update({
          where: { id: record.id },
          data: {
            checkOut: now,
            workedHours: Math.min(12, Math.round(diffHours * 10) / 10),
            status: 'PRESENT',
          },
          include: {
            employee: true,
            correctedBy: { select: { id: true, email: true } },
          },
        });
      }
    }

    res.json({ data: record, message: `Punch ${type} recorded successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record punch', details: err.message });
  }
});

// PUT /api/attendance/:id/correct - HR manual correction with mandatory reason
attendanceRouter.put('/:id/correct', authenticate, requireRole('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reason,
      checkIn,
      checkOut,
      workedHours,
      overtimeHours = 0,
      status = 'PRESENT',
    } = req.body;

    // 1. Mandatory Reason Validation
    if (!reason || String(reason).trim().length < 3) {
      return res.status(400).json({
        error: 'Mandatory Reason Required: A valid justification (e.g., "Biometric failure", "Client site visit") must be provided for audit tracking.',
      });
    }

    const existing = await prisma.attendance.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    // Parse checkIn and checkOut dates if provided
    let parsedCheckIn = existing.checkIn;
    let parsedCheckOut = existing.checkOut;

    if (checkIn) {
      parsedCheckIn = new Date(checkIn);
    }
    if (checkOut) {
      parsedCheckOut = new Date(checkOut);
    }

    // Compute or format worked hours
    let calcWorked = workedHours !== undefined && workedHours !== null ? Number(workedHours) : Number(existing.workedHours || 8);
    if (!workedHours && parsedCheckIn && parsedCheckOut) {
      const diffHrs = (parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 3600);
      calcWorked = Math.max(0, Math.min(16, Math.round(diffHrs * 10) / 10));
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        workedHours: calcWorked,
        overtimeHours: Number(overtimeHours || 0),
        status: status || existing.status,
        isCorrected: true,
        correctionReason: String(reason).trim(),
        correctedById: req.user?.id || null,
        correctedAt: new Date(),
      },
      include: {
        employee: true,
        correctedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: { select: { name: true } },
          },
        },
      },
    });

    // 2. Statutory Audit Event Logging
    try {
      if (req.user?.id) {
        await prisma.payrollAuditEvent.create({
          data: {
            entityType: 'ATTENDANCE',
            entityId: id,
            action: 'HR_ATTENDANCE_OVERRIDE_CORRECTED',
            actorId: req.user.id,
            meta: {
              employeeId: existing.employeeId,
              employeeName: existing.employee?.name,
              previousStatus: existing.status,
              newStatus: status,
              previousHours: existing.workedHours,
              newHours: calcWorked,
              reason: String(reason).trim(),
              correctedByEmail: req.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    } catch (auditErr) {
      console.warn('Audit event log warning:', auditErr.message);
    }

    res.json({
      data: updated,
      message: `Attendance corrected successfully: ${reason}`,
    });
  } catch (err) {
    console.error('Attendance correction error:', err);
    res.status(500).json({ error: 'Failed to correct attendance', details: err.message });
  }
});

// POST /api/attendance/manual-entry - HR creates missing attendance punch record with mandatory reason
attendanceRouter.post('/manual-entry', authenticate, requireRole('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const {
      employeeId,
      date,
      reason,
      checkIn,
      checkOut,
      workedHours = 8.0,
      overtimeHours = 0,
      status = 'PRESENT',
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }

    if (!reason || String(reason).trim().length < 3) {
      return res.status(400).json({
        error: 'Mandatory Reason Required: A valid reason (e.g. "Biometric failure", "Client site visit") is required for manual attendance entries.',
      });
    }

    const targetDate = new Date(date);
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    let parsedCheckIn = checkIn ? new Date(checkIn) : new Date(dateOnly.getTime() + 9 * 3600 * 1000);
    let parsedCheckOut = checkOut ? new Date(checkOut) : new Date(dateOnly.getTime() + 18 * 3600 * 1000);

    const record = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly,
        },
      },
      create: {
        employeeId,
        date: dateOnly,
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        workedHours: Number(workedHours),
        overtimeHours: Number(overtimeHours || 0),
        status,
        isCorrected: true,
        correctionReason: String(reason).trim(),
        correctedById: req.user?.id || null,
        correctedAt: new Date(),
      },
      update: {
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        workedHours: Number(workedHours),
        overtimeHours: Number(overtimeHours || 0),
        status,
        isCorrected: true,
        correctionReason: String(reason).trim(),
        correctedById: req.user?.id || null,
        correctedAt: new Date(),
      },
      include: {
        employee: true,
        correctedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: { select: { name: true } },
          },
        },
      },
    });

    // Statutory Audit Event Logging
    try {
      if (req.user?.id) {
        await prisma.payrollAuditEvent.create({
          data: {
            entityType: 'ATTENDANCE',
            entityId: record.id,
            action: 'HR_MANUAL_ATTENDANCE_CREATED',
            actorId: req.user.id,
            meta: {
              employeeId,
              date: dateOnly.toISOString(),
              status,
              workedHours,
              reason: String(reason).trim(),
              correctedByEmail: req.user.email,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    } catch (auditErr) {
      console.warn('Audit event log warning:', auditErr.message);
    }

    res.status(201).json({
      data: record,
      message: `Manual attendance record created with reason: ${reason}`,
    });
  } catch (err) {
    console.error('Manual attendance creation error:', err);
    res.status(500).json({ error: 'Failed to create manual attendance entry', details: err.message });
  }
});

export default attendanceRouter;

