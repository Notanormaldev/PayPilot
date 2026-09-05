import React, { useState, useEffect } from 'react';
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
  Modal,
  TextInput,
  Textarea,
  Select,
  Alert,
  Progress,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconCheck,
  IconTrash,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { fetchApi } from '../../../lib/api';
import { HolidayCalendarModal } from './HolidayCalendarModal';

export const MyTimeOffView = () => {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Leave Balances
  const balances = [
    { type: 'Casual Leave', allocated: 12, taken: 3, remaining: 9, color: 'blue' },
    { type: 'Sick Leave', allocated: 10, taken: 1, remaining: 9, color: 'teal' },
    { type: 'Earned / Paid Leave', allocated: 15, taken: 5, remaining: 10, color: 'indigo' },
  ];

  // Request History
  const [requests, setRequests] = useState([
    {
      id: 'req_101',
      type: 'Casual Leave',
      dates: 'Sep 12, 2026 - Sep 14, 2026',
      duration: '3 Days',
      reason: 'Personal family obligation',
      status: 'Pending',
    },
    {
      id: 'req_100',
      type: 'Sick Leave',
      dates: 'Aug 18, 2026',
      duration: '1 Day',
      reason: 'Medical consultation & recovery',
      status: 'Approved',
    },
    {
      id: 'req_99',
      type: 'Earned / Paid Leave',
      dates: 'Jul 01, 2026 - Jul 05, 2026',
      duration: '5 Days',
      reason: 'Annual summer vacation',
      status: 'Approved',
    },
  ]);

  const fetchUserRequests = async () => {
    try {
      const res = await fetchApi('/time-off/requests?employeeId=emp_1');
      if (res && res.data && res.data.length > 0) {
        const formatted = res.data.map((r) => ({
          id: r.id,
          type: r.timeOffTypeName || r.timeOffType?.name || 'Casual Leave',
          dates: r.startDate && r.endDate ? `${r.startDate} - ${r.endDate}` : 'Sep 12, 2026 - Sep 14, 2026',
          duration: `${r.duration || 1} Days`,
          reason: r.reason || 'Personal request',
          status: r.status === 'TO_APPROVE' ? 'Pending' : r.status === 'APPROVED' ? 'Approved' : 'Refused',
        }));
        setRequests(formatted);
      }
    } catch (e) {
      console.warn('fetchUserRequests fallback:', e.message);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const calculateDuration = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) return;
    const dur = calculateDuration();
    setSubmitting(true);
    try {
      await fetchApi('/time-off/requests', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: 'emp_1',
          timeOffTypeName: leaveType,
          startDate,
          endDate,
          duration: dur,
          reason: reason || 'Personal request',
        }),
      });
    } catch (e) {
      console.warn('API leave submission error:', e.message);
    } finally {
      setSubmitting(false);
    }

    const newReq = {
      id: `req_${Date.now()}`,
      type: leaveType,
      dates: `${startDate} - ${endDate}`,
      duration: `${dur} ${dur === 1 ? 'Day' : 'Days'}`,
      reason: reason || 'Personal request',
      status: 'Pending',
    };

    setRequests([newReq, ...requests]);
    setSuccessMsg(`Leave request for ${newReq.duration} submitted to HR Manager for approval.`);
    setRequestModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    fetchUserRequests();
  };

  const handleCancelRequest = (id) => {
    setRequests(requests.filter((r) => r.id !== id));
    setSuccessMsg('Pending leave request has been cancelled.');
  };

  return (
    <Stack gap="lg">
      {/* Top Header Card */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Title order={3} c="#09090B">
              My Leave & Time Off
            </Title>
            <Text size="xs" c="#64748B">
              Track allocated leave balances, auto-calculate durations, and submit requests for manager approval.
            </Text>
          </div>

          <Group gap="xs">
            <Button
              variant="light"
              color="indigo"
              leftSection={<IconCalendarEvent size={16} />}
              onClick={() => setHolidayModalOpen(true)}
            >
              2026 Indian Holiday Calendar
            </Button>
            <Button
              color="dark"
              leftSection={<IconPlus size={16} />}
              onClick={() => setRequestModalOpen(true)}
            >
              New Leave Request
            </Button>
          </Group>
        </Group>
      </Paper>

      {successMsg && (
        <Alert icon={<IconCheck size={16} />} color="teal" title="Success" withCloseButton onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Leave Balance Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {balances.map((b, i) => (
          <Paper key={i} p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
                {b.type}
              </Text>
              <Badge color={b.color} variant="light" size="sm">
                {b.remaining} Days Left
              </Badge>
            </Group>
            <Group align="baseline" gap="xs" mb="xs">
              <Text size="1.8rem" fw={700} c="#09090B">
                {b.remaining}
              </Text>
              <Text size="xs" c="#64748B">
                / {b.allocated} Total Allocated
              </Text>
            </Group>
            <Progress value={(b.taken / b.allocated) * 100} color={b.color} size="sm" radius="xl" />
            <Text size="10px" c="#94A3B8" mt="xs">
              {b.taken} days consumed this year
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Request History Table */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Title order={4} c="#09090B" mb="md">
          Leave Request History
        </Title>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
              <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Leave Type</Table.Th>
              <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Requested Dates</Table.Th>
              <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Duration</Table.Th>
              <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Reason</Table.Th>
              <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Approval Status</Table.Th>
              <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.map((req) => (
              <Table.Tr key={req.id}>
                <Table.Td>
                  <Text size="xs" fw={600} c="#09090B">
                    {req.type}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="#64748B">
                    {req.dates}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="xs" variant="outline" color="gray">
                    {req.duration}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="#64748B">
                    {req.reason}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    size="xs"
                    color={
                      req.status === 'Approved' ? 'teal' : req.status === 'Pending' ? 'yellow' : 'red'
                    }
                    variant="filled"
                  >
                    {req.status}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {req.status === 'Pending' ? (
                    <Tooltip label="Cancel this pending request">
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        color="red"
                        leftSection={<IconTrash size={12} />}
                        onClick={() => handleCancelRequest(req.id)}
                      >
                        Cancel
                      </Button>
                    </Tooltip>
                  ) : (
                    <Text size="11px" c="#94A3B8">—</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* New Leave Request Modal */}
      <Modal
        opened={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Submit New Leave Request"
        centered
        size="md"
      >
        <Stack gap="sm">
          <Select
            label="Leave Type"
            data={[
              'Casual Leave',
              'Sick Leave',
              'Earned / Paid Leave',
              'Restricted / Optional Holiday (RH)',
              'Unpaid Absence',
            ]}
            value={leaveType}
            onChange={setLeaveType}
          />

          <Group grow>
            <TextInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.currentTarget.value)}
            />
            <TextInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.currentTarget.value)}
            />
          </Group>

          {startDate && endDate && (
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Text size="xs" fw={700} c="#1E40AF">
                Calculated Duration: {calculateDuration()} Day(s)
              </Text>
            </Paper>
          )}

          <Textarea
            label="Reason for Time Off"
            placeholder="Brief reason for your leave request..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />

          <Group justify="end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button color="dark" loading={submitting} onClick={handleSubmitRequest}>
              Submit for HR Manager Approval
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 2026 Indian Holiday & Festival Calendar Modal */}
      <HolidayCalendarModal
        opened={holidayModalOpen}
        onClose={() => setHolidayModalOpen(false)}
        onApplyRhLeave={(rhData) => {
          setLeaveType('Restricted / Optional Holiday (RH)');
          setStartDate(rhData.date);
          setEndDate(rhData.date);
          setReason(`Restricted Holiday (RH): ${rhData.name}`);
          setRequestModalOpen(true);
        }}
      />
    </Stack>
  );
};
