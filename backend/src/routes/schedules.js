import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const schedulesRouter = Router();

// Helper to calculate daily and weekly hours
function calculateScheduleHours(lines = []) {
  let totalMinutes = 0;
  const processedLines = lines.map((line) => {
    let dailyMinutes = 0;
    if (line.startTime && line.endTime) {
      const [startH, startM] = line.startTime.split(':').map(Number);
      const [endH, endM] = line.endTime.split(':').map(Number);
      let diffM = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffM < 0) {
        // Cross-midnight shift (e.g. 20:00 to 05:00)
        diffM += 24 * 60;
      }
      const breakM = parseInt(line.breakMinutes, 10) || 0;
      dailyMinutes = Math.max(0, diffM - breakM);
    }
    totalMinutes += dailyMinutes;
    return {
      ...line,
      dailyHours: Number((dailyMinutes / 60).toFixed(2)),
    };
  });

  const weeklyHours = Number((totalMinutes / 60).toFixed(2));
  return {
    processedLines,
    weeklyHours,
    workingDaysCount: processedLines.length,
  };
}

// GET /api/schedules - list all working schedules
schedulesRouter.get('/', authenticate, async (req, res) => {
  try {
    const schedules = await prisma.workingSchedule.findMany({
      include: {
        lines: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = schedules.map((sched) => {
      const { processedLines, weeklyHours, workingDaysCount } = calculateScheduleHours(sched.lines);
      return {
        id: sched.id,
        name: sched.name,
        orgId: sched.orgId,
        isActive: sched.isActive,
        createdAt: sched.createdAt,
        updatedAt: sched.updatedAt,
        lines: processedLines,
        weeklyHours,
        workingDaysCount,
        assignedEmployeesCount: sched._count.employees,
      };
    });

    res.json({ data: formatted });
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules', details: err.message });
  }
});

// GET /api/schedules/:id - get single schedule with assigned employees
schedulesRouter.get('/:id', authenticate, async (req, res) => {
  try {
    const schedule = await prisma.workingSchedule.findUnique({
      where: { id: req.params.id },
      include: {
        lines: true,
        employees: {
          select: {
            id: true,
            name: true,
            workEmail: true,
            department: true,
            jobPosition: true,
            status: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Work schedule not found' });
    }

    const { processedLines, weeklyHours, workingDaysCount } = calculateScheduleHours(schedule.lines);

    res.json({
      data: {
        ...schedule,
        lines: processedLines,
        weeklyHours,
        workingDaysCount,
        assignedEmployeesCount: schedule.employees.length,
      },
    });
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ error: 'Failed to fetch schedule', details: err.message });
  }
});

// POST /api/schedules - create new working schedule with shift lines
schedulesRouter.post('/', authenticate, requireRole('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { name, lines = [], isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Schedule name is required' });
    }

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'PayPilot Global Inc.' },
      });
    }

    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const validLines = (Array.isArray(lines) ? lines : [])
      .filter((l) => validDays.includes(l.dayOfWeek) && l.startTime && l.endTime)
      .map((l) => ({
        dayOfWeek: l.dayOfWeek,
        startTime: String(l.startTime),
        endTime: String(l.endTime),
        breakMinutes: parseInt(l.breakMinutes, 10) || 60,
      }));

    const newSchedule = await prisma.workingSchedule.create({
      data: {
        name: name.trim(),
        orgId: org.id,
        isActive: Boolean(isActive),
        lines: {
          create: validLines,
        },
      },
      include: {
        lines: true,
        _count: { select: { employees: true } },
      },
    });

    const { processedLines, weeklyHours, workingDaysCount } = calculateScheduleHours(newSchedule.lines);

    res.status(201).json({
      data: {
        ...newSchedule,
        lines: processedLines,
        weeklyHours,
        workingDaysCount,
        assignedEmployeesCount: 0,
      },
      message: 'Work schedule created successfully',
    });
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Failed to create work schedule', details: err.message });
  }
});

// PUT /api/schedules/:id - update schedule and its lines
schedulesRouter.put('/:id', authenticate, requireRole('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lines = [], isActive } = req.body;

    const existing = await prisma.workingSchedule.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const validLines = (Array.isArray(lines) ? lines : [])
      .filter((l) => validDays.includes(l.dayOfWeek) && l.startTime && l.endTime)
      .map((l) => ({
        dayOfWeek: l.dayOfWeek,
        startTime: String(l.startTime),
        endTime: String(l.endTime),
        breakMinutes: parseInt(l.breakMinutes, 10) || 60,
      }));

    // Update schedule & replace lines in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Delete old lines
      await tx.scheduleLine.deleteMany({ where: { scheduleId: id } });

      // Update schedule record
      return await tx.workingSchedule.update({
        where: { id },
        data: {
          name: name ? name.trim() : existing.name,
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
          lines: {
            create: validLines,
          },
        },
        include: {
          lines: true,
          _count: { select: { employees: true } },
        },
      });
    });

    const { processedLines, weeklyHours, workingDaysCount } = calculateScheduleHours(updated.lines);

    res.json({
      data: {
        ...updated,
        lines: processedLines,
        weeklyHours,
        workingDaysCount,
        assignedEmployeesCount: updated._count.employees,
      },
      message: 'Work schedule updated successfully',
    });
  } catch (err) {
    console.error('Error updating schedule:', err);
    res.status(500).json({ error: 'Failed to update schedule', details: err.message });
  }
});

// DELETE /api/schedules/:id - delete schedule
schedulesRouter.delete('/:id', authenticate, requireRole('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.workingSchedule.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Safely unassign employees before deletion
    await prisma.employee.updateMany({
      where: { scheduleId: id },
      data: { scheduleId: null },
    });

    // Delete schedule (Cascade removes schedule lines)
    await prisma.workingSchedule.delete({ where: { id } });

    res.json({
      success: true,
      message: `Schedule "${existing.name}" deleted successfully.`,
      id,
    });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Failed to delete schedule', details: err.message });
  }
});

// POST /api/schedules/:id/assign - bulk assign employees to this schedule
schedulesRouter.post('/:id/assign', authenticate, requireRole('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeIds = [], department } = req.body;

    const schedule = await prisma.workingSchedule.findUnique({ where: { id } });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const where = {};
    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      where.id = { in: employeeIds };
    } else if (department && department !== 'ALL') {
      where.department = department;
    } else {
      return res.status(400).json({ error: 'Please specify employee IDs or a department to assign' });
    }

    const result = await prisma.employee.updateMany({
      where,
      data: { scheduleId: id },
    });

    res.json({
      success: true,
      message: `Assigned ${result.count} employees to schedule "${schedule.name}"`,
      assignedCount: result.count,
    });
  } catch (err) {
    console.error('Error assigning employees to schedule:', err);
    res.status(500).json({ error: 'Failed to assign employees', details: err.message });
  }
});

export default schedulesRouter;
