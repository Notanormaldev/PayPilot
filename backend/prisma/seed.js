import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Seed] Starting comprehensive PayPilot database seeding...');

  // 1. Organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'PayPilot Global Inc.',
        timezone: 'Asia/Kolkata',
      },
    });
  }
  console.log(`✅ [Org] Organization: ${org.name}`);

  // 2. Working Schedule
  let schedule = await prisma.workingSchedule.findFirst({
    where: { orgId: org.id },
  });
  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        name: 'Standard 40h (Mon-Fri 09:00 - 18:00)',
        orgId: org.id,
        isActive: true,
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
  }
  console.log(`✅ [Schedule] Schedule: ${schedule.name}`);

  // 3. Salary Structure & Rules
  let structure = await prisma.salaryStructure.findFirst({
    include: { rules: true },
  });

  if (!structure) {
    structure = await prisma.salaryStructure.create({
      data: {
        name: 'Standard Indian Statutory Compensation (2026)',
        isActive: true,
        rules: {
          create: [
            { name: 'Basic Pay', code: 'BASIC', category: 'BASIC', sequence: 10, computationMethod: 'PERCENTAGE', percentageOf: 'WAGE', percentageValue: 0.50 },
            { name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', sequence: 20, computationMethod: 'PERCENTAGE', percentageOf: 'BASIC', percentageValue: 0.40 },
            { name: 'Special Allowance', code: 'SPECIAL_ALLOWANCE', category: 'ALLOWANCE', sequence: 30, computationMethod: 'PERCENTAGE', percentageOf: 'WAGE', percentageValue: 0.30 },
            { name: 'Employees Provident Fund', code: 'EPF', category: 'DEDUCTION', sequence: 40, computationMethod: 'PERCENTAGE', percentageOf: 'BASIC', percentageValue: 0.12 },
            { name: 'Employee State Insurance', code: 'ESI', category: 'DEDUCTION', sequence: 50, computationMethod: 'PERCENTAGE', percentageOf: 'BASIC', percentageValue: 0.0075 },
            { name: 'Tax Deducted at Source', code: 'TDS', category: 'DEDUCTION', sequence: 60, computationMethod: 'PERCENTAGE', percentageOf: 'WAGE', percentageValue: 0.08 },
          ],
        },
      },
      include: { rules: true },
    });
  }
  console.log(`✅ [Structure] Structure: ${structure.name} with ${structure.rules.length} rules`);

  const ruleMap = {};
  for (const r of structure.rules) {
    ruleMap[r.code] = r.id;
  }

  // 4. Time Off Types
  let ptoType = await prisma.timeOffType.findFirst({ where: { name: { contains: 'Paid Time Off' } } });
  if (!ptoType) {
    ptoType = await prisma.timeOffType.create({
      data: {
        name: 'Paid Time Off (PTO)',
        unit: 'DAYS',
        requiresAllocation: true,
        requiresApproval: true,
        affectsPayroll: true,
      },
    });
  }

  // 5. Employees & Active Contracts
  const employeeData = [
    { name: 'Meera Krishnan', email: 'meera.krishnan@paypilot.internal', dept: 'Executive', role: 'Chief People & Payroll Officer', wage: 220000, bank: 'HDFC0001829' },
    { name: 'Aarav Mehta', email: 'aarav.mehta@paypilot.internal', dept: 'Engineering', role: 'VP of Engineering', wage: 250000, bank: 'ICIC0009281' },
    { name: 'Priya Sharma', email: 'priya.sharma@paypilot.internal', dept: 'Engineering', role: 'Lead Frontend Architect', wage: 165000, bank: 'SBIN0004123' },
    { name: 'Rohan Verma', email: 'rohan.verma@paypilot.internal', dept: 'Engineering', role: 'Senior Backend Engineer', wage: 140000, bank: 'KKBK0001928' },
    { name: 'Kartik Kumar', email: 'kartik.kumar@paypilot.internal', dept: 'Product', role: 'Staff Product Manager', wage: 155000, bank: 'HDFC0008812' },
    { name: 'Ananya Iyer', email: 'ananya.iyer@paypilot.internal', dept: 'Product', role: 'Senior UI/UX Designer', wage: 120000, bank: 'UTIB0001092' },
    { name: 'Vikram Patel', email: 'vikram.patel@paypilot.internal', dept: 'Infrastructure', role: 'Lead DevOps Architect', wage: 145000, bank: 'YESB0000182' },
    { name: 'Neha Gupta', email: 'neha.gupta@paypilot.internal', dept: 'HR & People', role: 'Senior Payroll Specialist', wage: 85000, bank: null },
    { name: 'Devendra Rao', email: 'devendra.rao@paypilot.internal', dept: 'Legal & Audit', role: 'Compliance Officer', wage: 95000, bank: 'HDFC0002738' },
    { name: 'Sneha Nair', email: 'sneha.nair@paypilot.internal', dept: 'Finance', role: 'Financial Controller', wage: 115000, bank: 'ICIC0003819' },
    { name: 'Aditya Joshi', email: 'aditya.joshi@paypilot.internal', dept: 'Engineering', role: 'Full Stack Engineer', wage: 85000, bank: 'SBIN0001928' },
    { name: 'Tanvi Kapoor', email: 'tanvi.kapoor@paypilot.internal', dept: 'HR & People', role: 'People Operations Lead', wage: 110000, bank: 'HDFC0007281' },
    { name: 'Arjun Reddy', email: 'arjun.reddy@paypilot.internal', dept: 'Sales', role: 'Enterprise Account Executive', wage: 130000, bank: 'UTIB0009827' },
    { name: 'Pooja Menon', email: 'pooja.menon@paypilot.internal', dept: 'Customer Success', role: 'Client Operations Manager', wage: 75000, bank: 'KKBK0008271' },
    { name: 'Sanjay Singhania', email: 'sanjay.singhania@paypilot.internal', dept: 'Operations', role: 'Logistics Lead', wage: 90000, bank: 'YESB0007621' },
  ];

  const createdEmployees = [];

  for (const emp of employeeData) {
    let created = await prisma.employee.findUnique({ where: { workEmail: emp.email } });
    if (!created) {
      created = await prisma.employee.create({
        data: {
          name: emp.name,
          workEmail: emp.email,
          department: emp.dept,
          jobPosition: emp.role,
          scheduleId: schedule.id,
          orgId: org.id,
          status: 'ACTIVE',
          bankAccount: emp.bank ? `AC-99${Math.floor(100000 + Math.random() * 900000)}` : null,
          bankName: emp.bank ? `Bank Ref: ${emp.bank}` : null,
        },
      });
    }

    createdEmployees.push(created);

    // Contract
    let contract = await prisma.contract.findFirst({
      where: { employeeId: created.id, status: 'RUNNING' },
    });
    if (!contract) {
      contract = await prisma.contract.create({
        data: {
          employeeId: created.id,
          startDate: new Date('2026-01-01'),
          wage: emp.wage,
          department: emp.dept,
          jobPosition: emp.role,
          salaryStructureId: structure.id,
          status: 'RUNNING',
        },
      });
    }

    // Leave Allocation
    let allocation = await prisma.timeOffAllocation.findFirst({
      where: { employeeId: created.id, timeOffTypeId: ptoType.id },
    });
    if (!allocation) {
      await prisma.timeOffAllocation.create({
        data: {
          employeeId: created.id,
          timeOffTypeId: ptoType.id,
          allocated: 24.0,
          taken: 2.0,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
          status: 'active',
        },
      });
    }
  }

  console.log(`✅ [Employees] Synced ${createdEmployees.length} active enterprise employees`);

  // 6. Payrun & Payslips
  let payrun = await prisma.payrun.findFirst({
    where: { name: { contains: 'September 2026' } },
  });

  if (!payrun) {
    payrun = await prisma.payrun.create({
      data: {
        name: 'September 2026 Standard Payroll Run',
        salaryStructureId: structure.id,
        periodStart: new Date('2026-09-01'),
        periodEnd: new Date('2026-09-30'),
        status: 'COMPUTED',
      },
    });
  }

  for (const emp of createdEmployees) {
    const contract = await prisma.contract.findFirst({
      where: { employeeId: emp.id, status: 'RUNNING' },
    });

    if (contract) {
      let slip = await prisma.payslip.findUnique({
        where: {
          payrunId_employeeId: {
            payrunId: payrun.id,
            employeeId: emp.id,
          },
        },
        include: { lines: true },
      });

      const wage = Number(contract.wage);
      const basic = wage * 0.5;
      const hra = basic * 0.4;
      const special = wage * 0.3;
      const epf = basic * 0.12;
      const esi = basic * 0.0075;
      const tds = wage * 0.08;

      if (!slip) {
        slip = await prisma.payslip.create({
          data: {
            payrunId: payrun.id,
            employeeId: emp.id,
            contractId: contract.id,
            workedDays: 22.0,
            status: 'COMPUTED',
          },
        });

        // Insert Lines with correct salaryRuleId
        const linesData = [
          { code: 'BASIC', name: 'Basic Pay', category: 'BASIC', sequence: 10, amount: basic, salaryRuleId: ruleMap['BASIC'] },
          { code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', sequence: 20, amount: hra, salaryRuleId: ruleMap['HRA'] },
          { code: 'SPECIAL_ALLOWANCE', name: 'Special Allowance', category: 'ALLOWANCE', sequence: 30, amount: special, salaryRuleId: ruleMap['SPECIAL_ALLOWANCE'] },
          { code: 'EPF', name: 'Provident Fund (EPF)', category: 'DEDUCTION', sequence: 40, amount: epf, salaryRuleId: ruleMap['EPF'] },
          { code: 'ESI', name: 'State Insurance (ESI)', category: 'DEDUCTION', sequence: 50, amount: esi, salaryRuleId: ruleMap['ESI'] },
          { code: 'TDS', name: 'Tax Deducted at Source', category: 'DEDUCTION', sequence: 60, amount: tds, salaryRuleId: ruleMap['TDS'] },
        ].filter((l) => l.salaryRuleId);

        for (const line of linesData) {
          await prisma.payslipLine.create({
            data: {
              payslipId: slip.id,
              code: line.code,
              name: line.name,
              category: line.category,
              sequence: line.sequence,
              amount: line.amount,
              salaryRuleId: line.salaryRuleId,
            },
          });
        }
      }

      // Sentinel Flags
      if (!emp.bankAccount) {
        const flag = await prisma.sentinelFlag.findFirst({
          where: { payslipId: slip.id, flagType: 'MISSING_BANK_DETAILS' },
        });

        if (!flag) {
          await prisma.sentinelFlag.create({
            data: {
              payslipId: slip.id,
              flagType: 'MISSING_BANK_DETAILS',
              severity: 'HIGH',
              deterministicReasonJson: { issue: `Employee ${emp.name} has no registered banking credentials on record.` },
              aiExplanation: `Executive Notice: Direct deposit cannot be completed for ${emp.name}. Action required to supply verified IFSC & account coordinates.`,
              status: 'OPEN',
            },
          });
        }
      }
    }
  }

  console.log('🏁 [Seed] Real database population completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
