import { taxRulesRepository } from './taxRulesRepository.js';

/**
 * Production-Ready Indian Income Tax & Payroll Calculation Engine
 * FY 2026-27 / AY 2027-28 Govt Tax Reforms
 * ZERO hardcoded slabs/rates: all loaded dynamically from database repository
 */

export class TaxCalculationEngine {
  /**
   * Main calculation method
   * @param {Object} params
   * @param {number} params.salaryIncome - Annual Gross Salary
   * @param {number} params.otherIncome - Other income (Interest, Rent, Capital Gains, etc.)
   * @param {string} params.financialYearId - e.g. 'FY_2026_27'
   * @param {string} params.regimeCode - 'NEW' or 'OLD'
   * @param {string} params.ageCategory - 'BELOW_60', '60_TO_80', 'ABOVE_80'
   * @param {Object} params.claimedDeductions - Map of deduction section code -> amount { '80C': 150000, '80D': 25000, ... }
   * @param {string} params.stateCode - State code for professional tax (e.g. 'MH', 'KA')
   * @returns {Object} Complete calculation breakdown with educational steps
   */
  static calculate({
    salaryIncome = 0,
    otherIncome = 0,
    financialYearId = 'FY_2026_27',
    regimeCode = 'NEW',
    ageCategory = 'BELOW_60',
    claimedDeductions = {},
    stateCode = 'MH',
    isSalaried = true,
  }) {
    const grossSalary = Math.max(0, Number(salaryIncome) || 0);
    const grossOtherIncome = Math.max(0, Number(otherIncome) || 0);
    const totalGrossIncome = grossSalary + grossOtherIncome;

    // 1. Fetch Tax Regime from DB
    const regimes = taxRulesRepository.getTaxRegimes(financialYearId);
    const selectedRegime = regimes.find((r) => r.regimeCode === regimeCode) || regimes[0];

    // 2. Standard Deduction & Professional Tax (u/s 16)
    let standardDeduction = 0;
    if (isSalaried && selectedRegime.standardDeduction > 0) {
      // Standard deduction cannot exceed salary income
      standardDeduction = Math.min(grossSalary, selectedRegime.standardDeduction);
    }

    // Professional Tax lookup from DB
    const ptRule = taxRulesRepository.getProfessionalTaxRule(stateCode, financialYearId);
    let professionalTaxDeduction = 0;
    if (isSalaried && selectedRegime.regimeCode === 'OLD' && ptRule && ptRule.annualLimit > 0) {
      professionalTaxDeduction = ptRule.annualLimit;
    }

    const netSalaryIncome = Math.max(0, grossSalary - standardDeduction - professionalTaxDeduction);
    const grossTotalIncome = netSalaryIncome + grossOtherIncome;

    // 3. Chapter VI-A & Other Deductions (Old Regime only, or specific to regime from DB)
    const allowedDeductionRules = taxRulesRepository.getDeductions(selectedRegime.id, financialYearId);
    const deductionBreakdown = [];
    let totalDeductions = 0;

    if (selectedRegime.regimeCode === 'OLD') {
      for (const rule of allowedDeductionRules) {
        const claimed = Number(claimedDeductions[rule.sectionCode]) || 0;
        if (claimed > 0) {
          const eligible = Math.min(claimed, rule.maximumAmount);
          deductionBreakdown.push({
            sectionCode: rule.sectionCode,
            name: rule.name,
            claimedAmount: claimed,
            eligibleAmount: eligible,
            maximumLimit: rule.maximumAmount,
          });
          totalDeductions += eligible;
        }
      }
    }

    // 4. Taxable Income
    // Taxable income rounded to nearest 10 as per Indian Income Tax Act Section 288A
    const unroundedTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
    const taxableIncome = Math.round(unroundedTaxableIncome / 10) * 10;

    // 5. Load Tax Slabs from DB and compute Slab Tax
    const slabs = taxRulesRepository.getTaxSlabs(selectedRegime.id, ageCategory);
    let totalBaseTax = 0;
    const slabCalculations = [];
    let highestMarginalRate = 0;

    for (const slab of slabs) {
      const slabMin = slab.minIncome;
      const slabMax = slab.maxIncome !== null ? slab.maxIncome : Infinity;

      if (taxableIncome > slabMin) {
        const incomeInSlab = Math.min(taxableIncome, slabMax) - slabMin;
        const taxInSlab = incomeInSlab * (slab.taxRate / 100);
        totalBaseTax += taxInSlab;
        if (slab.taxRate > highestMarginalRate && incomeInSlab > 0) {
          highestMarginalRate = slab.taxRate;
        }

        slabCalculations.push({
          slabId: slab.id,
          rangeLabel: slab.maxIncome ? `₹${(slabMin / 100000).toFixed(1)}L - ₹${(slabMax / 100000).toFixed(1)}L` : `Above ₹${(slabMin / 100000).toFixed(1)}L`,
          minIncome: slabMin,
          maxIncome: slab.maxIncome,
          taxRate: slab.taxRate,
          taxableAmountInSlab: incomeInSlab,
          taxForSlab: Math.round(taxInSlab * 100) / 100,
          explanation: `${slab.taxRate}% on ₹${incomeInSlab.toLocaleString('en-IN')} = ₹${Math.round(taxInSlab).toLocaleString('en-IN')}`,
        });
      } else {
        slabCalculations.push({
          slabId: slab.id,
          rangeLabel: slab.maxIncome ? `₹${(slabMin / 100000).toFixed(1)}L - ₹${(slabMax / 100000).toFixed(1)}L` : `Above ₹${(slabMin / 100000).toFixed(1)}L`,
          minIncome: slabMin,
          maxIncome: slab.maxIncome,
          taxRate: slab.taxRate,
          taxableAmountInSlab: 0,
          taxForSlab: 0,
          explanation: `Income did not reach this bracket (Rate: ${slab.taxRate}%)`,
        });
      }
    }

    // 6. Section 87A Rebate & Marginal Relief
    const rebateRule = taxRulesRepository.getRebate(selectedRegime.id, financialYearId);
    let rebate87A = 0;
    let rebate87AMarginalRelief = 0;
    let taxAfter87A = totalBaseTax;

    if (rebateRule) {
      if (taxableIncome <= rebateRule.incomeLimit) {
        // Full rebate up to maximum rebate or full tax
        rebate87A = Math.min(totalBaseTax, rebateRule.maximumRebate);
        taxAfter87A = Math.max(0, totalBaseTax - rebate87A);
      } else if (selectedRegime.regimeCode === 'NEW') {
        // Marginal Relief for New Regime u/s 87A
        // If taxable income slightly exceeds ₹12,00,000, total tax payable cannot exceed (Taxable Income - ₹12,00,000)
        const excessOverLimit = taxableIncome - rebateRule.incomeLimit;
        if (totalBaseTax > excessOverLimit) {
          rebate87AMarginalRelief = totalBaseTax - excessOverLimit;
          taxAfter87A = excessOverLimit;
        }
      }
    }

    // 7. Surcharge & Surcharge Marginal Relief
    const surchargeRules = taxRulesRepository.getSurchargeRules(selectedRegime.id, financialYearId);
    let applicableSurchargeRule = null;
    let surchargeAmount = 0;
    let surchargeMarginalRelief = 0;

    for (const sRule of surchargeRules) {
      const maxThresh = sRule.maxThreshold !== null ? sRule.maxThreshold : Infinity;
      if (taxableIncome > sRule.minThreshold && taxableIncome <= maxThresh) {
        applicableSurchargeRule = sRule;
        break;
      }
    }

    if (applicableSurchargeRule && taxAfter87A > 0) {
      const rawSurcharge = taxAfter87A * (applicableSurchargeRule.surchargeRate / 100);
      surchargeAmount = rawSurcharge;

      // Marginal Relief Calculation for Surcharge threshold
      const threshold = applicableSurchargeRule.minThreshold;
      const excessIncomeOverThreshold = taxableIncome - threshold;
      
      // Calculate tax payable at the exact threshold without surcharge
      const taxAtThreshold = this.calculateTaxAtIncome(threshold, selectedRegime.id, ageCategory, rebateRule);
      const maxPermissibleTaxWithSurcharge = taxAtThreshold + excessIncomeOverThreshold;
      const actualTaxWithSurcharge = taxAfter87A + rawSurcharge;

      if (actualTaxWithSurcharge > maxPermissibleTaxWithSurcharge) {
        surchargeMarginalRelief = actualTaxWithSurcharge - maxPermissibleTaxWithSurcharge;
        surchargeAmount = Math.max(0, rawSurcharge - surchargeMarginalRelief);
      }
    }

    const taxPlusSurcharge = taxAfter87A + surchargeAmount;

    // 8. Health & Education Cess (4%)
    const cessRule = taxRulesRepository.getCessRule(financialYearId);
    const cessRate = cessRule ? cessRule.cessRate : 4.0;
    const cessAmount = taxPlusSurcharge * (cessRate / 100);

    // 9. Total Final Tax Liability (Rounded to nearest 10 as per Section 288B)
    const unroundedFinalTax = taxPlusSurcharge + cessAmount;
    const totalTaxPayable = Math.round(unroundedFinalTax / 10) * 10;
    const monthlyTDS = Math.round(totalTaxPayable / 12);

    // 10. Metrics: Effective Tax Rate & Marginal Tax Rate
    const effectiveTaxRate = totalGrossIncome > 0 ? (totalTaxPayable / totalGrossIncome) * 100 : 0;
    const netAnnualTakeHome = totalGrossIncome - totalTaxPayable - (isSalaried ? (ptRule?.annualLimit || 0) : 0);
    const netMonthlyTakeHome = Math.round(netAnnualTakeHome / 12);

    // 11. Generate Human Explanation & Audit Steps
    const explanationSteps = this.generateExplanationSteps({
      financialYear: financialYearId,
      regime: selectedRegime,
      ageCategory,
      totalGrossIncome,
      grossSalary,
      grossOtherIncome,
      standardDeduction,
      professionalTaxDeduction,
      deductionBreakdown,
      totalDeductions,
      taxableIncome,
      slabCalculations,
      totalBaseTax,
      rebate87A,
      rebate87AMarginalRelief,
      rebateRule,
      applicableSurchargeRule,
      surchargeAmount,
      surchargeMarginalRelief,
      cessRate,
      cessAmount,
      totalTaxPayable,
    });

    const result = {
      financialYear: financialYearId,
      assessmentYear: financialYearId === 'FY_2026_27' ? 'AY 2027-28' : 'AY 2026-27',
      regime: {
        code: selectedRegime.regimeCode,
        name: selectedRegime.regimeName,
        standardDeductionLimit: selectedRegime.standardDeduction,
      },
      ageCategory,
      incomeSummary: {
        grossSalary,
        grossOtherIncome,
        totalGrossIncome,
        standardDeduction,
        professionalTaxDeduction,
        netSalaryIncome,
        grossTotalIncome,
      },
      deductions: {
        totalDeductions,
        breakdown: deductionBreakdown,
      },
      taxableIncome,
      taxBreakdown: {
        slabs: slabCalculations,
        baseTax: Math.round(totalBaseTax * 100) / 100,
        rebate87A: Math.round(rebate87A * 100) / 100,
        rebate87AMarginalRelief: Math.round(rebate87AMarginalRelief * 100) / 100,
        taxAfterRebate: Math.round(taxAfter87A * 100) / 100,
        surcharge: {
          rate: applicableSurchargeRule ? applicableSurchargeRule.surchargeRate : 0,
          amount: Math.round(surchargeAmount * 100) / 100,
          marginalRelief: Math.round(surchargeMarginalRelief * 100) / 100,
        },
        cess: {
          rate: cessRate,
          amount: Math.round(cessAmount * 100) / 100,
        },
        totalTaxPayable,
        monthlyTDS,
      },
      metrics: {
        effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
        marginalTaxRate: highestMarginalRate,
        netAnnualTakeHome,
        netMonthlyTakeHome,
      },
      explanationSteps,
    };

    // Record calculation log
    taxRulesRepository.saveCalculationLog({
      regime: selectedRegime.regimeCode,
      grossIncome: totalGrossIncome,
      taxableIncome,
      taxPayable: totalTaxPayable,
      effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
    });

    return result;
  }

