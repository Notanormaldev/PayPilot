import React from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Table,
  Progress,
  Button,
  SimpleGrid,
  Divider,
} from '@mantine/core';
import { IconCheck, IconClock, IconReceipt2, IconCash } from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';

export const LoanScheduleModal = ({ loan, opened, onClose, onSettleLoan }) => {
  if (!loan) return null;

  const progressPercent = Math.min(
    100,
    Math.round(((loan.totalPaidAmount || 0) / (loan.principalAmount || 1)) * 100)
  );

  // Generate monthly schedule lines
  const scheduleRows = Array.from({ length: loan.tenureMonths || 6 }, (_, i) => {
    const installmentNo = i + 1;
    const isPaid = installmentNo <= (loan.paidInstallments || 0);

    const baseMonthDate = new Date(2026, 0 + i, 1);
    const monthLabel = baseMonthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    return {
      installmentNo,
      monthLabel,
      amount: loan.monthlyEmi,
      status: isPaid ? 'DEDUCTED' : loan.status === 'SETTLED' ? 'SETTLED_EARLY' : 'UPCOMING',
      payrunRef: isPaid ? `PR-${monthLabel.replace(' ', '-').toUpperCase()}` : '—',
    };
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={700} size="md" c="#09090B">
            Loan Amortization & Recovery Schedule
          </Text>
          <Badge size="xs" color="gray">
            {loan.id}
          </Badge>
        </Group>
      }
      size="lg"
      radius="md"
    >
      <Stack gap="md">
        {/* Employee & Loan Summary Header */}
        <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <UserAvatar size={40} name={loan.employeeName} id={loan.employeeEmail} />
              <div>
                <Text size="xs" fw={700} c="#09090B">
                  {loan.employeeName}
                </Text>
                <Text size="11px" c="#64748B">
                  {loan.jobPosition} • {loan.department}
                </Text>
              </div>
            </Group>

            <Badge
              size="sm"
              color={
                loan.status === 'ACTIVE'
                  ? 'teal'
                  : loan.status === 'SETTLED'
                  ? 'blue'
                  : loan.status === 'PENDING_APPROVAL'
                  ? 'yellow'
                  : 'red'
              }
            >
              {loan.status.replace('_', ' ')}
            </Badge>
          </Group>
        </Paper>

        {/* Financial Highlights */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Text size="10px" c="#64748B" fw={600}>Principal Loan</Text>
            <Text size="sm" fw={700} c="#09090B">₹{loan.principalAmount?.toLocaleString('en-IN')}</Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Text size="10px" c="#64748B" fw={600}>Monthly EMI</Text>
            <Text size="sm" fw={700} c="#2563EB">₹{loan.monthlyEmi?.toLocaleString('en-IN')}</Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Text size="10px" c="#64748B" fw={600}>Recovered</Text>
            <Text size="sm" fw={700} c="#0D9488">₹{loan.totalPaidAmount?.toLocaleString('en-IN')}</Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Text size="10px" c="#64748B" fw={600}>Balance</Text>
            <Text size="sm" fw={700} c="#DC2626">₹{loan.remainingBalance?.toLocaleString('en-IN')}</Text>
          </Paper>
        </SimpleGrid>

        {/* Progress Bar */}
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="11px" fw={600} c="#64748B">
              Repayment Progress ({loan.paidInstallments} of {loan.tenureMonths} EMIs Paid)
            </Text>
            <Text size="11px" fw={700} c="#09090B">
              {progressPercent}%
            </Text>
          </Group>
          <Progress value={progressPercent} color={progressPercent === 100 ? 'teal' : 'blue'} size="sm" radius="xl" />
        </div>

        <Divider />

        {/* Schedule Table */}
        <Text size="xs" fw={700} c="#09090B">
          Monthly Deduction Ledger
        </Text>
        <Paper radius="sm" style={{ border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
            <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
              <Table.Tr>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>EMI #</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>Due Month</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>Amount</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>Payrun Batch</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {scheduleRows.map((row) => (
                <Table.Tr key={row.installmentNo}>
                  <Table.Td style={{ fontWeight: 600 }}>Installment {row.installmentNo}</Table.Td>
                  <Table.Td>{row.monthLabel}</Table.Td>
                  <Table.Td style={{ fontWeight: 600 }}>₹{row.amount?.toLocaleString('en-IN')}</Table.Td>
                  <Table.Td style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '11px' }}>
                    {row.payrunRef}
                  </Table.Td>
                  <Table.Td>
                    {row.status === 'DEDUCTED' ? (
                      <Badge size="xs" color="teal" variant="light" leftSection={<IconCheck size={10} />}>
                        Deducted
                      </Badge>
                    ) : row.status === 'SETTLED_EARLY' ? (
                      <Badge size="xs" color="blue" variant="light">
                        Foreclosed
                      </Badge>
                    ) : (
                      <Badge size="xs" color="gray" variant="outline" leftSection={<IconClock size={10} />}>
                        Scheduled
                      </Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Modal Actions */}
        <Group justify="space-between" mt="md">
          {loan.status === 'ACTIVE' && onSettleLoan ? (
            <Button
              color="teal"
              variant="light"
              size="xs"
              onClick={() => {
                onSettleLoan(loan.id);
                onClose();
              }}
              leftSection={<IconCash size={14} />}
            >
              Mark Full Foreclosure / Early Settlement
            </Button>
          ) : (
            <div />
          )}

          <Button variant="default" size="xs" onClick={onClose}>
            Close Ledger
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
