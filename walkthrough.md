# Walkthrough: Indian Income Tax Studio & Statutory Rules Engine (FY 2026-27 / AY 2027-28)

We have successfully implemented and integrated a production-ready **Indian Income Tax Calculator, Tax Rule Database, and Statutory Payroll Components Engine** according to the latest **FY 2026-27 Union Budget Tax Reforms** (Assessment Year 2027-28).

---

## 1. Zero Hardcoding Architecture

Everything is driven by dynamic relational database models in [`backend/src/lib/taxRulesRepository.js`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/backend/src/lib/taxRulesRepository.js):

- **Financial Years & Assessment Years**: `FY_2026_27` (AY 2027-28), `FY_2025_26` (AY 2026-27).
- **Tax Regimes**: `REGIME_NEW_2026_27` (u/s 115BAC, ₹75k std ded) & `REGIME_OLD_2026_27` (₹50k std ded).
- **New Tax Slabs (FY 2026-27)**:
  - ₹0 - ₹4,00,000: **0%**
  - ₹4,00,000 - ₹8,00,000: **5%**
  - ₹8,00,000 - ₹12,00,000: **10%**
  - ₹12,00,000 - ₹16,00,000: **15%**
  - ₹16,00,000 - ₹20,00,000: **20%**
  - ₹20,00,000 - ₹24,00,000: **25%**
  - Above ₹24,00,000: **30%**
- **Section 87A Rebate**:
  - New Regime: 100% tax rebate up to ₹60,000 for taxable income ≤ ₹12,00,000 (Gross Salary of ₹12.75L with ₹75k standard deduction = ₹0 tax).
  - Old Regime: Tax rebate up to ₹12,500 for taxable income ≤ ₹5,00,000.
- **Section 87A & Surcharge Marginal Relief**: Fully computes relief on threshold boundaries.
- **Chapter VI-A Deductions**: 80C (₹1.5L), 80D (₹75k), 80CCD(1B) (₹50k), 24(b) (₹2L), 10(13A) HRA, 80TTA/80TTB.
- **Statutory Acts**:
  - **Payment of Gratuity Act, 1972**: `(15 / 26) * monthly basic * tenure` (>= 5 years service eligibility, ₹20 Lakh tax exemption ceiling).
  - **Payment of Bonus Act, 1965**: 8.33% to 20% on ₹7,000 statutory wage limit with ₹21,000 salary eligibility limit.
  - **State Professional Tax**: State-specific rules (Maharashtra ₹2,500 cap, Karnataka ₹2,400 cap, Delhi ₹0).

---

## 2. Verified Test Cases

All 7 core calculation test cases passed with 100% precision:

| Test Case | Scenario | Expected | Result | Status |
|---|---|---|---|---|
| **1** | Gross Salary ₹12.75L (New Regime) | Taxable ₹12L, Base Tax ₹60k, 87A Rebate ₹60k | **₹0 Tax** | ✅ **PASSED** |
| **2** | Gross Salary ₹15L (New Regime) | Taxable ₹14.25L, Base Tax ₹93,750 + 4% Cess | **₹97,500** | ✅ **PASSED** |
| **3** | Gross Salary ₹20L (Taxable ₹20L) | Slabs 0-20L + 4% Cess | **₹2,08,000** | ✅ **PASSED** |
| **4** | Taxable Income ₹30L (New Regime) | Slabs 0-30L + 4% Cess (Base ₹4.8L + ₹19.2k) | **₹4,99,200** | ✅ **PASSED** |
| **5** | Gratuity on ₹60k Basic, 7 Yrs | `(15/26) * 60,000 * 7` | **₹2,42,308** | ✅ **PASSED** |
| **6** | Statutory Bonus 8.33% on ₹7k wage | `7,000 * 12 * 8.33%` | **₹6,997.20** | ✅ **PASSED** |
| **7** | Maharashtra Professional Tax | State PT Annual Cap | **₹2,500/yr** | ✅ **PASSED** |

---

## 3. Frontend UI Components

Created the feature module [`frontend/src/features/taxes/`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/):
1. [`useTaxCalculator.js`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/useTaxCalculator.js): Dynamic hook loading rules from REST API and calculating in real-time.
2. [`TaxCalculatorView.jsx`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/TaxCalculatorView.jsx): Master studio with quick preset chips (`₹12.75L Zero Tax`, `₹15L Mid-Career`, `₹30L Senior Exec`, `₹75L HNI`, `Old Regime Saver`), live sliders, and summary KPI cards.
3. [`SlabVisualizer.jsx`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/SlabVisualizer.jsx): Color-coded progressive slab utilization cards with animated progress bars.
4. [`TaxExplanationCard.jsx`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/TaxExplanationCard.jsx): Visual pipeline and plain-English step-by-step accordion.
5. [`RegimeComparisonCard.jsx`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/RegimeComparisonCard.jsx): Side-by-side Old vs New comparison with breakeven deduction calculations.
6. [`PayrollCtcDrawer.jsx`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/PayrollCtcDrawer.jsx): Full CTC structuring, Gratuity Act 1972, and Bonus Act 1965 drawer.
7. [`AdminTaxRuleModal.jsx`](file:///c:/Users/dhruv/OneDrive/Desktop/PayPilot/PayPilot/frontend/src/features/taxes/AdminTaxRuleModal.jsx): Real-time DB tax rule inspector and live slab editor.

---

## 4. Git & Branch Status
- Pulled latest changes from `origin/main` (including Approvals & UserMenu updates).
- Committed tax feature on `main` branch.
