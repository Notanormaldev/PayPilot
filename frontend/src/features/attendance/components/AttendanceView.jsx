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
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconFingerprint,
  IconCalendarCheck,
  IconClock,
  IconX,
  IconAdjustments,
  IconPlus,
  IconShieldCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { attendanceService } from '../services/attendanceService';
import { fetchApi } from '../../../lib/api';
import { UserAvatar } from '../../../components/ui';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';

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

  // Attendance Correction Modal State
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedAttendanceForCorrection, setSelectedAttendanceForCorrection] = useState(null);

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

  const handleOpenCorrection = (att) => {
    setSelectedAttendanceForCorrection(att);
    setCorrectionModalOpen(true);
  };

  const handleOpenNewManualEntry = () => {
    setSelectedAttendanceForCorrection(null);
    setCorrectionModalOpen(true);
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
      {/* Top Quick Punch Simulation Bar & HR Manual Override Action */}
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
                PUNCH CLOCK TERMINAL & HR ATTENDANCE OVERRIDE
              </Text>
              <Text size="xs" c="#71717A">
                Record real-time RFID telemetry or perform statutory punch adjustments with mandatory reason
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={handleOpenNewManualEntry}
              leftSection={<IconPlus size={13} />}
            >
              Manual Punch Override
            </Button>

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
              <Group gap="xs">
                <Text fw={700} size="sm" c="#09090B">
                  RECENT ATTENDANCE LOGS
                </Text>
                <Badge size="xs" color="teal" variant="light">
                  Auto-Synced
                </Badge>
              </Group>

              <Button
                size="compact-xs"
                variant="subtle"
                color="blue"
                leftSection={<IconAdjustments size={12} />}
                onClick={handleOpenNewManualEntry}
              >
                + Fix Missing Punch
              </Button>
            </Group>

            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '34%', whiteSpace: 'nowrap' }}>EMPLOYEE</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '18%', whiteSpace: 'nowrap' }}>DATE</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '16%', whiteSpace: 'nowrap' }}>HOURS</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '20%', whiteSpace: 'nowrap' }}>STATUS</Table.Th>
                  <Table.Th style={{ color: '#71717A', fontSize: '11px', width: '12%', textAlign: 'right' }}>ACTION</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {attendances.slice(0, 10).map((att) => {
                  const empName = att.employee?.firstName || att.employee?.name || 'Aarav Sharma';
                  const empNum = att.employee?.employeeNumber || 'EMP-2024-001';
                  const isCorrected = Boolean(att.isCorrected);
                  const reason = att.correctionReason || 'Manual adjustment';
                  const corrector = att.correctedBy?.employee?.name || att.correctedBy?.email || 'HR Admin';

                  return (
                    <Table.Tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <UserAvatar size={28} radius="xl" name={empName} id={empNum} />
                          <div style={{ minWidth: 0 }}>
                            <Text size="xs" fw={600} c="#09090B" style={{ whiteSpace: 'nowrap' }}>
                              {empName}
                            </Text>
                            <Text size="10px" c="#71717A" style={{ whiteSpace: 'nowrap' }}>
                              {empNum}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" c="#09090B" style={{ whiteSpace: 'nowrap' }}>
                          {new Date(att.date).toLocaleDateString()}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                          {Number(att.workedHours || 8).toFixed(1)} hrs
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Stack gap={2}>
                          <Badge
                            size="xs"
                            color={
                              att.status === 'PRESENT'
                                ? 'teal'
                                : att.status === 'HALF_DAY'
                                ? 'orange'
                                : att.status === 'LATE'
                                ? 'yellow'
                                : 'red'
                            }
                            variant="light"
                            styles={{ root: { height: 20, fontSize: '10px', whiteSpace: 'nowrap' } }}
                          >
                            {att.status || 'PRESENT'}
                          </Badge>

                          {isCorrected && (
                            <Tooltip
                              label={`Overridden: ${reason} (by ${corrector})`}
                              withArrow
                              position="top"
                            >
                              <Badge
                                size="xs"
                                color="indigo"
                                variant="outline"
                                styles={{ root: { height: 18, fontSize: '9px', cursor: 'pointer' } }}
                              >
                                ⚡ {reason.length > 18 ? `${reason.substring(0, 16)}...` : reason}
                              </Badge>
                            </Tooltip>
                          )}
                        </Stack>
                      </Table.Td>

                      <Table.Td style={{ textAlign: 'right' }}>
                        <Tooltip label="HR Override / Punch Correction (Biometric Failure, etc.)" withArrow>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="blue"
                            onClick={() => handleOpenCorrection(att)}
                          >
                            <IconAdjustments size={15} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
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
                      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                        <Group gap="xs" align="flex-start" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                          <UserAvatar size={30} radius="xl" name={empName} id={lr.employeeId || empName} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs" mb={2} wrap="wrap">
                              <Text size="xs" fw={700} c="#09090B">
                                {empName}
                              </Text>
                              {isPending && (
                                <Badge size="xs" color="orange" variant="light" styles={{ root: { height: 18, fontSize: '10px', padding: '0 6px' } }}>
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
                              <Text size="10px" c="#64748B" fs="italic" mt={2} lineClamp={2}>
                                "{lr.reason}"
                              </Text>
                            )}
                          </div>
                        </Group>

                        <div style={{ flexShrink: 0 }}>
                          {isPending ? (
                            <Group gap={4} wrap="nowrap">
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
                            <Badge size="xs" color={isApproved ? 'teal' : 'red'} variant="light" styles={{ root: { height: 20, fontSize: '10px' } }}>
                              {isApproved ? 'Approved' : 'Refused'}
                            </Badge>
                          )}
                        </div>
                      </Group>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* HR Attendance Correction Modal */}
      <AttendanceCorrectionModal
        opened={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        attendance={selectedAttendanceForCorrection}
        employees={attendances.map((a) => a.employee).filter(Boolean)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </Stack>
  );
};

