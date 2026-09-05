import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const loansRouter = Router();

// In-memory persistent loan registry with realistic seed data
let loansStore = [
  {
    id: 'LOAN-2026-001',
    employeeId: 'emp-kartik',
    employeeName: 'Kartik Kumar',
    employeeEmail: 'kartik.kumar@paypilot.internal',
    department: 'Product',
    jobPosition: 'Product Manager',
    loanType: 'MEDICAL_EMERGENCY',
    loanTypeName: 'Medical Emergency Advance',
    principalAmount: 120000,
    interestRatePercent: 0,
    tenureMonths: 12,
    monthlyEmi: 10000,
    paidInstallments: 4,
    totalPaidAmount: 40000,
    remainingBalance: 80000,
    deductionStartMonth: 'Jan 2026',
    disbursedDate: '2025-12-28',
    status: 'ACTIVE',
    reason: 'Family hospitalization emergency expenses assistance.',
    approvedBy: 'Meera Krishnan',
    approvedAt: '2025-12-29',
  },
  {
    id: 'LOAN-2026-002',
    employeeId: 'emp-ananya',
    employeeName: 'Ananya Iyer',
    employeeEmail: 'ananya.iyer@paypilot.internal',
    department: 'Engineering',
    jobPosition: 'Senior Frontend Engineer',
    loanType: 'RELOCATION',
    loanTypeName: 'Relocation & Housing Advance',
    principalAmount: 75000,
    interestRatePercent: 0,
    tenureMonths: 6,
    monthlyEmi: 12500,
    paidInstallments: 2,
    totalPaidAmount: 25000,
    remainingBalance: 50000,
    deductionStartMonth: 'Feb 2026',
    disbursedDate: '2026-01-20',
    status: 'ACTIVE',
    reason: 'Security deposit and moving allowance for Bangalore branch relocation.',
    approvedBy: 'Meera Krishnan',
    approvedAt: '2026-01-21',
  },
  {
    id: 'LOAN-2026-003',
    employeeId: 'emp-devendra',
    employeeName: 'Devendra Rao',
    employeeEmail: 'devendra.rao@paypilot.internal',
    department: 'Engineering',
    jobPosition: 'Lead Cloud Architect',
    loanType: 'EDUCATION_CERTIFICATION',
    loanTypeName: 'AWS Solutions Master Certification Loan',
    principalAmount: 60000,
    interestRatePercent: 0,
    tenureMonths: 6,
    monthlyEmi: 10000,
    paidInstallments: 1,
    totalPaidAmount: 10000,
    remainingBalance: 50000,
    deductionStartMonth: 'Mar 2026',
    disbursedDate: '2026-02-15',
    status: 'ACTIVE',
    reason: 'Executive Cloud Architecture specialization training program.',
    approvedBy: 'Meera Krishnan',
    approvedAt: '2026-02-16',
  },
  {
    id: 'LOAN-2026-004',
    employeeId: 'emp-tanvi',
    employeeName: 'Tanvi Kapoor',
    employeeEmail: 'tanvi.kapoor@paypilot.internal',
    department: 'Product',
    jobPosition: 'Senior UI/UX Designer',
    loanType: 'SALARY_ADVANCE',
    loanTypeName: 'Short-Term Salary Advance',
    principalAmount: 30000,
    interestRatePercent: 0,
    tenureMonths: 3,
    monthlyEmi: 10000,
    paidInstallments: 0,
    totalPaidAmount: 0,
    remainingBalance: 30000,
    deductionStartMonth: 'Apr 2026',
    disbursedDate: null,
    status: 'PENDING_APPROVAL',
    reason: 'Personal festival advance against upcoming quarterly appraisal.',
    approvedBy: null,
    approvedAt: null,
  },
  {
    id: 'LOAN-2026-005',
    employeeId: 'emp-sneha',
    employeeName: 'Sneha Nair',
    employeeEmail: 'sneha.nair@paypilot.internal',
    department: 'Quality Assurance',
    jobPosition: 'Staff QA Engineer',
    loanType: 'PERSONAL_LOAN',
    loanTypeName: 'Personal Emergency Advance',
    principalAmount: 40000,
    interestRatePercent: 0,
    tenureMonths: 4,
    monthlyEmi: 10000,
    paidInstallments: 0,
    totalPaidAmount: 0,
    remainingBalance: 40000,
    deductionStartMonth: 'Apr 2026',
    disbursedDate: null,
    status: 'PENDING_APPROVAL',
    reason: 'Home appliance repair and essential medical testing costs.',
    approvedBy: null,
    approvedAt: null,
  },
  {
    id: 'LOAN-2026-006',
    employeeId: 'emp-rohan',
    employeeName: 'Rohan Verma',
    employeeEmail: 'rohan.verma@paypilot.internal',
    department: 'Engineering',
    jobPosition: 'Backend Core Specialist',
    loanType: 'EQUIPMENT_BUYBACK',
    loanTypeName: 'Workstation Buyback Advance',
    principalAmount: 50000,
    interestRatePercent: 0,
    tenureMonths: 5,
    monthlyEmi: 10000,
    paidInstallments: 5,
    totalPaidAmount: 50000,
    remainingBalance: 0,
    deductionStartMonth: 'Oct 2025',
    disbursedDate: '2025-09-30',
    status: 'SETTLED',
    reason: 'Company MacBook Pro 16 buyback program scheme.',
    approvedBy: 'Meera Krishnan',
    approvedAt: '2025-10-01',
  },
];

