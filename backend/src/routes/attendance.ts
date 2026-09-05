import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const attendanceRouter = Router();

// Get attendance logs
attendanceRouter.get('/', authenticate, async (req, res) => {
  try {
    const { employeeId, date, startDate, endDate } = req.query;

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: employeeId ? String(employeeId) : undefined,
        date: date
          ? new Date(String(date))
          : startDate && endDate
          ? { gte: new Date(String(startDate)), lte: new Date(String(endDate)) }
          : undefined,
      },
      include: {
        employee: { select: { id: true, name: true, department: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.json({ data: attendances });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check-in
attendanceRouter.post('/check-in', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { employeeId } = req.body;
    const targetEmpId = employeeId || req.user?.employeeId;

    if (!targetEmpId) {
      res.status(400).json({ error: 'Employee ID required' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: targetEmpId,
          date: today,
        },
      },
      create: {
        employeeId: targetEmpId,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT',
      },
      update: {
        checkIn: new Date(),
        status: 'PRESENT',
      },
    });

    res.json({ message: 'Checked in successfully', data: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check-out
attendanceRouter.post('/check-out', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { employeeId } = req.body;
    const targetEmpId = employeeId || req.user?.employeeId;

    if (!targetEmpId) {
      res.status(400).json({ error: 'Employee ID required' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: targetEmpId,
          date: today,
        },
      },
    });

    if (!existing || !existing.checkIn) {
      res.status(400).json({ error: 'Cannot check out without a check-in' });
      return;
    }

    const now = new Date();
    const workedHours = (now.getTime() - existing.checkIn.getTime()) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        workedHours: Math.round(workedHours * 100) / 100,
      },
    });

    res.json({ message: 'Checked out successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
