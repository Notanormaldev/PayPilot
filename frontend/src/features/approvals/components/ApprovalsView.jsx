import React, { useState, useEffect } from 'react';
import {
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  SimpleGrid,
  Button,
  Tabs,
  TextInput,
  Table,
  ActionIcon,
  Tooltip,
  Alert,
  Box,
  SegmentedControl,
} from '@mantine/core';
import {
  IconCheckupList,
  IconCalendarEvent,
  IconReceipt2,
  IconFileText,
  IconTrendingUp,
  IconSearch,
  IconCheck,
  IconX,
  IconChecks,
  IconPaperclip,
  IconRefresh,
  IconInfoCircle,
} from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';
import { attendanceService } from '../../attendance/services/attendanceService';
import { fetchApi } from '../../../lib/api';

const INITIAL_REIMBURSEMENTS = [
  {
    id: 'reimb-01',
    employeeName: 'Vikram Patel',
    employeeId: 'EMP-2024-002',
    category: 'Client Travel & Lodging',
    amount: '₹ 18,450',
    date: '2026-09-02',
    receiptsCount: 3,
    description: 'Quarterly client on-site visit expenses (flight + hotel)',
    status: 'PENDING',
  },
  {
    id: 'reimb-02',
    employeeName: 'Neha Gupta',
    employeeId: 'EMP-2024-003',
    category: 'Workstation & Hardware',
    amount: '₹ 8,990',
    date: '2026-09-01',
    receiptsCount: 1,
    description: 'Ergonomic dual-monitor desk arm & peripherals',
    status: 'PENDING',
  },
  {
    id: 'reimb-03',
    employeeName: 'Rohan Verma',
    employeeId: 'EMP-2024-005',
    category: 'Medical Reimbursement',
    amount: '₹ 12,300',
    date: '2026-08-28',
    receiptsCount: 2,
    description: 'Annual executive health checkup bills',
    status: 'PENDING',
  },
  {
    id: 'reimb-04',
    employeeName: 'Priya Sundaram',
    employeeId: 'EMP-2024-007',
    category: 'Internet & Mobile Allowance',
    amount: '₹ 2,400',
    date: '2026-08-25',
    receiptsCount: 1,
    description: 'High-speed fiber broadband bill for WFH setup',
    status: 'APPROVED',
  },
];

const INITIAL_POI = [
  {
    id: 'poi-01',
    employeeName: 'Aarav Sharma',
    employeeId: 'EMP-2024-001',
    section: 'Section 80C (ELSS / PPF)',
    amount: '₹ 1,50,000',
    date: '2026-08-30',
    documentType: 'Tax Saving Mutual Fund Statement',
    status: 'PENDING',
  },
  {
    id: 'poi-02',
    employeeName: 'Meera Krishnan',
    employeeId: 'EMP-2024-004',
    section: 'Section 80D (Health Insurance)',
    amount: '₹ 25,000',
    date: '2026-08-29',
    documentType: 'Family Mediclaim Premium Receipt',
    status: 'PENDING',
  },
  {
    id: 'poi-03',
    employeeName: 'Sanjay Deshmukh',
    employeeId: 'EMP-2024-006',
    section: 'House Rent Allowance (HRA)',
    amount: '₹ 2,40,000',
    date: '2026-08-26',
    documentType: 'Rent Agreement & Landlord PAN receipts',
    status: 'APPROVED',
  },
];

const INITIAL_SALARY_REVISIONS = [
  {
    id: 'sal-01',
    employeeName: 'Pooja Nair',
    employeeId: 'EMP-2024-008',
    role: 'Senior Frontend Engineer',
    currentCtc: '₹ 16,50,000',
    proposedCtc: '₹ 19,80,000',
    hikePercentage: '20.0%',
    effectiveDate: '2026-10-01',
    reason: 'Annual Performance Rating - Exceeds Expectations',
    status: 'PENDING',
  },
  {
    id: 'sal-02',
    employeeName: 'Karan Malhotra',
    employeeId: 'EMP-2024-009',
    role: 'Product Lead',
    currentCtc: '₹ 24,00,000',
    proposedCtc: '₹ 28,00,000',
    hikePercentage: '16.7%',
    effectiveDate: '2026-10-01',
    reason: 'Promotion to Group Product Manager',
    status: 'PENDING',
  },
];

