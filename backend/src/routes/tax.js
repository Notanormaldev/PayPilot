import express from 'express';
import { taxRulesRepository } from '../lib/taxRulesRepository.js';
import { TaxCalculationEngine, TaxComparisonEngine, PayrollCalculationEngine } from '../lib/taxEngine.js';

export const taxRouter = express.Router();

/**
 * GET /api/tax/rules
 * Fetch complete dynamic tax and statutory payroll rules from the database repository
 */
taxRouter.get('/rules', (req, res) => {
  try {
    const { financialYearId = 'FY_2026_27' } = req.query;

    const financialYears = taxRulesRepository.getFinancialYears();
    const regimes = taxRulesRepository.getTaxRegimes(financialYearId);
    const deductions = taxRulesRepository.getDeductions('REGIME_OLD_2026_27', financialYearId);
    const states = taxRulesRepository.states;
    const cess = taxRulesRepository.getCessRule(financialYearId);
    const gratuity = taxRulesRepository.getGratuityRule(financialYearId);
    const bonus = taxRulesRepository.getStatutoryBonusRule(financialYearId);

    // Fetch slabs for all regimes and age categories
    const slabs = {
      NEW: taxRulesRepository.getTaxSlabs('REGIME_NEW_2026_27', 'ALL'),
      OLD_BELOW_60: taxRulesRepository.getTaxSlabs('REGIME_OLD_2026_27', 'BELOW_60'),
      OLD_60_TO_80: taxRulesRepository.getTaxSlabs('REGIME_OLD_2026_27', '60_TO_80'),
      OLD_ABOVE_80: taxRulesRepository.getTaxSlabs('REGIME_OLD_2026_27', 'ABOVE_80'),
    };

    const rebates = {
      NEW: taxRulesRepository.getRebate('REGIME_NEW_2026_27', financialYearId),
      OLD: taxRulesRepository.getRebate('REGIME_OLD_2026_27', financialYearId),
    };

    const surcharges = {
      NEW: taxRulesRepository.getSurchargeRules('REGIME_NEW_2026_27', financialYearId),
      OLD: taxRulesRepository.getSurchargeRules('REGIME_OLD_2026_27', financialYearId),
    };

    const professionalTaxes = taxRulesRepository.professionalTaxRules.filter(
      (pt) => pt.financialYearId === financialYearId && pt.active
    );

    res.json({
      success: true,
      data: {
        financialYears,
        regimes,
        slabs,
        deductions,
        rebates,
        surcharges,
        cess,
        states,
        professionalTaxes,
        gratuity,
        bonus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/tax/calculate
 * Calculate income tax with dynamic DB-driven rules
 */
taxRouter.post('/calculate', (req, res) => {
  try {
    const {
      salaryIncome = 0,
      otherIncome = 0,
      financialYearId = 'FY_2026_27',
      regimeCode = 'NEW',
      ageCategory = 'BELOW_60',
      claimedDeductions = {},
      stateCode = 'MH',
      isSalaried = true,
    } = req.body;

    const result = TaxCalculationEngine.calculate({
      salaryIncome,
      otherIncome,
      financialYearId,
      regimeCode,
      ageCategory,
      claimedDeductions,
      stateCode,
      isSalaried,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/tax/compare
 * Side-by-side comparison of New vs Old Regime with smart recommendation
 */
taxRouter.post('/compare', (req, res) => {
  try {
    const {
      salaryIncome = 0,
      otherIncome = 0,
      financialYearId = 'FY_2026_27',
      ageCategory = 'BELOW_60',
      claimedDeductions = {},
      stateCode = 'MH',
      isSalaried = true,
    } = req.body;

    const result = TaxComparisonEngine.compare({
      salaryIncome,
      otherIncome,
      financialYearId,
      ageCategory,
      claimedDeductions,
      stateCode,
      isSalaried,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/tax/payroll-ctc
 * Detailed CTC & in-hand payroll breakdown with Gratuity, Bonus & State PT
 */
taxRouter.post('/payroll-ctc', (req, res) => {
  try {
    const {
      annualCTC = 1200000,
      stateCode = 'MH',
      serviceTenureYears = 5,
      bonusPercentage = 8.33,
      regimeCode = 'NEW',
      financialYearId = 'FY_2026_27',
    } = req.body;

    const result = PayrollCalculationEngine.calculateCTC({
      annualCTC,
      stateCode,
      serviceTenureYears,
      bonusPercentage,
      regimeCode,
      financialYearId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tax/history
 * Calculation audit logs
 */
taxRouter.get('/history', (req, res) => {
  try {
    res.json({
      success: true,
      data: taxRulesRepository.calculationLogs.slice(0, 50),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/tax/admin/slabs
 * Admin configuration: update tax slab details dynamically in the database repository
 */
taxRouter.put('/admin/slabs', (req, res) => {
  try {
    const { slabId, taxRate, minIncome, maxIncome } = req.body;
    const slab = taxRulesRepository.taxSlabs.find((s) => s.id === slabId);
    if (!slab) {
      return res.status(404).json({ success: false, message: 'Tax slab not found' });
    }

    if (taxRate !== undefined) slab.taxRate = Number(taxRate);
    if (minIncome !== undefined) slab.minIncome = Number(minIncome);
    if (maxIncome !== undefined) slab.maxIncome = maxIncome === null ? null : Number(maxIncome);

    res.json({
      success: true,
      message: `Tax slab ${slabId} updated successfully`,
      data: slab,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
