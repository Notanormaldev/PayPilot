import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Grid,
  SegmentedControl,
  Select,
  TextInput,
  Table,
  Pagination,
  ThemeIcon,
  Box,
  Divider,
  Alert,
  Loader,
  Center,
  SimpleGrid,
  Progress,
} from '@mantine/core';
import {
  IconChartBar,
  IconBuildingBank,
  IconShieldCheck,
  IconPercentage,
  IconScale,
  IconFileSpreadsheet,
  IconDownload,
  IconSearch,
  IconPrinter,
  IconFileText,
  IconArrowUpRight,
  IconArrowDownRight,
  IconShieldExclamation,
  IconCheck,
  IconCalendar,
  IconCurrencyRupee,
  IconUsers,
  IconReceipt2,
  IconTrendingUp,
  IconBriefcase,
  IconUserPlus,
  IconUserMinus,
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchApi } from '../../../lib/api';

const PAGE_SIZE = 10;

// Monthly trend data for visual analytics
const monthlyTrendData = [
  { month: 'Jan', netPay: 1.21, taxes: 0.13, statutories: 0.05, total: 1.39 },
  { month: 'Feb', netPay: 1.24, taxes: 0.14, statutories: 0.05, total: 1.43 },
  { month: 'Mar', netPay: 1.28, taxes: 0.14, statutories: 0.06, total: 1.48 },
  { month: 'Apr', netPay: 1.32, taxes: 0.15, statutories: 0.06, total: 1.53 },
  { month: 'May', netPay: 1.34, taxes: 0.15, statutories: 0.06, total: 1.55 },
  { month: 'Jun', netPay: 1.39, taxes: 0.16, statutories: 0.06, total: 1.61 },
  { month: 'Jul', netPay: 1.44, taxes: 0.16, statutories: 0.06, total: 1.66 },
  { month: 'Aug', netPay: 1.48, taxes: 0.17, statutories: 0.06, total: 1.71 },
  { month: 'Sep', netPay: 1.73, taxes: 0.20, statutories: 0.07, total: 2.00 },
];

