import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const employeesRouter = Router();

// GET /api/employees - list employees with contracts & smart counts
employeesRouter.get('/', authenticate, async (req, res) => {
  try {
    const { department, status, search, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const where = {};
    if (department) where.department = String(department);
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { workEmail: { contains: String(search), mode: 'insensitive' } },
        { department: { contains: String(search), mode: 'insensitive' } },
        { jobPosition: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [total, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          contracts: {
            where: { status: 'RUNNING' },
            take: 1,
            include: { salaryStructure: true },
          },
          schedule: true,
          _count: {
            select: {
              contracts: true,
              attendance: true,
              timeOffRequests: true,
              payslips: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Format for frontend
    const formatted = employees.map((emp) => {
      const parts = emp.name.split(' ');
      const firstName = parts[0] || 'Employee';
      const lastName = parts.slice(1).join(' ') || '';
      return {
        id: emp.id,
        firstName,
        lastName,
        name: emp.name,
        employeeNumber: `EMP-${emp.id.slice(-4).toUpperCase()}`,
        email: emp.workEmail,
        workEmail: emp.workEmail,
        department: emp.department,
        jobTitle: emp.jobPosition,
        jobPosition: emp.jobPosition,
        status: emp.status,
        bankAccountNo: emp.bankAccount,
        bankIfsc: emp.bankName ? 'YES' : null,
        contracts: emp.contracts,
        schedule: emp.schedule,
        _counts: emp._count,
      };
    });

    res.json({
      data: formatted,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  }
});

// GET /api/employees/:id - get single employee with details
employeesRouter.get('/:id', authenticate, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        contracts: {
          include: { salaryStructure: true },
          orderBy: { startDate: 'desc' },
        },
        schedule: { include: { lines: true } },
        manager: true,
        reports: true,
        timeOffAllocations: { include: { timeOffType: true } },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ data: employee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee', details: err.message });
  }
});

// POST /api/employees - create employee
employeesRouter.post('/', authenticate, async (req, res) => {
  try {
    const { name, workEmail, department, jobPosition, scheduleId, managerId, bankAccount, bankName } = req.body;

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'PayPilot Global Inc.' },
      });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        workEmail,
        department: department || 'Engineering',
        jobPosition: jobPosition || 'Software Engineer',
        scheduleId,
        managerId,
        bankAccount,
        bankName,
        orgId: org.id,
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ data: employee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create employee', details: err.message });
  }
});

export default employeesRouter;