// Helper to compute summary statistics
function getSummaryStats(loans) {
  const totalDisbursed = loans.reduce((sum, l) => sum + (l.status !== 'REJECTED' ? l.principalAmount : 0), 0);
  const totalRecovered = loans.reduce((sum, l) => sum + l.totalPaidAmount, 0);
  const outstandingBalance = loans
    .filter((l) => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + l.remainingBalance, 0);
  const monthlyEmiRecovery = loans
    .filter((l) => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + l.monthlyEmi, 0);

  const activeCount = loans.filter((l) => l.status === 'ACTIVE').length;
  const pendingCount = loans.filter((l) => l.status === 'PENDING_APPROVAL').length;
  const settledCount = loans.filter((l) => l.status === 'SETTLED').length;

  return {
    totalDisbursed,
    totalRecovered,
    outstandingBalance,
    monthlyEmiRecovery,
    activeCount,
    pendingCount,
    settledCount,
    totalLoans: loans.length,
  };
}

// GET /api/loans - list all loans or filter by status/employee
loansRouter.get('/', authenticate, async (req, res) => {
  try {
    const { status, employeeId, search } = req.query;
    let filtered = [...loansStore];

    if (status && status !== 'ALL') {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (employeeId) {
      filtered = filtered.filter((l) => l.employeeId === employeeId || l.employeeEmail === req.user.email);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.department.toLowerCase().includes(q) ||
          l.loanTypeName.toLowerCase().includes(q)
      );
    }

    const stats = getSummaryStats(loansStore);
    res.json({ success: true, data: filtered, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loans', details: err.message });
  }
});

// POST /api/loans - apply for or grant a new loan
loansRouter.post('/', authenticate, async (req, res) => {
  try {
    const {
      employeeName,
      employeeEmail,
      department,
      jobPosition,
      loanType,
      loanTypeName,
      principalAmount,
      tenureMonths,
      deductionStartMonth,
      reason,
    } = req.body;

    const principal = parseFloat(principalAmount) || 25000;
    const tenure = parseInt(tenureMonths, 10) || 6;
    const monthlyEmi = Math.round(principal / tenure);

    const isManager = ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'].includes(req.user.role);

    const newLoan = {
      id: `LOAN-2026-${String(loansStore.length + 1).padStart(3, '0')}`,
      employeeId: req.user.employeeId || `emp-${Date.now()}`,
      employeeName: employeeName || req.user.name || 'Employee',
      employeeEmail: employeeEmail || req.user.email,
      department: department || 'General',
      jobPosition: jobPosition || 'Specialist',
      loanType: loanType || 'SALARY_ADVANCE',
      loanTypeName: loanTypeName || 'Salary Advance Request',
      principalAmount: principal,
      interestRatePercent: 0,
      tenureMonths: tenure,
      monthlyEmi: monthlyEmi,
      paidInstallments: 0,
      totalPaidAmount: 0,
      remainingBalance: principal,
      deductionStartMonth: deductionStartMonth || 'Apr 2026',
      disbursedDate: isManager ? new Date().toISOString().split('T')[0] : null,
      status: isManager ? 'ACTIVE' : 'PENDING_APPROVAL',
      reason: reason || 'Salary advance / loan requested.',
      approvedBy: isManager ? req.user.name || 'Meera Krishnan' : null,
      approvedAt: isManager ? new Date().toISOString().split('T')[0] : null,
    };

    loansStore.unshift(newLoan);
    res.status(201).json({
      success: true,
      message: isManager ? 'Loan sanctioned and activated successfully' : 'Loan application submitted for HR approval',
      data: newLoan,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create loan', details: err.message });
  }
});

// PUT /api/loans/:id/status - approve, reject, or settle a loan
loansRouter.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // 'ACTIVE', 'REJECTED', 'SETTLED'

    const loanIndex = loansStore.findIndex((l) => l.id === id);
    if (loanIndex === -1) {
      return res.status(404).json({ error: 'Loan record not found' });
    }

    const loan = loansStore[loanIndex];
    loan.status = status;

    if (status === 'ACTIVE') {
      loan.approvedBy = req.user.name || 'Meera Krishnan';
      loan.approvedAt = new Date().toISOString().split('T')[0];
      if (!loan.disbursedDate) {
        loan.disbursedDate = new Date().toISOString().split('T')[0];
      }
    } else if (status === 'SETTLED') {
      loan.paidInstallments = loan.tenureMonths;
      loan.totalPaidAmount = loan.principalAmount;
      loan.remainingBalance = 0;
    }

    loansStore[loanIndex] = loan;

    res.json({
      success: true,
      message: `Loan ${id} status updated to ${status}`,
      data: loan,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update loan status', details: err.message });
  }
});