export const ReportsView = () => {
  // Main view mode: 'analytics' (Visual Charts & MoM Variance) | 'registers' (Government Tables & Ledgers)
  const [viewMode, setViewMode] = useState('analytics');

  const [activeCenter, setActiveCenter] = useState('statutory'); // 'statutory' | 'payroll' | 'workforce' | 'variance'
  const [subReport, setSubReport] = useState('epf-ecr');
  const [selectedPeriod, setSelectedPeriod] = useState('SEP_2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Load executive summary
  useEffect(() => {
    loadSummary();
  }, []);

  // Load specific active report
  useEffect(() => {
    loadActiveReport();
    setPage(1);
    setSearchQuery('');
  }, [activeCenter, subReport]);

  const loadSummary = async () => {
    try {
      const res = await fetchApi('/reports/summary');
      if (res?.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report summary:', err);
    }
  };

  const loadActiveReport = async () => {
    try {
      setLoading(true);
      let endpoint = '/reports/statutory/epf-ecr';
      if (activeCenter === 'statutory') {
        if (subReport === 'esic') endpoint = '/reports/statutory/esic';
        else if (subReport === 'form24q') endpoint = '/reports/statutory/form24q';
        else endpoint = '/reports/statutory/epf-ecr';
      } else if (activeCenter === 'payroll') {
        if (subReport === 'bank-advice') endpoint = '/reports/payroll/bank-advice';
        else if (subReport === 'journal-voucher') endpoint = '/reports/payroll/journal-voucher';
        else endpoint = '/reports/payroll/master-sheet';
      } else if (activeCenter === 'workforce') {
        endpoint = '/reports/workforce/leave-liability';
      } else if (activeCenter === 'variance') {
        endpoint = '/reports/analytics/department-variance';
      }

      const res = await fetchApi(endpoint);
      if (res?.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load active report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Department options
  const departmentOptions = useMemo(() => {
    const list = Array.isArray(reportData?.records) ? reportData.records : [];
    const set = new Set();
    list.forEach((item) => {
      if (item.department) set.add(item.department);
    });
    return [{ value: 'ALL', label: 'All Departments' }, ...Array.from(set).sort().map((d) => ({ value: d, label: d }))];
  }, [reportData]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    const list = Array.isArray(reportData?.records)
      ? reportData.records
      : Array.isArray(reportData?.departments)
      ? reportData.departments
      : [];
    return list.filter((r) => {
      if (deptFilter !== 'ALL' && r.department && r.department !== deptFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const str = JSON.stringify(r).toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [reportData, deptFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredRecords.length) return;
    const keys = Object.keys(filteredRecords[0]).filter((k) => typeof filteredRecords[0][k] !== 'object');
    const headers = keys.join(',');
    const rows = filteredRecords.map((r) => keys.map((k) => `"${r[k] ?? ''}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PayPilot_${activeCenter}_${subReport}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Stack gap="lg">
      {/* 1. TOP EXECUTIVE HEADER & CONTROLS */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <div>
            <Group gap="xs" align="center">
              <ThemeIcon size="lg" radius="md" color="dark" variant="filled">
                <IconChartBar size={20} />
              </ThemeIcon>
              <div>
                <Group gap="xs" align="center">
                  <Text fw={800} size="lg" c="#09090B">
                    Executive Reports & Statutory Intelligence Hub
                  </Text>
                  <Badge color="blue" size="sm" variant="light" fw={700}>
                    FY 2026-27 Compliant
                  </Badge>
                </Group>
                <Text size="xs" c="#64748B">
                  Cost variance waterfall, statutory filing returns, bank disbursement advice, and accounting ledgers
                </Text>
              </div>
            </Group>
          </div>

          <Group gap="sm" wrap="wrap">
            <Select
              size="sm"
              radius="md"
              leftSection={<IconCalendar size={15} color="#64748B" />}
              value={selectedPeriod}
              onChange={(v) => setSelectedPeriod(v || 'SEP_2026')}
              data={[
                { value: 'SEP_2026', label: 'September 2026 (Current)' },
                { value: 'AUG_2026', label: 'August 2026' },
                { value: 'Q2_FY26', label: 'Q2 FY 2026-27 (Jul - Sep)' },
                { value: 'FY2026_27', label: 'Full Year FY 2026-27' },
              ]}
              styles={{ root: { minWidth: '220px' } }}
            />

            <Button
              color="dark"
              size="sm"
              variant="outline"
              leftSection={<IconDownload size={15} />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>

            <Button
              color="dark"
              size="sm"
              leftSection={<IconPrinter size={15} />}
              onClick={() => window.print()}
            >
              Print Dossier
            </Button>
          </Group>
        </Group>

        {/* 2. EXECUTIVE 4-STAT SUMMARY TILES */}
        <Grid mt="lg" gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                TOTAL GROSS PAYROLL
              </Text>
              <Text size="22px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{(summaryData?.financials?.totalGrossPayroll || 128200000).toLocaleString('en-IN')}
              </Text>
              <Text size="xs" c="#64748B" mt={2}>
                301 Active Staff Members
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                NET TAKE-HOME DISBURSED
              </Text>
              <Text size="22px" fw={800} c="#059669" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{(summaryData?.financials?.netTakeHomeDisbursed || 108800000).toLocaleString('en-IN')}
              </Text>
              <Text size="xs" c="#059669" mt={2} fw={600}>
                84.9% Net Liquidity Ratio
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                STATUTORY & TAX WITHHELD
              </Text>
              <Text size="22px" fw={800} c="#DC2626" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{(summaryData?.financials?.totalStatutoryRemittance || 16325123).toLocaleString('en-IN')}
              </Text>
              <Text size="xs" c="#64748B" mt={2}>
                EPF • ESI • TDS • PT Deposited
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                GRATUITY & BONUS ACCRUAL
              </Text>
              <Text size="22px" fw={800} c="#2563EB" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{(summaryData?.financials?.accruedGratuityLiability || 34377000).toLocaleString('en-IN')}
              </Text>
              <Text size="xs" c="#2563EB" mt={2} fw={600}>
                Actuary Reserve Compliant
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* 3. PRIMARY VIEW SWITCHER: VISUAL ANALYTICS vs. STRUCTURED REGISTERS */}
      <Paper p="xs" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            data={[
              {
                value: 'analytics',
                label: (
                  <Group gap={6} wrap="nowrap" c={viewMode === 'analytics' ? '#FFFFFF' : '#475569'}>
                    <IconTrendingUp size={16} color={viewMode === 'analytics' ? '#FFFFFF' : '#475569'} />
                    <span style={{ fontWeight: 600 }}>📊 Visual Cost Analytics & MoM Variance</span>
                  </Group>
                ),
              },
              {
                value: 'registers',
                label: (
                  <Group gap={6} wrap="nowrap" c={viewMode === 'registers' ? '#FFFFFF' : '#475569'}>
                    <IconFileSpreadsheet size={16} color={viewMode === 'registers' ? '#FFFFFF' : '#475569'} />
                    <span style={{ fontWeight: 600 }}>📋 Government Filing Registers & Ledgers</span>
                  </Group>
                ),
              },
            ]}
            size="sm"
            radius="md"
            styles={{
              root: { backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' },
              indicator: { backgroundColor: '#09090B' },
              label: { fontWeight: 600 },
            }}
          />

          <Badge size="md" color="dark" variant="light">
            {viewMode === 'analytics' ? 'Executive Insights Mode' : 'Filing & Audit Mode'}
          </Badge>
        </Group>
      </Paper>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: VISUAL COST ANALYTICS & MOM VARIANCE WATERFALL */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'analytics' && (
        <Stack gap="lg">
          {/* SECTION 1: MONTH-OVER-MONTH VARIANCE WATERFALL (THE "WHY DID PAYROLL CHANGE?" INSIGHT) */}
          <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Group justify="space-between" align="center" mb="md">
              <div>
                <Text fw={800} size="md" c="#09090B">
                  Month-over-Month (MoM) Payroll Variance & Cost Drivers
                </Text>
                <Text size="xs" c="#64748B">
                  Instant executive reconciliation: Exactly why August vs. September payroll changed
                </Text>
              </div>
              <Badge size="md" color="teal" variant="light" fw={700}>
                +₹14.00 Lakhs (+8.5%) Net Change
              </Badge>
            </Group>

            <Grid gutter="md">
              {/* Cost Driver Cards */}
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <Group justify="space-between">
                    <Text size="11px" fw={700} c="#166534">NEW HIRES ADDED</Text>
                    <IconUserPlus size={16} color="#16A34A" />
                  </Group>
                  <Text size="18px" fw={800} c="#166534" style={{ fontFamily: 'JetBrains Mono, monospace' }} mt={4}>
                    +₹8,50,000
                  </Text>
                  <Text size="11px" c="#166534">5 Engineers joined in Sep</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <Group justify="space-between">
                    <Text size="11px" fw={700} c="#1E40AF">SALARY REVISIONS</Text>
                    <IconArrowUpRight size={16} color="#2563EB" />
                  </Group>
                  <Text size="18px" fw={800} c="#1E40AF" style={{ fontFamily: 'JetBrains Mono, monospace' }} mt={4}>
                    +₹4,20,000
                  </Text>
                  <Text size="11px" c="#1E40AF">Mid-year appraisal cycle</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                  <Group justify="space-between">
                    <Text size="11px" fw={700} c="#92400E">OVERTIME & BONUS</Text>
                    <IconReceipt2 size={16} color="#D97706" />
                  </Group>
                  <Text size="18px" fw={800} c="#92400E" style={{ fontFamily: 'JetBrains Mono, monospace' }} mt={4}>
                    +₹2,80,000
                  </Text>
                  <Text size="11px" c="#92400E">Statutory festival pool</Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <Group justify="space-between">
                    <Text size="11px" fw={700} c="#991B1B">EXITS & TERMINATIONS</Text>
                    <IconUserMinus size={16} color="#DC2626" />
                  </Group>
                  <Text size="18px" fw={800} c="#991B1B" style={{ fontFamily: 'JetBrains Mono, monospace' }} mt={4}>
                    -₹1,50,000
                  </Text>
                  <Text size="11px" c="#991B1B">2 Resignations processed</Text>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Monthly Trend Stacked Chart */}
            <Box mt="lg" style={{ height: 280 }}>
              <Text size="xs" fw={700} c="#64748B" mb="xs">
                MONTHLY PAYROLL COMPOSITION (IN CRORES ₹)
              </Text>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} unit=" Cr" />
                  <Tooltip
                    formatter={(value) => [`₹${value} Cr`, '']}
                    contentStyle={{ backgroundColor: '#09090B', border: 'none', borderRadius: '8px', color: '#FFFFFF' }}
                  />
                  <Legend />
                  <Bar dataKey="netPay" name="Net Take-Home Pay" stackId="a" fill="#09090B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="taxes" name="Income Tax (TDS)" stackId="a" fill="#DC2626" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="statutories" name="Statutories (EPF/ESI/PT)" stackId="a" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* SECTION 2: DEPARTMENT COST CENTERS & AVERAGE COST PER EMPLOYEE (ACPE) */}
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
                <Text fw={800} size="md" c="#09090B" mb="xs">
                  Departmental Payroll Spend & Cost Share
                </Text>
                <Text size="xs" c="#64748B" mb="md">
                  Distribution of monthly ₹12.82 Crore labor spend across company divisions
                </Text>

                <Stack gap="sm">
                  <div>
                    <Group justify="space-between" mb={3}>
                      <Text size="xs" fw={700} c="#09090B">Engineering (145 Staff)</Text>
                      <Text size="xs" fw={800} c="#09090B">₹5.42 Cr (42.3%)</Text>
                    </Group>
                    <Progress value={42.3} color="dark" size="sm" radius="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb={3}>
                      <Text size="xs" fw={700} c="#09090B">Sales & Business Dev (68 Staff)</Text>
                      <Text size="xs" fw={800} c="#09090B">₹3.10 Cr (24.2%)</Text>
                    </Group>
                    <Progress value={24.2} color="blue" size="sm" radius="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb={3}>
                      <Text size="xs" fw={700} c="#09090B">Product & Design (42 Staff)</Text>
                      <Text size="xs" fw={800} c="#09090B">₹1.85 Cr (14.4%)</Text>
                    </Group>
                    <Progress value={14.4} color="teal" size="sm" radius="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb={3}>
                      <Text size="xs" fw={700} c="#09090B">Operations & Logistics (32 Staff)</Text>
                      <Text size="xs" fw={800} c="#09090B">₹1.45 Cr (11.3%)</Text>
                    </Group>
                    <Progress value={11.3} color="yellow" size="sm" radius="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb={3}>
                      <Text size="xs" fw={700} c="#09090B">HR & Corporate Management (14 Staff)</Text>
                      <Text size="xs" fw={800} c="#09090B">₹1.00 Cr (7.8%)</Text>
                    </Group>
                    <Progress value={7.8} color="grape" size="sm" radius="sm" />
                  </div>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
                <Text fw={800} size="md" c="#09090B" mb="xs">
                  Average Cost Per Employee (ACPE) Benchmarks
                </Text>
                <Text size="xs" c="#64748B" mb="md">
                  Monthly average labor expenditure per seat by operational function
                </Text>

                <Stack gap="xs">
                  <Paper p="xs" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">Executive & Leadership</Text>
                        <Text size="10px" c="#64748B">Strategy & Corporate Affairs</Text>
                      </div>
                      <Badge size="md" color="dark" variant="filled">
                        ₹3,50,000 / mo
                      </Badge>
                    </Group>
                  </Paper>

                  <Paper p="xs" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">Engineering & Technology</Text>
                        <Text size="10px" c="#64748B">Core Developers & Architects</Text>
                      </div>
                      <Badge size="md" color="blue" variant="light">
                        ₹1,85,000 / mo
                      </Badge>
                    </Group>
                  </Paper>

                  <Paper p="xs" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">Product & UI/UX Design</Text>
                        <Text size="10px" c="#64748B">Product Managers & Designers</Text>
                      </div>
                      <Badge size="md" color="teal" variant="light">
                        ₹1,65,000 / mo
                      </Badge>
                    </Group>
                  </Paper>

                  <Paper p="xs" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">Sales & Account Management</Text>
                        <Text size="10px" c="#64748B">Enterprise Sales & RevOps</Text>
                      </div>
                      <Badge size="md" color="yellow" variant="light">
                        ₹1,20,000 / mo
                      </Badge>
                    </Group>
                  </Paper>

                  <Paper p="xs" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">Operations & Technical Support</Text>
                        <Text size="10px" c="#64748B">Customer Experience & Facilities</Text>
                      </div>
                      <Badge size="md" color="gray" variant="light">
                        ₹55,000 / mo
                      </Badge>
                    </Group>
                  </Paper>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 2: STRUCTURED REGISTERS & GOVERNMENT FILING TABLES */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'registers' && (
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
          }}
        >
          <SegmentedControl
            value={activeCenter}
            onChange={(v) => {
              setActiveCenter(v);
              if (v === 'statutory') setSubReport('epf-ecr');
              else if (v === 'payroll') setSubReport('master-sheet');
              else if (v === 'workforce') setSubReport('leave-liability');
              else if (v === 'variance') setSubReport('dept-variance');
            }}
            data={[
              {
                value: 'statutory',
                label: (
                  <Group gap={6} wrap="nowrap" c={activeCenter === 'statutory' ? '#FFFFFF' : '#475569'}>
                    <IconScale size={16} color={activeCenter === 'statutory' ? '#FFFFFF' : '#475569'} />
                    <span>Statutory Returns (EPFO/ESIC/24Q)</span>
                  </Group>
                ),
              },
              {
                value: 'payroll',
                label: (
                  <Group gap={6} wrap="nowrap" c={activeCenter === 'payroll' ? '#FFFFFF' : '#475569'}>
                    <IconBuildingBank size={16} color={activeCenter === 'payroll' ? '#FFFFFF' : '#475569'} />
                    <span>Payroll & Financial Ledgers</span>
                  </Group>
                ),
              },
              {
                value: 'workforce',
                label: (
                  <Group gap={6} wrap="nowrap" c={activeCenter === 'workforce' ? '#FFFFFF' : '#475569'}>
                    <IconUsers size={16} color={activeCenter === 'workforce' ? '#FFFFFF' : '#475569'} />
                    <span>Workforce & Leave Liability</span>
                  </Group>
                ),
              },
              {
                value: 'variance',
                label: (
                  <Group gap={6} wrap="nowrap" c={activeCenter === 'variance' ? '#FFFFFF' : '#475569'}>
                    <IconChartBar size={16} color={activeCenter === 'variance' ? '#FFFFFF' : '#475569'} />
                    <span>Department Cost Centers</span>
                  </Group>
                ),
              },
            ]}
            size="sm"
            radius="md"
            fullWidth
            styles={{
              root: { backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' },
              indicator: { backgroundColor: '#09090B' },
              label: { fontWeight: 600 },
            }}
          />

          {/* SUB-REPORT SELECTOR & SEARCH BAR */}
          <Group justify="space-between" align="center" mt="md" wrap="wrap" gap="sm">
            {activeCenter === 'statutory' && (
              <SegmentedControl
                size="xs"
                value={subReport}
                onChange={setSubReport}
                data={[
                  { label: 'EPFO ECR Challan Return', value: 'epf-ecr' },
                  { label: 'ESIC Monthly Register', value: 'esic' },
                  { label: 'Income Tax Form 24Q (Annexure II)', value: 'form24q' },
                ]}
              />
            )}

            {activeCenter === 'payroll' && (
              <SegmentedControl
                size="xs"
                value={subReport}
                onChange={setSubReport}
                data={[
                  { label: 'Master Salary Matrix (301 Staff)', value: 'master-sheet' },
                  { label: 'Bank NEFT/RTGS Advice', value: 'bank-advice' },
                  { label: 'General Ledger JV (Double-Entry)', value: 'journal-voucher' },
                ]}
              />
            )}

            {activeCenter === 'workforce' && (
              <Badge size="md" color="blue" variant="light">
                Annual Leave Liability & Encashment Register
              </Badge>
            )}

            {activeCenter === 'variance' && (
              <Badge size="md" color="teal" variant="light">
                Department Spend & ACPE Cost Centers
              </Badge>
            )}

            {/* Search & Dept Filters */}
            <Group gap="xs">
              <TextInput
                placeholder="Search in report..."
                leftSection={<IconSearch size={14} color="#94A3B8" />}
                size="xs"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                style={{ width: '220px' }}
              />
              {departmentOptions.length > 2 && (
                <Select
                  placeholder="Department"
                  size="xs"
                  value={deptFilter}
                  onChange={(v) => { setDeptFilter(v || 'ALL'); setPage(1); }}
                  data={departmentOptions}
                  style={{ width: '160px' }}
                />
              )}
            </Group>
          </Group>

          {/* REPORT CONTENT DISPLAY */}
          {loading ? (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Loader size="md" color="dark" />
                <Text size="sm" c="#64748B">
                  Generating enterprise registers and government returns...
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="md" mt="md">
              {/* Regulatory Description Banner */}
              {activeCenter === 'statutory' && (
                <Alert icon={<IconScale size={18} />} color="blue" variant="light" radius="md">
                  <Text size="xs" fw={700} c="#1E3A8A">
                    {subReport === 'epf-ecr' && "Employees' Provident Funds and Miscellaneous Provisions Act, 1952 — Unified Portal Electronic Challan Return (ECR)"}
                    {subReport === 'esic' && "Employees' State Insurance Act, 1948 — Monthly Contribution Return (ESIC Form 5 / 6)"}
                    {subReport === 'form24q' && "Income Tax Act, 1961 (Section 192) — Quarterly TDS Return Form 24Q (Annexure II Salary Details for FY 2026-27)"}
                  </Text>
                </Alert>
              )}

              {/* General Ledger JV Special Table */}
              {activeCenter === 'payroll' && subReport === 'journal-voucher' ? (
                <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
                  <Table striped highlightOnHover fz="xs">
                    <Table.Thead style={{ backgroundColor: '#F1F5F9' }}>
                      <Table.Tr>
                        <Table.Th>GL Account Code</Table.Th>
                        <Table.Th>Account Name</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Debit (INR)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Credit (INR)</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {(reportData?.entries || []).map((entry, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                            {entry.glCode}
                          </Table.Td>
                          <Table.Td fw={600} c="#09090B">
                            {entry.accountName}
                          </Table.Td>
                          <Table.Td>
                            <Badge size="xs" color={entry.type === 'DEBIT' ? 'blue' : 'teal'} variant="light">
                              {entry.type}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: entry.debit > 0 ? 700 : 400 }}>
                            {entry.debit > 0 ? `₹${Number(entry.debit).toLocaleString('en-IN')}` : '-'}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: entry.credit > 0 ? 700 : 400 }}>
                            {entry.credit > 0 ? `₹${Number(entry.credit).toLocaleString('en-IN')}` : '-'}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {/* Totals Row */}
                      <Table.Tr style={{ backgroundColor: '#F8FAFC', fontWeight: 800 }}>
                        <Table.Td colSpan={3} style={{ textAlign: 'right' }}>
                          TOTAL BALANCED POSTING:
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#2563EB' }}>
                          ₹{Number(reportData?.totalDebits || 0).toLocaleString('en-IN')}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#059669' }}>
                          ₹{Number(reportData?.totalCredits || 0).toLocaleString('en-IN')}
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Paper>
              ) : activeCenter === 'variance' ? (
                /* Department Variance Table */
                <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
                  <Table striped highlightOnHover fz="xs">
                    <Table.Thead style={{ backgroundColor: '#F1F5F9' }}>
                      <Table.Tr>
                        <Table.Th>Department</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Headcount</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actual Spend (INR)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Allocated Budget (INR)</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Variance</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Average Cost Per Employee (ACPE)</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {(paginatedRecords || []).map((dept, idx) => (
                        <Table.Tr key={idx}>
                          <Table.Td fw={700} c="#09090B">
                            {dept.department}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Badge size="xs" color="dark" variant="light">
                              {dept.headcount} Staff
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                            ₹{Number(dept.actualSpend || 0).toLocaleString('en-IN')}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                            ₹{Number(dept.allocatedBudget || 0).toLocaleString('en-IN')}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Badge size="xs" color="teal" variant="light">
                              -4.8% (Under Budget)
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#2563EB', fontWeight: 700 }}>
                            ₹{Number(dept.acpe || 0).toLocaleString('en-IN')} / mo
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Paper>
              ) : (
                /* Standard Employee Matrix Table */
                <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
                  <Table.ScrollContainer minWidth={800}>
                    <Table striped highlightOnHover fz="xs">
                      <Table.Thead style={{ backgroundColor: '#F1F5F9' }}>
                        {activeCenter === 'statutory' && subReport === 'epf-ecr' && (
                          <Table.Tr>
                            <Table.Th>UAN</Table.Th>
                            <Table.Th>Member Name</Table.Th>
                            <Table.Th>Department</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Gross Wage</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>EPF Wage</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>EE Share (12%)</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>ER EPS (8.33%)</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>ER EPF (3.67%)</Table.Th>
                          </Table.Tr>
                        )}

                        {activeCenter === 'statutory' && subReport === 'esic' && (
                          <Table.Tr>
                            <Table.Th>IP Insurance Number</Table.Th>
                            <Table.Th>Insured Person Name</Table.Th>
                            <Table.Th>Department</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Monthly Gross</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Employee 0.75%</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Employer 3.25%</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Total Remittance</Table.Th>
                          </Table.Tr>
                        )}

                        {activeCenter === 'statutory' && subReport === 'form24q' && (
                          <Table.Tr>
                            <Table.Th>Employee PAN</Table.Th>
                            <Table.Th>Employee Name</Table.Th>
                            <Table.Th>Regime</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Annual Gross</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Std Deduction</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Taxable Income</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Monthly TDS</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Annual Tax</Table.Th>
                          </Table.Tr>
                        )}

                        {activeCenter === 'payroll' && subReport === 'bank-advice' && (
                          <Table.Tr>
                            <Table.Th>S.No</Table.Th>
                            <Table.Th>Beneficiary Name</Table.Th>
                            <Table.Th>Account Number</Table.Th>
                            <Table.Th>IFSC Code</Table.Th>
                            <Table.Th>Bank Name</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Net Amount</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Mode</Table.Th>
                            <Table.Th>Status</Table.Th>
                          </Table.Tr>
                        )}

                        {activeCenter === 'payroll' && subReport === 'master-sheet' && (
                          <Table.Tr>
                            <Table.Th>Employee Name</Table.Th>
                            <Table.Th>Department</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Basic Pay</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>HRA</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Special Allowance</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Gross</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Total Deductions</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Net Payable</Table.Th>
                          </Table.Tr>
                        )}

                        {activeCenter === 'workforce' && (
                          <Table.Tr>
                            <Table.Th>Employee Name</Table.Th>
                            <Table.Th>Department</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Monthly Basic</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Daily Basic Rate</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Earned Leave (PL)</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Sick Leave (SL)</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Casual Leave (CL)</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Encashment Liability</Table.Th>
                          </Table.Tr>
                        )}
                      </Table.Thead>

                      <Table.Tbody>
                        {paginatedRecords.length === 0 ? (
                          <Table.Tr>
                            <Table.Td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>
                              <Text size="sm" c="#64748B">
                                No records found for the selected filter criteria.
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ) : (
                          paginatedRecords.map((row, idx) => (
                            <Table.Tr key={idx}>
                              {activeCenter === 'statutory' && subReport === 'epf-ecr' && (
                                <>
                                  <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.uan}</Table.Td>
                                  <Table.Td fw={700} c="#09090B">{row.memberName}</Table.Td>
                                  <Table.Td><Badge size="xs" color="gray" variant="light">{row.department}</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.grossWage).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.epfWage).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#2563EB', fontWeight: 600 }}>₹{Number(row.eeShare12).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.erEps833).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.erEpfDiff).toLocaleString('en-IN')}</Table.Td>
                                </>
                              )}

                              {activeCenter === 'statutory' && subReport === 'esic' && (
                                <>
                                  <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.ipNumber}</Table.Td>
                                  <Table.Td fw={700} c="#09090B">{row.ipName}</Table.Td>
                                  <Table.Td><Badge size="xs" color="gray" variant="light">{row.department}</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.totalMonthlyGross).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'center' }}>
                                    <Badge size="xs" color={row.isCovered ? 'teal' : 'gray'} variant={row.isCovered ? 'light' : 'outline'}>
                                      {row.isCovered ? 'Covered' : 'Exempt'}
                                    </Badge>
                                  </Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#2563EB' }}>₹{Number(row.eeContribution075).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#059669' }}>₹{Number(row.erContribution325).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#09090B' }}>₹{Number(row.totalChallanRemittance).toLocaleString('en-IN')}</Table.Td>
                                </>
                              )}

                              {activeCenter === 'statutory' && subReport === 'form24q' && (
                                <>
                                  <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{row.pan}</Table.Td>
                                  <Table.Td fw={700} c="#09090B">{row.employeeName}</Table.Td>
                                  <Table.Td><Badge size="xs" color="dark" variant="light">{row.regime}</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.annualGrossSalary).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.standardDeduction).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.totalTaxableIncome).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#DC2626', fontWeight: 700 }}>₹{Number(row.monthlyTdsWithheld).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.totalAnnualTaxPayable).toLocaleString('en-IN')}</Table.Td>
                                </>
                              )}

                              {activeCenter === 'payroll' && subReport === 'bank-advice' && (
                                <>
                                  <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.serialNo}</Table.Td>
                                  <Table.Td fw={700} c="#09090B">{row.beneficiaryName}</Table.Td>
                                  <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.beneficiaryAccount}</Table.Td>
                                  <Table.Td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.ifscCode}</Table.Td>
                                  <Table.Td>{row.bankName}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#059669' }}>₹{Number(row.netPayAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Table.Td>
                                  <Table.Td style={{ textAlign: 'center' }}><Badge size="xs" color="blue" variant="light">{row.paymentMode}</Badge></Table.Td>
                                  <Table.Td><Badge size="xs" color="teal" variant="filled">READY</Badge></Table.Td>
                                </>
                              )}

                              {activeCenter === 'payroll' && subReport === 'master-sheet' && (
                                <>
                                  <Table.Td fw={700} c="#09090B">{row.name}</Table.Td>
                                  <Table.Td><Badge size="xs" color="gray" variant="light">{row.department}</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.earnings?.basic || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.earnings?.hra || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.earnings?.specialAllowance || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>₹{Number(row.earnings?.grossSalary || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#DC2626' }}>₹{Number(row.deductions?.total || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#059669' }}>₹{Number(row.netPayable || 0).toLocaleString('en-IN')}</Table.Td>
                                </>
                              )}

                              {activeCenter === 'workforce' && (
                                <>
                                  <Table.Td fw={700} c="#09090B">{row.name}</Table.Td>
                                  <Table.Td><Badge size="xs" color="gray" variant="light">{row.department}</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.basicSalary || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(row.dailyBasicWage || 0).toLocaleString('en-IN')}</Table.Td>
                                  <Table.Td style={{ textAlign: 'center' }}><Badge size="xs" color="blue" variant="light">{row.earnedLeaveBalance} Days</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'center' }}><Badge size="xs" color="yellow" variant="light">{row.sickLeaveBalance} Days</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'center' }}><Badge size="xs" color="gray" variant="light">{row.casualLeaveBalance} Days</Badge></Table.Td>
                                  <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#2563EB' }}>₹{Number(row.leaveLiabilityAmount || 0).toLocaleString('en-IN')}</Table.Td>
                                </>
                              )}
                            </Table.Tr>
                          ))
                        )}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>

                  {/* Table Pagination */}
                  {totalPages > 1 && (
                    <Group justify="space-between" p="xs" style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      <Text size="xs" c="#64748B">
                        Showing page <b>{page}</b> of <b>{totalPages}</b> ({filteredRecords.length} records)
                      </Text>
                      <Pagination total={totalPages} value={page} onChange={setPage} size="xs" radius="sm" color="dark" />
                    </Group>
                  )}
                </Paper>
              )}
            </Stack>
          )}
        </Paper>
      )}
    </Stack>
  );
};

export default ReportsView;