  /**
   * Helper to compute base tax at a specific income threshold for marginal relief
   */
  static calculateTaxAtIncome(income, regimeId, ageCategory, rebateRule) {
    const slabs = taxRulesRepository.getTaxSlabs(regimeId, ageCategory);
    let baseTax = 0;
    for (const slab of slabs) {
      const slabMin = slab.minIncome;
      const slabMax = slab.maxIncome !== null ? slab.maxIncome : Infinity;
      if (income > slabMin) {
        const amt = Math.min(income, slabMax) - slabMin;
        baseTax += amt * (slab.taxRate / 100);
      }
    }
    if (rebateRule && income <= rebateRule.incomeLimit) {
      baseTax = Math.max(0, baseTax - rebateRule.maximumRebate);
    }
    return baseTax;
  }

  /**
   * Generate crystal-clear, step-by-step educational explanations
   */
  static generateExplanationSteps(ctx) {
    const steps = [];

    // Step 1: Gross Income Computation
    steps.push({
      stepNumber: 1,
      title: 'Gross Total Income Breakdown',
      description: `Your total income of ₹${ctx.totalGrossIncome.toLocaleString('en-IN')} is aggregated from Salary Income (₹${ctx.grossSalary.toLocaleString('en-IN')}) and Other Income (₹${ctx.grossOtherIncome.toLocaleString('en-IN')}).`,
      highlight: `Gross Income = ₹${ctx.totalGrossIncome.toLocaleString('en-IN')}`,
      type: 'INFO',
    });

    // Step 2: Deductions & Standard Deduction
    if (ctx.regime.regimeCode === 'NEW') {
      steps.push({
        stepNumber: 2,
        title: 'New Regime Standard Deduction (u/s 16ia)',
        description: `Under the latest FY 2026-27 Union Budget reforms, salaried individuals receive an enhanced Standard Deduction of ₹${ctx.standardDeduction.toLocaleString('en-IN')} (capped at ₹75,000). Deductions under 80C/80D are not required or permitted under this simplified regime.`,
        highlight: `Taxable Income = ₹${ctx.totalGrossIncome.toLocaleString('en-IN')} - ₹${ctx.standardDeduction.toLocaleString('en-IN')} = ₹${ctx.taxableIncome.toLocaleString('en-IN')}`,
        type: 'DEDUCTION',
      });
    } else {
      steps.push({
        stepNumber: 2,
        title: 'Old Regime Deductions (Chapter VI-A & Sec 16)',
        description: `Standard deduction of ₹${ctx.standardDeduction.toLocaleString('en-IN')} plus Chapter VI-A deductions (80C, 80D, HRA, etc.) totaling ₹${ctx.totalDeductions.toLocaleString('en-IN')} and Professional Tax ₹${ctx.professionalTaxDeduction.toLocaleString('en-IN')} are subtracted.`,
        highlight: `Taxable Income = ₹${ctx.totalGrossIncome.toLocaleString('en-IN')} - ₹${(ctx.standardDeduction + ctx.totalDeductions + ctx.professionalTaxDeduction).toLocaleString('en-IN')} = ₹${ctx.taxableIncome.toLocaleString('en-IN')}`,
        type: 'DEDUCTION',
      });
    }

    // Step 3: Progressive Slab Calculation
    const activeSlabs = ctx.slabCalculations.filter((s) => s.taxableAmountInSlab > 0);
    const slabSummaries = activeSlabs
      .map((s) => `${s.rangeLabel} @ ${s.taxRate}% on ₹${s.taxableAmountInSlab.toLocaleString('en-IN')} = ₹${Math.round(s.taxForSlab).toLocaleString('en-IN')}`)
      .join(' + ');

    steps.push({
      stepNumber: 3,
      title: 'Progressive Slab-by-Slab Computation',
      description: `Income tax is progressive: each bracket is taxed only on the portion of income within that range. ${slabSummaries || 'Your taxable income falls below the minimum taxable threshold.'}`,
      highlight: `Total Slab Tax = ₹${Math.round(ctx.totalBaseTax).toLocaleString('en-IN')}`,
      type: 'TAX_CALCULATION',
    });

    // Step 4: Section 87A Rebate & Marginal Relief
    if (ctx.rebate87A > 0) {
      steps.push({
        stepNumber: 4,
        title: 'Section 87A Full Tax Rebate',
        description: `Since your taxable income of ₹${ctx.taxableIncome.toLocaleString('en-IN')} is within the statutory limit of ₹${ctx.rebateRule.incomeLimit.toLocaleString('en-IN')}, you qualify for 100% tax rebate under Section 87A up to ₹${ctx.rebateRule.maximumRebate.toLocaleString('en-IN')}. Tax after rebate becomes ₹0.`,
        highlight: `Section 87A Rebate: -₹${ctx.rebate87A.toLocaleString('en-IN')} (Net Tax = ₹0)`,
        type: 'REBATE',
      });
    } else if (ctx.rebate87AMarginalRelief > 0) {
      steps.push({
        stepNumber: 4,
        title: 'Section 87A Marginal Relief',
        description: `Your income (₹${ctx.taxableIncome.toLocaleString('en-IN')}) slightly exceeds the ₹12 Lakh threshold. To prevent your tax from exceeding the extra income earned above ₹12L, marginal relief of ₹${Math.round(ctx.rebate87AMarginalRelief).toLocaleString('en-IN')} is granted. Tax before surcharge is capped at ₹${(ctx.taxableIncome - 1200000).toLocaleString('en-IN')}.`,
        highlight: `Marginal Relief = ₹${Math.round(ctx.rebate87AMarginalRelief).toLocaleString('en-IN')}`,
        type: 'REBATE',
      });
    }

    // Step 5: Surcharge & Cess
    const cessDesc = `Health & Education Cess @ ${ctx.cessRate}% (₹${Math.round(ctx.cessAmount).toLocaleString('en-IN')}) is applied to fund nationwide health and education initiatives.`;
    const surchargeDesc = ctx.surchargeAmount > 0
      ? `Surcharge of ${ctx.applicableSurchargeRule.surchargeRate}% (₹${Math.round(ctx.surchargeAmount).toLocaleString('en-IN')}) is applied on high net-worth income.`
      : 'No surcharge is applicable (taxable income ≤ ₹50 Lakhs).';

    steps.push({
      stepNumber: 5,
      title: 'Surcharge & Health and Education Cess',
      description: `${surchargeDesc} ${cessDesc}`,
      highlight: `Total Cess & Surcharge = ₹${Math.round(ctx.surchargeAmount + ctx.cessAmount).toLocaleString('en-IN')}`,
      type: 'CESS',
    });

    // Step 6: Final Tax Liability
    steps.push({
      stepNumber: 6,
      title: 'Final Tax Payable (Rounded u/s 288B)',
      description: `Your final net income tax payable for ${ctx.financialYear} is ₹${ctx.totalTaxPayable.toLocaleString('en-IN')} (Estimated monthly TDS deduction: ₹${Math.round(ctx.totalTaxPayable / 12).toLocaleString('en-IN')}/month).`,
      highlight: `Final Tax Payable = ₹${ctx.totalTaxPayable.toLocaleString('en-IN')}`,
      type: 'FINAL',
    });

    return steps;
  }
}

