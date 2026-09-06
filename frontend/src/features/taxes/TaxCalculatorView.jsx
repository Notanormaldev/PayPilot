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
  IconDownload,
  IconUserCheck,
} from '@tabler/icons-react';

import { useTaxCalculator } from './useTaxCalculator';
import { SlabVisualizer } from './SlabVisualizer';
import { TaxExplanationCard } from './TaxExplanationCard';
import { RegimeComparisonCard } from './RegimeComparisonCard';
import { PayrollCtcDrawer } from './PayrollCtcDrawer';
import { AdminTaxRuleModal } from './AdminTaxRuleModal';
import { useAuthUser } from '../auth/hooks/useAuthUser';
import { useEmployees } from '../employees/hooks/useEmployees';
import { generateTaxBreakdownPdf } from '../../lib/taxBreakdownPdfGenerator';
import { canAccessTaxStatement, getAuthorizedEmployeesForUser } from './taxAccessControl';

export const TaxCalculatorView = ({ targetEmployee = null }) => {
  const { user, currentRole } = useAuthUser();
  const { employees } = useEmployees();
  const isEmployee = currentRole === 'EMPLOYEE';

  const {
    rules,
    loadingRules,
    financialYearId,
    setFinancialYearId,
    regimeCode,
    setRegimeCode,
    ageCategory,
    setAgeCategory,
    age,
    setAge,
    dob,
    setDob,
    residentialStatus,
    setResidentialStatus,
    disabilityCategory,
    setDisabilityCategory,
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(targetEmployee?.id || (isEmployee ? user?.id || 'EMP-8492' : 'CUSTOM'));

  // Get list of employees authorized for this role
  const allEmployeesList = Array.isArray(employees) ? employees : employees?.employees || [];
  const authorizedEmployees = getAuthorizedEmployeesForUser(user, allEmployeesList);

  const selectedEmpObject = allEmployeesList.find((e) => e.id === selectedEmployeeId) || (isEmployee ? {
    id: user?.id || 'EMP-8492',
    name: user?.name || 'Kartik Kumar',
    designation: user?.designation || 'Staff Software Engineer',
    department: user?.department || 'Engineering',
    pan: user?.pan || 'ABCPK8942F',
    uan: '101849204918',
    state: 'Maharashtra (MH)',
  } : {
    id: 'SIM-001',
    name: user?.name || 'Meera Krishnan (Simulation)',
    designation: 'Management Simulation',
    department: 'Corporate Payroll',
    pan: 'AAAAP1234F',
    uan: '109876543210',
    state: 'Maharashtra (MH)',
  });

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeId(empId);
    if (empId === 'CUSTOM') {
      return;
    }
    const emp = allEmployeesList.find((e) => e.id === empId);
    if (emp) {
      if (emp.salary || emp.annualCTC || emp.ctc) {
        setSalaryIncome(Number(emp.salary || emp.annualCTC || emp.ctc) || 1275000);
      }
      if (emp.department === 'Operations' || emp.role === 'Senior') {
        setServiceTenureYears(6);
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (!taxResult) return;
    try {
      setDownloadingPdf(true);
      await generateTaxBreakdownPdf(taxResult, selectedEmpObject, payrollResult || {});
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDeductionChange = (section, value) => {
    setClaimedDeductions((prev) => ({
      ...prev,
      [section]: Number(value) || 0,
    }));
  };

  const isZeroTax = taxResult?.taxBreakdown?.totalTaxPayable === 0;
  const isAge58Plus = age >= 58;

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
                Database-driven calculations • Section 87A Rebate • Age 58 EPS Pension Cutoff • Section 6 NRI Rules • Section 80U Disability Relief
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            {/* Download PDF Button */}
            <Button
              size="xs"
              color="blue"
              variant="filled"
              leftSection={<IconDownload size={14} />}
              loading={downloadingPdf}
              onClick={handleDownloadPdf}
            >
              {isEmployee ? 'Download My Tax Statement (PDF)' : 'Download Statement (PDF)'}
            </Button>

            <Button
              size="xs"
              variant="light"
              color="indigo"
              leftSection={<IconBriefcase size={14} />}
              onClick={() => setCtcDrawerOpened(true)}
            >
              CTC & Gratuity Breakdown
            </Button>

            {!isEmployee && (
              <Button
                size="xs"
                variant="outline"
                color="gray"
                leftSection={<IconDatabase size={14} />}
                onClick={() => setAdminModalOpened(true)}
              >
                DB Tax Rules Config
              </Button>
            )}
          </Group>
        </Group>

        {/* Role-Based Employee Selector for Admin/HR */}
        {!isEmployee && authorizedEmployees.length > 0 && (
          <Paper p="xs" radius="sm" mt="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconUserCheck size={16} color="#2563EB" />
                <Text size="xs" fw={700} c="#0F172A">
                  Target Employee Statement:
                </Text>
              </Group>
              <Select
                size="xs"
                style={{ width: '380px' }}
                value={selectedEmployeeId}
                onChange={handleSelectEmployee}
                data={[
                  { value: 'CUSTOM', label: '⚡ Custom Simulation / Calculator Mode' },
                  ...authorizedEmployees.map((e) => ({
                    value: e.id,
                    label: `${e.name} (${e.designation || e.department || 'Employee'}) - ${e.id}`,
                  })),
                ]}
              />
            </Group>
          </Paper>
        )}

        <Divider my="md" color="#F1F5F9" />

        {/* Quick Scenario Preset Chips */}
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
            Quick Statutory Scenarios:
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
              onClick={() => applyPreset('SENIOR_CITIZEN_65')}
            >
              👴 Senior (65 Yrs - ₹3L Exemption)
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="indigo"
              onClick={() => applyPreset('SUPER_SENIOR_82')}
            >
              👑 Super Senior (82 Yrs - ₹5L Exemption)
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="cyan"
              onClick={() => applyPreset('AGE_58_EPS_CUTOFF')}
            >
              ⚡ Age 58 EPS Cutoff
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="grape"
              onClick={() => applyPreset('NRI_EXPAT')}
            >
              🌐 NRI Expat (Sec 6)
            </Button>
            <Button
              size="compact-xs"
              variant="light"
              color="emerald"
              onClick={() => applyPreset('DISABILITY_RELIEF_80U')}
            >
              ♿ Sec 80U Disability Relief
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

      {/* Top Full-Width KPI Summary Strip */}
      {taxResult && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="10px" fw={700} c="#64748B" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Taxable Income
            </Text>
            <Text size="xl" fw={800} c="#0F172A">
              ₹{taxResult.taxableIncome.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c="#64748B">
              After ₹{taxResult.incomeSummary.standardDeduction.toLocaleString('en-IN')} Std Ded
            </Text>
          </Paper>

          <Paper p="md" radius="md" style={{ backgroundColor: isZeroTax ? '#F0FDF4' : '#FEF2F2', border: isZeroTax ? '1px solid #BBF7D0' : '1px solid #FECACA' }}>
            <Text size="10px" fw={700} c={isZeroTax ? '#15803D' : '#B91C1C'} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Final Tax Payable
            </Text>
            <Text size="xl" fw={800} c={isZeroTax ? '#15803D' : '#DC2626'}>
              ₹{taxResult.taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c={isZeroTax ? '#16A34A' : '#EF4444'}>
              {isZeroTax ? '🎉 100% Tax Free u/s 87A' : `Incl. 4% Cess (₹${taxResult.taxBreakdown.cess.amount.toLocaleString('en-IN')})`}
            </Text>
          </Paper>

          <Paper p="md" radius="md" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Text size="10px" fw={700} c="#1D4ED8" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Salary TDS
            </Text>
            <Text size="xl" fw={800} c="#1E40AF">
              ₹{taxResult.taxBreakdown.monthlyTDS.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c="#3B82F6">
              Estimated per month
            </Text>
          </Paper>

          <Paper p="md" radius="md" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Text size="10px" fw={700} c="#15803D" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Net Take-Home
            </Text>
            <Text size="xl" fw={800} c="#15803D">
              ₹{taxResult.metrics.netMonthlyTakeHome.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c="#16A34A">
              Effective Rate: {taxResult.metrics.effectiveTaxRate}%
            </Text>
          </Paper>
        </SimpleGrid>
      )}

      {/* Main Studio Grid */}
      <SimpleGrid cols={{ base: 1, lg: 12 }} spacing="lg">
        {/* LEFT COLUMN: Controls & Input Studio (5 Columns) */}
        <div style={{ gridColumn: 'span 5' }}>
          <Stack gap="md">
            <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Text size="xs" fw={700} c="#0F172A" mb="sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Statutory Profile & Tax Regime
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
                    styles={{
                      root: { backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' },
                      indicator: { backgroundColor: '#2563EB', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' },
                      label: { fontWeight: 600 },
                    }}
                  />
                </div>

                {/* Residential Status (Section 6) */}
                <div>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="#64748B">
                      Residential Status (Income Tax Act Section 6)
                    </Text>
                    <Badge size="xs" color={residentialStatus === 'RESIDENT' ? 'teal' : 'grape'}>
                      {residentialStatus === 'RESIDENT' ? 'Resident Indian' : 'Non-Resident (NRI)'}
                    </Badge>
                  </Group>
                  <SegmentedControl
                    fullWidth
                    size="xs"
                    value={residentialStatus}
                    onChange={setResidentialStatus}
                    data={[
                      { label: 'Resident Indian (Sec 6)', value: 'RESIDENT' },
                      { label: 'Non-Resident (NRI / Expat)', value: 'NRI' },
                    ]}
                    styles={{
                      root: { backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' },
                      indicator: { backgroundColor: '#2563EB', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' },
                      label: { fontWeight: 600 },
                    }}
                  />
                  {residentialStatus === 'NRI' && (
                    <Text size="11px" c="#D97706" mt={4} fw={500}>
                      ⚠️ Under Section 6, NRIs are taxed under General (&lt;60) slabs and are excluded from Section 87A rebate.
                    </Text>
                  )}
                </div>

                {/* Statutory Age & DOB Auto-Derivation */}
                <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={700} c="#0F172A">
                      Employee Age & Statutory Classification
                    </Text>
                    <Badge size="xs" color={age >= 80 ? 'grape' : age >= 60 ? 'blue' : age >= 58 ? 'cyan' : 'gray'}>
                      {age >= 80 ? 'Super Senior (80+)' : age >= 60 ? 'Senior (60-80)' : age >= 58 ? 'Age 58 (EPS Cutoff)' : 'General (<60)'}
                    </Badge>
                  </Group>

                  <SimpleGrid cols={2} spacing="xs" mb="sm">
                    <div>
                      <Text size="10px" c="#64748B" mb={2}>
                        Date of Birth (DOB)
                      </Text>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '4px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>

                    <div>
                      <Group justify="space-between" mb={2}>
                        <Text size="10px" c="#64748B">
                          Exact Age:
                        </Text>
                        <Text size="11px" fw={700} c="#2563EB">
                          {age} Years
                        </Text>
                      </Group>
                      <NumberInput
                        size="xs"
                        min={18}
                        max={100}
                        value={age}
                        onChange={(val) => setAge(Number(val) || 18)}
                      />
                    </div>
                  </SimpleGrid>

                  <div style={{ paddingBottom: '16px', paddingTop: '4px' }}>
                    <Slider
                      min={18}
                      max={90}
                      step={1}
                      value={age}
                      onChange={setAge}
                      color="indigo"
                      size="sm"
                      marks={[
                        { value: 18, label: '18y' },
                        { value: 58, label: '⚡ 58y (EPS)' },
                        { value: 80, label: '80y+ (Super)' },
                      ]}
                    />
                  </div>

                  {/* Age 58 EPS Alert Callout */}
                  {isAge58Plus && (
                    <Alert color="blue" variant="light" p="xs" mt="xs">
                      <Text size="11px" fw={600} c="#1E40AF">
                        ⚡ EPFO EPS 1995 Pension Cutoff Active (Age {age}):
                      </Text>
                      <Text size="10px" c="#1E3A8A" mt={2}>
                        Pension contribution (8.33%) ceases at age 58. 100% of the 12% employer share is automatically diverted to EPF A/c 1.
                      </Text>
                    </Alert>
                  )}
                </Paper>

                {/* Section 80U Disability Relief Selector */}
                <div>
                  <Text size="xs" c="#64748B" mb={4}>
                    Disability Relief (Section 80U / 80DD & PwD ESI Scheme)
                  </Text>
                  <Select
                    size="xs"
                    value={disabilityCategory}
                    onChange={setDisabilityCategory}
                    data={[
                      { value: 'NONE', label: 'None / Standard Profile' },
                      { value: 'MODERATE_40_80', label: '♿ Section 80U (40% - 80% Disability) - ₹75,000 Ded' },
                      { value: 'SEVERE_80_PLUS', label: '♿ Section 80U (80%+ Severe Disability) - ₹1,25,000 Ded' },
                    ]}
                  />
                  {disabilityCategory !== 'NONE' && (
                    <Text size="10px" c="#059669" mt={2} fw={500}>
                      ✓ Eligible for Section 80U deduction under Old Regime & ESI wage ceiling elevated to ₹25,000/mo.
                    </Text>
                  )}
                </div>

                <SimpleGrid cols={2} spacing="xs">
                  <div>
                    <Text size="xs" c="#64748B" mb={4}>
                      Age Category Slab
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
                    Under the <strong>New Tax Regime (u/s 115BAC)</strong>, Chapter VI-A deductions (80C, 80D, 80U, HRA, 24b) are not required. You receive an automatic ₹75,000 Standard Deduction and simplified lower slab rates.
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
                      <Text size="xs" c="#475569">Section 80U (Disability Relief - Max ₹1.25L)</Text>
                      <Text size="11px" fw={600} c="#0F172A">₹{claimedDeductions['80U']?.toLocaleString('en-IN')}</Text>
                    </Group>
                    <NumberInput
                      size="xs"
                      prefix="₹ "
                      thousandSeparator=","
                      value={claimedDeductions['80U']}
                      onChange={(v) => handleDeductionChange('80U', v)}
                      max={125000}
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
            {/* Slab Visualizer */}
            <SlabVisualizer taxResult={taxResult} regimeCode={regimeCode} />

            {/* Regime Comparison Card */}
            <RegimeComparisonCard
              comparisonResult={comparisonResult}
              currentRegime={regimeCode}
              onSelectRegime={setRegimeCode}
            />
          </Stack>
        </div>
      </SimpleGrid>

      {/* Full-Width Educational Explanation Studio Section */}
      <TaxExplanationCard taxResult={taxResult} />

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
