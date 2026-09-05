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
} from '@mantine/core';
import {
  IconReceipt2,
  IconDownload,
  IconFileText,
  IconChartPie,
  IconTrendingUp,
} from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const MyPayslipsView = () => {
  const [downloadingId, setDownloadingId] = useState(null);

  // Latest Salary Breakdown Composition for Donut Chart
  const pieData = [
    { name: 'Basic Salary', value: 72500, color: '#2563EB' },
    { name: 'HRA & Allowances', value: 43500, color: '#0D9488' },
    { name: 'PF & ESI Deductions', value: 8700, color: '#D97706' },
    { name: 'TDS Income Tax', value: 12000, color: '#DC2626' },
  ];

  // Payslip History Data
  const payslips = [
    {
      id: 'PS-2026-08',
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
  ];

  const handleDownloadPdf = (ps) => {
    setDownloadingId(ps.id);

    // Create client-side text download file simulating PDF receipt
    const payslipText = `
==================================================
PAYPILOT AUTONOMOUS PAYROLL - OFFICIAL PAYSLIP
==================================================
Payslip ID : ${ps.id}
Period     : ${ps.month} (${ps.payrunName})
Pay Date   : ${ps.date}
Employee   : Kartik Kumar (EMP-8492)
Department : Product

--------------------------------------------------
SALARY RULE BREAKDOWN:
--------------------------------------------------
Basic Salary           : ₹ 72,500.00
House Rent Allowance   : ₹ 29,000.00
Special Allowance      : ₹ 14,500.00
Provident Fund (PF)    : -₹ 7,250.00
ESI Contribution       : -₹ 1,450.00
TDS Tax Deduction      : -₹ 12,000.00
--------------------------------------------------
TOTAL GROSS SALARY     : ₹ ${ps.gross.toLocaleString()}
TOTAL DEDUCTIONS       : ₹ ${ps.deductions.toLocaleString()}
NET TAKE-HOME SALARY   : ₹ ${ps.net.toLocaleString()}
==================================================
        `;

    const blob = new Blob([payslipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${ps.id}_${ps.month.replace(' ', '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingId(null);
    }, 1000);
  };

  return (
    <Stack gap="lg">
      {/* Top Header Card */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Title order={3} c="#09090B">
              My Monthly Payslips & Salary Breakdown
            </Title>
            <Text size="xs" c="#64748B">
              Access itemized salary rule breakdowns, download monthly PDF statements, and visualize salary compositions.
            </Text>
          </div>

          <Badge size="md" color="indigo" variant="light">
            Latest Net Take-Home: ₹95,300
          </Badge>
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

      {/* Payslips History Accordion List */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Title order={4} size="sm" c="#09090B" mb="md">
          Monthly Payslips Statements History
        </Title>

        <Accordion variant="separated" radius="md">
          {payslips.map((ps) => (
            <Accordion.Item key={ps.id} value={ps.id}>
              <Accordion.Control>
                <Group justify="space-between">
                  <Group gap="sm">
                    <IconReceipt2 size={18} color="#2563EB" />
                    <div>
                      <Text size="xs" fw={700} c="#09090B">
                        {ps.month} ({ps.id})
                      </Text>
                      <Text size="10px" c="#71717A">
                        Pay Date: {ps.date}
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
      </Paper>
    </Stack>
  );
};