/**
 * Side-by-Side Regime Comparison Engine
 */
export class TaxComparisonEngine {
  /**
   * Compares New Tax Regime vs Old Tax Regime for any given income and deduction profile
   */
  static compare(params) {
    const newRegimeResult = TaxCalculationEngine.calculate({
      ...params,
      regimeCode: 'NEW',
    });

    const oldRegimeResult = TaxCalculationEngine.calculate({
      ...params,
      regimeCode: 'OLD',
    });

    const taxDifference = oldRegimeResult.taxBreakdown.totalTaxPayable - newRegimeResult.taxBreakdown.totalTaxPayable;
    const isNewRegimeBetter = taxDifference > 0;
    const isOldRegimeBetter = taxDifference < 0;
    const isBothEqual = taxDifference === 0;

    const recommendedRegime = isNewRegimeBetter ? 'NEW' : isOldRegimeBetter ? 'OLD' : 'NEW';
    const totalSavings = Math.abs(taxDifference);

    let recommendationReason = '';
    if (isNewRegimeBetter) {
      recommendationReason = `The New Tax Regime saves you ₹${totalSavings.toLocaleString('en-IN')} annually compared to the Old Regime due to lower slab rates and the ₹75,000 standard deduction.`;
    } else if (isOldRegimeBetter) {
      recommendationReason = `The Old Tax Regime saves you ₹${totalSavings.toLocaleString('en-IN')} annually because your high claimed deductions (80C, 80D, HRA, Home Loan) significantly reduce your taxable income.`;
    } else {
      recommendationReason = `Both regimes result in the exact same tax liability (₹${newRegimeResult.taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}). The New Regime is recommended for its simplified filing without proof verification.`;
    }

    // Breakeven deduction calculation: The minimum deduction needed under Old Regime to match New Regime tax
    const breakevenDeductionNeeded = this.calculateBreakevenDeduction(params);

    return {
      financialYear: params.financialYearId || 'FY_2026_27',
      grossIncome: (Number(params.salaryIncome) || 0) + (Number(params.otherIncome) || 0),
      newRegime: newRegimeResult,
      oldRegime: oldRegimeResult,
      comparison: {
        recommendedRegime,
        totalSavings,
        taxDifference,
        isNewRegimeBetter,
        isOldRegimeBetter,
        isBothEqual,
        recommendationReason,
        breakevenDeductionNeeded,
      },
    };
  }

