import React from 'react';
import { Paper, Text, Group } from '@mantine/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PayrollChartProps {
  data: { month: string; payroll: number; employees: number }[];
}

export const PayrollChart: React.FC<PayrollChartProps> = ({ data }) => {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { month: 'Apr', payroll: 2100000, employees: 34 },
          { month: 'May', payroll: 2250000, employees: 36 },
          { month: 'Jun', payroll: 2310000, employees: 37 },
          { month: 'Jul', payroll: 2380000, employees: 38 },
          { month: 'Aug', payroll: 2420000, employees: 39 },
          { month: 'Sep', payroll: 2450000, employees: 40 },
        ];

  return (
    <Paper p="md" radius="sm" style={{ height: '340px' }}>
      <Group justify="space-between" mb="md">
        <div>
          <Text size="xs" fw={700} c="#94A3B8" style={{ letterSpacing: '0.05em' }}>
            PAYROLL DISBURSEMENT RUNTIME (LAST 6 MONTHS)
          </Text>
          <Text size="xs" c="#64748B">
            Net disbursement trend across active salary structures.
          </Text>
        </div>
      </Group>

      <div style={{ width: '100%', height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262A36" vertical={false} />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#14161F',
                borderColor: '#262A36',
                borderRadius: '4px',
                color: '#F1F5F9',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net Spend']}
            />
            <Bar dataKey="payroll" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};
