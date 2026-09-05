import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Title,
  SegmentedControl,
  NumberInput,
  Slider,
  Switch,
  Select,
  Accordion,
  ThemeIcon,
  Divider,
  Tooltip,
  Alert,
  Tabs,
} from '@mantine/core';
import {
  IconCalculator,
  IconReceiptTax,
  IconDatabase,
  IconBriefcase,
  IconSparkles,
  IconRefresh,
  IconScale,
  IconInfoCircle,
  IconCoins,
  IconCheck,
  IconChevronRight,
  IconWallet,
} from '@tabler/icons-react';

import { useTaxCalculator } from './useTaxCalculator';
import { SlabVisualizer } from './SlabVisualizer';
import { TaxExplanationCard } from './TaxExplanationCard';
import { RegimeComparisonCard } from './RegimeComparisonCard';
import { PayrollCtcDrawer } from './PayrollCtcDrawer';
import { AdminTaxRuleModal } from './AdminTaxRuleModal';

export const TaxCalculatorView = () => {
  const {
    rules,
    loadingRules,
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
    refreshAll,
  } = useTaxCalculator();

  const [ctcDrawerOpened, setCtcDrawerOpened] = useState(false);
  const [adminModalOpened, setAdminModalOpened] = useState(false);

  const handleDeductionChange = (section, value) => {
    setClaimedDeductions((prev) => ({
      ...prev,
      [section]: Number(value) || 0,
    }));
  };

  const isZeroTax = taxResult?.taxBreakdown?.totalTaxPayable === 0;

  return (
    <Stack gap="lg">
      {/* Top Banner & Header */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="sm">
            <ThemeIcon size="xl" radius="md" color="indigo" variant="gradient" gradient={{ from: 'indigo', to: 'violet' }}>
              <IconCalculator size={24} />
            </ThemeIcon>
            <div>
              <Group gap="xs">
                <Title order={3} c="#0F172A">
                  Indian Income Tax Studio & Statutory Rules Engine
                </Title>
                <Badge size="md" color="teal" variant="filled">
                  FY 2026-27 Union Budget Reforms
                </Badge>
              </Group>
              <Text size="xs" c="#64748B" mt={2}>
                Database-driven calculations with zero hardcoding • Section 87A Rebate up to ₹12L • Gratuity & Statutory Bonus Act
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="indigo"
              leftSection={<IconBriefcase size={14} />}
              onClick={() => setCtcDrawerOpened(true)}
            >
              CTC & Gratuity Breakdown
            </Button>

            <Button
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconDatabase size={14} />}
              onClick={() => setAdminModalOpened(true)}
            >
              DB Tax Rules Config
            </Button>
          </Group>
        </Group>

        <Divider my="md" color="#F1F5F9" />

        {/* Quick Scenario Preset Chips */}
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
            Quick Scenarios:
          </Text>
          <Group gap="xs" wrap="wrap">
            <Button
              size="compact-xs"
              variant="light"
              color="teal"
              leftSection={<IconSparkles size={12} />}
              onClick={() => applyPreset('ZERO_TAX_12_75L')}
            >
              ₹12.75L Zero Tax Case
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="blue"
              onClick={() => applyPreset('MID_CAREER_15L')}
            >
              ₹15L Mid-Career
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="indigo"
              onClick={() => applyPreset('SENIOR_EXEC_30L')}
            >
              ₹30L Senior Exec
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="orange"
              onClick={() => applyPreset('HNI_75L')}
            >
              ₹75L HNI (Surcharge)
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="violet"
              onClick={() => applyPreset('OLD_REGIME_SAVER')}
            >
              Old Regime Max Saver
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Main Studio Grid */}
      <SimpleGrid cols={{ base: 1, lg: 12 }} spacing="lg">
        {/* LEFT COLUMN: Controls & Input Studio (5 Columns) */}
        <div style={{ gridColumn: 'span 5' }}>
          <Stack gap="md">
            <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Text size="xs" fw={700} c="#0F172A" mb="sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Tax Profile & Regime Selection
              </Text>

              <Stack gap="sm">
                <div>
                  <Text size="xs" c="#64748B" mb={4}>
                    Financial Year & Assessment Year
                  </Text>
                  <Select
                    size="xs"
                    value={financialYearId}
                    onChange={setFinancialYearId}
                    data={[
                      { value: 'FY_2026_27', label: 'FY 2026-27 (AY 2027-28) - Latest Reforms' },
                      { value: 'FY_2025_26', label: 'FY 2025-26 (AY 2026-27)' },
                    ]}
                  />
                </div>

                <div>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="#64748B">
                      Tax Regime
                    </Text>
                    <Badge size="xs" color={regimeCode === 'NEW' ? 'teal' : 'blue'}>
                      {regimeCode === 'NEW' ? 'Std Ded: ₹75,000' : 'Std Ded: ₹50,000'}
                    </Badge>
                  </Group>
                  <SegmentedControl
                    fullWidth
                    size="xs"
                    value={regimeCode}
                    onChange={setRegimeCode}
                    data={[
                      { label: 'New Tax Regime (u/s 115BAC)', value: 'NEW' },
                      { label: 'Old Tax Regime (Exemptions)', value: 'OLD' },
                    ]}
                    color="indigo"
                  />
                </div>

                <SimpleGrid cols={2} spacing="xs">
                  <div>
                    <Text size="xs" c="#64748B" mb={4}>
                      Age Category
                    </Text>
                    <Select
                      size="xs"
                      value={ageCategory}
                      onChange={setAgeCategory}
                      data={[
                        { value: 'BELOW_60', label: '< 60 Years (General)' },
                        { value: '60_TO_80', label: '60 - 80 Yrs (Senior)' },
                        { value: 'ABOVE_80', label: '80+ Yrs (Super Senior)' },
                      ]}
                    />
                  </div>

                  <div>
                    <Text size="xs" c="#64748B" mb={4}>
                      Work State (PT)
                    </Text>
                    <Select
                      size="xs"
                      value={stateCode}
                      onChange={setStateCode}
                      data={[
                        { value: 'MH', label: 'Maharashtra (₹2.5k)' },
                        { value: 'KA', label: 'Karnataka (₹2.4k)' },
                        { value: 'DL', label: 'Delhi NCR (₹0)' },
                        { value: 'GJ', label: 'Gujarat (₹2.4k)' },
                        { value: 'TN', label: 'Tamil Nadu (₹2.5k)' },
                        { value: 'TS', label: 'Telangana (₹2.4k)' },
                      ]}
                    />
                  </div>
                </SimpleGrid>

                <Group justify="space-between" mt={4}>
                  <Text size="xs" c="#475569">
                    Salaried Individual (Claim Standard Deduction)
                  </Text>
                  <Switch
                    checked={isSalaried}
                    onChange={(e) => setIsSalaried(e.currentTarget.checked)}
                    color="indigo"
                    size="sm"
                  />
                </Group>
              </Stack>
            </Paper>

            {/* Income Inputs */}
            <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Text size="xs" fw={700} c="#0F172A" mb="sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2. Annual Income Details
              </Text>

              <Stack gap="md">
                <div>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={600} c="#0F172A">
                      Gross Salary Income (Annual CTC / Base)
                    </Text>
                    <Text size="xs" fw={700} c="#2563EB">
                      ₹{salaryIncome.toLocaleString('en-IN')}
                    </Text>
                  </Group>
                  <NumberInput
                    size="sm"
                    prefix="₹ "
                    thousandSeparator=","
                    value={salaryIncome}
                    onChange={(val) => setSalaryIncome(Number(val) || 0)}
                    min={0}
                    step={25000}
                    mb="xs"
                  />
                  <Slider
                    min={0}
                    max={10000000}
                    step={50000}
                    value={salaryIncome}
                    onChange={setSalaryIncome}
                    color="indigo"
                    size="sm"
                    marks={[
                      { value: 1275000, label: '12.75L' },
                      { value: 2400000, label: '24L' },
                      { value: 5000000, label: '50L' },
                    ]}
                  />
                </div>

                <div style={{ marginTop: '14px' }}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={600} c="#0F172A">
                      Other Income (Interest, Rental, Capital Gains)
                    </Text>
                    <Text size="xs" fw={700} c="#475569">
                      ₹{otherIncome.toLocaleString('en-IN')}
                    </Text>
                  </Group>
                  <NumberInput
                    size="sm"
                    prefix="₹ "
                    thousandSeparator=","
                    value={otherIncome}
                    onChange={(val) => setOtherIncome(Number(val) || 0)}
                    min={0}
                    step={10000}
                  />
                </div>
              </Stack>
            </Paper>

            {/* Deductions (Active for Old Regime) */}
            <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" align="center" mb="sm">
                <div>
                  <Text size="xs" fw={700} c="#0F172A" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    3. Chapter VI-A Deductions
                  </Text>
                  <Text size="10px" c="#64748B">
                    {regimeCode === 'OLD' ? 'Active under Old Tax Regime' : 'Exemptions not applicable in New Regime'}
                  </Text>
                </div>
                {regimeCode === 'NEW' && (
                  <Badge size="xs" color="gray" variant="light">
                    Disabled in New Regime
                  </Badge>
                )}
              </Group>

              {regimeCode === 'NEW' ? (
                <Paper p="sm" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                  <Text size="xs" c="#64748B">
                    Under the <strong>New Tax Regime (u/s 115BAC)</strong>, Chapter VI-A deductions (80C, 80D, HRA, 24b) are not required. You receive an automatic ₹75,000 Standard Deduction and simplified lower slab rates.
                  </Text>
                </Paper>
              ) : (
                <Stack gap="xs">
                  <div>
                    <Group justify="space-between" mb={2}>
                      <Text size="xs" c="#475569">Section 80C (PPF, EPF, ELSS, Insurance - Max ₹1.5L)</Text>
                      <Text size="11px" fw={600} c="#0F172A">₹{claimedDeductions['80C']?.toLocaleString('en-IN')}</Text>
                    </Group>
                    <NumberInput
                      size="xs"
                      prefix="₹ "
                      thousandSeparator=","
                      value={claimedDeductions['80C']}
                      onChange={(v) => handleDeductionChange('80C', v)}
                      max={150000}
                    />
                  </div>

                  <div>
                    <Group justify="space-between" mb={2}>
                      <Text size="xs" c="#475569">Section 80D (Health Insurance - Max ₹75k)</Text>
                      <Text size="11px" fw={600} c="#0F172A">₹{claimedDeductions['80D']?.toLocaleString('en-IN')}</Text>
                    </Group>
                    <NumberInput
                      size="xs"
                      prefix="₹ "
                      thousandSeparator=","
                      value={claimedDeductions['80D']}
                      onChange={(v) => handleDeductionChange('80D', v)}
                      max={75000}
                    />
                  </div>

                  <div>
                    <Group justify="space-between" mb={2}>
                      <Text size="xs" c="#475569">Section 80CCD(1B) (NPS Tier 1 - Max ₹50k)</Text>
                      <Text size="11px" fw={600} c="#0F172A">₹{claimedDeductions['80CCD(1B)']?.toLocaleString('en-IN')}</Text>
                    </Group>
                    <NumberInput
                      size="xs"
                      prefix="₹ "
                      thousandSeparator=","
                      value={claimedDeductions['80CCD(1B)']}
                      onChange={(v) => handleDeductionChange('80CCD(1B)', v)}
                      max={50000}
                    />
                  </div>

                  <div>
                    <Group justify="space-between" mb={2}>
                      <Text size="xs" c="#475569">Section 24(b) (Home Loan Interest - Max ₹2L)</Text>
                      <Text size="11px" fw={600} c="#0F172A">₹{claimedDeductions['24(b)']?.toLocaleString('en-IN')}</Text>
                    </Group>
                    <NumberInput
                      size="xs"
                      prefix="₹ "
                      thousandSeparator=","
                      value={claimedDeductions['24(b)']}
                      onChange={(v) => handleDeductionChange('24(b)', v)}
                      max={200000}
                    />
                  </div>

                  <div>
                    <Group justify="space-between" mb={2}>
                      <Text size="xs" c="#475569">Section 10(13A) (HRA Exemption Claim)</Text>
                      <Text size="11px" fw={600} c="#0F172A">₹{claimedDeductions['10(13A)']?.toLocaleString('en-IN')}</Text>
                    </Group>
                    <NumberInput
                      size="xs"
                      prefix="₹ "
                      thousandSeparator=","
                      value={claimedDeductions['10(13A)']}
                      onChange={(v) => handleDeductionChange('10(13A)', v)}
                    />
                  </div>
                </Stack>
              )}
            </Paper>
          </Stack>
        </div>

        {/* RIGHT COLUMN: Output Dashboard & Interactive Studio (7 Columns) */}
        <div style={{ gridColumn: 'span 7' }}>
          <Stack gap="md">
            {/* Top KPI Summary Banner */}
            {taxResult && (
              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <div>
                    <Text size="10px" c="#94A3B8" style={{ textTransform: 'uppercase' }}>
                      Taxable Income
                    </Text>
                    <Text size="lg" fw={800} c="#FFFFFF">
                      ₹{taxResult.taxableIncome.toLocaleString('en-IN')}
                    </Text>
                    <Text size="10px" c="#94A3B8">
                      After ₹{taxResult.incomeSummary.standardDeduction.toLocaleString('en-IN')} Std Ded
                    </Text>
                  </div>

                  <div>
                    <Text size="10px" c="#94A3B8" style={{ textTransform: 'uppercase' }}>
                      Final Tax Payable
                    </Text>
                    <Text size="lg" fw={800} c={isZeroTax ? '#4ADE80' : '#F87171'}>
                      ₹{taxResult.taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}
                    </Text>
                    <Text size="10px" c={isZeroTax ? '#4ADE80' : '#94A3B8'}>
                      {isZeroTax ? '🎉 100% Tax Free u/s 87A' : `Incl. 4% Cess (₹${taxResult.taxBreakdown.cess.amount.toLocaleString('en-IN')})`}
                    </Text>
                  </div>

                  <div>
                    <Text size="10px" c="#94A3B8" style={{ textTransform: 'uppercase' }}>
                      Monthly TDS
                    </Text>
                    <Text size="lg" fw={800} c="#60A5FA">
                      ₹{taxResult.taxBreakdown.monthlyTDS.toLocaleString('en-IN')}
                    </Text>
                    <Text size="10px" c="#94A3B8">
                      Estimated per month
                    </Text>
                  </div>

                  <div>
                    <Text size="10px" c="#94A3B8" style={{ textTransform: 'uppercase' }}>
                      Monthly Take-Home
                    </Text>
                    <Text size="lg" fw={800} c="#4ADE80">
                      ₹{taxResult.metrics.netMonthlyTakeHome.toLocaleString('en-IN')}
                    </Text>
                    <Text size="10px" c="#94A3B8">
                      Effective Rate: {taxResult.metrics.effectiveTaxRate}%
                    </Text>
                  </div>
                </SimpleGrid>
              </Paper>
            )}

            {/* Slab Visualizer */}
            <SlabVisualizer taxResult={taxResult} regimeCode={regimeCode} />

            {/* Regime Comparison Card */}
            <RegimeComparisonCard
              comparisonResult={comparisonResult}
              currentRegime={regimeCode}
              onSelectRegime={setRegimeCode}
            />

            {/* Educational Explanation Studio */}
            <TaxExplanationCard taxResult={taxResult} />
          </Stack>
        </div>
      </SimpleGrid>

      {/* Drawers & Modals */}
      <PayrollCtcDrawer
        opened={ctcDrawerOpened}
        onClose={() => setCtcDrawerOpened(false)}
        payrollResult={payrollResult}
        serviceTenureYears={serviceTenureYears}
        setServiceTenureYears={setServiceTenureYears}
        bonusPercentage={bonusPercentage}
        setBonusPercentage={setBonusPercentage}
        stateCode={stateCode}
        setStateCode={setStateCode}
      />

      <AdminTaxRuleModal
        opened={adminModalOpened}
        onClose={() => setAdminModalOpened(false)}
        rules={rules}
        onUpdateSlab={updateSlabInDB}
      />
    </Stack>
  );
};
