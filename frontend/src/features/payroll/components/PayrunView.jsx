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
  Box,
  SimpleGrid,
  Tooltip,
  Progress,
  ThemeIcon,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconDownload,
  IconEye,
  IconReceipt2,
  IconAlertTriangle,
  IconBuildingBank,
  IconPlus,
  IconShieldCheck,
  IconCreditCard,
  IconMailForward,
  IconCheck,
  IconInfoCircle,
  IconSparkles,
  IconArrowRight,
  IconClock,
  IconChecks,
  IconSend,
  IconCalculator,
} from '@tabler/icons-react';
import { payrollService } from '../services/payrollService';
import { UserAvatar } from '../../../components/ui';
import { generatePayslipPdf } from '../../../lib/payslipPdfGenerator';
import { PayrunCreationWizard } from './PayrunCreationWizard';
import { useAuthUser } from '../../auth/hooks/useAuthUser';

export const PayrunView = ({ payruns, onRefresh }) => {
  const { currentRole } = useAuthUser();
  const canMarkPaid = currentRole === 'ADMIN' || currentRole === 'HR_PAYROLL_MANAGER';

  const [wizardOpen, setWizardOpen] = useState(false);
  const [activePayrunId, setActivePayrunId] = useState(null);

  // Action Loading States
  const [computingId, setComputingId] = useState(null);
  const [validatingId, setValidatingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  // Payslip Modal State
  const [loadingPayslipsId, setLoadingPayslipsId] = useState(null);
  const [downloadingSlipId, setDownloadingSlipId] = useState(null);
  const [selectedPayslips, setSelectedPayslips] = useState(null);
  const [selectedPayrun, setSelectedPayrun] = useState(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  // Email Dispatch Result Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailResults, setEmailResults] = useState(null);

  // Notification feedback
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
    }, 5500);
  };

  // Determine current active payrun (selected or top of list)
  const currentPayrun =
    (activePayrunId && payruns?.find((p) => p.id === activePayrunId)) ||
    (payruns && payruns.length > 0 ? payruns[0] : null);

  // 1. COMPUTE STEP
  const handleCompute = async (payrunId, e) => {
    if (e) e.stopPropagation();
    setComputingId(payrunId);
    setActivePayrunId(payrunId);
    try {
      const res = await payrollService.computePayrun(payrunId);
      showNotification('success', res.message || 'Payrun computed successfully with latest salary rules.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Computation error:', err);
      showNotification('error', err.message || 'Failed to compute payrun.');
    } finally {
      setComputingId(null);
    }
  };

  // 2. VALIDATE STEP
  const handleValidate = async (payrunId, e) => {
    if (e) e.stopPropagation();
    setValidatingId(payrunId);
    setActivePayrunId(payrunId);
    try {
      const res = await payrollService.validatePayrun(payrunId, { processVerifiedOnly: true });
      showNotification(
        'success',
        res.message || 'Payrun and employee bank accounts validated with Sentinel Compliance.'
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Validation error:', err);
      showNotification('error', err.message || 'Failed to validate payrun.');
    } finally {
      setValidatingId(null);
    }
  };

  // 3. MARK AS PAID STEP
  const handleMarkPaid = async (payrunId, e) => {
    if (e) e.stopPropagation();
    if (!canMarkPaid) {
      showNotification('error', 'Payment disbursement authorization is restricted to HR Payroll Manager & Admin roles.');
      return;
    }
    setPayingId(payrunId);
    setActivePayrunId(payrunId);
    try {
      const res = await payrollService.markPaid(payrunId);
      showNotification(
        'success',
        `Disbursement complete! Payrun marked as Paid. Transaction Ref: ${res.transactionRef || 'PP-DISB-2026'}`
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Mark paid error:', err);
      showNotification('error', err.message || 'Failed to record payrun payment.');
    } finally {
      setPayingId(null);
    }
  };

  // 4. SEND PAYSLIPS (BULK EMAIL) STEP
  const handleSendPayslips = async (payrunId, e) => {
    if (e) e.stopPropagation();
    setSendingId(payrunId);
    setActivePayrunId(payrunId);
    try {
      const res = await payrollService.sendPayslips(payrunId);
      setEmailResults(res);
      setEmailModalOpen(true);
      showNotification(
        'success',
        `Bulk delivery complete! ${res.sentCount || 0} digital payslips dispatched via email.`
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Send payslips error:', err);
      showNotification('error', err.message || 'Failed to send bulk payslips.');
    } finally {
      setSendingId(null);
    }
  };

  // Payslips view modal
  const handleViewPayslips = async (payrun, e) => {
    if (e) e.stopPropagation();
    const payrunId = typeof payrun === 'object' ? payrun.id : payrun;
    setLoadingPayslipsId(payrunId);
    setSelectedPayrun(typeof payrun === 'object' ? payrun : payruns?.find((p) => p.id === payrunId));
    try {
      const res = await payrollService.fetchPayslips(payrunId);
      setSelectedPayslips(res.data || []);
      setPayslipModalOpen(true);
    } catch (err) {
      console.error('Fetch payslips error:', err);
      showNotification('error', 'Failed to load employee payslips.');
    } finally {
      setLoadingPayslipsId(null);
    }
  };

  const handleDownloadSlipPdf = async (slip) => {
    setDownloadingSlipId(slip.id);
    try {
      const empDetails = {
        name:
          slip.employee?.name ||
          `${slip.employee?.firstName || ''} ${slip.employee?.lastName || ''}`.trim() ||
          'Employee',
        id: slip.employee?.employeeNumber || `EMP-${(slip.employeeId || '').slice(-4).toUpperCase()}`,
        designation: slip.employee?.jobTitle || slip.employee?.jobPosition || 'Specialist',
        department: slip.employee?.department || 'General',
        bankAccount: slip.employee?.bankAccount || 'VERIFIED ON FILE',
        bankName: slip.employee?.bankName || 'Direct Deposit Account',
        pan: slip.employee?.pan || 'ABCPK9482F',
      };

      const slipData = {
        id: slip.id,
        month: selectedPayrun?.name || 'September 2026',
        date: selectedPayrun?.periodEnd
          ? new Date(selectedPayrun.periodEnd).toLocaleDateString('en-IN')
          : 'End of Month',
        gross: slip.grossPay,
        deductions: slip.totalDeductions,
        net: slip.netPay,
        lines: slip.lines || [],
      };

      await generatePayslipPdf(slipData, empDetails);
    } catch (err) {
      console.error('Download individual PDF error:', err);
    } finally {
      setDownloadingSlipId(null);
    }
  };

  // Calculate lifecycle step index (0: Draft, 1: Computed, 2: Validated, 3: Paid, 4: Payslips Dispatched)
  const getLifecycleStep = (status) => {
    switch (status) {
      case 'DRAFT':
        return 0;
      case 'COMPUTED':
        return 1;
      case 'VALIDATED':
      case 'PARTIALLY_VALIDATED':
        return 2;
      case 'PAID':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <Stack gap="lg">
      {/* Top Banner & Wizard Launch */}
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
          <Group gap="md">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <IconCalculator size={24} />
            </Box>
            <div>
              <Group gap="xs" align="center">
                <Text fw={700} size="lg" c="#09090B">
                  Payroll Processing & Lifecycle Engine
                </Text>
                <Badge size="sm" color="blue" variant="light">
                  Admin & HR Hub
                </Badge>
              </Group>
              <Text size="xs" c="#64748B" mt={2}>
                4-Stage Sequential Lifecycle: Compute Formulas → Validate Compliance → Mark as Paid → Bulk Email Payslips
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              size="sm"
              color="dark"
              leftSection={<IconPlus size={16} />}
              onClick={() => setWizardOpen(true)}
              styles={{
                root: {
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              New Payrun (2-Step Wizard)
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Feedback Alert */}
      {feedback.type && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color={feedback.type === 'success' ? 'teal' : 'red'}
          radius="md"
          variant="light"
          withCloseButton
          onClose={() => setFeedback({ type: null, message: '' })}
        >
          {feedback.message}
        </Alert>
      )}

      {/* ACTIVE PAYRUN 4-STEP LIFECYCLE CONTROLLER */}
      {currentPayrun && (
        <Paper
          p="lg"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #2563EB',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
            <div>
              <Group gap="xs">
                <Badge size="xs" color="indigo" variant="filled">
                  Active Lifecycle Focus
                </Badge>
                <Text fw={700} size="md" c="#09090B">
                  {currentPayrun.name}
                </Text>
                <Badge
                  size="sm"
                  color={
                    currentPayrun.status === 'PAID'
                      ? 'teal'
                      : currentPayrun.status === 'VALIDATED'
                        ? 'blue'
                        : currentPayrun.status === 'COMPUTED'
                          ? 'indigo'
                          : 'gray'
                  }
                  variant="light"
                >
                  Status: {currentPayrun.status?.replace('_', ' ')}
                </Badge>
              </Group>
              <Text size="xs" c="#64748B" mt={3}>
                Period: {new Date(currentPayrun.periodStart).toLocaleDateString('en-IN')} –{' '}
                {new Date(currentPayrun.periodEnd).toLocaleDateString('en-IN')} • Structure:{' '}
                {currentPayrun.salaryStructure?.name || 'Standard Scale'} •{' '}
                {currentPayrun.payslips?.length || 0} Eligible Employees
              </Text>
            </div>

            <Group gap="lg">
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="#64748B">
                  Total Gross
                </Text>
                <Text size="sm" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ₹{Number(currentPayrun.totalGross || 0).toLocaleString('en-IN')}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="#64748B">
                  Net Disbursed
                </Text>
                <Text size="sm" fw={700} c="#0D9488" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ₹{Number(currentPayrun.totalNet || 0).toLocaleString('en-IN')}
                </Text>
              </div>
            </Group>
          </Group>

          {/* 4 DISTINCT LIFECYCLE ACTION BUTTONS & STATUS PIPELINE */}
          <Divider my="sm" color="#E2E8F0" />
          <Text size="xs" fw={700} c="#64748B" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Distinct 4-Stage Lifecycle Controls
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {/* STEP 1: COMPUTE */}
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: currentPayrun.status === 'DRAFT' ? '#F0FDF4' : '#F8FAFC',
                border:
                  currentPayrun.status === 'DRAFT'
                    ? '1.5px solid #22C55E'
                    : getLifecycleStep(currentPayrun.status) >= 1
                      ? '1px solid #CBD5E1'
                      : '1px solid #E2E8F0',
              }}
            >
              <Group justify="space-between" mb={6}>
                <Group gap={6}>
                  <ThemeIcon
                    size="sm"
                    radius="xl"
                    color={getLifecycleStep(currentPayrun.status) >= 1 ? 'teal' : 'blue'}
                  >
                    {getLifecycleStep(currentPayrun.status) >= 1 ? (
                      <IconCheck size={12} />
                    ) : (
                      <IconPlayerPlay size={12} />
                    )}
                  </ThemeIcon>
                  <Text size="xs" fw={700} c="#09090B">
                    1. Compute
                  </Text>
                </Group>
                {getLifecycleStep(currentPayrun.status) >= 1 && (
                  <Badge size="xs" color="teal" variant="light">
                    Done
                  </Badge>
                )}
              </Group>
              <Text size="11px" c="#64748B" mb="sm" lineClamp={2}>
                Run Basic, HRA, PF, TDS and custom formulas for chosen cohort.
              </Text>
              <Button
                size="xs"
                fullWidth
                variant={getLifecycleStep(currentPayrun.status) === 0 ? 'filled' : 'outline'}
                color="blue"
                leftSection={<IconPlayerPlay size={13} />}
                loading={computingId === currentPayrun.id}
                onClick={(e) => handleCompute(currentPayrun.id, e)}
              >
                {getLifecycleStep(currentPayrun.status) >= 1 ? 'Recompute All' : 'Compute Formulas'}
              </Button>
            </Paper>

            {/* STEP 2: VALIDATE */}
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: currentPayrun.status === 'COMPUTED' ? '#EFF6FF' : '#F8FAFC',
                border:
                  currentPayrun.status === 'COMPUTED'
                    ? '1.5px solid #3B82F6'
                    : getLifecycleStep(currentPayrun.status) >= 2
                      ? '1px solid #CBD5E1'
                      : '1px solid #E2E8F0',
              }}
            >
              <Group justify="space-between" mb={6}>
                <Group gap={6}>
                  <ThemeIcon
                    size="sm"
                    radius="xl"
                    color={getLifecycleStep(currentPayrun.status) >= 2 ? 'teal' : 'indigo'}
                  >
                    {getLifecycleStep(currentPayrun.status) >= 2 ? (
                      <IconCheck size={12} />
                    ) : (
                      <IconShieldCheck size={12} />
                    )}
                  </ThemeIcon>
                  <Text size="xs" fw={700} c="#09090B">
                    2. Validate
                  </Text>
                </Group>
                {getLifecycleStep(currentPayrun.status) >= 2 && (
                  <Badge size="xs" color="teal" variant="light">
                    Validated
                  </Badge>
                )}
              </Group>
              <Text size="11px" c="#64748B" mb="sm" lineClamp={2}>
                Run Sentinel anomaly audit, check bank info & statutory compliance.
              </Text>
              <Button
                size="xs"
                fullWidth
                variant={currentPayrun.status === 'COMPUTED' ? 'filled' : 'outline'}
                color="indigo"
                leftSection={<IconShieldCheck size={13} />}
                loading={validatingId === currentPayrun.id}
                disabled={getLifecycleStep(currentPayrun.status) < 1}
                onClick={(e) => handleValidate(currentPayrun.id, e)}
              >
                Validate & Audit
              </Button>
            </Paper>

            {/* STEP 3: MARK AS PAID */}
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor:
                  currentPayrun.status === 'VALIDATED' || currentPayrun.status === 'PARTIALLY_VALIDATED'
                    ? '#F0FDF4'
                    : '#F8FAFC',
                border:
                  currentPayrun.status === 'VALIDATED' || currentPayrun.status === 'PARTIALLY_VALIDATED'
                    ? '1.5px solid #16A34A'
                    : getLifecycleStep(currentPayrun.status) >= 3
                      ? '1px solid #CBD5E1'
                      : '1px solid #E2E8F0',
              }}
            >
              <Group justify="space-between" mb={6}>
                <Group gap={6}>
                  <ThemeIcon
                    size="sm"
                    radius="xl"
                    color={getLifecycleStep(currentPayrun.status) >= 3 ? 'teal' : 'teal'}
                  >
                    {getLifecycleStep(currentPayrun.status) >= 3 ? (
                      <IconCheck size={12} />
                    ) : (
                      <IconCreditCard size={12} />
                    )}
                  </ThemeIcon>
                  <Text size="xs" fw={700} c="#09090B">
                    3. Mark as Paid
                  </Text>
                </Group>
                {getLifecycleStep(currentPayrun.status) >= 3 && (
                  <Badge size="xs" color="teal" variant="light">
                    Disbursed
                  </Badge>
                )}
              </Group>
              <Text size="11px" c="#64748B" mb="sm" lineClamp={2}>
                Confirm bank disbursal, generate payout reference and mark slips as Paid.
              </Text>
              <Tooltip
                label={
                  !canMarkPaid
                    ? 'Payment disbursement authorization is restricted to HR Payroll Manager & Admin'
                    : getLifecycleStep(currentPayrun.status) < 2
                    ? 'Requires validation step completion'
                    : 'Disburse payout & mark as paid'
                }
                disabled={canMarkPaid && getLifecycleStep(currentPayrun.status) >= 2}
              >
                <div>
                  <Button
                    size="xs"
                    fullWidth
                    variant={
                      currentPayrun.status === 'VALIDATED' || currentPayrun.status === 'PARTIALLY_VALIDATED'
                        ? 'filled'
                        : 'outline'
                    }
                    color="teal"
                    leftSection={<IconCreditCard size={13} />}
                    loading={payingId === currentPayrun.id}
                    disabled={!canMarkPaid || getLifecycleStep(currentPayrun.status) < 2}
                    onClick={(e) => handleMarkPaid(currentPayrun.id, e)}
                  >
                    {currentPayrun.status === 'PAID' ? 'Re-Disburse Payout' : 'Mark as Paid'}
                  </Button>
                </div>
              </Tooltip>
            </Paper>

            {/* STEP 4: SEND PAYSLIPS */}
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: currentPayrun.status === 'PAID' ? '#FFFBEB' : '#F8FAFC',
                border:
                  currentPayrun.status === 'PAID'
                    ? '1.5px solid #F59E0B'
                    : '1px solid #E2E8F0',
              }}
            >
              <Group justify="space-between" mb={6}>
                <Group gap={6}>
                  <ThemeIcon size="sm" radius="xl" color="orange">
                    <IconMailForward size={12} />
                  </ThemeIcon>
                  <Text size="xs" fw={700} c="#09090B">
                    4. Send Payslips
                  </Text>
                </Group>
                <Badge size="xs" color="orange" variant="light">
                  Email Dispatch
                </Badge>
              </Group>
              <Text size="11px" c="#64748B" mb="sm" lineClamp={2}>
                Dispatch digital salary slips with full breakdown via bulk email.
              </Text>
              <Button
                size="xs"
                fullWidth
                variant={currentPayrun.status === 'PAID' ? 'filled' : 'outline'}
                color="orange"
                leftSection={<IconSend size={13} />}
                loading={sendingId === currentPayrun.id}
                disabled={getLifecycleStep(currentPayrun.status) < 1}
                onClick={(e) => handleSendPayslips(currentPayrun.id, e)}
              >
                Send Bulk Email
              </Button>
            </Paper>
          </SimpleGrid>
        </Paper>
      )}

      {/* ALL PAYRUN BATCHES TABLE */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" mb="md" align="center">
          <div>
            <Text fw={700} size="sm" c="#09090B">
              ALL PAYRUN BATCHES ({payruns?.length || 0})
            </Text>
            <Text size="xs" c="#71717A">
              Select a payrun row to manage its lifecycle state or download batch PDFs
            </Text>
          </div>
        </Group>

        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '22%' }}>PAYRUN & PERIOD</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '12%' }}>STRUCTURE</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '14%' }}>LIFECYCLE STATE</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '13%' }}>GROSS PAY</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '13%' }}>NET PAYABLE</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '8%' }}>SLIPS</Table.Th>
              <Table.Th style={{ textAlign: 'right', color: '#71717A', fontSize: '11px', width: '18%' }}>
                ACTIONS
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payruns && payruns.length > 0 ? (
              payruns.map((pr) => {
                const isSelected = currentPayrun?.id === pr.id;
                const step = getLifecycleStep(pr.status);

                return (
                  <Table.Tr
                    key={pr.id}
                    onClick={() => setActivePayrunId(pr.id)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        {isSelected && (
                          <Box
                            style={{
                              width: 3,
                              height: 28,
                              backgroundColor: '#2563EB',
                              borderRadius: 2,
                            }}
                          />
                        )}
                        <div>
                          <Text size="xs" fw={700} c="#09090B">
                            {pr.name}
                          </Text>
                          <Text size="10px" c="#71717A">
                            {new Date(pr.periodStart).toLocaleDateString()} –{' '}
                            {new Date(pr.periodEnd).toLocaleDateString()}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Badge size="xs" color="gray" variant="light">
                        {pr.salaryStructure?.name || 'Standard Scale'}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        size="xs"
                        color={
                          pr.status === 'PAID'
                            ? 'teal'
                            : pr.status === 'PARTIALLY_VALIDATED'
                              ? 'orange'
                              : pr.status === 'VALIDATED'
                                ? 'blue'
                                : pr.status === 'COMPUTED'
                                  ? 'indigo'
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
                      <Group gap={6} justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                        {/* Quick View Payslips */}
                        <Tooltip label="View detailed employee payslips">
                          <Button
                            size="xs"
                            variant="light"
                            color="dark"
                            leftSection={<IconEye size={12} />}
                            loading={loadingPayslipsId === pr.id}
                            onClick={(e) => handleViewPayslips(pr, e)}
                            styles={{ root: { height: 26, fontSize: '11px', padding: '0 8px' } }}
                          >
                            Slips
                          </Button>
                        </Tooltip>

                        {/* Quick PDF Export */}
                        <Tooltip label="Download consolidated Batch PDF">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="dark"
                            component="a"
                            href={payrollService.exportPdf(pr.id)}
                            target="_blank"
                          >
                            <IconDownload size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#71717A', padding: '32px' }}>
                  <Text size="sm" c="#64748B" mb="xs">
                    No payroll batches found.
                  </Text>
                  <Button
                    size="xs"
                    color="dark"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => setWizardOpen(true)}
                  >
                    Create Your First Payrun Batch
                  </Button>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* 2-STEP CREATION WIZARD MODAL */}
      <PayrunCreationWizard
        opened={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onPayrunCreated={(newPayrun) => {
          showNotification('success', `New payrun "${newPayrun.name}" created successfully! You can now run computations.`);
          if (newPayrun?.id) setActivePayrunId(newPayrun.id);
          if (onRefresh) onRefresh();
        }}
      />

      {/* BULK EMAIL DISPATCH CONFIRMATION MODAL */}
      <Modal
        opened={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title={
          <Group gap="xs">
            <IconSend size={18} color="#EA580C" />
            <Text fw={700} size="sm" c="#09090B">
              Bulk Payslip Email Dispatch Summary
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <Stack gap="md">
          <Paper p="md" radius="md" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <Text size="sm" fw={700} c="#92400E">
              {emailResults?.message || 'All digital payslips have been successfully dispatched.'}
            </Text>
            <Text size="xs" c="#B45309" mt={2}>
              Recipients have received an email with their salary breakdown and direct deposit details.
            </Text>
          </Paper>

          <Box style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <Table verticalSpacing="xs">
              <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
                <Table.Tr>
                  <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>RECIPIENT</Table.Th>
                  <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>NET SALARY</Table.Th>
                  <Table.Th style={{ fontSize: '11px', color: '#64748B' }}>STATUS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {emailResults?.recipients?.map((r, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Text size="xs" fw={600} c="#09090B">
                        {r.name}
                      </Text>
                      <Text size="10px" c="#64748B">
                        {r.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={700} c="#0D9488">
                        ₹{Number(r.net || 0).toLocaleString('en-IN')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color="teal" variant="light">
                        Dispatched
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>

          <Button color="dark" fullWidth onClick={() => setEmailModalOpen(false)}>
            Done
          </Button>
        </Stack>
      </Modal>

      {/* DETAILED PAYSLIPS BREAKDOWN MODAL */}
      <Modal
        opened={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        title={
          <Group justify="space-between" style={{ width: '100%', paddingRight: 20 }}>
            <Group gap="xs">
              <IconReceipt2 size={18} color="#09090B" />
              <Text fw={700} size="sm" c="#09090B">
                Detailed Employee Payslips Breakdown
              </Text>
              <Badge size="xs" variant="light" color="blue">
                {selectedPayslips?.length || 0} Slips
              </Badge>
            </Group>
            {selectedPayrun && (
              <Button
                size="xs"
                variant="default"
                leftSection={<IconDownload size={13} />}
                component="a"
                href={payrollService.exportPdf(selectedPayrun.id)}
                target="_blank"
              >
                Batch PDF Export
              </Button>
            )}
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
              const nameDisplay =
                slip.employee?.name ||
                `${slip.employee?.firstName || ''} ${slip.employee?.lastName || ''}`.trim() ||
                'Employee';
              const empIdDisplay =
                slip.employee?.employeeNumber || `EMP-${(slip.employeeId || '').slice(-4).toUpperCase()}`;

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
                      <UserAvatar size={34} radius="xl" name={nameDisplay} id={empIdDisplay} />
                      <div>
                        <Group gap="xs">
                          <Text size="xs" fw={700} c="#09090B">
                            {nameDisplay} ({empIdDisplay})
                          </Text>
                          <Badge
                            size="xs"
                            color={
                              slip.status === 'PAID'
                                ? 'teal'
                                : slip.status === 'VALIDATED'
                                  ? 'blue'
                                  : slip.status === 'BLOCKED_MISSING_BANK'
                                    ? 'red'
                                    : 'gray'
                            }
                            variant="light"
                          >
                            {slip.status?.replace('_', ' ')}
                          </Badge>
                        </Group>
                        <Text size="10px" c="#71717A">
                          {slip.employee?.department} •{' '}
                          {slip.employee?.jobTitle || slip.employee?.jobPosition || 'Specialist'}
                        </Text>
                      </div>
                    </Group>

                    <Group gap="md">
                      <div style={{ textAlign: 'right' }}>
                        <Text size="11px" fw={700} c="#0D9488" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          Net: ₹{Number(slip.netPay || 0).toLocaleString('en-IN')}
                        </Text>
                        <Text size="9px" c="#71717A">
                          Gross: ₹{Number(slip.grossPay || 0).toLocaleString('en-IN')} | Ded: ₹
                          {Number(slip.totalDeductions || 0).toLocaleString('en-IN')}
                        </Text>
                      </div>

                      <Button
                        size="xs"
                        variant="subtle"
                        color="blue"
                        leftSection={<IconDownload size={13} />}
                        loading={downloadingSlipId === slip.id}
                        onClick={() => handleDownloadSlipPdf(slip)}
                      >
                        PDF
                      </Button>
                    </Group>
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
    </Stack>
  );
};

export default PayrunView;