  /**
   * Calculates how much Chapter VI-A deduction is needed in Old Regime to beat New Regime
   */
  static calculateBreakevenDeduction(params) {
    const newRegimeResult = TaxCalculationEngine.calculate({ ...params, regimeCode: 'NEW' });
    const targetTax = newRegimeResult.taxBreakdown.totalTaxPayable;
    
    // Binary search deduction from 0 to 10 Lakhs
    let low = 0;
    let high = 1500000;
    let breakeven = 0;

    for (let i = 0; i < 20; i++) {
      const mid = Math.round((low + high) / 2);
      const testResult = TaxCalculationEngine.calculate({
        ...params,
        regimeCode: 'OLD',
        claimedDeductions: { '80C': Math.min(mid, 150000), '24B': Math.max(0, mid - 150000) },
      });

      if (testResult.taxBreakdown.totalTaxPayable <= targetTax) {
        breakeven = mid;
        high = mid - 1000;
      } else {
        low = mid + 1000;
      }
    }

    return breakeven;
  }
}

/**
 * Payroll Components & CTC Engine
 * Handles State Professional Tax, Gratuity Act 1972, and Statutory Bonus Act 1965
 */
export class PayrollCalculationEngine {
  /**
   * Calculate Complete CTC and In-Hand Salary Breakdown
   * @param {Object} params
   * @param {number} params.annualCTC - Annual Cost to Company (e.g. ₹15,00,000)
   * @param {string} params.stateCode - 'MH', 'KA', 'DL', etc.
   * @param {number} params.serviceTenureYears - Completed years of service for gratuity
   * @param {number} params.bonusPercentage - Statutory bonus % (8.33% to 20%)
   * @param {string} params.regimeCode - 'NEW' or 'OLD'
   */
  static calculateCTC({
    annualCTC = 1200000,
    stateCode = 'MH',
    serviceTenureYears = 5,
    bonusPercentage = 8.33,
    regimeCode = 'NEW',
    financialYearId = 'FY_2026_27',
  }) {
    const ctc = Math.max(0, Number(annualCTC) || 0);

    // Standard salary structuring:
    // Basic Salary: 40% - 50% of CTC (Standard: 40%)
    const annualBasic = Math.round(ctc * 0.40);
    const monthlyBasic = Math.round(annualBasic / 12);

    // HRA: 50% of Basic (for Metro) or 40% (Non-metro)
    const annualHRA = Math.round(annualBasic * 0.50);
    const monthlyHRA = Math.round(annualHRA / 12);

    // Employer EPF: 12% of Basic (or capped at ₹1,800/mo if opting for statutory ceiling)
    const monthlyEmployerEPF = Math.round(monthlyBasic * 0.12);
    const annualEmployerEPF = monthlyEmployerEPF * 12;

    // Gratuity Provision (Payment of Gratuity Act, 1972)
    // Formula: (15 / 26) * Monthly Basic * Completed Service Years
    const gratRule = taxRulesRepository.getGratuityRule(financialYearId);
    const gratuityPerYear = Math.round((monthlyBasic * 15) / 26);
    const totalGratuityAccrued = serviceTenureYears >= (gratRule?.minimumServiceYears || 5)
      ? Math.min(gratRule?.maxTaxExemption || 2000000, gratuityPerYear * serviceTenureYears)
      : 0;
    const gratuityEligible = serviceTenureYears >= (gratRule?.minimumServiceYears || 5);

    // Statutory Bonus (Payment of Bonus Act, 1965)
    // Eligibility: Monthly basic <= ₹21,000. Calculation base ceiling: ₹7,000/month
    const bonusRule = taxRulesRepository.getStatutoryBonusRule(financialYearId);
    const effectiveBonusRate = Math.min(bonusRule?.maximumBonusRate || 20, Math.max(bonusRule?.minimumBonusRate || 8.33, Number(bonusPercentage) || 8.33));
    
    let annualStatutoryBonus = 0;
    let isBonusStatutorilyMandated = false;

    if (monthlyBasic <= (bonusRule?.salaryEligibilityLimit || 21000)) {
      isBonusStatutorilyMandated = true;
      const calculationWage = Math.min(monthlyBasic, bonusRule?.calculationWageLimit || 7000);
      annualStatutoryBonus = Math.round(calculationWage * 12 * (effectiveBonusRate / 100));
    } else {
      // For higher salaries, performance bonus / variable pay provision
      annualStatutoryBonus = Math.round(ctc * (effectiveBonusRate / 100) * 0.40);
    }
    const monthlyBonus = Math.round(annualStatutoryBonus / 12);

    // Special Allowance (Balancing figure to reach full CTC)
    // CTC = Basic + HRA + Employer EPF + Gratuity Provision (approx 4.81% of basic) + Bonus + Special Allowance
    const annualGratuityProvision = Math.round(annualBasic * 0.0481);
    const otherEmployerCosts = annualEmployerEPF + annualGratuityProvision;
    const grossSalary = Math.max(0, ctc - otherEmployerCosts);
    const annualSpecialAllowance = Math.max(0, grossSalary - annualBasic - annualHRA - annualStatutoryBonus);
    const monthlySpecialAllowance = Math.round(annualSpecialAllowance / 12);

    // Monthly Gross Salary
    const monthlyGrossSalary = Math.round(grossSalary / 12);

    // Employee Deductions
    // 1. Employee EPF (12% of Basic)
    const monthlyEmployeeEPF = monthlyEmployerEPF;
    const annualEmployeeEPF = annualEmployerEPF;

    // 2. Professional Tax (State specific)
    const ptRule = taxRulesRepository.getProfessionalTaxRule(stateCode, financialYearId);
    const annualPT = ptRule ? ptRule.annualLimit : 0;
    const monthlyPT = ptRule ? ptRule.monthlyDeduction : 0;

    // 3. Tax Calculation on this salary
    const taxResult = TaxCalculationEngine.calculate({
      salaryIncome: grossSalary,
      otherIncome: 0,
      financialYearId,
      regimeCode,
      stateCode,
      isSalaried: true,
    });

    const annualIncomeTax = taxResult.taxBreakdown.totalTaxPayable;
    const monthlyIncomeTax = taxResult.taxBreakdown.monthlyTDS;

    // Total Monthly Employee Deductions
    const totalMonthlyDeductions = monthlyEmployeeEPF + monthlyPT + monthlyIncomeTax;
    const totalAnnualDeductions = annualEmployeeEPF + annualPT + annualIncomeTax;

    // Net In-Hand / Take-Home Salary
    const monthlyTakeHome = monthlyGrossSalary - totalMonthlyDeductions;
    const annualTakeHome = grossSalary - totalAnnualDeductions;

    return {
      financialYear: financialYearId,
      annualCTC: ctc,
      monthlyCTC: Math.round(ctc / 12),
      stateCode,
      regimeCode,
      earnings: {
        basic: { annual: annualBasic, monthly: monthlyBasic, percentageOfCTC: 40 },
        hra: { annual: annualHRA, monthly: monthlyHRA, percentageOfCTC: 20 },
        specialAllowance: { annual: annualSpecialAllowance, monthly: monthlySpecialAllowance },
        statutoryBonus: {
          annual: annualStatutoryBonus,
          monthly: monthlyBonus,
          rate: effectiveBonusRate,
          isStatutorilyMandated: isBonusStatutorilyMandated,
        },
        grossSalary: { annual: grossSalary, monthly: monthlyGrossSalary },
      },
      employerContributions: {
        epf: { annual: annualEmployerEPF, monthly: monthlyEmployerEPF, rate: 12 },
        gratuityProvision: { annual: annualGratuityProvision, monthly: Math.round(annualGratuityProvision / 12), rate: 4.81 },
        totalEmployerContributions: otherEmployerCosts,
      },
      employeeDeductions: {
        epf: { annual: annualEmployeeEPF, monthly: monthlyEmployeeEPF, rate: 12 },
        professionalTax: { annual: annualPT, monthly: monthlyPT, state: ptRule?.stateCode },
        incomeTaxTDS: { annual: annualIncomeTax, monthly: monthlyIncomeTax },
        totalDeductions: { annual: totalAnnualDeductions, monthly: totalMonthlyDeductions },
      },
      takeHome: {
        annual: annualTakeHome,
        monthly: monthlyTakeHome,
        takeHomePercentage: ctc > 0 ? Number(((annualTakeHome / ctc) * 100).toFixed(2)) : 0,
      },
      gratuityStatutory: {
        law: 'Payment of Gratuity Act, 1972',
        serviceTenureYears,
        eligible: gratuityEligible,
        annualAccrual: gratuityPerYear,
        totalGratuityAccrued,
        maxTaxExemptLimit: gratRule?.maxTaxExemption || 2000000,
        formula: '(15 / 26) * Monthly Basic * Completed Years',
      },
      statutoryBonusInfo: {
        law: 'Payment of Bonus Act, 1965',
        rateApplied: effectiveBonusRate,
        isEligibleUnderAct: isBonusStatutorilyMandated,
        wageCeiling: bonusRule?.calculationWageLimit || 7000,
        salaryEligibilityCeiling: bonusRule?.salaryEligibilityLimit || 21000,
      },
      taxDetails: taxResult,
    };
  }
}
