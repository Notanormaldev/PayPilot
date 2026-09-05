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
  Table,
  Accordion,
  Divider,
  ActionIcon,
  Tooltip,
  SegmentedControl,
  TextInput,
  Select,
} from '@mantine/core';
import {
  IconReceipt2,
  IconDownload,
  IconFileText,
  IconChartPie,
  IconTrendingUp,
  IconSearch,
  IconFilterOff,
  IconCalendar,
  IconCalendarStats,
  IconClock,
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { generatePayslipPdf } from '../../../lib/payslipPdfGenerator';
import { generateTaxBreakdownPdf } from '../../../lib/taxBreakdownPdfGenerator';
import { useAuthUser } from '../../auth/hooks/useAuthUser';

export const MyPayslipsView = () => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [cycleFilter, setCycleFilter] = useState('ALL'); // 'ALL' | 'MONTHLY' | 'QUARTERLY' | 'WEEKLY' | 'YEARLY'
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');

  const { user } = useAuthUser();
  const [downloadingAnnual, setDownloadingAnnual] = useState(false);

  // Latest Salary Breakdown Composition for Donut Chart
  const pieData = [
    { name: 'Basic Salary', value: 72500, color: '#2563EB' },
    { name: 'HRA & Allowances', value: 43500, color: '#0D9488' },
    { name: 'PF & ESI Deductions', value: 8700, color: '#D97706' },
    { name: 'TDS Income Tax', value: 12000, color: '#DC2626' },
  ];

  // Comprehensive Payslip History Data across Payment Cycles
  const payslips = [
    // MONTHLY PAYSLIPS
    {
      id: 'PS-2026-08',
      cycleType: 'MONTHLY',
      month: 'August 2026',
      payrunName: 'Payrun Aug 2026 - Monthly Executive',
      gross: 116000,
      deductions: 20700,
      net: 95300,
      date: 'Aug 31, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 72500 },
        { seq: 20, code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 29000 },
        { seq: 30, code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', amount: 14500 },
        { seq: 40, code: 'PF_EMP', name: 'Provident Fund (PF)', category: 'DEDUCTION', amount: -7250 },
        { seq: 50, code: 'ESI_EMP', name: 'ESI Contribution', category: 'DEDUCTION', amount: -1450 },
        { seq: 60, code: 'TDS', name: 'Income Tax (TDS)', category: 'DEDUCTION', amount: -12000 },
      ],
    },
    {
      id: 'PS-2026-07',
      cycleType: 'MONTHLY',
      month: 'July 2026',
      payrunName: 'Payrun Jul 2026 - Monthly Executive',
      gross: 116000,
      deductions: 20700,
      net: 95300,
      date: 'Jul 31, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 72500 },
        { seq: 20, code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 29000 },
        { seq: 30, code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', amount: 14500 },
        { seq: 40, code: 'PF_EMP', name: 'Provident Fund (PF)', category: 'DEDUCTION', amount: -7250 },
        { seq: 50, code: 'ESI_EMP', name: 'ESI Contribution', category: 'DEDUCTION', amount: -1450 },
        { seq: 60, code: 'TDS', name: 'Income Tax (TDS)', category: 'DEDUCTION', amount: -12000 },
      ],
    },
    {
      id: 'PS-2026-06',
      cycleType: 'MONTHLY',
      month: 'June 2026',
      payrunName: 'Payrun Jun 2026 - Monthly Executive',
      gross: 116000,
      deductions: 20700,
      net: 95300,
      date: 'Jun 30, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 72500 },
        { seq: 20, code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 29000 },
        { seq: 30, code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', amount: 14500 },
        { seq: 40, code: 'PF_EMP', name: 'Provident Fund (PF)', category: 'DEDUCTION', amount: -7250 },
        { seq: 50, code: 'ESI_EMP', name: 'ESI Contribution', category: 'DEDUCTION', amount: -1450 },
        { seq: 60, code: 'TDS', name: 'Income Tax (TDS)', category: 'DEDUCTION', amount: -12000 },
      ],
    },
    {
      id: 'PS-2026-05',
      cycleType: 'MONTHLY',
      month: 'May 2026',
      payrunName: 'Payrun May 2026 - Monthly Executive',
      gross: 116000,
      deductions: 20700,
      net: 95300,
      date: 'May 31, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 72500 },
        { seq: 20, code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 29000 },
        { seq: 30, code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', amount: 14500 },
        { seq: 40, code: 'PF_EMP', name: 'Provident Fund (PF)', category: 'DEDUCTION', amount: -7250 },
        { seq: 50, code: 'ESI_EMP', name: 'ESI Contribution', category: 'DEDUCTION', amount: -1450 },
        { seq: 60, code: 'TDS', name: 'Income Tax (TDS)', category: 'DEDUCTION', amount: -12000 },
      ],
    },
    {
      id: 'PS-2026-04',
      cycleType: 'MONTHLY',
      month: 'April 2026',
      payrunName: 'Payrun Apr 2026 - Monthly Executive',
      gross: 116000,
      deductions: 20700,
      net: 95300,
      date: 'Apr 30, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 72500 },
        { seq: 20, code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 29000 },
        { seq: 30, code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', amount: 14500 },
        { seq: 40, code: 'PF_EMP', name: 'Provident Fund (PF)', category: 'DEDUCTION', amount: -7250 },
        { seq: 50, code: 'ESI_EMP', name: 'ESI Contribution', category: 'DEDUCTION', amount: -1450 },
        { seq: 60, code: 'TDS', name: 'Income Tax (TDS)', category: 'DEDUCTION', amount: -12000 },
      ],
    },

    // QUARTERLY PAYSLIPS / SUMMARIES
    {
      id: 'PS-Q1-2026',
      cycleType: 'QUARTERLY',
      month: 'Q1 FY 2026-27 (Apr - Jun 2026)',
      payrunName: 'Quarterly Audit Statement Q1 FY26-27',
      gross: 348000,
      deductions: 62100,
      net: 285900,
      date: 'Jun 30, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Quarterly Basic Salary', category: 'BASIC', amount: 217500 },
        { seq: 20, code: 'HRA', name: 'Quarterly HRA Allowance', category: 'ALLOWANCE', amount: 87000 },
        { seq: 30, code: 'SPECIAL', name: 'Quarterly Special Allowance', category: 'ALLOWANCE', amount: 43500 },
        { seq: 40, code: 'PF_EMP', name: 'Quarterly EPF Contribution', category: 'DEDUCTION', amount: -21750 },
        { seq: 50, code: 'ESI_EMP', name: 'Quarterly ESI Contribution', category: 'DEDUCTION', amount: -4350 },
        { seq: 60, code: 'TDS', name: 'Quarterly TDS Tax Withholding', category: 'DEDUCTION', amount: -36000 },
      ],
    },
    {
      id: 'PS-Q4-2025',
      cycleType: 'QUARTERLY',
      month: 'Q4 FY 2025-26 (Jan - Mar 2026)',
      payrunName: 'Quarterly Audit Statement Q4 FY25-26',
      gross: 348000,
      deductions: 62100,
      net: 285900,
      date: 'Mar 31, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Quarterly Basic Salary', category: 'BASIC', amount: 217500 },
        { seq: 20, code: 'HRA', name: 'Quarterly HRA Allowance', category: 'ALLOWANCE', amount: 87000 },
        { seq: 30, code: 'SPECIAL', name: 'Quarterly Special Allowance', category: 'ALLOWANCE', amount: 43500 },
        { seq: 40, code: 'PF_EMP', name: 'Quarterly EPF Contribution', category: 'DEDUCTION', amount: -21750 },
        { seq: 50, code: 'ESI_EMP', name: 'Quarterly ESI Contribution', category: 'DEDUCTION', amount: -4350 },
        { seq: 60, code: 'TDS', name: 'Quarterly TDS Tax Withholding', category: 'DEDUCTION', amount: -36000 },
      ],
    },
    {
      id: 'PS-Q3-2025',
      cycleType: 'QUARTERLY',
      month: 'Q3 FY 2025-26 (Oct - Dec 2025)',
      payrunName: 'Quarterly Audit Statement Q3 FY25-26',
      gross: 348000,
      deductions: 62100,
      net: 285900,
      date: 'Dec 31, 2025',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Quarterly Basic Salary', category: 'BASIC', amount: 217500 },
        { seq: 20, code: 'HRA', name: 'Quarterly HRA Allowance', category: 'ALLOWANCE', amount: 87000 },
        { seq: 30, code: 'SPECIAL', name: 'Quarterly Special Allowance', category: 'ALLOWANCE', amount: 43500 },
        { seq: 40, code: 'PF_EMP', name: 'Quarterly EPF Contribution', category: 'DEDUCTION', amount: -21750 },
        { seq: 50, code: 'ESI_EMP', name: 'Quarterly ESI Contribution', category: 'DEDUCTION', amount: -4350 },
        { seq: 60, code: 'TDS', name: 'Quarterly TDS Tax Withholding', category: 'DEDUCTION', amount: -36000 },
      ],
    },

    // WEEKLY PAYSLIPS / DISBURSALS
    {
      id: 'PS-W35-2026',
      cycleType: 'WEEKLY',
      month: 'Week 35 (Aug 24 - Aug 30, 2026)',
      payrunName: 'Weekly Disbursal Cycle W35',
      gross: 29000,
      deductions: 5175,
      net: 23825,
      date: 'Aug 30, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Weekly Basic Pay', category: 'BASIC', amount: 18125 },
        { seq: 20, code: 'HRA', name: 'Weekly HRA Stipend', category: 'ALLOWANCE', amount: 7250 },
        { seq: 30, code: 'SPECIAL', name: 'Weekly Special Allowance', category: 'ALLOWANCE', amount: 3625 },
        { seq: 40, code: 'PF_EMP', name: 'Weekly EPF Deduction', category: 'DEDUCTION', amount: -1812 },
        { seq: 50, code: 'ESI_EMP', name: 'Weekly ESI Deduction', category: 'DEDUCTION', amount: -363 },
        { seq: 60, code: 'TDS', name: 'Weekly TDS Withholding', category: 'DEDUCTION', amount: -3000 },
      ],
    },
    {
      id: 'PS-W34-2026',
      cycleType: 'WEEKLY',
      month: 'Week 34 (Aug 17 - Aug 23, 2026)',
      payrunName: 'Weekly Disbursal Cycle W34',
      gross: 29000,
      deductions: 5175,
      net: 23825,
      date: 'Aug 23, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Weekly Basic Pay', category: 'BASIC', amount: 18125 },
        { seq: 20, code: 'HRA', name: 'Weekly HRA Stipend', category: 'ALLOWANCE', amount: 7250 },
        { seq: 30, code: 'SPECIAL', name: 'Weekly Special Allowance', category: 'ALLOWANCE', amount: 3625 },
        { seq: 40, code: 'PF_EMP', name: 'Weekly EPF Deduction', category: 'DEDUCTION', amount: -1812 },
        { seq: 50, code: 'ESI_EMP', name: 'Weekly ESI Deduction', category: 'DEDUCTION', amount: -363 },
        { seq: 60, code: 'TDS', name: 'Weekly TDS Withholding', category: 'DEDUCTION', amount: -3000 },
      ],
    },
    {
      id: 'PS-W33-2026',
      cycleType: 'WEEKLY',
      month: 'Week 33 (Aug 10 - Aug 16, 2026)',
      payrunName: 'Weekly Disbursal Cycle W33',
      gross: 29000,
      deductions: 5175,
      net: 23825,
      date: 'Aug 16, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Weekly Basic Pay', category: 'BASIC', amount: 18125 },
        { seq: 20, code: 'HRA', name: 'Weekly HRA Stipend', category: 'ALLOWANCE', amount: 7250 },
        { seq: 30, code: 'SPECIAL', name: 'Weekly Special Allowance', category: 'ALLOWANCE', amount: 3625 },
        { seq: 40, code: 'PF_EMP', name: 'Weekly EPF Deduction', category: 'DEDUCTION', amount: -1812 },
        { seq: 50, code: 'ESI_EMP', name: 'Weekly ESI Deduction', category: 'DEDUCTION', amount: -363 },
        { seq: 60, code: 'TDS', name: 'Weekly TDS Withholding', category: 'DEDUCTION', amount: -3000 },
      ],
    },
    {
      id: 'PS-W32-2026',
      cycleType: 'WEEKLY',
      month: 'Week 32 (Aug 03 - Aug 09, 2026)',
      payrunName: 'Weekly Disbursal Cycle W32',
      gross: 29000,
      deductions: 5175,
      net: 23825,
      date: 'Aug 09, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Weekly Basic Pay', category: 'BASIC', amount: 18125 },
        { seq: 20, code: 'HRA', name: 'Weekly HRA Stipend', category: 'ALLOWANCE', amount: 7250 },
        { seq: 30, code: 'SPECIAL', name: 'Weekly Special Allowance', category: 'ALLOWANCE', amount: 3625 },
        { seq: 40, code: 'PF_EMP', name: 'Weekly EPF Deduction', category: 'DEDUCTION', amount: -1812 },
        { seq: 50, code: 'ESI_EMP', name: 'Weekly ESI Deduction', category: 'DEDUCTION', amount: -363 },
        { seq: 60, code: 'TDS', name: 'Weekly TDS Withholding', category: 'DEDUCTION', amount: -3000 },
      ],
    },

    // YEARLY PAYSLIPS / ANNUAL STATEMENTS
    {
      id: 'PS-FY2526',
      cycleType: 'YEARLY',
      month: 'FY 2025-26 Annual Compensation Statement',
      payrunName: 'Annual Tax Return & Form 16 Reconciliation FY 2025-26',
      gross: 1392000,
      deductions: 248400,
      net: 1143600,
      date: 'Mar 31, 2026',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Annual Basic Salary', category: 'BASIC', amount: 870000 },
        { seq: 20, code: 'HRA', name: 'Annual House Rent Allowance', category: 'ALLOWANCE', amount: 348000 },
        { seq: 30, code: 'SPECIAL', name: 'Annual Special Allowance', category: 'ALLOWANCE', amount: 174000 },
        { seq: 40, code: 'PF_EMP', name: 'Annual EPF Employee Deduction', category: 'DEDUCTION', amount: -87000 },
        { seq: 50, code: 'ESI_EMP', name: 'Annual ESI Contribution', category: 'DEDUCTION', amount: -17400 },
        { seq: 60, code: 'TDS', name: 'Annual TDS Income Tax Deposited', category: 'DEDUCTION', amount: -144000 },
      ],
    },
    {
      id: 'PS-FY2425',
      cycleType: 'YEARLY',
      month: 'FY 2024-25 Annual Form 16 Summary',
      payrunName: 'Annual Tax Return & Form 16 Reconciliation FY 2024-25',
      gross: 1260000,
      deductions: 210000,
      net: 1050000,
      date: 'Mar 31, 2025',
      lines: [
        { seq: 10, code: 'BASIC', name: 'Annual Basic Salary', category: 'BASIC', amount: 787500 },
        { seq: 20, code: 'HRA', name: 'Annual House Rent Allowance', category: 'ALLOWANCE', amount: 315000 },
        { seq: 30, code: 'SPECIAL', name: 'Annual Special Allowance', category: 'ALLOWANCE', amount: 157500 },
        { seq: 40, code: 'PF_EMP', name: 'Annual EPF Employee Deduction', category: 'DEDUCTION', amount: -78750 },
        { seq: 50, code: 'ESI_EMP', name: 'Annual ESI Contribution', category: 'DEDUCTION', amount: -15750 },
        { seq: 60, code: 'TDS', name: 'Annual TDS Income Tax Deposited', category: 'DEDUCTION', amount: -115500 },
      ],
    },
  ];

  // Filtering Logic
  const filteredPayslips = payslips.filter((ps) => {
    if (cycleFilter !== 'ALL' && ps.cycleType !== cycleFilter) {
      return false;
    }
    if (yearFilter !== 'ALL' && !ps.date.includes(yearFilter) && !ps.month.includes(yearFilter)) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      const matchMonth = (ps.month || '').toLowerCase().includes(term);
      const matchId = (ps.id || '').toLowerCase().includes(term);
      const matchPayrun = (ps.payrunName || '').toLowerCase().includes(term);
      if (!matchMonth && !matchId && !matchPayrun) return false;
    }
    return true;
  });

  const getCycleBadge = (type) => {
    switch (type) {
      case 'MONTHLY':
        return <Badge size="xs" color="blue" variant="light">MONTHLY</Badge>;
      case 'QUARTERLY':
        return <Badge size="xs" color="teal" variant="light">QUARTERLY</Badge>;
      case 'WEEKLY':
        return <Badge size="xs" color="grape" variant="light">WEEKLY</Badge>;
      case 'YEARLY':
        return <Badge size="xs" color="indigo" variant="filled">YEARLY</Badge>;
      default:
        return null;
    }
  };

  const handleDownloadPdf = (ps) => {
    setDownloadingId(ps.id);
    try {
      if (ps.cycleType === 'YEARLY') {
        generateTaxBreakdownPdf(
          {
            summary: { grossTotalIncome: ps.gross, netTaxableIncome: ps.gross - 75000, totalTaxLiability: Math.abs(ps.deductions) },
            slabs: [],
          },
          {
            name: user?.name || 'Kartik Kumar',
            id: user?.id || 'EMP-8492',
            designation: user?.designation || 'Staff Software Engineer',
            department: user?.department || 'Engineering',
            pan: user?.pan || 'ABCPK8942F',
          }
        );
      } else {
        generatePayslipPdf(ps, {
          name: user?.name || 'Kartik Kumar',
          id: user?.id || 'EMP-8492',
          designation: user?.designation || 'Staff Member',
          department: user?.department || 'Product',
        });
      }
    } catch (err) {
      console.error('Payslip generation error:', err);
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 500);
    }
  };

  const handleDownloadAnnualTax = async () => {
    try {
      setDownloadingAnnual(true);
      const res = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaryIncome: 1392000, regimeCode: 'NEW' }),
      });
      const json = await res.json();
      if (json.success) {
        await generateTaxBreakdownPdf(json.data, {
          name: user?.name || 'Kartik Kumar',
          id: user?.id || 'EMP-8492',
          designation: user?.designation || 'Staff Software Engineer',
          department: user?.department || 'Engineering',
          pan: user?.pan || 'ABCPK8942F',
        });
      }
    } catch (err) {
      console.error('Failed to generate annual tax statement:', err);
    } finally {
      setDownloadingAnnual(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* Top Header Card */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <div>
            <Title order={3} c="#09090B">
              My Payslips & Salary Breakdown
            </Title>
            <Text size="xs" c="#64748B">
              Access itemized salary rule breakdowns, download monthly, quarterly, weekly, and yearly PDF statements.
            </Text>
          </div>

          <Group gap="xs">
            <Button
              size="xs"
              color="indigo"
              variant="light"
              leftSection={<IconDownload size={14} />}
              loading={downloadingAnnual}
              onClick={handleDownloadAnnualTax}
            >
              Download Annual Tax & CTC Statement (PDF)
            </Button>
            <Badge size="md" color="indigo" variant="light">
              Latest Net Take-Home: ₹95,300
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* Salary Breakdown Chart + Latest Payslip Summary */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Recharts Salary Composition Donut Chart */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconChartPie size={18} color="#2563EB" />
              <Title order={4} size="sm" c="#09090B">
                Salary Composition (Latest Month)
              </Title>
            </Group>
            <Badge size="xs" color="blue">
              Aug 2026
            </Badge>
          </Group>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `₹ ${value.toLocaleString()}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* Latest Payslip Quick Summary */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Title order={4} size="sm" c="#09090B" mb="md">
            Latest Payrun Summary (August 2026)
          </Title>

          <Stack gap="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Group justify="space-between">
                <Text size="xs" c="#64748B">Total Gross Salary</Text>
                <Text size="xs" fw={700} c="#09090B">₹ 1,16,000</Text>
              </Group>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2' }}>
              <Group justify="space-between">
                <Text size="xs" c="#DC2626">Total Deductions (PF + ESI + TDS)</Text>
                <Text size="xs" fw={700} c="#DC2626">- ₹ 20,700</Text>
              </Group>
            </Paper>

            <Paper p="sm" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Group justify="space-between">
                <Text size="xs" fw={700} c="#166534">Net Take-Home Salary</Text>
                <Text size="md" fw={800} c="#166534">₹ 95,300</Text>
              </Group>
            </Paper>

            <Button
              color="dark"
              size="xs"
              mt="xs"
              leftSection={<IconDownload size={14} />}
              loading={downloadingId === 'PS-2026-08'}
              onClick={() => handleDownloadPdf(payslips[0])}
            >
              Download Aug 2026 Payslip Statement
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Payslips History Accordion List with Cycle Filters */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
          <div>
            <Title order={4} size="sm" c="#09090B">
              Payslips & Earnings History
            </Title>
            <Text size="xs" c="#64748B">
              Filter statements by payment frequency cycle, search specific periods, or download PDF receipts.
            </Text>
          </div>

          <Badge size="sm" color="gray" variant="light">
            Showing {filteredPayslips.length} of {payslips.length} Statements
          </Badge>
        </Group>

        {/* Filter Controls Bar */}
        <Paper p="xs" radius="sm" mb="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            {/* Frequency Segmented Control Filter */}
            <SegmentedControl
              size="xs"
              value={cycleFilter}
              onChange={setCycleFilter}
              data={[
                { label: `All (${payslips.length})`, value: 'ALL' },
                { label: `Monthly (${payslips.filter(p => p.cycleType === 'MONTHLY').length})`, value: 'MONTHLY' },
                { label: `Quarterly (${payslips.filter(p => p.cycleType === 'QUARTERLY').length})`, value: 'QUARTERLY' },
                { label: `Weekly (${payslips.filter(p => p.cycleType === 'WEEKLY').length})`, value: 'WEEKLY' },
                { label: `Yearly (${payslips.filter(p => p.cycleType === 'YEARLY').length})`, value: 'YEARLY' },
              ]}
              styles={{
                root: { backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' },
              }}
            />

            <Group gap="xs">
              <TextInput
                size="xs"
                placeholder="Search period, Q1, Aug..."
                leftSection={<IconSearch size={13} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ width: 190 }}
              />

              <Select
                size="xs"
                value={yearFilter}
                onChange={(val) => setYearFilter(val || 'ALL')}
                data={[
                  { label: 'All Years', value: 'ALL' },
                  { label: 'FY 2026-27', value: '2026' },
                  { label: 'FY 2025-26', value: '2025' },
                ]}
                style={{ width: 110 }}
              />

              {(cycleFilter !== 'ALL' || searchQuery !== '' || yearFilter !== 'ALL') && (
                <Tooltip label="Reset Filters">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setCycleFilter('ALL');
                      setSearchQuery('');
                      setYearFilter('ALL');
                    }}
                  >
                    <IconFilterOff size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Paper>

        {filteredPayslips.length === 0 ? (
          <Paper p="xl" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
            <Text size="sm" fw={700} c="#09090B">
              No Payslips Found
            </Text>
            <Text size="xs" c="#64748B" mt={2} mb="sm">
              No statements match your active payment cycle or search criteria.
            </Text>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconFilterOff size={12} />}
              onClick={() => {
                setCycleFilter('ALL');
                setSearchQuery('');
                setYearFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </Paper>
        ) : (
          <Accordion variant="separated" radius="md">
            {filteredPayslips.map((ps) => (
              <Accordion.Item key={ps.id} value={ps.id}>
                <Accordion.Control>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <IconReceipt2 size={18} color="#2563EB" />
                      <div>
                        <Group gap="xs" align="center">
                          <Text size="xs" fw={700} c="#09090B">
                            {ps.month} ({ps.id})
                          </Text>
                          {getCycleBadge(ps.cycleType)}
                        </Group>
                        <Text size="10px" c="#71717A">
                          Pay Date: {ps.date} • {ps.payrunName}
                        </Text>
                      </div>
                    </Group>

                    <Group gap="lg">
                      <div>
                        <Text size="10px" c="#71717A">Net Salary</Text>
                        <Text size="xs" fw={800} c="#166534">₹ {ps.net.toLocaleString()}</Text>
                      </div>

                      <Button
                        size="compact-xs"
                        variant="light"
                        color="blue"
                        leftSection={<IconDownload size={12} />}
                        loading={downloadingId === ps.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(ps);
                        }}
                      >
                        PDF
                      </Button>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Table highlightOnHover border={0} mt="xs">
                    <Table.Thead>
                      <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
                        <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>Seq</Table.Th>
                        <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>Rule Code</Table.Th>
                        <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>Salary Rule Name</Table.Th>
                        <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>Category</Table.Th>
                        <Table.Th style={{ fontSize: '11px', color: '#64748B', textAlign: 'right' }}>Amount</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {ps.lines.map((line) => (
                        <Table.Tr key={line.code}>
                          <Table.Td style={{ fontSize: '11px', color: '#94A3B8' }}>{line.seq}</Table.Td>
                          <Table.Td style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>{line.code}</Table.Td>
                          <Table.Td style={{ fontSize: '12px', color: '#09090B' }}>{line.name}</Table.Td>
                          <Table.Td>
                            <Badge
                              size="xs"
                              color={
                                line.category === 'BASIC'
                                  ? 'blue'
                                  : line.category === 'ALLOWANCE'
                                  ? 'teal'
                                  : 'red'
                              }
                              variant="light"
                            >
                              {line.category}
                            </Badge>
                          </Table.Td>
                          <Table.Td
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              textAlign: 'right',
                              color: line.amount < 0 ? '#DC2626' : '#09090B',
                            }}
                          >
                            {line.amount < 0 ? `- ₹ ${Math.abs(line.amount).toLocaleString()}` : `₹ ${line.amount.toLocaleString()}`}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Paper>
    </Stack>
  );
};
