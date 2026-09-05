import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { computeSalaryRules } from '../src/lib/payroll-engine';
import { runSentinelAudit } from '../src/lib/sentinel';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PayPilot demo seed for hackathon story...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { id: 'org_oxp_demo' },
    update: {},
    create: {
      id: 'org_oxp_demo',
      name: 'OXP Technologies Pvt Ltd',
      timezone: 'Asia/Kolkata',
    },
  });

  // 2. Working Schedule
  const schedule = await prisma.workingSchedule.upsert({
    where: { id: 'sched_standard_40h' },
    update: {},
    create: {
      id: 'sched_standard_40h',
      name: 'Standard 40h Work Week (Mon-Fri)',
      orgId: org.id,
      lines: {
        create: [
          { dayOfWeek: 'MON', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
          { dayOfWeek: 'TUE', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
          { dayOfWeek: 'WED', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
          { dayOfWeek: 'THU', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
          { dayOfWeek: 'FRI', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
        ],
      },
    },
  });

  // 3. Time Off Types
  const paidLeave = await prisma.timeOffType.upsert({
    where: { id: 'leave_paid' },
    update: {},
    create: { id: 'leave_paid', name: 'Paid Annual Leave', unit: 'DAYS', affectsPayroll: true },
  });

  const sickLeave = await prisma.timeOffType.upsert({
    where: { id: 'leave_sick' },
    update: {},
    create: { id: 'leave_sick', name: 'Sick Leave', unit: 'DAYS', affectsPayroll: false },
  });

  // 4. Salary Structure & Rules
  const structure = await prisma.salaryStructure.upsert({
    where: { id: 'struct_corporate_standard' },
    update: {},
    create: {
      id: 'struct_corporate_standard',
      name: 'Corporate Standard India CTC Structure',
      rules: {
        create: [
          {
            name: 'Basic Salary',
            code: 'BASIC',
            category: 'BASIC',
            sequence: 10,
            computationMethod: 'FORMULA',
            formulaExpression: 'wage * 0.5',
          },
          {
            name: 'House Rent Allowance',
            code: 'HRA',
            category: 'ALLOWANCE',
            sequence: 20,
            computationMethod: 'FORMULA',
            formulaExpression: 'BASIC * 0.5',
          },
          {
            name: 'Special Allowance',
            code: 'SPL_ALW',
            category: 'ALLOWANCE',
            sequence: 30,
            computationMethod: 'FORMULA',
            formulaExpression: 'wage - BASIC - HRA',
          },
          {
            name: 'Gross Earnings',
            code: 'GROSS',
            category: 'GROSS',
            sequence: 40,
            computationMethod: 'FORMULA',
            formulaExpression: 'BASIC + HRA + SPL_ALW',
          },
          {
            name: 'Provident Fund',
            code: 'PF',
            category: 'DEDUCTION',
            sequence: 50,
            computationMethod: 'FORMULA',
            formulaExpression: 'BASIC * 0.12',
          },
          {
            name: 'Professional Tax',
            code: 'PT',
            category: 'DEDUCTION',
            sequence: 60,
            computationMethod: 'FIXED',
            amount: 200,
          },
          {
            name: 'Net Pay',
            code: 'NET',
            category: 'NET',
            sequence: 100,
            computationMethod: 'FORMULA',
            formulaExpression: 'GROSS - PF - PT',
          },
        ],
      },
    },
  });

  // 5. Employees & Contracts
  const demoEmployees = [
    {
      id: 'emp_aarav_mehta',
      name: 'Aarav Mehta',
      workEmail: 'aarav.mehta@oxp.internal',
      department: 'Finance',
      jobPosition: 'Finance Controller',
      bankAccount: 'HDFC000192837482',
      bankName: 'HDFC Bank',
      wage: 150000,
    },
    {
      id: 'emp_sara_khan',
      name: 'Sara Khan',
      workEmail: 'sara.khan@oxp.internal',
      department: 'Human Resources',
      jobPosition: 'Senior HR Specialist',
      bankAccount: 'ICIC000982736412',
      bankName: 'ICICI Bank',
      wage: 95000,
    },
    {
      id: 'emp_john_dsouza',
      name: 'John Dsouza',
      workEmail: 'john.dsouza@oxp.internal',
      department: 'Engineering',
      jobPosition: 'Senior Staff Engineer',
      bankAccount: null, // Placed deliberately to trigger Sentinel MISSING_BANK_DETAILS
      bankName: null,
      wage: 220000,
    },
    {
      id: 'emp_neha_patel',
      name: 'Neha Patel',
      workEmail: 'neha.patel@oxp.internal',
      department: 'Human Resources',
      jobPosition: 'HR Generalist',
      bankAccount: 'SBIN000492817263',
      bankName: 'State Bank of India',
      wage: 75000,
    },
    {
      id: 'emp_vikram_malhotra',
      name: 'Vikram Malhotra',
      workEmail: 'vikram.m@oxp.internal',
      department: 'Engineering',
      jobPosition: 'VP of Technology',
      bankAccount: 'KKBK000182736452',
      bankName: 'Kotak Mahindra',
      wage: 320000,
    },
    {
      id: 'emp_ananya_sharma',
      name: 'Ananya Sharma',
      workEmail: 'ananya.s@oxp.internal',
      department: 'Engineering',
      jobPosition: 'Fullstack Engineer',
      bankAccount: 'AXIS000827364512',
      bankName: 'Axis Bank',
      wage: 110000,
    },
    {
      id: 'emp_rohan_verma',
      name: 'Rohan Verma',
      workEmail: 'rohan.v@oxp.internal',
      department: 'Sales',
      jobPosition: 'VP Sales & Growth',
      bankAccount: 'HDFC000837462512',
      bankName: 'HDFC Bank',
      wage: 180000,
    },
    {
      id: 'emp_pooja_nair',
      name: 'Pooja Nair',
      workEmail: 'pooja.n@oxp.internal',
      department: 'Finance',
      jobPosition: 'Senior Payroll Analyst',
      bankAccount: 'ICIC000172635489',
      bankName: 'ICICI Bank',
      wage: 85000,
    },
  ];

  for (const empData of demoEmployees) {
    const emp = await prisma.employee.upsert({
      where: { id: empData.id },
      update: {
        bankAccount: empData.bankAccount,
        bankName: empData.bankName,
      },
      create: {
        id: empData.id,
        name: empData.name,
        workEmail: empData.workEmail,
        department: empData.department,
        jobPosition: empData.jobPosition,
        bankAccount: empData.bankAccount,
        bankName: empData.bankName,
        scheduleId: schedule.id,
        orgId: org.id,
      },
    });

    // Create RUNNING contract
    await prisma.contract.upsert({
      where: { id: `contract_${emp.id}` },
      update: {},
      create: {
        id: `contract_${emp.id}`,
        employeeId: emp.id,
        startDate: new Date('2026-01-01'),
        wage: empData.wage,
        department: emp.department,
        jobPosition: emp.jobPosition,
        salaryStructureId: structure.id,
        status: 'RUNNING',
      },
    });

    // Allocate Paid Leaves
    await prisma.timeOffAllocation.upsert({
      where: { id: `alloc_${emp.id}_paid` },
      update: {},
      create: {
        id: `alloc_${emp.id}_paid`,
        employeeId: emp.id,
        timeOffTypeId: paidLeave.id,
        allocated: 20,
        taken: 2,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
      },
    });
  }

  // 6. Current Payrun for Demo (September 2026)
  const payrun = await prisma.payrun.upsert({
    where: { id: 'payrun_sep_2026' },
    update: {},
    create: {
      id: 'payrun_sep_2026',
      name: 'September 2026 Monthly Payroll',
      salaryStructureId: structure.id,
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-09-30'),
      status: 'COMPUTED',
    },
  });

  // Compute slips for payrun
  const rules = await prisma.salaryRule.findMany({
    where: { structureId: structure.id, isActive: true },
    orderBy: { sequence: 'asc' },
  });

  for (const empData of demoEmployees) {
    const lines = computeSalaryRules(rules, {
      wage: empData.wage,
      worked_days: 22,
      scheduled_days: 22,
    });

    const slip = await prisma.payslip.upsert({
      where: {
        payrunId_employeeId: {
          payrunId: payrun.id,
          employeeId: empData.id,
        },
      },
      update: {},
      create: {
        payrunId: payrun.id,
        employeeId: empData.id,
        contractId: `contract_${empData.id}`,
        workedDays: 22,
        status: 'COMPUTED',
        lines: {
          create: lines.map((l) => ({
            salaryRuleId: l.ruleId,
            code: l.code,
            name: l.name,
            category: l.category,
            sequence: l.sequence,
            amount: l.amount,
          })),
        },
      },
    });

    // Run Sentinel audit on every payslip!
    await runSentinelAudit(slip.id);
  }

  console.log('✅ Demo seed finished successfully! Seeded organization, employees, contracts, payrun, and Sentinel audit flags.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
