import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function seedTaxPostgres() {
  console.log('Seeding Indian Income Tax Rules into PostgreSQL Database (odoo_5sg1)...');

  // 1. Create Financial Year
  const fy2026 = await prisma.taxFinancialYear.upsert({
    where: { financialYear: 'FY 2026-27' },
    update: {},
    create: {
      id: 'FY_2026_27',
      financialYear: 'FY 2026-27',
      assessmentYear: 'AY 2027-28',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
      active: true,
    },
  });

  console.log('✔ TaxFinancialYear created:', fy2026.financialYear);

  // 2. Create Tax Regimes
  const newRegime = await prisma.taxRegime.upsert({
    where: { id: 'REGIME_NEW_2026_27' },
    update: {},
    create: {
      id: 'REGIME_NEW_2026_27',
      financialYearId: fy2026.id,
      regimeCode: 'NEW',
      regimeName: 'New Tax Regime (u/s 115BAC)',
      standardDeduction: 75000,
      isDefault: true,
      description: 'Default concessional regime with simplified tax slabs, Rs. 75k standard deduction, and Section 87A rebate up to Rs. 12 Lakhs.',
      active: true,
    },
  });

  const oldRegime = await prisma.taxRegime.upsert({
    where: { id: 'REGIME_OLD_2026_27' },
    update: {},
    create: {
      id: 'REGIME_OLD_2026_27',
      financialYearId: fy2026.id,
      regimeCode: 'OLD',
      regimeName: 'Old Tax Regime (With Chapter VI-A Deductions)',
      standardDeduction: 50000,
      isDefault: false,
      description: 'Traditional regime permitting Section 80C, 80D, HRA, NPS, and Home Loan interest deductions.',
      active: true,
    },
  });

  console.log('✔ TaxRegimes created:', newRegime.regimeCode, oldRegime.regimeCode);

  // 3. Create Tax Slabs (FY 2026-27 New Regime)
  const slabs = [
    { id: 'NS_1', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 0, maxIncome: 400000, taxRate: 0, fixedTax: 0, priority: 1 },
    { id: 'NS_2', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 400000, maxIncome: 800000, taxRate: 5, fixedTax: 0, priority: 2 },
    { id: 'NS_3', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 800000, maxIncome: 1200000, taxRate: 10, fixedTax: 20000, priority: 3 },
    { id: 'NS_4', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 1200000, maxIncome: 1600000, taxRate: 15, fixedTax: 60000, priority: 4 },
    { id: 'NS_5', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 1600000, maxIncome: 2000000, taxRate: 20, fixedTax: 120000, priority: 5 },
    { id: 'NS_6', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 2000000, maxIncome: 2400000, taxRate: 25, fixedTax: 200000, priority: 6 },
    { id: 'NS_7', regimeId: newRegime.id, ageCategory: 'ALL', minIncome: 2400000, maxIncome: null, taxRate: 30, fixedTax: 300000, priority: 7 },
  ];

  for (const s of slabs) {
    await prisma.taxSlab.upsert({
      where: { id: s.id },
      update: { taxRate: s.taxRate, minIncome: s.minIncome, maxIncome: s.maxIncome },
      create: {
        id: s.id,
        regimeId: s.regimeId,
        ageCategory: s.ageCategory,
        minIncome: s.minIncome,
        maxIncome: s.maxIncome,
        taxRate: s.taxRate,
        fixedTax: s.fixedTax,
        priority: s.priority,
        formulaType: 'SLAB_CALCULATION',
        active: true,
      },
    });
  }

  console.log(`✔ ${slabs.length} TaxSlab rows created in PostgreSQL`);

  // 4. Create Deductions
  const deductions = [
    { id: 'DED_80C', regimeId: oldRegime.id, sectionCode: '80C', name: 'Section 80C (PPF, EPF, ELSS, Insurance)', maximumAmount: 150000 },
    { id: 'DED_80D', regimeId: oldRegime.id, sectionCode: '80D', name: 'Section 80D (Health Insurance Premium)', maximumAmount: 75000 },
    { id: 'DED_80CCD1B', regimeId: oldRegime.id, sectionCode: '80CCD(1B)', name: 'Section 80CCD(1B) (NPS Voluntary)', maximumAmount: 50000 },
    { id: 'DED_24B', regimeId: oldRegime.id, sectionCode: '24(b)', name: 'Section 24(b) (Home Loan Interest)', maximumAmount: 200000 },
    { id: 'DED_HRA', regimeId: oldRegime.id, sectionCode: '10(13A)', name: 'Section 10(13A) (HRA Exemption)', maximumAmount: 500000 },
  ];

  for (const d of deductions) {
    await prisma.taxDeduction.upsert({
      where: { id: d.id },
      update: { maximumAmount: d.maximumAmount },
      create: {
        id: d.id,
        regimeId: d.regimeId,
        sectionCode: d.sectionCode,
        name: d.name,
        maximumAmount: d.maximumAmount,
        formulaType: 'MIN_CLAIM_LIMIT',
        active: true,
      },
    });
  }

  console.log(`✔ ${deductions.length} TaxDeduction rows created in PostgreSQL`);

  // 5. Create Section 87A Rebates
  await prisma.taxRebate.upsert({
    where: { id: 'REBATE_87A_NEW_2026_27' },
    update: { incomeLimit: 1200000, maximumRebate: 60000 },
    create: {
      id: 'REBATE_87A_NEW_2026_27',
      regimeId: newRegime.id,
      sectionCode: '87A',
      incomeLimit: 1200000,
      maximumRebate: 60000,
      formulaType: 'THRESHOLD_REBATE',
      active: true,
    },
  });

  // 6. Create Seed Employee Declaration
  await prisma.employeeTaxDeclaration.create({
    data: {
      employeeId: 'EMP-8492',
      financialYear: 'FY 2026-27',
      selectedRegime: 'NEW',
      claimedDeductions: { '80C': 150000, '80D': 25000 },
      status: 'VERIFIED',
    },
  });

  console.log('✔ Seed EmployeeTaxDeclaration created in PostgreSQL');
  console.log('\n🎉 ALL POSTGRESQL TABLES AND ROWS POPULATED SUCCESSFULLY!');
}

seedTaxPostgres()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
