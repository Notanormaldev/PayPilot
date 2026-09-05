import React, { useState } from 'react';
import {
  Paper,
  Table,
  Badge,
  Text,
  Group,
  Button,
  Stack,
  ActionIcon,
  Modal,
  Divider,
  Alert,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconDownload,
  IconEye,
  IconReceipt2,
  IconCheck,
  IconAlertTriangle,
  IconShieldExclamation,
  IconBuildingBank,
} from '@tabler/icons-react';
import { payrollService } from '../services/payrollService';
import { UserAvatar } from '../../../components/ui';

export const PayrunView = ({ payruns, onRefresh }) => {
  const [computingId, setComputingId] = useState(null);
  const [validatingId, setValidatingId] = useState(null);
  const [selectedPayslips, setSelectedPayslips] = useState(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningData, setWarningData] = useState(null);

  const handleCompute = async (payrunId) => {
    setComputingId(payrunId);
    try {
      await payrollService.computePayrun(payrunId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Computation error:', err);
    } finally {
      setComputingId(null);
    }
  };

  const handleValidate = async (payrunId, options = {}) => {
    setValidatingId(payrunId);
    try {
      const res = await payrollService.validatePayrun(payrunId, options);
      if (res.warning || res.code === 'MISSING_BANK_CREDENTIALS') {
        setWarningData({ payrunId, ...res });
        setWarningModalOpen(true);
      } else {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      if (err.data && (err.data.warning || err.data.code === 'MISSING_BANK_CREDENTIALS')) {
        setWarningData({ payrunId, ...err.data });
        setWarningModalOpen(true);
      } else {
        console.error('Validation error:', err);
      }
    } finally {
      setValidatingId(null);
    }
  };

  const handleConfirmPartialValidation = async () => {
    if (!warningData?.payrunId) return;
    const pid = warningData.payrunId;
    setWarningModalOpen(false);
    await handleValidate(pid, { processVerifiedOnly: true });
    if (onRefresh) onRefresh();
  };

  const handleViewPayslips = async (payrunId) => {
    try {
      const res = await payrollService.fetchPayslips(payrunId);
      setSelectedPayslips(res.data || []);
      setPayslipModalOpen(true);
    } catch (err) {
      console.error('Fetch payslips error:', err);
    }
  };

  return (
    <Stack gap="md">
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={700} size="sm" c="#09090B">
              PAYROLL BATCHES & DISBURSEMENTS
            </Text>
            <Text size="xs" c="#71717A">
              Manage scheduled cycles, statutory computations, and direct bank transfers
            </Text>
          </div>
        </Group>

        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>PAYRUN</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>CYCLE</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>STATUS</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>GROSS PAY</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>NET DISBURSED</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>SLIPS</Table.Th>
              <Table.Th style={{ textAlign: 'right', color: '#71717A', fontSize: '11px' }}>ACTIONS</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payruns && payruns.length > 0 ? (
              payruns.map((pr) => (
                <Table.Tr key={pr.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <Table.Td>
                    <Text size="xs" fw={700} c="#09090B">
                      {pr.name}
                    </Text>
                    <Text size="10px" c="#71717A">
                      {new Date(pr.periodStart).toLocaleDateString()} – {new Date(pr.periodEnd).toLocaleDateString()}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#09090B">
                      {pr.cycle}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Badge
                      size="xs"
                      color={
                        pr.status === 'PAID'
                          ? 'teal'
                          : pr.status === 'PARTIALLY_VALIDATED'
                          ? 'orange'
                          : pr.status === 'COMPUTED'
                          ? 'blue'
                          : 'gray'
                      }
                      variant="light"
                    >
                      {pr.status?.replace('_', ' ')}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" fw={600} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ₹{pr.totalGross ? Number(pr.totalGross).toLocaleString('en-IN') : '0.00'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" fw={700} c="#0D9488" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ₹{pr.totalNet ? Number(pr.totalNet).toLocaleString('en-IN') : '0.00'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Badge size="xs" variant="outline" color="dark">
                      {pr.payslips?.length || 0} Slips
                    </Badge>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconPlayerPlay size={12} />}
                        loading={computingId === pr.id}
                        onClick={() => handleCompute(pr.id)}
                      >
                        Recompute
                      </Button>

                      <Button
                        size="xs"
                        variant="light"
                        color="dark"
                        leftSection={<IconEye size={12} />}
                        onClick={() => handleViewPayslips(pr.id)}
                      >
                        Payslips
                      </Button>

                      {(pr.status === 'COMPUTED' || pr.status === 'PARTIALLY_VALIDATED') && (
                        <Button
                          size="xs"
                          color="teal"
                          leftSection={<IconCheck size={12} />}
                          loading={validatingId === pr.id}
                          onClick={() => handleValidate(pr.id)}
                        >
                          {pr.status === 'PARTIALLY_VALIDATED' ? 'Validate Remaining' : 'Validate'}
                        </Button>
                      )}

                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="dark"
                        component="a"
                        href={payrollService.exportPdf(pr.id)}
                        target="_blank"
                        title="Download PDF"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#71717A', padding: '24px' }}>
                  No payruns available. Click Recompute to generate a live payrun batch.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Payslip Modal - Detailed Earnings & Deductions Breakdown */}
      <Modal
        opened={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        title={
          <Group gap="xs">
            <IconReceipt2 size={18} color="#09090B" />
            <Text fw={700} size="sm" c="#09090B">
              Detailed Employee Payslip Breakdown
            </Text>
          </Group>
        }
        size="lg"
        styles={{
          content: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
          header: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <Stack gap="md">
          {selectedPayslips && selectedPayslips.length > 0 ? (
            selectedPayslips.map((slip) => {
              const nameDisplay = slip.employee?.name || `${slip.employee?.firstName || ''} ${slip.employee?.lastName || ''}`.trim() || 'Employee';
              const empIdDisplay = slip.employee?.employeeNumber || `EMP-${(slip.employeeId || '').slice(-4).toUpperCase()}`;

              return (
                <Paper
                  key={slip.id}
                  p="sm"
                  radius="sm"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Group justify="space-between" mb="xs" align="center">
                    <Group gap="xs" wrap="nowrap">
                      <UserAvatar
                        size={34}
                        radius="xl"
                        name={nameDisplay}
                        id={empIdDisplay}
                      />
                      <div>
                        <Group gap="xs">
                          <Text size="xs" fw={700} c="#09090B">
                            {nameDisplay} ({empIdDisplay})
                          </Text>
                          <Badge
                            size="xs"
                            color={slip.status === 'PAID' ? 'teal' : slip.status === 'BLOCKED_MISSING_BANK' ? 'red' : 'blue'}
                            variant="light"
                          >
                            {slip.status?.replace('_', ' ')}
                          </Badge>
                        </Group>
                        <Text size="10px" c="#71717A">
                          {slip.employee?.department} • {slip.employee?.jobTitle}
                        </Text>
                      </div>
                    </Group>

                    <div style={{ textAlign: 'right' }}>
                      <Text size="11px" fw={700} c="#0D9488" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        Net: ₹{Number(slip.netPay || 0).toLocaleString('en-IN')}
                      </Text>
                      <Text size="9px" c="#71717A">
                        Gross: ₹{Number(slip.grossPay || 0).toLocaleString('en-IN')} | Ded: ₹{Number(slip.totalDeductions || 0).toLocaleString('en-IN')}
                      </Text>
                    </div>
                  </Group>

                  {/* Bank Details Status Banner */}
                  <Paper
                    p="xs"
                    mb="xs"
                    radius="xs"
                    style={{
                      backgroundColor: slip.hasBank ? '#F0FDF4' : '#FEF2F2',
                      border: `1px solid ${slip.hasBank ? '#BBF7D0' : '#FECACA'}`,
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap={6}>
                        {slip.hasBank ? (
                          <IconBuildingBank size={14} color="#16A34A" />
                        ) : (
                          <IconAlertTriangle size={14} color="#DC2626" />
                        )}
                        <Text size="11px" fw={600} c={slip.hasBank ? '#166534' : '#991B1B'}>
                          {slip.hasBank
                            ? `Verified Bank: ${slip.employee?.bankAccount}`
                            : 'Missing Banking Credentials (Blocked in Direct Deposit)'}
                        </Text>
                      </Group>
                      <Badge size="xs" color={slip.hasBank ? 'teal' : 'red'} variant="filled">
                        {slip.hasBank ? 'Direct Deposit Verified' : 'Missing Bank Info'}
                      </Badge>
                    </Group>
                  </Paper>

                  <Divider my={6} color="#E2E8F0" />

                  <Group gap="xs" wrap="wrap">
                    {slip.lines?.map((line, idx) => (
                      <Badge
                        key={idx}
                        size="xs"
                        variant="outline"
                        color={line.category === 'DEDUCTION' || line.amount < 0 ? 'red' : 'teal'}
                      >
                        {line.code}: ₹{Number(Math.abs(line.amount || line.total || 0)).toLocaleString('en-IN')}
                      </Badge>
                    ))}
                  </Group>
                </Paper>
              );
            })
          ) : (
            <Text size="xs" c="#71717A" style={{ textAlign: 'center', padding: '24px' }}>
              No payslip details available for this payrun.
            </Text>
          )}
        </Stack>
      </Modal>

      {/* Partial Validation Warning Modal */}
      <Modal
        opened={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        title={
          <Group gap="xs">
            <IconShieldExclamation size={20} color="#DC2626" />
            <Text fw={700} size="sm" c="#991B1B">
              Bank Verification Warning: Unregistered Employee Accounts
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: { backgroundColor: '#FFFFFF', borderColor: '#FECACA' },
          header: { backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' },
        }}
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={18} />} title="Direct Deposit Disbursal Warning">
            <Text size="xs" c="#991B1B" fw={600}>
              {warningData?.message || 'Some employees in this batch do not have registered banking credentials.'}
            </Text>
          </Alert>

          <Paper p="sm" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B" mb={4}>
              Employees Lacking Bank Details ({warningData?.unverifiedCount || 0}):
            </Text>
            <Stack gap={4}>
              {warningData?.missingEmployees?.map((emp, idx) => (
                <Group key={idx} justify="space-between">
                  <Text size="xs" c="#3F3F46" fw={600}>
                    • {emp.name} ({emp.department})
                  </Text>
                  <Badge size="xs" color="red" variant="filled">
                    Missing Bank Details
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Text size="xs" c="#71717A">
            Would you like to process and validate payroll for the <b>{warningData?.verifiedCount || 0} employee(s)</b> whose bank details are ready? Unverified employee payslips will remain pending until resolved in Sentinel.
          </Text>

          <Group justify="flex-end" gap="xs" mt="xs">
            <Button size="xs" variant="default" onClick={() => setWarningModalOpen(false)}>
              Cancel & Resolve in Sentinel
            </Button>
            <Button size="xs" color="teal" onClick={handleConfirmPartialValidation} leftSection={<IconCheck size={14} />}>
              Process Verified Payslips ({warningData?.verifiedCount || 0})
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default PayrunView;
