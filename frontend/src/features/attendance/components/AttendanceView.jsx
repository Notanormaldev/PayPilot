import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  Group,
  Text,
  Badge,
  Button,
  Grid,
  Stack,
} from '@mantine/core';
import { IconFingerprint, IconCalendarCheck, IconClock, IconX } from '@tabler/icons-react';
import { attendanceService } from '../services/attendanceService';
import { fetchApi } from '../../../lib/api';

export const AttendanceView = ({
  attendances = [],
  leaveRequests: initialLeaveRequests = [],
  onRefresh,
}) => {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [punching, setPunching] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [refusingId, setRefusingId] = useState(null);
  const [liveRequests, setLiveRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await attendanceService.fetchLeaveRequests();
      if (res && res.data && res.data.length > 0) {
        setLiveRequests(res.data);
      }
    } catch (e) {
      console.warn('fetchLeaveRequests error:', e.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const requestsToDisplay = liveRequests.length > 0 ? liveRequests : initialLeaveRequests;

  const handlePunch = async (type) => {
    const empId = selectedEmp || (attendances[0]?.employeeId) || 'demo-emp';
    setPunching(true);
    try {
      await attendanceService.recordPunch(empId, type);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Punch error:', err);
    } finally {
      setPunching(false);
    }
  };

  const handleApprove = async (reqId) => {
    setApprovingId(reqId);
    try {
      await attendanceService.approveLeave(reqId);
      await fetchRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRefuse = async (reqId) => {
    setRefusingId(reqId);
    try {
      await fetchApi(`/time-off/requests/${reqId}/refuse`, { method: 'POST' });
      await fetchRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Refuse error:', err);
    } finally {
      setRefusingId(null);
    }
  };

  return (
    <Stack gap="lg">
      {/* Top Quick Punch Simulation Bar */}
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xs">
            <IconFingerprint size={20} color="#2563EB" />
            <div>
              <Text fw={700} size="sm" c="#09090B">
                Live RFID / Biometric Punch Simulator
              </Text>
              <Text size="xs" c="#71717A">
                Record real-time check-in and check-out events with instant hours computation
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              size="xs"
              color="dark"
              loading={punching}
              onClick={() => handlePunch('CHECK_IN')}
              leftSection={<IconClock size={12} />}
            >
              Simulate Punch In
            </Button>
            <Button
              size="xs"
              variant="outline"
              color="orange"
              loading={punching}
              onClick={() => handlePunch('CHECK_OUT')}
              leftSection={<IconClock size={12} />}
            >
              Simulate Punch Out
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Main 2-Column: Left Attendance Log, Right Leave Requests */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
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
              <Text fw={700} size="sm" c="#09090B">
                RECENT ATTENDANCE LOGS
              </Text>
              <Badge size="xs" color="teal" variant="light">
                Auto-Synced
              </Badge>
            </Group>

            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>EMPLOYEE</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>DATE</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>HOURS</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>STATUS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {attendances.slice(0, 8).map((att) => (
                  <Table.Tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <Table.Td>
                      <Text size="xs" fw={600} c="#09090B">
                        {att.employee?.firstName || att.employee?.name || 'Aarav Sharma'}
                      </Text>
                      <Text size="10px" c="#71717A">
                        {att.employee?.employeeNumber || 'EMP-2024-001'}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" c="#09090B">
                        {new Date(att.date).toLocaleDateString()}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {Number(att.workedHours || 8).toFixed(1)} hrs
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        size="xs"
                        color={
                          att.status === 'PRESENT'
                            ? 'teal'
                            : att.status === 'HALF_DAY'
                            ? 'orange'
                            : 'red'
                        }
                        variant="light"
                      >
                        {att.status || 'PRESENT'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
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
              <Group gap="xs">
                <IconCalendarCheck size={18} color="#2563EB" />
                <Text fw={700} size="sm" c="#09090B">
                  LEAVE REQUESTS & APPROVALS
                </Text>
              </Group>
              <Badge size="xs" color="blue" variant="light">
                HR Manager Queue
              </Badge>
            </Group>

            <Stack gap="sm">
              {requestsToDisplay.length === 0 ? (
                <Text size="xs" c="#71717A" style={{ textAlign: 'center', padding: '24px' }}>
                  No pending leave requests.
                </Text>
              ) : (
                requestsToDisplay.map((lr) => {
                  const empName = lr.employeeName || (lr.employee ? `${lr.employee.firstName || ''} ${lr.employee.lastName || ''}` : 'Aarav Sharma');
                  const leaveName = lr.timeOffTypeName || lr.timeOffType?.name || 'Casual Leave';
                  const isPending = lr.status === 'TO_APPROVE' || lr.status === 'Pending' || lr.status === 'PENDING';
                  const isApproved = lr.status === 'APPROVED' || lr.status === 'Approved';

                  return (
                    <Paper
                      key={lr.id}
                      p="sm"
                      radius="sm"
                      style={{ backgroundColor: isPending ? '#FFFBEB' : '#F8FAFC', border: isPending ? '1px solid #FDE68A' : '1px solid #E2E8F0' }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <div>
                          <Group gap="xs" mb={2}>
                            <Text size="xs" fw={700} c="#09090B">
                              {empName}
                            </Text>
                            {isPending && (
                              <Badge size="9px" color="orange">
                                Needs Approval
                              </Badge>
                            )}
                          </Group>
                          <Text size="10px" c="#475569" fw={500}>
                            {leaveName} • {Number(lr.duration || lr.numberOfDays || 1)} day(s)
                          </Text>
                          <Text size="10px" c="#71717A">
                            {lr.startDate || '2026-09-12'} to {lr.endDate || '2026-09-14'}
                          </Text>
                          {lr.reason && (
                            <Text size="10px" c="#64748B" fs="italic" mt={2}>
                              "{lr.reason}"
                            </Text>
                          )}
                        </div>

                        {isPending ? (
                          <Group gap={4}>
                            <Button
                              size="xs"
                              color="dark"
                              loading={approvingId === lr.id}
                              onClick={() => handleApprove(lr.id)}
                              styles={{
                                root: { height: 26, fontSize: '11px', padding: '0 8px' },
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              loading={refusingId === lr.id}
                              onClick={() => handleRefuse(lr.id)}
                              styles={{
                                root: { height: 26, fontSize: '11px', padding: '0 6px' },
                              }}
                            >
                              <IconX size={12} />
                            </Button>
                          </Group>
                        ) : (
                          <Badge size="xs" color={isApproved ? 'teal' : 'red'} variant="light">
                            {isApproved ? 'Approved' : 'Refused'}
                          </Badge>
                        )}
                      </Group>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
