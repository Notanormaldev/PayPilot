import React, { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  SimpleGrid,
  Button,
  Tabs,
  TextInput,
  Table,
  Progress,
  ActionIcon,
  Tooltip,
  Alert,
  Menu,
  ThemeIcon,
  Box,
} from '@mantine/core';
import {
  IconPigMoney,
  IconPlus,
  IconSearch,
  IconCheck,
  IconX,
  IconCalendarTime,
  IconReceiptTax,
  IconClock,
  IconDotsVertical,
  IconCurrencyRupee,
  IconBuildingBank,
  IconCash,
  IconInfoCircle,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { useLoans } from '../hooks/useLoans';
import { useAuthUser } from '../../auth/hooks/useAuthUser';
import { UserAvatar } from '../../../components/ui';
import { NewLoanModal } from './NewLoanModal';
import { LoanScheduleModal } from './LoanScheduleModal';

export const LoansView = () => {
  const { currentRole } = useAuthUser();
  const isManager = ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'].includes(currentRole);

  const { loans, stats, loading, fetchLoans, createLoan, updateLoanStatus } = useLoans();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newLoanModalOpen, setNewLoanModalOpen] = useState(false);
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState(null);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
    }, 4000);
  };

  const handleTabChange = (val) => {
    setActiveTab(val);
    fetchLoans({ status: val, search: searchQuery });
  };

  const handleSearch = (e) => {
    const val = e.currentTarget.value;
    setSearchQuery(val);
    fetchLoans({ status: activeTab, search: val });
  };

  const handleCreateLoan = async (loanData) => {
    const res = await createLoan(loanData);
    showFeedback('success', res.message || 'Loan record added successfully.');
  };

  const handleApprove = async (loanId) => {
    await updateLoanStatus(loanId, 'ACTIVE');
    showFeedback('success', `Loan ${loanId} sanctioned and added to monthly payrun EMI schedule.`);
  };

  const handleReject = async (loanId) => {
    await updateLoanStatus(loanId, 'REJECTED');
    showFeedback('error', `Loan request ${loanId} has been rejected.`);
  };

  const handleSettle = async (loanId) => {
    await updateLoanStatus(loanId, 'SETTLED');
    showFeedback('success', `Loan ${loanId} marked as fully foreclosed and settled.`);
  };

  return (
    <Stack gap="lg">
      {/* Top Banner */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb={2}>
              <Title order={3} style={{ color: '#09090B' }}>
                Employee Loans & Salary Advances
              </Title>
              <Badge size="sm" color="blue" variant="light">
                Auto-Deduction Engine
              </Badge>
            </Group>
            <Text size="xs" c="#64748B">
              Manage employee advance schemes, calculate monthly EMI recovery schedules, and integrate automatic payslip deductions.
            </Text>
          </div>

          <Group gap="sm">
            <Button
              color="dark"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => setNewLoanModalOpen(true)}
            >
              {isManager ? 'Grant / Sanction Loan' : 'Apply for Advance'}
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Live Feedback Alert */}
      {feedback.type && (
        <Alert
          icon={feedback.type === 'success' ? <IconCheck size={16} /> : <IconInfoCircle size={16} />}
          color={feedback.type === 'success' ? 'teal' : 'red'}
          title={feedback.type === 'success' ? 'Completed' : 'Action Notification'}
        >
          {feedback.message}
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="11px" c="#64748B" fw={600} tt="uppercase">
                Total Sanctioned Loans
              </Text>
              <Title order={3} style={{ color: '#09090B', marginTop: '4px' }}>
                ₹{(stats?.totalDisbursed || 375000).toLocaleString('en-IN')}
              </Title>
              <Text size="11px" c="#0D9488" mt={2} fw={500}>
                {stats?.totalLoans || 6} Total approved requests
              </Text>
            </div>
            <ThemeIcon size={38} radius="md" color="blue" variant="light">
              <IconBuildingBank size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="11px" c="#64748B" fw={600} tt="uppercase">
                Monthly EMI Recovery
              </Text>
              <Title order={3} style={{ color: '#2563EB', marginTop: '4px' }}>
                ₹{(stats?.monthlyEmiRecovery || 42500).toLocaleString('en-IN')}
              </Title>
              <Text size="11px" c="#64748B" mt={2}>
                Auto-deducted in upcoming payrun
              </Text>
            </div>
            <ThemeIcon size={38} radius="md" color="indigo" variant="light">
              <IconReceiptTax size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="11px" c="#64748B" fw={600} tt="uppercase">
                Outstanding Principal
              </Text>
              <Title order={3} style={{ color: '#D97706', marginTop: '4px' }}>
                ₹{(stats?.outstandingBalance || 250000).toLocaleString('en-IN')}
              </Title>
              <Text size="11px" c="#64748B" mt={2}>
                ₹{(stats?.totalRecovered || 125000).toLocaleString('en-IN')} Recovered to date
              </Text>
            </div>
            <ThemeIcon size={38} radius="md" color="yellow" variant="light">
              <IconPigMoney size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="11px" c="#64748B" fw={600} tt="uppercase">
                Active Schemes
              </Text>
              <Title order={3} style={{ color: '#09090B', marginTop: '4px' }}>
                {stats?.activeCount || 3} Running
              </Title>
              <Text size="11px" c={stats?.pendingCount > 0 ? '#DC2626' : '#64748B'} mt={2} fw={500}>
                {stats?.pendingCount || 0} Pending approval
              </Text>
            </div>
            <ThemeIcon size={38} radius="md" color="teal" variant="light">
              <IconCalendarTime size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Main Table Card with Filter Tabs & Search */}
      <Paper radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box p="md" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Tabs value={activeTab} onChange={handleTabChange} variant="pills" radius="sm">
              <Tabs.List>
                <Tabs.Tab value="ALL" style={{ fontSize: '12px', fontWeight: 600 }}>
                  All ({stats?.totalLoans || loans.length})
                </Tabs.Tab>
                <Tabs.Tab value="ACTIVE" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Active Repaying ({stats?.activeCount || 0})
                </Tabs.Tab>
                <Tabs.Tab value="PENDING_APPROVAL" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Pending Approval ({stats?.pendingCount || 0})
                </Tabs.Tab>
                <Tabs.Tab value="SETTLED" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Settled / Closed ({stats?.settledCount || 0})
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <TextInput
              placeholder="Search by Employee, ID, or Loan Type..."
              size="xs"
              value={searchQuery}
              onChange={handleSearch}
              leftSection={<IconSearch size={14} color="#71717A" />}
              style={{ width: '280px' }}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />
          </Group>
        </Box>

        {/* Loans Table */}
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="sm" fz="xs">
            <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
              <Table.Tr>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>EMPLOYEE</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>SCHEME / ID</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>PRINCIPAL</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>MONTHLY EMI</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px', minWidth: '160px' }}>
                  REPAYMENT PROGRESS
                </Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>BALANCE</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px' }}>STATUS</Table.Th>
                <Table.Th style={{ color: '#475569', fontSize: '11px', textAlign: 'right' }}>ACTIONS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loans.map((loan) => {
                const progressPercent = Math.min(
                  100,
                  Math.round(((loan.totalPaidAmount || 0) / (loan.principalAmount || 1)) * 100)
                );

                return (
                  <Table.Tr key={loan.id}>
                    {/* Employee info */}
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <UserAvatar size={34} name={loan.employeeName} id={loan.employeeEmail} />
                        <div>
                          <Text size="xs" fw={700} c="#09090B">
                            {loan.employeeName}
                          </Text>
                          <Text size="11px" c="#64748B">
                            {loan.jobPosition} • {loan.department}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>

                    {/* Scheme & ID */}
                    <Table.Td>
                      <Text size="xs" fw={600} c="#09090B">
                        {loan.loanTypeName}
                      </Text>
                      <Text size="10px" c="#94A3B8" style={{ fontFamily: 'monospace' }}>
                        {loan.id} • Start: {loan.deductionStartMonth}
                      </Text>
                    </Table.Td>

                    {/* Principal */}
                    <Table.Td>
                      <Text size="xs" fw={700} c="#09090B">
                        ₹{loan.principalAmount?.toLocaleString('en-IN')}
                      </Text>
                      <Text size="10px" c="#64748B">
                        {loan.tenureMonths} Months
                      </Text>
                    </Table.Td>

                    {/* Monthly EMI */}
                    <Table.Td>
                      <Text size="xs" fw={700} c="#2563EB">
                        ₹{loan.monthlyEmi?.toLocaleString('en-IN')}
                      </Text>
                      <Text size="10px" c="#94A3B8">
                        / month
                      </Text>
                    </Table.Td>

                    {/* Progress */}
                    <Table.Td>
                      <Group justify="space-between" mb={2}>
                        <Text size="10px" c="#64748B" fw={600}>
                          {loan.paidInstallments} / {loan.tenureMonths} EMIs
                        </Text>
                        <Text size="10px" c="#09090B" fw={700}>
                          {progressPercent}%
                        </Text>
                      </Group>
                      <Progress
                        value={progressPercent}
                        color={progressPercent === 100 ? 'teal' : 'blue'}
                        size="xs"
                        radius="xl"
                      />
                    </Table.Td>

                    {/* Balance */}
                    <Table.Td>
                      <Text
                        size="xs"
                        fw={700}
                        c={loan.remainingBalance === 0 ? '#0D9488' : '#DC2626'}
                      >
                        ₹{loan.remainingBalance?.toLocaleString('en-IN')}
                      </Text>
                    </Table.Td>

                    {/* Status Badge */}
                    <Table.Td>
                      <Badge
                        size="xs"
                        variant="filled"
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
                    </Table.Td>

                    {/* Actions */}
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Button
                          variant="light"
                          color="blue"
                          size="xs"
                          onClick={() => setSelectedLoanForSchedule(loan)}
                        >
                          Ledger
                        </Button>

                        {isManager && loan.status === 'PENDING_APPROVAL' && (
                          <>
                            <Tooltip label="Approve Loan Scheme" withArrow>
                              <ActionIcon
                                size="sm"
                                color="teal"
                                variant="filled"
                                onClick={() => handleApprove(loan.id)}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Reject Request" withArrow>
                              <ActionIcon
                                size="sm"
                                color="red"
                                variant="light"
                                onClick={() => handleReject(loan.id)}
                              >
                                <IconX size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </>
                        )}

                        {isManager && loan.status === 'ACTIVE' && (
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon size="sm" variant="subtle" color="gray">
                                <IconDotsVertical size={14} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconCash size={14} color="#0D9488" />}
                                onClick={() => handleSettle(loan.id)}
                              >
                                Mark Foreclosed & Settled
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}

              {loans.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    <Text size="xs" c="#94A3B8">
                      No loan or advance records found matching the criteria.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Modals */}
      <NewLoanModal
        opened={newLoanModalOpen}
        onClose={() => setNewLoanModalOpen(false)}
        onSubmit={handleCreateLoan}
        currentRole={currentRole}
      />

      <LoanScheduleModal
        loan={selectedLoanForSchedule}
        opened={Boolean(selectedLoanForSchedule)}
        onClose={() => setSelectedLoanForSchedule(null)}
        onSettleLoan={handleSettle}
      />
    </Stack>
  );
};

export default LoansView;
