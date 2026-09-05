import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { invalidateCache } from '../lib/redis';

export const employeesRouter = Router();

// List all employees with active contract and schedule
employeesRouter.get('/', authenticate, async (req, res) => {
  try {
    const { department, status, search } = req.query;

    const employees = await prisma.employee.findMany({
      where: {
        department: department ? String(department) : undefined,
        status: status ? (status as any) : undefined,
        OR: search
          ? [
              { name: { contains: String(search), mode: 'insensitive' } },
              { workEmail: { contains: String(search), mode: 'insensitive' } },
              { jobPosition: { contains: String(search), mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        contracts: {
          where: { status: 'RUNNING' },
          take: 1,
        },
        schedule: true,
        manager: {
          select: { id: true, name: true, workEmail: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ data: employees });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get employee by ID with full profile
employeesRouter.get('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id as string;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        contracts: { orderBy: { createdAt: 'desc' } },
        schedule: { include: { lines: true } },
        timeOffAllocations: { include: { timeOffType: true } },
        manager: true,
        reports: true,
      },
    });

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json({ data: employee });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create employee
employeesRouter.post('/', authenticate, requireRole('ADMIN', 'HR_OFFICER'), async (req, res) => {
  try {
    const { name, workEmail, department, jobPosition, managerId, bankAccount, bankName, scheduleId } = req.body;

    if (!name || !workEmail || !department || !jobPosition) {
      res.status(400).json({ error: 'Missing required fields (name, workEmail, department, jobPosition)' });
      return;
    }

    const org = await prisma.organization.findFirst();
    if (!org) {
      res.status(400).json({ error: 'No active organization found' });
      return;
    }

    const newEmployee = await prisma.employee.create({
      data: {
        name,
        workEmail,
        department,
        jobPosition,
        managerId: managerId || null,
        bankAccount: bankAccount || null,
        bankName: bankName || null,
        scheduleId: scheduleId || null,
        orgId: org.id,
      },
    });

    await invalidateCache('kpi:*');
    res.status(201).json({ data: newEmployee });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update employee
employeesRouter.patch('/:id', authenticate, requireRole('ADMIN', 'HR_OFFICER'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.employee.update({
      where: { id },
      data: req.body,
    });

    await invalidateCache('kpi:*');
    res.json({ data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