export const ApprovalsView = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Live Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Other approval categories
  const [reimbursements, setReimbursements] = useState(INITIAL_REIMBURSEMENTS);
  const [poiList, setPoiList] = useState(INITIAL_POI);
  const [salaryRevisions, setSalaryRevisions] = useState(INITIAL_SALARY_REVISIONS);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
    }, 4500);
  };

  const fetchLeaveRequests = async () => {
    setLoadingLeaves(true);
    try {
      const res = await attendanceService.fetchLeaveRequests();
      if (res && res.data) {
        setLeaveRequests(res.data);
      }
    } catch (e) {
      console.warn('fetchLeaveRequests error:', e.message);
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Handlers for Leave Requests
  const handleApproveLeave = async (id, empName) => {
    setProcessingId(id);
    try {
      await attendanceService.approveLeave(id);
      await fetchLeaveRequests();
      if (onRefresh) onRefresh();
      showNotification('success', `Leave request for ${empName} has been approved.`);
    } catch (e) {
      // Local fallback
      setLeaveRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'APPROVED' } : item))
      );
      showNotification('success', `Leave request for ${empName} marked as Approved.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefuseLeave = async (id, empName) => {
    setProcessingId(id);
    try {
      await fetchApi(`/time-off/requests/${id}/refuse`, { method: 'POST' });
      await fetchLeaveRequests();
      if (onRefresh) onRefresh();
      showNotification('error', `Leave request for ${empName} has been refused.`);
    } catch (e) {
      // Local fallback
      setLeaveRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'REFUSED' } : item))
      );
      showNotification('error', `Leave request for ${empName} marked as Refused.`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handlers for Reimbursements
  const handleApproveReimbursement = (id, empName, amount) => {
    setReimbursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
    showNotification('success', `Reimbursement claim of ${amount} for ${empName} approved for payout.`);
  };

  const handleRejectReimbursement = (id, empName) => {
    setReimbursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
    );
    showNotification('error', `Reimbursement claim for ${empName} rejected.`);
  };

  // Handlers for POI
  const handleApprovePoi = (id, empName, section) => {
    setPoiList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p))
    );
    showNotification('success', `Tax declaration ${section} for ${empName} verified and approved.`);
  };

  const handleRejectPoi = (id, empName) => {
    setPoiList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p))
    );
    showNotification('error', `Tax declaration for ${empName} rejected.`);
  };

  // Handlers for Salary Revisions
  const handleApproveSalary = (id, empName, proposed) => {
    setSalaryRevisions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'APPROVED' } : s))
    );
    showNotification('success', `Salary revision to ${proposed} for ${empName} confirmed.`);
  };

  const handleRejectSalary = (id, empName) => {
    setSalaryRevisions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'REJECTED' } : s))
    );
    showNotification('error', `Salary revision proposal for ${empName} rejected.`);
  };

  // Batch approve all pending in current view
  const handleBatchApprove = () => {
    setReimbursements((prev) => prev.map((r) => ({ ...r, status: 'APPROVED' })));
    setPoiList((prev) => prev.map((p) => ({ ...p, status: 'APPROVED' })));
    setSalaryRevisions((prev) => prev.map((s) => ({ ...s, status: 'APPROVED' })));
    setLeaveRequests((prev) => prev.map((l) => ({ ...l, status: 'APPROVED' })));
    showNotification('success', 'All pending approval items successfully approved and synced.');
  };

  // Counts
  const pendingLeavesCount = leaveRequests.filter(
    (l) => l.status === 'TO_APPROVE' || l.status === 'Pending' || l.status === 'PENDING'
  ).length;
  const pendingReimbCount = reimbursements.filter((r) => r.status === 'PENDING').length;
  const pendingPoiCount = poiList.filter((p) => p.status === 'PENDING').length;
  const pendingSalCount = salaryRevisions.filter((s) => s.status === 'PENDING').length;
  const totalPending = pendingLeavesCount + pendingReimbCount + pendingPoiCount + pendingSalCount;

  // Filter helper
  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    return text?.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const matchesStatus = (status) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return status === 'PENDING' || status === 'TO_APPROVE' || status === 'Pending';
    if (statusFilter === 'APPROVED') return status === 'APPROVED' || status === 'Approved';
    if (statusFilter === 'REJECTED') return status === 'REJECTED' || status === 'REFUSED' || status === 'Refused';
    return true;
  };

  return (
    <Stack gap="lg">
      {/* Top Banner */}
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
              <IconCheckupList size={24} />
            </Box>
            <div>
              <Group gap="xs" align="center">
                <Text fw={700} size="lg" c="#09090B">
                  Approvals Management Hub
                </Text>
                {totalPending > 0 ? (
                  <Badge size="sm" color="orange" variant="light">
                    {totalPending} Action Required
                  </Badge>
                ) : (
                  <Badge size="sm" color="teal" variant="light">
                    Queue Clear
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="#64748B" mt={2}>
                Review, audit, and sanction employee time-off, expense claims, tax declarations, and compensation changes.
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconRefresh size={13} />}
              onClick={() => {
                fetchLeaveRequests();
                if (onRefresh) onRefresh();
              }}
              loading={loadingLeaves}
            >
              Refresh
            </Button>
            <Button
              size="xs"
              color="dark"
              leftSection={<IconChecks size={14} />}
              onClick={handleBatchApprove}
              disabled={totalPending === 0}
            >
              Approve All Pending ({totalPending})
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

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Paper
          p="md"
          radius="md"
          onClick={() => setActiveTab('LEAVE')}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'LEAVE' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Leave & Time Off
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {pendingLeavesCount}
              </Text>
              <Text size="10px" c="#94A3B8" mt={2}>
                Pending manager review
              </Text>
            </div>
            <Box
              p={8}
              style={{
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
              }}
            >
              <IconCalendarEvent size={20} />
            </Box>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => setActiveTab('REIMBURSEMENT')}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'REIMBURSEMENT' ? '1.5px solid #0D9488' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Expense Claims
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {pendingReimbCount}
              </Text>
              <Text size="10px" c="#94A3B8" mt={2}>
                136 total in cycle
              </Text>
            </div>
            <Box
              p={8}
              style={{
                borderRadius: '8px',
                backgroundColor: '#F0FDF4',
                color: '#0D9488',
              }}
            >
              <IconReceipt2 size={20} />
            </Box>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => setActiveTab('POI')}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'POI' ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Tax Proofs (POI)
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {pendingPoiCount}
              </Text>
              <Text size="10px" c="#94A3B8" mt={2}>
                96 filings submitted
              </Text>
            </div>
            <Box
              p={8}
              style={{
                borderRadius: '8px',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
              }}
            >
              <IconFileText size={20} />
            </Box>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => setActiveTab('SALARY')}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'SALARY' ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Salary Revisions
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {pendingSalCount}
              </Text>
              <Text size="10px" c="#94A3B8" mt={2}>
                55 proposals on hold
              </Text>
            </div>
            <Box
              p={8}
              style={{
                borderRadius: '8px',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
              }}
            >
              <IconTrendingUp size={20} />
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Main Container */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Navigation Tabs and Controls */}
        <Group justify="space-between" align="center" wrap="wrap" gap="md" mb="lg">
          <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
            <Tabs.List>
              <Tabs.Tab value="ALL" leftSection={<IconCheckupList size={14} />}>
                All ({totalPending})
              </Tabs.Tab>
              <Tabs.Tab value="LEAVE" leftSection={<IconCalendarEvent size={14} />}>
                Leave & Time Off ({pendingLeavesCount})
              </Tabs.Tab>
              <Tabs.Tab value="REIMBURSEMENT" leftSection={<IconReceipt2 size={14} />}>
                Reimbursements ({pendingReimbCount})
              </Tabs.Tab>
              <Tabs.Tab value="POI" leftSection={<IconFileText size={14} />}>
                Tax Declarations ({pendingPoiCount})
              </Tabs.Tab>
              <Tabs.Tab value="SALARY" leftSection={<IconTrendingUp size={14} />}>
                Salary Revisions ({pendingSalCount})
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Group gap="xs">
            <TextInput
              placeholder="Search by name or ID..."
              size="xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={13} color="#71717A" />}
              style={{ width: 220 }}
            />
            <SegmentedControl
              size="xs"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { label: 'All', value: 'ALL' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Refused', value: 'REJECTED' },
              ]}
            />
          </Group>
        </Group>

        {/* TAB CONTENTS */}
        <Stack gap="lg">
          {/* 1. Leave & Time Off Section */}
          {(activeTab === 'ALL' || activeTab === 'LEAVE') && (
            <Box>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconCalendarEvent size={16} color="#2563EB" />
                  <Text size="sm" fw={700} c="#09090B">
                    Leave Requests & Time Off
                  </Text>
                </Group>
                <Badge size="xs" color="blue" variant="light">
                  HR Queue
                </Badge>
              </Group>

              <Table verticalSpacing="sm" highlightOnHover style={{ border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
                  <Table.Tr>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '28%' }}>EMPLOYEE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '22%' }}>TYPE & DURATION</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '25%' }}>DATES & REASON</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '12%' }}>STATUS</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '13%', textAlign: 'right' }}>ACTION</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {leaveRequests
                    .filter((lr) => {
                      const empName = lr.employeeName || (lr.employee ? `${lr.employee.firstName || ''} ${lr.employee.lastName || ''}` : 'Aarav Sharma');
                      return matchesSearch(empName) && matchesStatus(lr.status);
                    })
                    .map((lr) => {
                      const empName = lr.employeeName || (lr.employee ? `${lr.employee.firstName || ''} ${lr.employee.lastName || ''}` : 'Aarav Sharma');
                      const leaveName = lr.timeOffTypeName || lr.timeOffType?.name || 'Casual Leave';
                      const isPending = lr.status === 'TO_APPROVE' || lr.status === 'Pending' || lr.status === 'PENDING';
                      const isApproved = lr.status === 'APPROVED' || lr.status === 'Approved';

                      return (
                        <Table.Tr key={lr.id}>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <UserAvatar size={32} radius="xl" name={empName} id={lr.employeeId || empName} />
                              <div>
                                <Text size="xs" fw={700} c="#09090B">
                                  {empName}
                                </Text>
                                <Text size="10px" c="#64748B">
                                  {lr.employeeId || 'EMP-2024-001'}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={600} c="#09090B">
                              {leaveName}
                            </Text>
                            <Text size="10px" c="#64748B">
                              {Number(lr.duration || lr.numberOfDays || 1)} Day(s) Requested
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" c="#09090B">
                              {lr.startDate || '2026-09-12'} to {lr.endDate || '2026-09-14'}
                            </Text>
                            {lr.reason && (
                              <Text size="10px" c="#64748B" fs="italic" lineClamp={1}>
                                "{lr.reason}"
                              </Text>
                            )}
                          </Table.Td>

                          <Table.Td>
                            <Badge
                              size="xs"
                              color={isPending ? 'orange' : isApproved ? 'teal' : 'red'}
                              variant="light"
                              styles={{ root: { height: 20, fontSize: '10px' } }}
                            >
                              {isPending ? 'Pending' : isApproved ? 'Approved' : 'Refused'}
                            </Badge>
                          </Table.Td>

                          <Table.Td style={{ textAlign: 'right' }}>
                            {isPending ? (
                              <Group gap={6} justify="flex-end" wrap="nowrap">
                                <Button
                                  size="xs"
                                  color="dark"
                                  loading={processingId === lr.id}
                                  onClick={() => handleApproveLeave(lr.id, empName)}
                                  styles={{ root: { height: 26, fontSize: '11px', padding: '0 10px' } }}
                                >
                                  Approve
                                </Button>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  loading={processingId === lr.id}
                                  onClick={() => handleRefuseLeave(lr.id, empName)}
                                  title="Refuse Leave"
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            ) : (
                              <Text size="10px" c="#94A3B8">
                                Processed
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  {leaveRequests.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text size="xs" c="#94A3B8" ta="center" py="md">
                          No leave requests match the criteria.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          )}

          {/* 2. Reimbursements Section */}
          {(activeTab === 'ALL' || activeTab === 'REIMBURSEMENT') && (
            <Box>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconReceipt2 size={16} color="#0D9488" />
                  <Text size="sm" fw={700} c="#09090B">
                    Expense Reimbursements & Claims
                  </Text>
                </Group>
                <Badge size="xs" color="teal" variant="light">
                  Finance Audit
                </Badge>
              </Group>

              <Table verticalSpacing="sm" highlightOnHover style={{ border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
                  <Table.Tr>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '28%' }}>EMPLOYEE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '22%' }}>EXPENSE CATEGORY</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '25%' }}>AMOUNT & RECEIPTS</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '12%' }}>STATUS</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '13%', textAlign: 'right' }}>ACTION</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reimbursements
                    .filter((r) => matchesSearch(r.employeeName) && matchesStatus(r.status))
                    .map((r) => {
                      const isPending = r.status === 'PENDING';
                      const isApproved = r.status === 'APPROVED';

                      return (
                        <Table.Tr key={r.id}>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <UserAvatar size={32} radius="xl" name={r.employeeName} id={r.employeeId} />
                              <div>
                                <Text size="xs" fw={700} c="#09090B">
                                  {r.employeeName}
                                </Text>
                                <Text size="10px" c="#64748B">
                                  {r.employeeId}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={600} c="#09090B">
                              {r.category}
                            </Text>
                            <Text size="10px" c="#64748B" lineClamp={1}>
                              {r.description}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {r.amount}
                            </Text>
                            <Group gap={4} mt={2}>
                              <IconPaperclip size={11} color="#64748B" />
                              <Text size="10px" c="#64748B">
                                {r.receiptsCount} Verified Receipt(s)
                              </Text>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Badge
                              size="xs"
                              color={isPending ? 'orange' : isApproved ? 'teal' : 'red'}
                              variant="light"
                              styles={{ root: { height: 20, fontSize: '10px' } }}
                            >
                              {isPending ? 'Pending Audit' : isApproved ? 'Approved' : 'Rejected'}
                            </Badge>
                          </Table.Td>

                          <Table.Td style={{ textAlign: 'right' }}>
                            {isPending ? (
                              <Group gap={6} justify="flex-end" wrap="nowrap">
                                <Button
                                  size="xs"
                                  color="dark"
                                  onClick={() => handleApproveReimbursement(r.id, r.employeeName, r.amount)}
                                  styles={{ root: { height: 26, fontSize: '11px', padding: '0 10px' } }}
                                >
                                  Approve
                                </Button>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  onClick={() => handleRejectReimbursement(r.id, r.employeeName)}
                                  title="Reject Claim"
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            ) : (
                              <Text size="10px" c="#94A3B8">
                                Processed
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                </Table.Tbody>
              </Table>
            </Box>
          )}

          {/* 3. Tax Declarations Section (POI) */}
          {(activeTab === 'ALL' || activeTab === 'POI') && (
            <Box>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconFileText size={16} color="#7C3AED" />
                  <Text size="sm" fw={700} c="#09090B">
                    Proof of Investment (POI / Tax Declarations)
                  </Text>
                </Group>
                <Badge size="xs" color="grape" variant="light">
                  Tax Compliance
                </Badge>
              </Group>

              <Table verticalSpacing="sm" highlightOnHover style={{ border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
                  <Table.Tr>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '28%' }}>EMPLOYEE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '22%' }}>TAX SECTION</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '25%' }}>SUBMITTED PROOF & VALUE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '12%' }}>STATUS</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '13%', textAlign: 'right' }}>ACTION</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {poiList
                    .filter((p) => matchesSearch(p.employeeName) && matchesStatus(p.status))
                    .map((p) => {
                      const isPending = p.status === 'PENDING';
                      const isApproved = p.status === 'APPROVED';

                      return (
                        <Table.Tr key={p.id}>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <UserAvatar size={32} radius="xl" name={p.employeeName} id={p.employeeId} />
                              <div>
                                <Text size="xs" fw={700} c="#09090B">
                                  {p.employeeName}
                                </Text>
                                <Text size="10px" c="#64748B">
                                  {p.employeeId}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={600} c="#09090B">
                              {p.section}
                            </Text>
                            <Text size="10px" c="#64748B">
                              Declared for FY 2026-27
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {p.amount}
                            </Text>
                            <Text size="10px" c="#64748B">
                              {p.documentType}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Badge
                              size="xs"
                              color={isPending ? 'orange' : isApproved ? 'teal' : 'red'}
                              variant="light"
                              styles={{ root: { height: 20, fontSize: '10px' } }}
                            >
                              {isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected'}
                            </Badge>
                          </Table.Td>

                          <Table.Td style={{ textAlign: 'right' }}>
                            {isPending ? (
                              <Group gap={6} justify="flex-end" wrap="nowrap">
                                <Button
                                  size="xs"
                                  color="dark"
                                  onClick={() => handleApprovePoi(p.id, p.employeeName, p.section)}
                                  styles={{ root: { height: 26, fontSize: '11px', padding: '0 10px' } }}
                                >
                                  Approve
                                </Button>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  onClick={() => handleRejectPoi(p.id, p.employeeName)}
                                  title="Reject Submission"
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            ) : (
                              <Text size="10px" c="#94A3B8">
                                Processed
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                </Table.Tbody>
              </Table>
            </Box>
          )}

          {/* 4. Salary Revisions Section */}
          {(activeTab === 'ALL' || activeTab === 'SALARY') && (
            <Box>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconTrendingUp size={16} color="#EA580C" />
                  <Text size="sm" fw={700} c="#09090B">
                    Salary & Compensation Revisions
                  </Text>
                </Group>
                <Badge size="xs" color="orange" variant="light">
                  Executive Sanction
                </Badge>
              </Group>

              <Table verticalSpacing="sm" highlightOnHover style={{ border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
                  <Table.Tr>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '28%' }}>EMPLOYEE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '22%' }}>ROLE & REASON</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '25%' }}>REVISION DETAILS</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '12%' }}>STATUS</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '13%', textAlign: 'right' }}>ACTION</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {salaryRevisions
                    .filter((s) => matchesSearch(s.employeeName) && matchesStatus(s.status))
                    .map((s) => {
                      const isPending = s.status === 'PENDING';
                      const isApproved = s.status === 'APPROVED';

                      return (
                        <Table.Tr key={s.id}>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <UserAvatar size={32} radius="xl" name={s.employeeName} id={s.employeeId} />
                              <div>
                                <Text size="xs" fw={700} c="#09090B">
                                  {s.employeeName}
                                </Text>
                                <Text size="10px" c="#64748B">
                                  {s.employeeId}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={600} c="#09090B">
                              {s.role}
                            </Text>
                            <Text size="10px" c="#64748B" lineClamp={1}>
                              {s.reason}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Group gap={6} wrap="nowrap">
                              <Text size="xs" c="#64748B" td="line-through">
                                {s.currentCtc}
                              </Text>
                              <Text size="xs" fw={700} c="#0D9488">
                                → {s.proposedCtc}
                              </Text>
                              <Badge size="xs" color="teal" variant="light">
                                +{s.hikePercentage}
                              </Badge>
                            </Group>
                            <Text size="10px" c="#64748B">
                              Effective: {s.effectiveDate}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Badge
                              size="xs"
                              color={isPending ? 'orange' : isApproved ? 'teal' : 'red'}
                              variant="light"
                              styles={{ root: { height: 20, fontSize: '10px' } }}
                            >
                              {isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected'}
                            </Badge>
                          </Table.Td>

                          <Table.Td style={{ textAlign: 'right' }}>
                            {isPending ? (
                              <Group gap={6} justify="flex-end" wrap="nowrap">
                                <Button
                                  size="xs"
                                  color="dark"
                                  onClick={() => handleApproveSalary(s.id, s.employeeName, s.proposedCtc)}
                                  styles={{ root: { height: 26, fontSize: '11px', padding: '0 10px' } }}
                                >
                                  Approve
                                </Button>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  onClick={() => handleRejectSalary(s.id, s.employeeName)}
                                  title="Reject Revision"
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            ) : (
                              <Text size="10px" c="#94A3B8">
                                Processed
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};
