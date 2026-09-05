import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'tax_database.json');

/**
 * Indian Income Tax & Payroll Statutory Rules Database Repository
 * Fully versioned by Financial Year & Assessment Year (FY 2026-27 / AY 2027-28 & Latest Govt Reforms)
 * NO HARDCODED SLABS IN CALCULATION ENGINE - EVERYTHING IS LOADED AND PERSISTED IN DB REPOSITORY
 */

class TaxRulesRepository {
  constructor() {
    this.financialYears = [
      {
        id: 'FY_2026_27',
        financialYear: 'FY 2026-27',
        assessmentYear: 'AY 2027-28',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
        isCurrent: true,
        active: true,
      },
      {
        id: 'FY_2025_26',
        financialYear: 'FY 2025-26',
        assessmentYear: 'AY 2026-27',
        startDate: '2025-04-01',
        endDate: '2026-03-31',
        isCurrent: false,
        active: true,
      },
    ];

    this.taxRegimes = [
      {
        id: 'REGIME_NEW_2026_27',
        financialYearId: 'FY_2026_27',
        regimeCode: 'NEW',
        regimeName: 'New Tax Regime (u/s 115BAC)',
        standardDeduction: 75000,
        isDefault: true,
        description: 'Default concessional regime with simplified tax slabs, Rs. 75k standard deduction, and Section 87A rebate up to Rs. 12 Lakhs.',
        active: true,
      },
      {
        id: 'REGIME_OLD_2026_27',
        financialYearId: 'FY_2026_27',
        regimeCode: 'OLD',
        regimeName: 'Old Tax Regime (With Chapter VI-A Deductions)',
        standardDeduction: 50000,
        isDefault: false,
        description: 'Traditional regime permitting Section 80C, 80D, HRA, NPS, and Home Loan interest deductions.',
        active: true,
      },
    ];

    // Tax Slabs (Matching Official Indian Govt 2026-27 Notification)
    this.taxSlabs = [
      // 1. New Tax Regime (FY 2026-27 - Universal across all age categories)
      { id: 'NS_1', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 0, maxIncome: 400000, taxRate: 0, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 1, active: true },
      { id: 'NS_2', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 400000, maxIncome: 800000, taxRate: 5, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 2, active: true },
      { id: 'NS_3', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 800000, maxIncome: 1200000, taxRate: 10, fixedTax: 20000, formulaType: 'SLAB_CALCULATION', priority: 3, active: true },
      { id: 'NS_4', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 1200000, maxIncome: 1600000, taxRate: 15, fixedTax: 60000, formulaType: 'SLAB_CALCULATION', priority: 4, active: true },
      { id: 'NS_5', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 1600000, maxIncome: 2000000, taxRate: 20, fixedTax: 120000, formulaType: 'SLAB_CALCULATION', priority: 5, active: true },
      { id: 'NS_6', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 2000000, maxIncome: 2400000, taxRate: 25, fixedTax: 200000, formulaType: 'SLAB_CALCULATION', priority: 6, active: true },
      { id: 'NS_7', regimeId: 'REGIME_NEW_2026_27', ageCategory: 'ALL', minIncome: 2400000, maxIncome: null, taxRate: 30, fixedTax: 300000, formulaType: 'SLAB_CALCULATION', priority: 7, active: true },

      // 2. Old Tax Regime - Below 60 Years (General)
      { id: 'OS_G1', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'BELOW_60', minIncome: 0, maxIncome: 250000, taxRate: 0, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 1, active: true },
      { id: 'OS_G2', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'BELOW_60', minIncome: 250000, maxIncome: 500000, taxRate: 5, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 2, active: true },
      { id: 'OS_G3', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'BELOW_60', minIncome: 500000, maxIncome: 1000000, taxRate: 20, fixedTax: 12500, formulaType: 'SLAB_CALCULATION', priority: 3, active: true },
      { id: 'OS_G4', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'BELOW_60', minIncome: 1000000, maxIncome: null, taxRate: 30, fixedTax: 112500, formulaType: 'SLAB_CALCULATION', priority: 4, active: true },

      // 3. Old Tax Regime - 60 to 80 Years (Senior Citizen)
      { id: 'OS_S1', regimeId: 'REGIME_OLD_2026_27', ageCategory: '60_TO_80', minIncome: 0, maxIncome: 300000, taxRate: 0, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 1, active: true },
      { id: 'OS_S2', regimeId: 'REGIME_OLD_2026_27', ageCategory: '60_TO_80', minIncome: 300000, maxIncome: 500000, taxRate: 5, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 2, active: true },
      { id: 'OS_S3', regimeId: 'REGIME_OLD_2026_27', ageCategory: '60_TO_80', minIncome: 500000, maxIncome: 1000000, taxRate: 20, fixedTax: 10000, formulaType: 'SLAB_CALCULATION', priority: 3, active: true },
      { id: 'OS_S4', regimeId: 'REGIME_OLD_2026_27', ageCategory: '60_TO_80', minIncome: 1000000, maxIncome: null, taxRate: 30, fixedTax: 110000, formulaType: 'SLAB_CALCULATION', priority: 4, active: true },

      // 4. Old Tax Regime - 80+ Years (Super Senior Citizen)
      { id: 'OS_SS1', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'ABOVE_80', minIncome: 0, maxIncome: 500000, taxRate: 0, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 1, active: true },
      { id: 'OS_SS2', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'ABOVE_80', minIncome: 500000, maxIncome: 1000000, taxRate: 20, fixedTax: 0, formulaType: 'SLAB_CALCULATION', priority: 2, active: true },
      { id: 'OS_SS3', regimeId: 'REGIME_OLD_2026_27', ageCategory: 'ABOVE_80', minIncome: 1000000, maxIncome: null, taxRate: 30, fixedTax: 100000, formulaType: 'SLAB_CALCULATION', priority: 3, active: true },
    ];

    // Deductions Database (Old Regime Exemptions)
    this.deductions = [
      {
        id: 'DED_80C',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '80C',
        name: 'Section 80C (PPF, EPF, ELSS, Life Insurance, Home Loan Principal)',
        description: 'Deduction for specified investments and savings.',
        maximumAmount: 150000,
        formulaType: 'MIN_CLAIM_LIMIT',
        eligibility: 'Individual / HUF',
        active: true,
      },
      {
        id: 'DED_80D',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '80D',
        name: 'Section 80D (Health Insurance Premium - Self & Family)',
        description: 'Medical insurance premiums paid for self, spouse, children (Rs. 25k) and parents (Rs. 25k/Rs. 50k).',
        maximumAmount: 75000,
        formulaType: 'MIN_CLAIM_LIMIT',
        eligibility: 'Individual / HUF',
        active: true,
      },
      {
        id: 'DED_80CCD1B',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '80CCD(1B)',
        name: 'Section 80CCD(1B) (National Pension Scheme - NPS)',
        description: 'Additional voluntary contribution to NPS tier 1 account over and above 80C.',
        maximumAmount: 50000,
        formulaType: 'MIN_CLAIM_LIMIT',
        eligibility: 'Individual',
        active: true,
      },
      {
        id: 'DED_24B',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '24(b)',
        name: 'Section 24(b) (Interest on Home Loan - Self Occupied)',
        description: 'Interest paid on loan taken for acquisition/construction of self-occupied house.',
        maximumAmount: 200000,
        formulaType: 'MIN_CLAIM_LIMIT',
        eligibility: 'Individual / HUF',
        active: true,
      },
      {
        id: 'DED_HRA',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '10(13A)',
        name: 'Section 10(13A) (House Rent Allowance Exemption)',
        description: 'Exemption based on rent paid minus 10% basic salary and city classification.',
        maximumAmount: 500000,
        formulaType: 'MIN_CLAIM_LIMIT',
        eligibility: 'Salaried individuals living in rented accommodations',
        active: true,
      },
      {
        id: 'DED_80TTA',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '80TTA/80TTB',
        name: 'Section 80TTA / 80TTB (Savings & Deposit Interest)',
        description: 'Interest earned on savings bank accounts and fixed deposits for senior citizens.',
        maximumAmount: 50000,
        formulaType: 'MIN_CLAIM_LIMIT',
        eligibility: 'Individual / Senior Citizens',
        active: true,
      },
    ];

    // Section 87A Rebates Database
    this.rebates = [
      {
        id: 'REBATE_87A_NEW_2026_27',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_NEW_2026_27',
        sectionCode: '87A',
        incomeLimit: 1200000,
        maximumRebate: 60000,
        formulaType: 'THRESHOLD_REBATE',
        description: '100% tax rebate for resident individuals with taxable income up to Rs. 12 Lakhs.',
        active: true,
      },
      {
        id: 'REBATE_87A_OLD_2026_27',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_OLD_2026_27',
        sectionCode: '87A',
        incomeLimit: 500000,
        maximumRebate: 12500,
        formulaType: 'THRESHOLD_REBATE',
        description: 'Tax rebate for resident individuals with taxable income up to Rs. 5 Lakhs.',
        active: true,
      },
    ];

    // Surcharge Rules (Matching Screenshot 4)
    this.surchargeRules = [
      // New Regime Surcharge
      { id: 'SUR_N_1', financialYearId: 'FY_2026_27', regimeId: 'REGIME_NEW_2026_27', minThreshold: 5000000, maxThreshold: 10000000, surchargeRate: 10, calculationBase: 'TAX_AFTER_REBATE', active: true },
      { id: 'SUR_N_2', financialYearId: 'FY_2026_27', regimeId: 'REGIME_NEW_2026_27', minThreshold: 10000000, maxThreshold: 20000000, surchargeRate: 15, calculationBase: 'TAX_AFTER_REBATE', active: true },
      { id: 'SUR_N_3', financialYearId: 'FY_2026_27', regimeId: 'REGIME_NEW_2026_27', minThreshold: 20000000, maxThreshold: null, surchargeRate: 25, calculationBase: 'TAX_AFTER_REBATE', active: true },

      // Old Regime Surcharge
      { id: 'SUR_O_1', financialYearId: 'FY_2026_27', regimeId: 'REGIME_OLD_2026_27', minThreshold: 5000000, maxThreshold: 10000000, surchargeRate: 10, calculationBase: 'TAX_AFTER_REBATE', active: true },
      { id: 'SUR_O_2', financialYearId: 'FY_2026_27', regimeId: 'REGIME_OLD_2026_27', minThreshold: 10000000, maxThreshold: 20000000, surchargeRate: 15, calculationBase: 'TAX_AFTER_REBATE', active: true },
      { id: 'SUR_O_3', financialYearId: 'FY_2026_27', regimeId: 'REGIME_OLD_2026_27', minThreshold: 20000000, maxThreshold: 50000000, surchargeRate: 25, calculationBase: 'TAX_AFTER_REBATE', active: true },
      { id: 'SUR_O_4', financialYearId: 'FY_2026_27', regimeId: 'REGIME_OLD_2026_27', minThreshold: 50000000, maxThreshold: null, surchargeRate: 37, calculationBase: 'TAX_AFTER_REBATE', active: true },
    ];

    // Health & Education Cess
    this.cessRules = [
      {
        id: 'CESS_2026_27',
        financialYearId: 'FY_2026_27',
        cessName: 'Health & Education Cess',
        cessRate: 4.0,
        calculationBase: 'TAX_PLUS_SURCHARGE',
        active: true,
      },
    ];

    // Marginal Relief Rules
    this.marginalReliefRules = [
      {
        id: 'MR_87A_NEW',
        financialYearId: 'FY_2026_27',
        regimeId: 'REGIME_NEW_2026_27',
        reliefType: 'REBATE_BOUNDARY',
        incomeThreshold: 1200000,
        formulaType: 'MARGINAL_RELIEF',
        active: true,
      },
      {
        id: 'MR_SURCHARGE',
        financialYearId: 'FY_2026_27',
        reliefType: 'SURCHARGE_BOUNDARY',
        incomeThreshold: 5000000,
        formulaType: 'MARGINAL_RELIEF',
        active: true,
      },
    ];

    // State Professional Tax Rules
    this.states = [
      { id: 'STATE_MH', stateCode: 'MH', stateName: 'Maharashtra', active: true },
      { id: 'STATE_KA', stateCode: 'KA', stateName: 'Karnataka', active: true },
      { id: 'STATE_DL', stateCode: 'DL', stateName: 'Delhi (NCR)', active: true },
      { id: 'STATE_GJ', stateCode: 'GJ', stateName: 'Gujarat', active: true },
      { id: 'STATE_TN', stateCode: 'TN', stateName: 'Tamil Nadu', active: true },
      { id: 'STATE_TS', stateCode: 'TS', stateName: 'Telangana', active: true },
    ];

    this.professionalTaxRules = [
      {
        id: 'PT_MH_2026_27',
        stateCode: 'MH',
        financialYearId: 'FY_2026_27',
        annualLimit: 2500,
        monthlyDeduction: 200,
        februaryDeduction: 300,
        taxTreatmentOldRegime: 'DEDUCTIBLE_US_16_III',
        taxTreatmentNewRegime: 'NOT_DEDUCTIBLE',
        description: 'Maharashtra Professional Tax: Rs. 200/month and Rs. 300 in February (Max Rs. 2,500/year).',
        active: true,
      },
      {
        id: 'PT_KA_2026_27',
        stateCode: 'KA',
        financialYearId: 'FY_2026_27',
        annualLimit: 2400,
        monthlyDeduction: 200,
        februaryDeduction: 200,
        taxTreatmentOldRegime: 'DEDUCTIBLE_US_16_III',
        taxTreatmentNewRegime: 'NOT_DEDUCTIBLE',
        description: 'Karnataka Professional Tax: Rs. 200/month (Max Rs. 2,400/year).',
        active: true,
      },
      {
        id: 'PT_DL_2026_27',
        stateCode: 'DL',
        financialYearId: 'FY_2026_27',
        annualLimit: 0,
        monthlyDeduction: 0,
        februaryDeduction: 0,
        taxTreatmentOldRegime: 'NOT_APPLICABLE',
        taxTreatmentNewRegime: 'NOT_APPLICABLE',
        description: 'Delhi (NCR) has no applicable state professional tax.',
        active: true,
      },
    ];

    // Gratuity Rules (Payment of Gratuity Act, 1972)
    this.gratuityRules = [
      {
        id: 'GRAT_1972_2026_27',
        financialYearId: 'FY_2026_27',
        lawName: 'Payment of Gratuity Act, 1972',
        minimumServiceYears: 5,
        daysWagesPerYear: 15,
        wageDivisor: 26,
        maxTaxExemption: 2000000,
        calculationType: 'MONTHLY_WAGE_15_DAYS',
        taxTreatment: 'EXEMPT_UP_TO_20_LAKHS',
        active: true,
      },
    ];

    // Statutory Bonus Rules (Payment of Bonus Act, 1965)
    this.statutoryBonusRules = [
      {
        id: 'BONUS_1965_2026_27',
        financialYearId: 'FY_2026_27',
        lawName: 'Payment of Bonus Act, 1965',
        minimumBonusRate: 8.33,
        maximumBonusRate: 20.0,
        salaryEligibilityLimit: 21000,
        calculationWageLimit: 7000,
        minimumDaysWorked: 30,
        taxTreatment: 'TAXABLE_AS_SALARY',
        active: true,
      },
    ];

    // Employee Tax Declarations Store (Persistent)
    this.employeeDeclarations = {};

    // Calculation Logs History Store
    this.calculationLogs = [];

    // Load persisted state from disk on startup
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.taxSlabs) this.taxSlabs = data.taxSlabs;
        if (data.deductions) this.deductions = data.deductions;
        if (data.rebates) this.rebates = data.rebates;
        if (data.professionalTaxRules) this.professionalTaxRules = data.professionalTaxRules;
        if (data.employeeDeclarations) this.employeeDeclarations = data.employeeDeclarations;
        if (data.calculationLogs) this.calculationLogs = data.calculationLogs;
      }
    } catch (err) {
      console.warn('Could not read tax database file from disk:', err.message);
    }
  }

  saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = {
        updatedAt: new Date().toISOString(),
        financialYears: this.financialYears,
        taxRegimes: this.taxRegimes,
        taxSlabs: this.taxSlabs,
        deductions: this.deductions,
        rebates: this.rebates,
        surchargeRules: this.surchargeRules,
        cessRules: this.cessRules,
        states: this.states,
        professionalTaxRules: this.professionalTaxRules,
        gratuityRules: this.gratuityRules,
        statutoryBonusRules: this.statutoryBonusRules,
        employeeDeclarations: this.employeeDeclarations,
        calculationLogs: this.calculationLogs.slice(0, 200),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write tax database to disk:', err.message);
    }
  }

  getFinancialYears() {
    return this.financialYears.filter((fy) => fy.active);
  }

  getTaxRegimes(financialYearId = 'FY_2026_27') {
    return this.taxRegimes.filter((r) => r.financialYearId === financialYearId && r.active);
  }

  getTaxSlabs(regimeId = 'REGIME_NEW_2026_27', ageCategory = 'BELOW_60') {
    return this.taxSlabs
      .filter((s) => s.regimeId === regimeId && (s.ageCategory === ageCategory || s.ageCategory === 'ALL') && s.active)
      .sort((a, b) => a.priority - b.priority);
  }

  updateTaxSlab(slabId, updates) {
    const slab = this.taxSlabs.find((s) => s.id === slabId);
    if (!slab) return null;
    if (updates.taxRate !== undefined) slab.taxRate = Number(updates.taxRate);
    if (updates.minIncome !== undefined) slab.minIncome = Number(updates.minIncome);
    if (updates.maxIncome !== undefined) slab.maxIncome = updates.maxIncome === null ? null : Number(updates.maxIncome);
    this.saveToDisk();
    return slab;
  }

  getDeductions(regimeId = 'REGIME_OLD_2026_27', financialYearId = 'FY_2026_27') {
    return this.deductions.filter((d) => d.regimeId === regimeId && d.financialYearId === financialYearId && d.active);
  }

  getRebate(regimeId = 'REGIME_NEW_2026_27', financialYearId = 'FY_2026_27') {
    return this.rebates.find((r) => r.regimeId === regimeId && r.financialYearId === financialYearId && r.active);
  }

  getSurchargeRules(regimeId = 'REGIME_NEW_2026_27', financialYearId = 'FY_2026_27') {
    return this.surchargeRules.filter((s) => s.regimeId === regimeId && s.financialYearId === financialYearId && s.active);
  }

  getCessRule(financialYearId = 'FY_2026_27') {
    return this.cessRules.find((c) => c.financialYearId === financialYearId && c.active);
  }

  getProfessionalTaxRule(stateCode = 'MH', financialYearId = 'FY_2026_27') {
    return (
      this.professionalTaxRules.find((p) => p.stateCode === stateCode && p.financialYearId === financialYearId && p.active) ||
      this.professionalTaxRules[0]
    );
  }

  getGratuityRule(financialYearId = 'FY_2026_27') {
    return this.gratuityRules.find((g) => g.financialYearId === financialYearId && g.active);
  }

  getStatutoryBonusRule(financialYearId = 'FY_2026_27') {
    return this.statutoryBonusRules.find((b) => b.financialYearId === financialYearId && b.active);
  }

  saveEmployeeDeclaration(empId, declaration) {
    this.employeeDeclarations[empId] = {
      ...declaration,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.employeeDeclarations[empId];
  }

  getEmployeeDeclaration(empId) {
    return this.employeeDeclarations[empId] || null;
  }

  saveCalculationLog(logEntry) {
    const entry = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...logEntry,
    };
    this.calculationLogs.unshift(entry);
    this.saveToDisk();
    return entry;
  }
}

export const taxRulesRepository = new TaxRulesRepository();
