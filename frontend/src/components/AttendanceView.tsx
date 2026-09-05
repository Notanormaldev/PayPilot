import React, { useState } from 'react';
import { Paper, Stack, Group, Text, Badge, Button, Table, Grid } from '@mantine/core';
import { IconClockPlay, IconClockStop } from '@tabler/icons-react';
import { fetchApi } from '../lib/api';

interface AttendanceViewProps {
  attendances: any[];
  leaveRequests: any[];
  onRefresh: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendances,
  leaveRequests,
  onRefresh,
}) => {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await fetchApi('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp_aarav_mehta' }),
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await fetchApi('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp_aarav_mehta' }),
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleApproveLeave = async (reqId: string) => {
    setApprovingId(reqId);
    try {
      await fetchApi(`/time-off/requests/${reqId}/approve`, { method: 'POST' });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Stack gap="md">
      {/* Attendance Kiosk Card */}
      <Paper p="md" radius="sm">
        <Group justify="space-between" align="center">
          <div>
            <Text size="md" fw={700} c="#09090B">
              Today's Attendance Terminal
            </Text>
            <Text size="xs" c="#71717A">
              Live RFID / Biometric punch emulator for employee Aarav Mehta
            </Text>
          </div>

          <Group gap="sm">
            <Button
              size="sm"
              color="teal"
              leftSection={<IconClockPlay size={14} />}
              loading={checkingIn}
              onClick={handleCheckIn}
            >
              Punch In (09:00 AM)
            </Button>
            <Button
              size="sm"
              variant="outline"
              color="red"
              leftSection={<IconClockStop size={14} />}
              loading={checkingOut}
              onClick={handleCheckOut}
            >
              Punch Out (06:00 PM)
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Grid: Attendance Logs & Leave Requests */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="sm" style={{ minHeight: '350px' }}>
            <Text size="xs" fw={700} c="#71717A" mb="md" style={{ letterSpacing: '0.04em' }}>
              RECENT ATTENDANCE LOGS
            </Text>
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>EMPLOYEE</Table.Th>
                  <Table.Th>DATE</Table.Th>
                  <Table.Th>STATUS</Table.Th>
                  <Table.Th>HOURS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {attendances.slice(0, 8).map((a) => (
                  <Table.Tr key={a.id}>
                    <Table.Td>
                      <Text size="xs" fw={600} c="#09090B">
                        {a.employee?.name || 'Staff Member'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="#71717A">
                        {new Date(a.date).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={a.status === 'PRESENT' ? 'teal' : 'red'} variant="light">
                        {a.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="#3F3F46" style={{ fontFamily: 'JetBrains Mono' }}>
                        {a.workedHours ? `${a.workedHours}h` : '8.0h'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="sm" style={{ minHeight: '350px' }}>
            <Text size="xs" fw={700} c="#71717A" mb="md" style={{ letterSpacing: '0.04em' }}>
              PENDING TIME OFF REQUESTS ({leaveRequests.length})
            </Text>
            {leaveRequests.length === 0 ? (
              <Text size="xs" c="#71717A">
                No pending requests. All allocations balanced.
              </Text>
            ) : (
              <Stack gap="xs">
                {leaveRequests.map((req) => (
                  <Paper key={req.id} p="sm" bg="#F8FAFC" radius="xs" style={{ border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          {req.employee?.name} — {req.timeOffType?.name}
                        </Text>
                        <Text size="xs" c="#71717A">
                          {new Date(req.startDate).toLocaleDateString()} ({req.duration} days)
                        </Text>
                      </div>

                      {req.status === 'TO_APPROVE' ? (
                        <Button
                          size="xs"
                          color="teal"
                          loading={approvingId === req.id}
                          onClick={() => handleApproveLeave(req.id)}
                        >
                          Approve (Atomic)
                        </Button>
                      ) : (
                        <Badge size="xs" color="teal" variant="light">
                          {req.status}
                        </Badge>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
