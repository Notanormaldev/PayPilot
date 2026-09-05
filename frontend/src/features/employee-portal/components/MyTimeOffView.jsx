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
  Modal,
  TextInput,
  Textarea,
  Select,
  Alert,
  Progress,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconPlus,
  IconCheck,
  IconX,
  IconTrash,
  IconClock,
  IconAlertCircle,
} from '@tabler/icons-react';

export const MyTimeOffView = () => {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

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

  // Compute calculated duration in days
  const calculateDuration = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const handleSubmitRequest = () => {
    if (!startDate || !endDate) return;
    const dur = calculateDuration();
    const newReq = {
      id: `req_${Date.now()}`,
      type: leaveType,
      dates: `${startDate} - ${endDate}`,
      duration: `${dur} ${dur === 1 ? 'Day' : 'Days'}`,
      reason: reason || 'Personal request',
      status: 'Pending',
    };
    setRequests([newReq, ...requests]);
    setSuccessMsg(`Leave request for ${newReq.duration} submitted to manager for approval.`);
    setRequestModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
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

          <Button
            color="dark"
            leftSection={<IconPlus size={16} />}
            onClick={() => setRequestModalOpen(true)}
          >
            New Leave Request
          </Button>
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
              <Text size="xs" fw={700} c="#09090B">
                {b.type}
              </Text>
              <Badge size="xs" color={b.color} variant="light">
                {b.remaining} Days Left
              </Badge>
            </Group>

            <Group gap="xs" align="baseline" mb="xs">
              <Text size="22px" fw={800} c="#09090B">
                {b.remaining}
              </Text>
              <Text size="xs" c="#71717A">
                / {b.allocated} allocated
              </Text>
            </Group>

            <Progress
              value={(b.remaining / b.allocated) * 100}
              color={b.color}
              size="sm"
              radius="xl"
            />
            <Group justify="space-between" mt={6}>
              <Text size="10px" c="#64748B">Taken: {b.taken} days</Text>
              <Text size="10px" c="#64748B">Allocated: {b.allocated} days</Text>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Request History Table */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Title order={4} size="sm" c="#09090B" mb="md">
          Leave Request History
        </Title>

        <Table highlightOnHover border={0}>
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Leave Type</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Dates</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Duration</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Reason</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Status</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px', textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.map((req) => (
              <Table.Tr key={req.id}>
                <Table.Td style={{ fontWeight: 600, fontSize: '13px', color: '#09090B' }}>{req.type}</Table.Td>
                <Table.Td style={{ fontSize: '12px', color: '#334155' }}>{req.dates}</Table.Td>
                <Table.Td style={{ fontWeight: 600, fontSize: '12px', color: '#09090B' }}>{req.duration}</Table.Td>
                <Table.Td style={{ fontSize: '12px', color: '#64748B' }}>{req.reason}</Table.Td>
                <Table.Td>
                  <Badge
                    size="xs"
                    color={
                      req.status === 'Approved'
                        ? 'teal'
                        : req.status === 'Pending'
                        ? 'orange'
                        : 'red'
                    }
                    variant="light"
                  >
                    {req.status}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {req.status === 'Pending' ? (
                    <Tooltip label="Cancel this pending request" withArrow>
                      <Button
                        size="compact-xs"
                        variant="light"
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
            data={['Casual Leave', 'Sick Leave', 'Earned / Paid Leave', 'Unpaid Absence']}
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
            <Button color="dark" onClick={handleSubmitRequest}>
              Submit for Manager Approval
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};
