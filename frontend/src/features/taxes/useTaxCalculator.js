import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/tax';

export const useTaxCalculator = () => {
  // Database-driven configuration state
  const [rules, setRules] = useState(null);
  const [loadingRules, setLoadingRules] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // User input state
  const [financialYearId, setFinancialYearId] = useState('FY_2026_27');
  const [regimeCode, setRegimeCode] = useState('NEW');
  const [ageCategory, setAgeCategory] = useState('BELOW_60');
  const [isSalaried, setIsSalaried] = useState(true);
  const [salaryIncome, setSalaryIncome] = useState(1275000); // Default to famous ₹12.75L zero tax case
  const [otherIncome, setOtherIncome] = useState(0);
  const [stateCode, setStateCode] = useState('MH');
  const [serviceTenureYears, setServiceTenureYears] = useState(5);
  const [bonusPercentage, setBonusPercentage] = useState(8.33);

  // Claimed deductions for Old Regime
  const [claimedDeductions, setClaimedDeductions] = useState({
    '80C': 150000,
    '80D': 25000,
    '80CCD(1B)': 50000,
    '24(b)': 200000,
    '10(13A)': 120000,
    '80TTA/80TTB': 10000,
  });

  // Calculation Results
  const [taxResult, setTaxResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [payrollResult, setPayrollResult] = useState(null);

  // Fetch DB rules on mount or FY change
  const fetchRules = useCallback(async () => {
    try {
      setLoadingRules(true);
      const res = await fetch(`${API_BASE}/rules?financialYearId=${financialYearId}`);
      const json = await res.json();
      if (json.success) {
        setRules(json.data);
      }
    } catch (err) {
      console.error('Failed to load tax rules from database:', err);
    } finally {
      setLoadingRules(false);
    }
  }, [financialYearId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Perform Calculation & Comparison
  const calculateAll = useCallback(async () => {
    try {
      setCalculating(true);
      const payload = {
        salaryIncome,
        otherIncome,
        financialYearId,
        regimeCode,
        ageCategory,
        claimedDeductions,
        stateCode,
        isSalaried,
      };

      // 1. Calculate for selected regime
      const calcPromise = fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      // 2. Compare New vs Old
      const compPromise = fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      // 3. Calculate Payroll CTC & In-hand
      const payrollPromise = fetch(`${API_BASE}/payroll-ctc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annualCTC: salaryIncome,
          stateCode,
          serviceTenureYears,
          bonusPercentage,
          regimeCode,
          financialYearId,
        }),
      }).then((r) => r.json());

      const [calcRes, compRes, payRes] = await Promise.all([calcPromise, compPromise, payrollPromise]);

      if (calcRes.success) setTaxResult(calcRes.data);
      if (compRes.success) setComparisonResult(compRes.data);
      if (payRes.success) setPayrollResult(payRes.data);
    } catch (err) {
      console.error('Tax calculation error:', err);
    } finally {
      setCalculating(false);
    }
  }, [
    salaryIncome,
    otherIncome,
    financialYearId,
    regimeCode,
    ageCategory,
    claimedDeductions,
    stateCode,
    isSalaried,
    serviceTenureYears,
    bonusPercentage,
  ]);

  // Recalculate whenever inputs change
  useEffect(() => {
    calculateAll();
  }, [calculateAll]);

  // Quick Preset Scenarios
  const applyPreset = (presetName) => {
    switch (presetName) {
      case 'ZERO_TAX_12_75L':
        setSalaryIncome(1275000);
        setOtherIncome(0);
        setRegimeCode('NEW');
        setIsSalaried(true);
        break;
      case 'MID_CAREER_15L':
        setSalaryIncome(1500000);
        setOtherIncome(50000);
        setRegimeCode('NEW');
        break;
      case 'SENIOR_EXEC_30L':
        setSalaryIncome(3000000);
        setOtherIncome(150000);
        setRegimeCode('NEW');
        break;
      case 'HNI_75L':
        setSalaryIncome(7500000);
        setOtherIncome(500000);
        setRegimeCode('NEW');
        break;
      case 'OLD_REGIME_SAVER':
        setSalaryIncome(1600000);
        setOtherIncome(50000);
        setRegimeCode('OLD');
        setClaimedDeductions({
          '80C': 150000,
          '80D': 50000,
          '80CCD(1B)': 50000,
          '24(b)': 200000,
          '10(13A)': 180000,
          '80TTA/80TTB': 10000,
        });
        break;
      default:
        break;
    }
  };

  // Admin update slab
  const updateSlabInDB = async (slabId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/admin/slabs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slabId, ...updates }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchRules();
        await calculateAll();
      }
      return json;
    } catch (err) {
      console.error('Failed to update slab in DB:', err);
      return { success: false, message: err.message };
    }
  };

  return {
    rules,
    loadingRules,
    calculating,
    financialYearId,
    setFinancialYearId,
    regimeCode,
    setRegimeCode,
    ageCategory,
    setAgeCategory,
    isSalaried,
    setIsSalaried,
    salaryIncome,
    setSalaryIncome,
    otherIncome,
    setOtherIncome,
    stateCode,
    setStateCode,
    serviceTenureYears,
    setServiceTenureYears,
    bonusPercentage,
    setBonusPercentage,
    claimedDeductions,
    setClaimedDeductions,
    taxResult,
    comparisonResult,
    payrollResult,
    applyPreset,
    updateSlabInDB,
    refreshAll: () => {
      fetchRules();
      calculateAll();
    },
  };
};
