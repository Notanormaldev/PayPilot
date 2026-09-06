import React, { useState, useMemo } from 'react';
import {
  Paper,
  Group,
  Stack,
  Text,
  Select,
  Badge,
  Box,
  SimpleGrid,
  SegmentedControl,
  ActionIcon,
  Button,
  Tooltip as MantineTooltip,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconChartBar,
  IconArrowBackUp,
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
  Cell,
} from 'recharts';

// Base monthly reference data for years
const yearlyBaseData = {
  '2026': [
    { month: 'Jan', netPay: 12100000, taxes: 1320000, statutories: 520000, deductions: 260000 },
    { month: 'Feb', netPay: 12350000, taxes: 1350000, statutories: 530000, deductions: 270000 },
    { month: 'Mar', netPay: 12800000, taxes: 1410000, statutories: 550000, deductions: 280000 },
    { month: 'Apr', netPay: 13150000, taxes: 1450000, statutories: 560000, deductions: 285000 },
    { month: 'May', netPay: 13420000, taxes: 1510000, statutories: 580000, deductions: 290000 },
    { month: 'Jun', netPay: 13900000, taxes: 1560000, statutories: 600000, deductions: 300000 },
    { month: 'Jul', netPay: 14350000, taxes: 1610000, statutories: 620000, deductions: 310000 },
    { month: 'Aug', netPay: 14800000, taxes: 1670000, statutories: 640000, deductions: 320000 },
    { month: 'Sep', netPay: 17250000, taxes: 1950000, statutories: 720000, deductions: 350000 },
    { month: 'Oct', netPay: 15400000, taxes: 1730000, statutories: 660000, deductions: 330000 },
    { month: 'Nov', netPay: 15900000, taxes: 1790000, statutories: 680000, deductions: 340000 },
    { month: 'Dec', netPay: 16500000, taxes: 1860000, statutories: 710000, deductions: 355000 },
  ],
  '2025': [
    { month: 'Jan', netPay: 9800000, taxes: 1050000, statutories: 420000, deductions: 210000 },
    { month: 'Feb', netPay: 10100000, taxes: 1080000, statutories: 430000, deductions: 215000 },
    { month: 'Mar', netPay: 10450000, taxes: 1120000, statutories: 450000, deductions: 225000 },
    { month: 'Apr', netPay: 10800000, taxes: 1160000, statutories: 460000, deductions: 230000 },
    { month: 'May', netPay: 11100000, taxes: 1190000, statutories: 475000, deductions: 240000 },
    { month: 'Jun', netPay: 11400000, taxes: 1220000, statutories: 490000, deductions: 245000 },
    { month: 'Jul', netPay: 11650000, taxes: 1250000, statutories: 500000, deductions: 250000 },
    { month: 'Aug', netPay: 11950000, taxes: 1280000, statutories: 510000, deductions: 255000 },
    { month: 'Sep', netPay: 12200000, taxes: 1310000, statutories: 520000, deductions: 260000 },
    { month: 'Oct', netPay: 12500000, taxes: 1340000, statutories: 535000, deductions: 270000 },
    { month: 'Nov', netPay: 12800000, taxes: 1370000, statutories: 545000, deductions: 275000 },
    { month: 'Dec', netPay: 13100000, taxes: 1410000, statutories: 560000, deductions: 280000 },
  ],
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthShortNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const monthDaysCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const CURRENT_MAX_YEAR = 2026;
const CURRENT_MAX_MONTH_IDX = 8; // 8 = September 2026
const MAX_ALLOWED_DATE = new Date(CURRENT_MAX_YEAR, CURRENT_MAX_MONTH_IDX, 30);

const formatCurrency = (val) => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(val / 100000).toFixed(1)}L`;
};

export const PayrollCostChart = ({ data }) => {
  // Calendar Date State (defaults to September 2026)
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 1));
  const [viewMode, setViewMode] = useState('full-year'); // 'full-year' | 'single-month' | 'trailing-6'

  const selectedYear = selectedDate ? selectedDate.getFullYear().toString() : '2026';
  const selectedMonthIndex = selectedDate ? selectedDate.getMonth() : 8;
  const selectedMonthShort = monthShortNames[selectedMonthIndex] || 'Sep';
  const selectedMonthFullName = monthNames[selectedMonthIndex] || 'September';

  // Handle month change safely with boundary check
  const handleSelectMonth = (date) => {
    if (!date) return;
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();

    // Prevent selecting beyond September 2026
    if (
      targetYear > CURRENT_MAX_YEAR ||
      (targetYear === CURRENT_MAX_YEAR && targetMonth > CURRENT_MAX_MONTH_IDX)
    ) {
      setSelectedDate(new Date(CURRENT_MAX_YEAR, CURRENT_MAX_MONTH_IDX, 1));
      setViewMode('single-month');
      return;
    }

    setSelectedDate(date);
    setViewMode('single-month'); // Automatically switch to Month-wise view
  };

  const handlePrevMonth = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setSelectedDate(prevDate);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = nextDate.getMonth();

    if (
      nextYear > CURRENT_MAX_YEAR ||
      (nextYear === CURRENT_MAX_YEAR && nextMonth > CURRENT_MAX_MONTH_IDX)
    ) {
      return; // Capped at current month
    }
    setSelectedDate(nextDate);
  };

  const canGoNext = !(
    parseInt(selectedYear, 10) > CURRENT_MAX_YEAR ||
    (parseInt(selectedYear, 10) === CURRENT_MAX_YEAR && selectedMonthIndex >= CURRENT_MAX_MONTH_IDX)
  );

  // Compute chart series enforcing realistic cutoff (no bars for future months after September 2026)
  const chartData = useMemo(() => {
    const yearData = yearlyBaseData[selectedYear] || yearlyBaseData['2026'];
    const targetYear = parseInt(selectedYear, 10);

    const resolvedYearData = yearData.map((item, idx) => {
      const isFutureMonth =
        targetYear > CURRENT_MAX_YEAR ||
        (targetYear === CURRENT_MAX_YEAR && idx > CURRENT_MAX_MONTH_IDX);

      if (isFutureMonth) {
        return {
          month: item.month,
          monthIndex: idx,
          netPay: 0,
          taxes: 0,
          statutories: 0,
          deductions: 0,
          isFuture: true,
        };
      }

      // If live data has payruns, update matching months
      const liveItem = data?.find(
        (d) => d.month === item.month || d.period?.toLowerCase().includes(item.month.toLowerCase())
      );
      if (liveItem && liveItem.cost) {
        return {
          month: item.month,
          monthIndex: idx,
          netPay: Math.round(liveItem.cost * 0.78),
          taxes: Math.round(liveItem.cost * 0.12),
          statutories: Math.round(liveItem.cost * 0.06),
          deductions: Math.round(liveItem.cost * 0.04),
          isFuture: false,
        };
      }

      return { ...item, monthIndex: idx, isFuture: false };
    });

    if (viewMode === 'trailing-6') {
      const result = [];
      for (let i = 5; i >= 0; i--) {
        let targetIdx = selectedMonthIndex - i;
        if (targetIdx >= 0) {
          result.push(resolvedYearData[targetIdx]);
        } else {
          const prevYearData = yearlyBaseData[(parseInt(selectedYear, 10) - 1).toString()] || yearlyBaseData['2025'];
          result.push(prevYearData[12 + targetIdx]);
        }
      }
      return result;
    }

    if (viewMode === 'single-month') {
      const mData = resolvedYearData[selectedMonthIndex] || resolvedYearData[8];
      const isFuture = mData.isFuture;
      const daysInMonth = monthDaysCount[selectedMonthIndex] || 30;

      return [
        {
          month: `Week 1 (1-7 ${selectedMonthShort})`,
          netPay: isFuture ? 0 : Math.round(mData.netPay * 0.23),
          taxes: isFuture ? 0 : Math.round(mData.taxes * 0.23),
          statutories: isFuture ? 0 : Math.round(mData.statutories * 0.23),
          deductions: isFuture ? 0 : Math.round(mData.deductions * 0.23),
          isFuture,
        },
        {
          month: `Week 2 (8-14 ${selectedMonthShort})`,
          netPay: isFuture ? 0 : Math.round(mData.netPay * 0.25),
          taxes: isFuture ? 0 : Math.round(mData.taxes * 0.25),
          statutories: isFuture ? 0 : Math.round(mData.statutories * 0.25),
          deductions: isFuture ? 0 : Math.round(mData.deductions * 0.25),
          isFuture,
        },
        {
          month: `Week 3 (15-21 ${selectedMonthShort})`,
          netPay: isFuture ? 0 : Math.round(mData.netPay * 0.24),
          taxes: isFuture ? 0 : Math.round(mData.taxes * 0.24),
          statutories: isFuture ? 0 : Math.round(mData.statutories * 0.24),
          deductions: isFuture ? 0 : Math.round(mData.deductions * 0.24),
          isFuture,
        },
        {
          month: `Week 4 (22-${daysInMonth} ${selectedMonthShort})`,
          netPay: isFuture ? 0 : Math.round(mData.netPay * 0.28),
          taxes: isFuture ? 0 : Math.round(mData.taxes * 0.28),
          statutories: isFuture ? 0 : Math.round(mData.statutories * 0.28),
          deductions: isFuture ? 0 : Math.round(mData.deductions * 0.28),
          isFuture,
        },
      ];
    }

    return resolvedYearData;
  }, [selectedYear, selectedMonthIndex, selectedMonthShort, viewMode, data]);

  // Aggregate stats for current chart view
  const aggregates = useMemo(() => {
    let totalNet = 0;
    let totalTaxes = 0;
    let totalStatutories = 0;
    let totalDeductions = 0;

    chartData.forEach((item) => {
      if (!item.isFuture) {
        totalNet += item.netPay || 0;
        totalTaxes += item.taxes || 0;
        totalStatutories += item.statutories || 0;
        totalDeductions += item.deductions || 0;
      }
    });

    const totalGross = totalNet + totalTaxes + totalStatutories + totalDeductions;
    return {
      totalGross,
      totalNet,
      totalTaxes,
      totalStatutories,
      totalDeductions,
      taxPct: totalGross ? ((totalTaxes / totalGross) * 100).toFixed(1) : '12.0',
      netPct: totalGross ? ((totalNet / totalGross) * 100).toFixed(1) : '78.0',
    };
  }, [chartData]);

  // Bar click handler to drill down into month-wise
  const handleBarClick = (entry) => {
    if (!entry || viewMode === 'single-month') return;
    const monthShort = entry.month;
    const idx = monthShortNames.indexOf(monthShort);
    if (idx >= 0) {
      if (parseInt(selectedYear, 10) === CURRENT_MAX_YEAR && idx > CURRENT_MAX_MONTH_IDX) {
        return; // Future month
      }
      const newDate = new Date(parseInt(selectedYear, 10), idx, 1);
      setSelectedDate(newDate);
      setViewMode('single-month');
    }
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthTotal = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
      const isFuture = payload[0]?.payload?.isFuture || monthTotal === 0;

      return (
        <Paper
          p="sm"
          radius="md"
          style={{
            backgroundColor: '#09090B',
            color: '#FFFFFF',
            border: '1px solid #27272A',
            fontSize: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            minWidth: '220px',
          }}
        >
          <Group justify="space-between" mb={6} pb={4} style={{ borderBottom: '1px solid #27272A' }}>
            <Text fw={700} c="#F8FAFC" size="xs">
              {label} {viewMode !== 'single-month' ? selectedYear : ''}
            </Text>
            {isFuture ? (
              <Badge size="xs" color="gray" variant="filled">
                Unprocessed Future Month
              </Badge>
            ) : (
              <Text fw={800} c="#38BDF8" size="xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Total: {formatCurrency(monthTotal)}
              </Text>
            )}
          </Group>

          {isFuture ? (
            <Text size="11px" c="#94A3B8" py={4}>
              Future payroll run. No disbursals recorded yet.
            </Text>
          ) : (
            <>
              <Stack gap={4}>
                {payload.map((item, index) => {
                  const pct = monthTotal ? ((item.value / monthTotal) * 100).toFixed(1) : 0;
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <Group gap={6}>
                        <Box style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: item.color }} />
                        <span style={{ color: '#E2E8F0', fontSize: '11px' }}>{item.name}</span>
                      </Group>
                      <Group gap={6}>
                        <span style={{ color: '#94A3B8', fontSize: '10px' }}>({pct}%)</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#FFFFFF', fontSize: '11px' }}>
                          ₹{(item.value / 100000).toFixed(2)}L
                        </span>
                      </Group>
                    </div>
                  );
                })}
              </Stack>
              {viewMode !== 'single-month' && (
                <Text size="10px" c="#38BDF8" mt={6} pt={4} style={{ borderTop: '1px solid #27272A', fontStyle: 'italic' }}>
                  💡 Click bar to view {label} weekly cycles
                </Text>
              )}
            </>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Row with Title, View Controls & Month Picker */}
      <Group justify="space-between" align="flex-start" mb="sm" wrap="wrap" gap="md">
        <div>
          <Group gap="xs" align="center">
            <Text fw={800} size="sm" c="#09090B" style={{ letterSpacing: '0.02em' }}>
              PAYROLL COST SUMMARY
            </Text>
            <Badge size="xs" color="blue" variant="light" fw={700}>
              {selectedYear}
            </Badge>
            {viewMode === 'single-month' && (
              <Badge size="xs" color="teal" variant="filled" fw={700}>
                Month-wise: {selectedMonthFullName}
              </Badge>
            )}
          </Group>
          <Text size="xs" c="#71717A" mt={2}>
            {viewMode === 'single-month'
              ? `Weekly disbursal cycles and statutory breakdown for ${selectedMonthFullName} ${selectedYear}`
              : 'Historical distribution across net pay, taxes, statutory contributions & deductions'}
          </Text>
        </div>

        {/* Action Controls */}
        <Group gap="xs" align="center" wrap="wrap">
          {/* Segmented Mode Toggle */}
          <SegmentedControl
            size="xs"
            radius="sm"
            value={viewMode}
            onChange={(val) => {
              if (val === 'single-month') {
                // Ensure not picking future month
                if (
                  parseInt(selectedYear, 10) > CURRENT_MAX_YEAR ||
                  (parseInt(selectedYear, 10) === CURRENT_MAX_YEAR && selectedMonthIndex > CURRENT_MAX_MONTH_IDX)
                ) {
                  setSelectedDate(new Date(CURRENT_MAX_YEAR, CURRENT_MAX_MONTH_IDX, 1));
                }
              }
              setViewMode(val);
            }}
            data={[
              { label: `Full Year (${selectedYear})`, value: 'full-year' },
              { label: `Month-wise (${selectedMonthShort})`, value: 'single-month' },
              { label: 'Trailing 6M', value: 'trailing-6' },
            ]}
            styles={{
              root: {
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
              },
              label: {
                fontWeight: 600,
                fontSize: '11px',
              },
            }}
          />

          {/* Month & Year Calendar Dropdown */}
          <MonthPickerInput
            leftSection={<IconCalendar size={15} stroke={1.7} style={{ color: '#2563EB' }} />}
            placeholder="Pick month & year"
            value={selectedDate}
            onChange={handleSelectMonth}
            maxDate={MAX_ALLOWED_DATE}
            minDate={new Date(2024, 0, 1)}
            size="xs"
            radius="sm"
            styles={{
              input: {
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
                color: '#09090B',
                fontWeight: 600,
                fontSize: '12px',
                width: '160px',
                cursor: 'pointer',
              },
            }}
          />
        </Group>
      </Group>

      {/* Month Navigation Pills & Quick Controls when in Month-wise mode */}
      {viewMode === 'single-month' && (
        <Paper
          p="xs"
          mb="sm"
          radius="sm"
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap="xs" align="center">
              <ActionIcon
                variant="default"
                size="sm"
                radius="sm"
                onClick={handlePrevMonth}
                title="Previous Month"
              >
                <IconChevronLeft size={14} />
              </ActionIcon>

              <Text size="xs" fw={700} c="#166534">
                {selectedMonthFullName} {selectedYear}
              </Text>

              <ActionIcon
                variant="default"
                size="sm"
                radius="sm"
                onClick={handleNextMonth}
                disabled={!canGoNext}
                title={canGoNext ? 'Next Month' : 'Current active month reached (September 2026)'}
              >
                <IconChevronRight size={14} />
              </ActionIcon>

              <Text size="11px" c="#15803D" fw={500} ml={4}>
                (Select any month up to current month Sep 2026)
              </Text>
            </Group>

            {/* Quick Month Selector Pills */}
            <Group gap={4} wrap="wrap">
              {monthShortNames.map((m, idx) => {
                const isFuture =
                  parseInt(selectedYear, 10) > CURRENT_MAX_YEAR ||
                  (parseInt(selectedYear, 10) === CURRENT_MAX_YEAR && idx > CURRENT_MAX_MONTH_IDX);
                const isSelected = idx === selectedMonthIndex;

                return (
                  <MantineTooltip
                    key={m}
                    label={isFuture ? `${m} ${selectedYear} is in the future` : `View ${monthNames[idx]} ${selectedYear}`}
                    position="top"
                    withArrow
                    disabled={!isFuture && !isSelected}
                  >
                    <span>
                      <Button
                        size="compact-xs"
                        variant={isSelected ? 'filled' : 'subtle'}
                        color={isSelected ? 'teal' : 'gray'}
                        disabled={isFuture}
                        onClick={() => {
                          if (!isFuture) {
                            setSelectedDate(new Date(parseInt(selectedYear, 10), idx, 1));
                          }
                        }}
                        style={{
                          fontSize: '10px',
                          fontWeight: isSelected ? 700 : 500,
                          padding: '0 6px',
                          height: '22px',
                          cursor: isFuture ? 'not-allowed' : 'pointer',
                          opacity: isFuture ? 0.35 : 1,
                        }}
                      >
                        {m}
                      </Button>
                    </span>
                  </MantineTooltip>
                );
              })}

              <Button
                size="compact-xs"
                variant="light"
                color="blue"
                leftSection={<IconArrowBackUp size={12} />}
                onClick={() => setViewMode('full-year')}
                style={{ fontSize: '10px', height: '22px', marginLeft: '6px' }}
              >
                Full Year
              </Button>
            </Group>
          </Group>
        </Paper>
      )}

      {/* Aggregate KPI Badges Row */}
      <Paper
        p="xs"
        mb="md"
        radius="sm"
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #F1F5F9',
        }}
      >
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
          <Box px="xs">
            <Text size="10px" fw={700} c="#64748B" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
              {viewMode === 'single-month' ? `${selectedMonthShort} Gross Payroll` : 'Total Gross Payroll'}
            </Text>
            <Text size="14px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {formatCurrency(aggregates.totalGross)}
            </Text>
          </Box>

          <Box px="xs" style={{ borderLeft: '1px solid #E2E8F0' }}>
            <Text size="10px" fw={700} c="#64748B" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
              Net Take-Home ({aggregates.netPct}%)
            </Text>
            <Text size="14px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {formatCurrency(aggregates.totalNet)}
            </Text>
          </Box>

          <Box px="xs" style={{ borderLeft: '1px solid #E2E8F0' }}>
            <Text size="10px" fw={700} c="#DC2626" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
              Tax Withholdings ({aggregates.taxPct}%)
            </Text>
            <Text size="14px" fw={800} c="#DC2626" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {formatCurrency(aggregates.totalTaxes)}
            </Text>
          </Box>

          <Box px="xs" style={{ borderLeft: '1px solid #E2E8F0' }}>
            <Text size="10px" fw={700} c="#EA580C" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
              Statutories & PF
            </Text>
            <Text size="14px" fw={800} c="#EA580C" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {formatCurrency(aggregates.totalStatutories)}
            </Text>
          </Box>
        </SimpleGrid>
      </Paper>

      {/* Main Bar Chart Container */}
      <div style={{ width: '100%', height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                handleBarClick(e.activePayload[0].payload);
              }
            }}
            style={{ cursor: viewMode !== 'single-month' ? 'pointer' : 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="netPay"
              name="Net Pay"
              stackId="payroll_stack"
              fill="#09090B"
              radius={[0, 0, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="taxes"
              name="Taxes (TDS)"
              stackId="payroll_stack"
              fill="#DC2626"
              radius={[0, 0, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="statutories"
              name="Statutories (PF/ESI)"
              stackId="payroll_stack"
              fill="#EA580C"
              radius={[0, 0, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="deductions"
              name="Other Deductions"
              stackId="payroll_stack"
              fill="#94A3B8"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

