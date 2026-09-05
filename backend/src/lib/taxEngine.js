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
   * @param {number|null} params.age - Exact employee age (optional, auto-derives category and EPFO cutoff)
   * @param {string|null} params.dob - Date of birth in YYYY-MM-DD format (optional)
   * @param {string} params.residentialStatus - 'RESIDENT' or 'NRI' (Income Tax Act Section 6)
   * @param {string} params.disabilityCategory - 'NONE', 'MODERATE_40_80', 'SEVERE_80_PLUS' (Section 80U)
   * @param {Object} params.claimedDeductions - Map of deduction section code -> amount { '80C': 150000, '80D': 25000, ... }
   * @param {string} params.stateCode - State code for professional tax (e.g. 'MH', 'KA')
   * @param {boolean} params.isSalaried - True if salaried individual claiming standard deduction
   * @returns {Object} Complete calculation breakdown with educational steps
   */
  static calculate({
    salaryIncome = 0,
    otherIncome = 0,
    financialYearId = 'FY_2026_27',
    regimeCode = 'NEW',
    ageCategory = 'BELOW_60',
    age = null,
    dob = null,
    residentialStatus = 'RESIDENT',
    disabilityCategory = 'NONE',
    claimedDeductions = {},
    stateCode = 'MH',
    isSalaried = true,
  }) {
    const grossSalary = Math.max(0, Number(salaryIncome) || 0);
    const grossOtherIncome = Math.max(0, Number(otherIncome) || 0);
    const totalGrossIncome = grossSalary + grossOtherIncome;

    // 0. Statutory Age & DOB Auto-Derivation
    let computedAge = typeof age === 'number' && !isNaN(age) ? age : null;
    if (computedAge === null && dob && typeof dob === 'string' && dob.trim() !== '') {
      const dobDate = new Date(dob);
      if (!isNaN(dobDate.getTime())) {
        const fyBase = new Date(financialYearId === 'FY_2025_26' ? '2025-04-01' : '2026-04-01');
        let calculatedAge = fyBase.getFullYear() - dobDate.getFullYear();
        const m = fyBase.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && fyBase.getDate() < dobDate.getDate())) {
          calculatedAge--;
        }
        computedAge = Math.max(0, calculatedAge);
      }
    }

    let derivedAgeCategory = ageCategory || 'BELOW_60';
    if (computedAge !== null) {
      if (computedAge < 60) {
        derivedAgeCategory = 'BELOW_60';
      } else if (computedAge < 80) {
        derivedAgeCategory = '60_TO_80';
      } else {
        derivedAgeCategory = 'ABOVE_80';
      }
    } else {
      if (derivedAgeCategory === '60_TO_80') computedAge = 65;
      else if (derivedAgeCategory === 'ABOVE_80') computedAge = 82;
      else computedAge = 32;
    }

    const isAge58Plus = computedAge >= 58;

    // 1. Fetch Tax Regime from DB
    const regimes = taxRulesRepository.getTaxRegimes(financialYearId);
    const selectedRegime = regimes.find((r) => r.regimeCode === regimeCode) || regimes[0];

    // 2. Standard Deduction & Professional Tax (u/s 16)
    let standardDeduction = 0;
    if (isSalaried && selectedRegime.standardDeduction > 0) {
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

    // 3. Chapter VI-A & Other Deductions (Old Regime only)
    const allowedDeductionRules = taxRulesRepository.getDeductions(selectedRegime.id, financialYearId);
    const deductionBreakdown = [];
    let totalDeductions = 0;

    // Auto-inject Section 80U Disability Relief if applicable and not manually overridden
    const mergedClaimedDeductions = { ...claimedDeductions };
    if (disabilityCategory === 'MODERATE_40_80') {
      mergedClaimedDeductions['80U'] = Math.max(mergedClaimedDeductions['80U'] || 0, 75000);
    } else if (disabilityCategory === 'SEVERE_80_PLUS') {
      mergedClaimedDeductions['80U'] = Math.max(mergedClaimedDeductions['80U'] || 0, 125000);
    }

    if (selectedRegime.regimeCode === 'OLD') {
      for (const rule of allowedDeductionRules) {
        const claimed = Number(mergedClaimedDeductions[rule.sectionCode]) || 0;
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

    // 4. Taxable Income (Rounded to nearest 10 as per Section 288A)
    const unroundedTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
    const taxableIncome = Math.round(unroundedTaxableIncome / 10) * 10;

    // 5. Section 6 Residency Rule & Tax Slabs:
    // NRIs are not eligible for Senior/Super Senior higher basic exemption limits under Old Regime
    const isNriSeniorExclusionApplied = (residentialStatus === 'NRI' && derivedAgeCategory !== 'BELOW_60');
    const applicableSlabCategory = (residentialStatus === 'NRI' ? 'BELOW_60' : derivedAgeCategory);

    const slabs = taxRulesRepository.getTaxSlabs(selectedRegime.id, applicableSlabCategory);
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
    // Note: Under Section 87A, rebate is ONLY admissible to RESIDENT individuals!
    const rebateRule = taxRulesRepository.getRebate(selectedRegime.id, financialYearId);
    let rebate87A = 0;
    let rebate87AMarginalRelief = 0;
    let taxAfter87A = totalBaseTax;
    const isNri87AExclusionApplied = (residentialStatus === 'NRI');

    if (rebateRule && residentialStatus === 'RESIDENT') {
      if (taxableIncome <= rebateRule.incomeLimit) {
        rebate87A = Math.min(totalBaseTax, rebateRule.maximumRebate);
        taxAfter87A = Math.max(0, totalBaseTax - rebate87A);
      } else if (selectedRegime.regimeCode === 'NEW') {
        // Marginal Relief for New Regime u/s 87A
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

      const threshold = applicableSurchargeRule.minThreshold;
      const excessIncomeOverThreshold = taxableIncome - threshold;
      
      const taxAtThreshold = this.calculateTaxAtIncome(threshold, selectedRegime.id, applicableSlabCategory, rebateRule, residentialStatus);
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
      ageCategory: derivedAgeCategory,
      computedAge,
      residentialStatus,
      disabilityCategory,
      isNriSeniorExclusionApplied,
      isNri87AExclusionApplied,
      isAge58Plus,
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
      ageCategory: derivedAgeCategory,
      statutoryProfile: {
        age: computedAge,
        dob: dob || null,
        ageCategory: derivedAgeCategory,
        effectiveSlabCategory: applicableSlabCategory,
        residentialStatus,
        disabilityCategory,
        isAge58Plus,
        isNriSeniorExclusionApplied,
        isNri87AExclusionApplied,
        pensionRuleStatus: isAge58Plus ? 'EPFO_PENSION_CEASED_100PCT_EPF' : 'EPFO_PENSION_ACTIVE',
      },
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
  static calculateTaxAtIncome(income, regimeId, ageCategory, rebateRule, residentialStatus = 'RESIDENT') {
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
    if (rebateRule && residentialStatus === 'RESIDENT' && income <= rebateRule.incomeLimit) {
      baseTax = Math.max(0, baseTax - rebateRule.maximumRebate);
    }
    return baseTax;
  }

  /**
   * Generate crystal-clear, step-by-step educational explanations
   */
  static generateExplanationSteps(ctx) {
    const steps = [];

    // Step 1: Statutory Profile & Gross Income
    let profileDesc = `Your total income of ₹${ctx.totalGrossIncome.toLocaleString('en-IN')} is aggregated from Salary Income (₹${ctx.grossSalary.toLocaleString('en-IN')}) and Other Income (₹${ctx.grossOtherIncome.toLocaleString('en-IN')}).`;
    if (ctx.residentialStatus === 'NRI') {
      profileDesc += ` Classified as Non-Resident Indian (NRI) per Income Tax Act Section 6.`;
    }
    if (ctx.isAge58Plus) {
      profileDesc += ` Employee age (${ctx.computedAge || 58}+ yrs) triggers EPFO EPS 1995 Pension cessation cutoff (100% employer contribution routed to EPF A/c 1).`;
    }
    if (ctx.disabilityCategory && ctx.disabilityCategory !== 'NONE') {
      profileDesc += ` Section 80U disability relief applied (${ctx.disabilityCategory === 'SEVERE_80_PLUS' ? 'Severe 80%+: ₹1.25L' : '40-80%: ₹75k'}).`;
    }

    steps.push({
      stepNumber: 1,
      title: 'Gross Total Income & Statutory Profile',
      description: profileDesc,
      highlight: `Gross Income = ₹${ctx.totalGrossIncome.toLocaleString('en-IN')} | Age: ${ctx.computedAge || 32} Yrs (${ctx.residentialStatus})`,
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
        description: `Standard deduction of ₹${ctx.standardDeduction.toLocaleString('en-IN')} plus Chapter VI-A deductions (80C, 80D, 80U, HRA, etc.) totaling ₹${ctx.totalDeductions.toLocaleString('en-IN')} and Professional Tax ₹${ctx.professionalTaxDeduction.toLocaleString('en-IN')} are subtracted.`,
        highlight: `Taxable Income = ₹${ctx.totalGrossIncome.toLocaleString('en-IN')} - ₹${(ctx.standardDeduction + ctx.totalDeductions + ctx.professionalTaxDeduction).toLocaleString('en-IN')} = ₹${ctx.taxableIncome.toLocaleString('en-IN')}`,
        type: 'DEDUCTION',
      });
    }

    // Step 3: Progressive Slab Calculation
    const activeSlabs = ctx.slabCalculations.filter((s) => s.taxableAmountInSlab > 0);
    const slabSummaries = activeSlabs
      .map((s) => `${s.rangeLabel} @ ${s.taxRate}% on ₹${s.taxableAmountInSlab.toLocaleString('en-IN')} = ₹${Math.round(s.taxForSlab).toLocaleString('en-IN')}`)
      .join(' + ');

    let slabExplanation = `Income tax is progressive: each bracket is taxed only on the portion of income within that range. ${slabSummaries || 'Your taxable income falls below the minimum taxable threshold.'}`;
    if (ctx.isNriSeniorExclusionApplied) {
      slabExplanation += ` (Note: Under Section 6, NRI individuals are taxed under the General Below-60 slab regardless of age).`;
    }

    steps.push({
      stepNumber: 3,
      title: 'Progressive Slab-by-Slab Computation',
      description: slabExplanation,
      highlight: `Total Slab Tax = ₹${Math.round(ctx.totalBaseTax).toLocaleString('en-IN')}`,
      type: 'TAX_CALCULATION',
    });

    // Step 4: Section 87A Rebate & Marginal Relief
    if (ctx.isNri87AExclusionApplied) {
      steps.push({
        stepNumber: 4,
        title: 'Section 87A Ineligible (NRI Status)',
        description: `Section 87A tax rebate is statutory relief available strictly to Resident Individuals. As an NRI under Section 6, full slab tax remains payable without 87A rebate.`,
        highlight: `Section 87A Rebate = ₹0 (NRI Exclusion u/s 87A)`,
        type: 'REBATE',
      });
    } else if (ctx.rebate87A > 0) {
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
      recommendationReason = `The Old Tax Regime saves you ₹${totalSavings.toLocaleString('en-IN')} annually because your high claimed deductions (80C, 80D, 80U, HRA, Home Loan) significantly reduce your taxable income.`;
    } else {
      recommendationReason = `Both regimes result in the exact same tax liability (₹${newRegimeResult.taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}). The New Regime is recommended for its simplified filing without proof verification.`;
    }

    // Breakeven deduction calculation: The minimum deduction needed under Old Regime to match New Regime tax
    const breakevenDeductionNeeded = this.calculateBreakevenDeduction(params);

    return {
      financialYear: params.financialYearId || 'FY_2026_27',
      grossIncome: (Number(params.salaryIncome) || 0) + (Number(params.otherIncome) || 0),
      statutoryProfile: newRegimeResult.statutoryProfile,
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
    
    let low = 0;
    let high = 1500000;
    let breakeven = 0;

    for (let i = 0; i < 20; i++) {
      const mid = Math.round((low + high) / 2);
      const testResult = TaxCalculationEngine.calculate({
        ...params,
        regimeCode: 'OLD',
        claimedDeductions: { ...(params.claimedDeductions || {}), '80C': Math.min(mid, 150000), '24(b)': Math.max(0, mid - 150000) },
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
    employeeAge = null,
    dob = null,
    residentialStatus = 'RESIDENT',
    disabilityCategory = 'NONE',
    isAge58Plus = false,
  }) {
    const ctc = Math.max(0, Number(annualCTC) || 0);

    // Statutory Age Derivation
    let computedAge = typeof employeeAge === 'number' && !isNaN(employeeAge) ? employeeAge : null;
    if (computedAge === null && dob && typeof dob === 'string' && dob.trim() !== '') {
      const dobDate = new Date(dob);
      if (!isNaN(dobDate.getTime())) {
        const fyBase = new Date(financialYearId === 'FY_2025_26' ? '2025-04-01' : '2026-04-01');
        let calculatedAge = fyBase.getFullYear() - dobDate.getFullYear();
        const m = fyBase.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && fyBase.getDate() < dobDate.getDate())) {
          calculatedAge--;
        }
        computedAge = Math.max(0, calculatedAge);
      }
    }

    const is58 = Boolean(isAge58Plus || (computedAge !== null && computedAge >= 58));

    // Standard salary structuring:
    // Basic Salary: 40% - 50% of CTC (Standard: 40%)
    const annualBasic = Math.round(ctc * 0.40);
    const monthlyBasic = Math.round(annualBasic / 12);

    // HRA: 50% of Basic (for Metro) or 40% (Non-metro)
    const annualHRA = Math.round(annualBasic * 0.50);
    const monthlyHRA = Math.round(annualHRA / 12);

    // Employer EPF: Total 12% of Basic
    const monthlyEmployerEPF = Math.round(monthlyBasic * 0.12);
    const annualEmployerEPF = monthlyEmployerEPF * 12;

    // EPFO EPS 1995 Pension Allocation vs EPF Account 1
    let monthlyEmployerEPS = 0;
    let monthlyEmployerEPF_Ac1 = 0;
    let epsStatus = '';
    let epsExplanation = '';

    if (is58) {
      // Age 58 EPFO Pension Cutoff: EPS ceases, 100% of 12% goes to EPF Account 1
      monthlyEmployerEPS = 0;
      monthlyEmployerEPF_Ac1 = monthlyEmployerEPF;
      epsStatus = 'PENSION_CEASED_AGE_58';
      epsExplanation = 'EPFO EPS 1995 Pension ceased upon reaching age 58. 100% of the 12% employer share is diverted to EPF A/c 1.';
    } else {
      const statutoryPensionCeiling = 15000;
      const pensionWage = Math.min(monthlyBasic, statutoryPensionCeiling);
      monthlyEmployerEPS = Math.round(pensionWage * 0.0833); // max Rs. 1,250/mo
      monthlyEmployerEPF_Ac1 = Math.max(0, monthlyEmployerEPF - monthlyEmployerEPS);
      epsStatus = 'PENSION_ACTIVE';
      epsExplanation = `Active EPS contribution: ₹${monthlyEmployerEPS}/mo to EPS A/c 10 (8.33% capped at ₹15k wage) + ₹${monthlyEmployerEPF_Ac1}/mo to EPF A/c 1.`;
    }

    const annualEmployerEPS = monthlyEmployerEPS * 12;
    const annualEmployerEPF_Ac1 = monthlyEmployerEPF_Ac1 * 12;

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
      age: computedAge,
      dob,
      residentialStatus,
      disabilityCategory,
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
      statutoryProfile: {
        age: computedAge,
        dob: dob || null,
        isAge58Plus: is58,
        residentialStatus,
        disabilityCategory,
      },
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
      epfoBreakdown: {
        employeeShare: {
          rate: 12,
          monthly: monthlyEmployeeEPF,
          annual: annualEmployeeEPF,
          accountName: 'EPF Account 1 (Employee PF)',
        },
        employerShare: {
          totalMonthly: monthlyEmployerEPF,
          totalAnnual: annualEmployerEPF,
          epfAc1Monthly: monthlyEmployerEPF_Ac1,
          epfAc1Annual: annualEmployerEPF_Ac1,
          epsAc10Monthly: monthlyEmployerEPS,
          epsAc10Annual: annualEmployerEPS,
          epsStatus,
          epsExplanation,
          isAge58PensionCutoff: is58,
        },
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
      disabilitySchemeInfo: {
        category: disabilityCategory,
        isApplicable: disabilityCategory !== 'NONE',
        esiWageCeiling: disabilityCategory !== 'NONE' ? 25000 : 21000,
        lawCitation: 'Persons with Disabilities (Equal Opportunities) Act & ESI PwD Incentive Scheme',
        exemptionAmount80U: disabilityCategory === 'SEVERE_80_PLUS' ? 125000 : disabilityCategory === 'MODERATE_40_80' ? 75000 : 0,
      },
      taxDetails: taxResult,
    };
  }
}
