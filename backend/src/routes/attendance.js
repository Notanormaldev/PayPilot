import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const attendanceRouter = Router();

// GET /api/attendance - list attendance logs
attendanceRouter.get('/', authenticate, async (req, res) => {
  try {
    const { employeeId, dateFrom, dateTo } = req.query;
    const where = {};
    if (employeeId) where.employeeId = String(employeeId);
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
        include: { employee: true },
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
          include: { employee: true },
        });
      }
    }

    res.json({ data: record, message: `Punch ${type} recorded successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record punch', details: err.message });
  }
});

export default attendanceRouter;
