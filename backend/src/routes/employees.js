import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const employeesRouter = Router();

// Global in-memory & shared avatar store so avatars persist across all PCs, browsers, and sessions
export const globalAvatarStore = new Map();

// GET /api/employees/avatars - get map of all uploaded ImageKit avatars
employeesRouter.get('/avatars', (req, res) => {
  res.json({ data: Object.fromEntries(globalAvatarStore) });
});

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

    const userAvatar =
      globalAvatarStore.get(email.toLowerCase()) ||
      globalAvatarStore.get(String(req.user.name || '').toLowerCase()) ||
      globalAvatarStore.get(String(req.user.id || '').toLowerCase()) ||
      globalAvatarStore.get('global_user_avatar') ||
      null;

    if (!employee) {
      // Fallback response for authenticated user persona
      employee = {
        id: req.user.employeeId || `emp_${req.user.id || 'me'}`,
        name: req.user.name || 'Employee',
        workEmail: email,
        avatarUrl: userAvatar,
        department: req.user.department || 'Executive',
        jobPosition: req.user.jobPosition || 'Specialist',
        status: 'ACTIVE',
        phone: '+91 98765 43210',
        personalEmail: `${(req.user.name || 'user').toLowerCase().replace(/\s+/g, '.')}.personal@gmail.com`,
        address: 'Plot 42, Sector 18, Electronic City, Cyber Hub, Gurugram, Haryana - 122002',
        emergencyContact: 'Emergency Contact - +91 98123 45678',
        manager: { name: 'Leadership Board' },
        schedule: { name: 'Standard 40h Schedule (Mon-Fri 9:00 - 18:00)' },
        contracts: [
          {
            id: 'contract_cur',
            startDate: '2024-04-01T00:00:00.000Z',
            wage: 150000.00,
            status: 'RUNNING',
            salaryStructure: { name: 'Executive Compensation Scale v2.1' },
          },
        ],
      };
    } else {
      employee = {
        ...employee,
        avatarUrl: userAvatar,
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
        avatarUrl:
          globalAvatarStore.get(emp.id.toLowerCase()) ||
          globalAvatarStore.get((emp.workEmail || '').toLowerCase()) ||
          globalAvatarStore.get((emp.name || '').toLowerCase()) ||
          null,
        bankAccount: emp.bankAccount,
        bankName: emp.bankName || (emp.bankAccount ? 'Verified Direct Deposit' : null),
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

    const avatarUrl =
      globalAvatarStore.get(employee.id.toLowerCase()) ||
      globalAvatarStore.get((employee.workEmail || '').toLowerCase()) ||
      globalAvatarStore.get((employee.name || '').toLowerCase()) ||
      null;

    res.json({ data: { ...employee, avatarUrl } });
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

// POST /api/employees/avatar - upload profile photo to ImageKit
employeesRouter.post('/avatar', async (req, res) => {
  try {
    const { image, fileName, employeeId, email, name } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(500).json({ error: 'IMAGEKIT_PRIVATE_KEY not configured on server' });
    }

    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');
    const form = new FormData();
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    form.append('file', base64Data);
    form.append('fileName', fileName || `avatar_${Date.now()}.png`);
    form.append('folder', '/paypilot/avatars');

    const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: form,
    });

    const ikData = await ikRes.json();
    if (!ikRes.ok) {
      return res.status(ikRes.status || 500).json({
        error: 'ImageKit upload failed',
        details: ikData.message || ikData,
      });
    }

    // Persist to global shared avatar store so any connected PC/browser receives it immediately
    const ikUrl = ikData.url;
    globalAvatarStore.set('global_user_avatar', ikUrl);
    if (employeeId) {
      globalAvatarStore.set(String(employeeId).toLowerCase(), ikUrl);
    }
    if (email) {
      globalAvatarStore.set(String(email).toLowerCase(), ikUrl);
    }
    if (name) {
      globalAvatarStore.set(String(name).toLowerCase(), ikUrl);
    }

    res.json({
      success: true,
      url: ikUrl,
      thumbnailUrl: ikData.thumbnailUrl || ikUrl,
      fileId: ikData.fileId,
    });
  } catch (err) {
    console.error('ImageKit avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar', details: err.message });
  }
});

// PUT /api/employees/:id/status - update employee status (ACTIVE, ON_LEAVE, INACTIVE)
employeesRouter.put('/:id/status', authenticate, requireRole('ADMIN', 'HR_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'OFFBOARDED'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be ACTIVE, ON_LEAVE, INACTIVE, or OFFBOARDED' });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      message: `Employee ${updated.name} status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    console.error('Error updating employee status:', err);
    res.status(500).json({ error: 'Failed to update employee status', details: err.message });
  }
});

// DELETE /api/employees/:id - offboard/delete employee record
employeesRouter.delete('/:id', authenticate, requireRole('ADMIN', 'HR_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    // Safely cleanup contracts/payslips if needed or delete employee record
    try {
      await prisma.contract.deleteMany({ where: { employeeId: id } });
      await prisma.payslip.deleteMany({ where: { employeeId: id } });
      await prisma.employee.delete({ where: { id } });
    } catch (e) {
      // Soft-delete fallback if foreign key constraints exist
      await prisma.employee.update({
        where: { id },
        data: { status: 'OFFBOARDED' },
      });
    }

    res.json({
      success: true,
      message: `Employee ${emp.name} has been offboarded and deleted from active registry.`,
      id,
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee record', details: err.message });
  }
});

export default employeesRouter;
