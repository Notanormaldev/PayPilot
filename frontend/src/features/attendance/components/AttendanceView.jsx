import React, { useState } from 'react';
import {
  Paper,
  Table,
  Group,
  Text,
  Badge,
  Button,
  Grid,
  Stack,
  Select,
} from '@mantine/core';
import { IconFingerprint, IconCalendarCheck, IconCheck, IconClock } from '@tabler/icons-react';
import { attendanceService } from '../services/attendanceService';

export const AttendanceView = ({
  attendances = [],
  leaveRequests = [],
  onRefresh,
}) => {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [punching, setPunching] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const handlePunch = async (type) => {
    if (!selectedEmp && attendances.length > 0) {
      // Default to first employee if not selected
    }
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
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setApprovingId(null);
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
                        {att.employee?.firstName} {att.employee?.lastName}
                      </Text>
                      <Text size="10px" c="#71717A">
                        {att.employee?.employeeNumber}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" c="#09090B">
                        {new Date(att.date).toLocaleDateString()}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {Number(att.workedHours).toFixed(1)} hrs
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
                        {att.status}
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
                Atomic Ledger
              </Badge>
            </Group>

            <Stack gap="sm">
              {leaveRequests.length === 0 ? (
                <Text size="xs" c="#71717A" style={{ textAlign: 'center', padding: '24px' }}>
                  No pending leave requests.
                </Text>
              ) : (
                leaveRequests.map((lr) => (
                  <Paper
                    key={lr.id}
                    p="sm"
                    radius="sm"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          {lr.employee?.firstName} {lr.employee?.lastName}
                        </Text>
                        <Text size="10px" c="#71717A">
                          {lr.timeOffType?.name || 'Paid Leave'} • {Number(lr.numberOfDays)} day(s)
                        </Text>
                        <Text size="10px" c="#71717A">
                          {new Date(lr.dateFrom).toLocaleDateString()} – {new Date(lr.dateTo).toLocaleDateString()}
                        </Text>
                      </div>

                      {lr.status === 'PENDING' ? (
                        <Button
                          size="xs"
                          color="dark"
                          loading={approvingId === lr.id}
                          onClick={() => handleApprove(lr.id)}
                          styles={{
                            root: { height: 26, fontSize: '11px', padding: '0 10px' },
                          }}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Badge size="xs" color="teal" variant="light">
                          {lr.status}
                        </Badge>
                      )}
                    </Group>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
