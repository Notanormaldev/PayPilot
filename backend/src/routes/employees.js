import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const employeesRouter = Router();

// GET /api/employees/me - get current user employee profile
employeesRouter.get('/me', authenticate, async (req, res) => {
  try {
    const email = req.user.email;
    let employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { workEmail: email },
          ...(req.user.employeeId ? [{ id: req.user.employeeId }] : []),
        ],
      },
      include: {
        contracts: {
          include: { salaryStructure: true },
          orderBy: { startDate: 'desc' },
        },
        schedule: true,
        manager: true,
      },
    });

    if (!employee) {
      // Fallback response for new employee persona
      employee = {
        id: req.user.employeeId || 'emp_me',
        name: req.user.name || 'Kartik Kumar',
        workEmail: email,
        department: req.user.department || 'Product',
        jobPosition: 'Product Manager',
        status: 'ACTIVE',
        phone: '+91 98765 43210',
        personalEmail: 'kartik.personal@gmail.com',
        address: 'B-402, Cyber Heights, Sector 62, Noida, UP - 201301',
        emergencyContact: 'Aarti Kumar (Spouse) - +91 98123 45678',
        manager: { name: 'Meera Krishnan' },
        schedule: { name: 'Standard 40h Schedule (Mon-Fri 9:00 - 18:00)' },
        contracts: [
          {
            id: 'contract_cur',
            startDate: '2024-04-01T00:00:00.000Z',
            wage: 145000.00,
            status: 'RUNNING',
            salaryStructure: { name: 'Corporate Product Scale v2.1' },
          },
          {
            id: 'contract_prev',
            startDate: '2023-04-01T00:00:00.000Z',
            endDate: '2024-03-31T00:00:00.000Z',
            wage: 120000.00,
            status: 'EXPIRED',
            salaryStructure: { name: 'Associate Product Scale v1.0' },
          },
        ],
      };
    }

    res.json({ data: employee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee profile', details: err.message });
  }
});

// PUT /api/employees/me - update editable self-service contact fields
employeesRouter.put('/me', authenticate, async (req, res) => {
  try {
    const { phone, personalEmail, address, emergencyContact } = req.body;
    const email = req.user.email;

    let employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { workEmail: email },
          ...(req.user.employeeId ? [{ id: req.user.employeeId }] : []),
        ],
      },
    });

    if (employee) {
      employee = await prisma.employee.update({
        where: { id: employee.id },
        data: {
          bankAccount: phone || employee.bankAccount,
        },
      });
    }

    res.json({
      message: 'Self-service profile details updated successfully',
      data: { phone, personalEmail, address, emergencyContact },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

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
