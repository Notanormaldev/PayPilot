import React from 'react';
import { Paper, Group, Text, Select, Badge, Box } from '@mantine/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const mockMonthlyData = [
  { month: 'Apr', netPay: 11200000, taxes: 1200000, statutories: 500000, deductions: 250000 },
  { month: 'May', netPay: 12400000, taxes: 1350000, statutories: 550000, deductions: 280000 },
  { month: 'Jun', netPay: 13420000, taxes: 1510000, statutories: 580000, deductions: 290000 },
  { month: 'Jul', netPay: 13100000, taxes: 1480000, statutories: 570000, deductions: 270000 },
  { month: 'Aug', netPay: 14200000, taxes: 1620000, statutories: 610000, deductions: 310000 },
  { month: 'Sep', netPay: 17250000, taxes: 1950000, statutories: 720000, deductions: 350000 },
];

export const PayrollCostChart = ({ data }) => {
  const chartData = data && data.length > 0 ? data.map((d, i) => ({
    month: d.month || `M${i+1}`,
    netPay: d.cost ? Math.round(d.cost * 0.78) : 13420000,
    taxes: d.cost ? Math.round(d.cost * 0.12) : 1510000,
    statutories: d.cost ? Math.round(d.cost * 0.06) : 580000,
    deductions: d.cost ? Math.round(d.cost * 0.04) : 290000,
  })) : mockMonthlyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          p="xs"
          radius="sm"
          style={{
            backgroundColor: '#09090B',
            color: '#FFFFFF',
            border: '1px solid #27272A',
            fontSize: '11px',
            lineHeight: 1.4,
          }}
        >
          <Text fw={700} c="#F8FAFC" mb={4}>
            {label} Breakdown
          </Text>
          {payload.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: item.color }}>{item.name}:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{(item.value / 100000).toFixed(2)}L
              </span>
            </div>
          ))}
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
      <Group justify="space-between" mb="lg">
        <div>
          <Text fw={700} size="sm" c="#09090B">
            PAYROLL COST SUMMARY
          </Text>
          <Text size="xs" c="#71717A">
            Historical distribution across net pay, taxes, and statutory withholdings
          </Text>
        </div>
        <Badge size="sm" variant="outline" color="gray">
          This year ▼
        </Badge>
      </Group>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="netPay" name="Net Pay" stackId="a" fill="#09090B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="taxes" name="Taxes" stackId="a" fill="#DC2626" />
            <Bar dataKey="statutories" name="Statutories" stackId="a" fill="#EA580C" />
            <Bar dataKey="deductions" name="Deductions" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};
