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
  Alert,
  Box,
  ThemeIcon,
  Tooltip,
  Divider,
} from '@mantine/core';
import {
  IconClock,
  IconCalendarTime,
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconClockCheck,
  IconClockOff,
  IconEye,
  IconTrendingUp,
  IconCalendarStats,
  IconHistory,
} from '@tabler/icons-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ActiveShiftCard } from './ActiveShiftCard';
import { useShiftAttendance } from '../hooks/useShiftAttendance';

export const MyAttendanceView = () => {
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [correctionDate, setCorrectionDate] = useState('2026-09-04');
  const [correctCheckIn, setCorrectCheckIn] = useState('09:00 AM');
  const [correctCheckOut, setCorrectCheckOut] = useState('06:00 PM');
  const [reason, setReason] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(null);

  // Synchronized Shift Attendance State from Central Hook
  const {
    checkedIn,
    checkInTime,
    checkInDisplayStr,
    shiftCompleted,
    regularShiftSec,
    isOvertimeActive,
    liveTodayOtSec,
    totalMonthOtSec,
  } = useShiftAttendance('EMP-8492');

  // Dynamic Total Worked Hours (Base 160.5 hrs + Live current shift + Overtime)
  const baseMonthlyHrs = 160.5;
  const liveShiftHoursVal = checkedIn ? (regularShiftSec + (isOvertimeActive ? liveTodayOtSec : 0)) / 3600 : 0;
  const dynamicTotalWorkedHours = (baseMonthlyHrs + liveShiftHoursVal).toFixed(1);

  // Comprehensive Work Breakdown History Dataset
  const detailedBreakdown = [
    { date: 'Sep 05, 2026', day: 'Friday', checkIn: '09:15 AM', checkOut: '06:15 PM', breakTime: '45 mins', workedHours: '8.2 hrs', status: 'PRESENT', overtime: '+0.2 hrs' },
    { date: 'Sep 04, 2026', day: 'Thursday', checkIn: '09:00 AM', checkOut: '06:00 PM', breakTime: '60 mins', workedHours: '8.0 hrs', status: 'PRESENT', overtime: '0.0 hrs' },
    { date: 'Sep 03, 2026', day: 'Wednesday', checkIn: '09:28 AM', checkOut: '06:00 PM', breakTime: '30 mins', workedHours: '7.5 hrs', status: 'LATE', overtime: '-0.5 hrs' },
    { date: 'Sep 02, 2026', day: 'Tuesday', checkIn: '09:00 AM', checkOut: '06:00 PM', breakTime: '60 mins', workedHours: '8.0 hrs', status: 'PRESENT', overtime: '0.0 hrs' },
    { date: 'Sep 01, 2026', day: 'Monday', checkIn: '09:02 AM', checkOut: '06:10 PM', breakTime: '45 mins', workedHours: '8.1 hrs', status: 'PRESENT', overtime: '+0.1 hrs' },
    { date: 'Aug 29, 2026', day: 'Friday', checkIn: '09:00 AM', checkOut: '06:00 PM', breakTime: '60 mins', workedHours: '8.0 hrs', status: 'PRESENT', overtime: '0.0 hrs' },
    { date: 'Aug 28, 2026', day: 'Thursday', checkIn: '09:18 AM', checkOut: '06:00 PM', breakTime: '45 mins', workedHours: '7.7 hrs', status: 'LATE', overtime: '-0.3 hrs' },
    { date: 'Aug 27, 2026', day: 'Wednesday', checkIn: '08:55 AM', checkOut: '06:30 PM', breakTime: '60 mins', workedHours: '8.6 hrs', status: 'PRESENT', overtime: '+0.6 hrs' },
  ];

  // Attendance History List
  const [attendanceLogs, setAttendanceLogs] = useState([
    { date: 'Sep 04, 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', workedHours: '8.0 hrs', status: 'PRESENT' },
    { date: 'Sep 03, 2026', checkIn: '09:28 AM', checkOut: '06:00 PM', workedHours: '7.5 hrs', status: 'LATE' },
    { date: 'Sep 02, 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', workedHours: '8.0 hrs', status: 'PRESENT' },
    { date: 'Sep 01, 2026', checkIn: '09:02 AM', checkOut: '06:10 PM', workedHours: '8.1 hrs', status: 'PRESENT' },
    { date: 'Aug 29, 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', workedHours: '8.0 hrs', status: 'PRESENT' },
    { date: 'Aug 28, 2026', checkIn: '09:18 AM', checkOut: '06:00 PM', workedHours: '7.7 hrs', status: 'LATE' },
  ]);

  const todayFormattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const trendData = [
    { day: '08/18', hours: 8.5 },
    { day: '08/19', hours: 8.2 },
    { day: '08/20', hours: 9.1 },
    { day: '08/21', hours: 8.0 },
    { day: '08/22', hours: 8.5 },
    { day: '08/25', hours: 8.3 },
    { day: '08/26', hours: 8.0 },
    { day: '08/27', hours: 8.6 },
    { day: '08/28', hours: 8.0 },
    { day: '08/29', hours: 8.5 },
    { day: '09/01', hours: 8.2 },
    { day: '09/02', hours: 8.0 },
    { day: '09/03', hours: 8.5 },
    { day: '09/04', hours: 8.0 },
    { day: '09/05', hours: 8.2 },
  ];

  const handleSubmitCorrection = () => {
    setSubmittedMessage(`Attendance correction request for ${correctionDate} submitted to HR Manager for review.`);
    setCorrectionModalOpen(false);
    setReason('');
  };

  return (
    <Stack gap="lg">
      {/* Top Header */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Title order={3} c="#09090B">
              My Attendance & Work Shift Tracker
            </Title>
            <Text size="xs" c="#64748B">
              Real-time shift timer, remaining shift target countdown, and daily attendance logs.
            </Text>
          </div>

          <Group gap="xs">
            <Button
              variant="light"
              color="blue"
              leftSection={<IconCalendarStats size={16} />}
              onClick={() => setBreakdownModalOpen(true)}
            >
              Work Breakdown
            </Button>
            <Button
              color="dark"
              leftSection={<IconEdit size={16} />}
              onClick={() => setCorrectionModalOpen(true)}
            >
              Request Correction
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* TODAY'S LOG & UNIFIED LIVE SHIFT PUNCH CARD */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Group gap="xs">
            <Text fw={800} size="sm" c="#09090B">
              TODAY'S SHIFT LOG ({todayFormattedDate})
            </Text>
            <Badge
              size="xs"
              color={isOvertimeActive ? 'amber' : checkedIn ? 'teal' : shiftCompleted ? 'blue' : 'gray'}
              variant="filled"
            >
              {isOvertimeActive
                ? '⚡ OVERTIME ACTIVE'
                : checkedIn
                ? `ACTIVE SHIFT • Punched in at ${checkInDisplayStr}`
                : shiftCompleted
                ? 'SHIFT COMPLETED'
                : 'NOT CHECKED IN'}
            </Badge>
          </Group>
          <Text size="xs" c="#71717A">
            Standard Daily Target: <b>08h 00m</b> • Monthly Overtime Limit: <b>20.0h</b>
          </Text>
        </Group>

        {/* Unified Active Shift & Overtime Card */}
        <ActiveShiftCard employeeCode="EMP-8492" />
      </Paper>

      {submittedMessage && (
        <Alert icon={<IconCheck size={16} />} color="teal" title="Correction Request Sent" withCloseButton onClose={() => setSubmittedMessage(null)}>
          {submittedMessage}
        </Alert>
      )}

      {/* Monthly Summary Cards (Clickable Total Worked Hours Card) */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #BFDBFE',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          }}
          onClick={() => setBreakdownModalOpen(true)}
        >
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={700} c="#1E40AF" style={{ textTransform: 'uppercase' }}>
              Total Worked Hours (Live)
            </Text>
            <Badge size="xs" color="blue" variant="light">
              Click for Breakdown
            </Badge>
          </Group>
          <Group align="baseline" gap="xs">
            <Text size="xl" fw={900} c="#1D4ED8">
              {dynamicTotalWorkedHours} hrs
            </Text>
            {checkedIn && (
              <Badge size="xs" color="teal" variant="filled">
                ● Live Counting
              </Badge>
            )}
          </Group>
          <Text size="10px" c="#166534" mt={2}>
            Monthly Target: 160.0 hrs • {((parseFloat(dynamicTotalWorkedHours) / 160) * 100).toFixed(0)}% of quota
          </Text>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
              Late Check-Ins
            </Text>
            <IconAlertCircle size={18} color="#D97706" />
          </Group>
          <Text size="xl" fw={800} c="#D97706">
            2 Days
          </Text>
          <Text size="10px" c="#71717A" mt={2}>
            Grace threshold: Up to 3 late entries per month
          </Text>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
              Unexcused Absences
            </Text>
            <IconCalendarTime size={18} color="#0D9488" />
          </Group>
          <Text size="xl" fw={800} c="#166534">
            0 Days
          </Text>
          <Text size="10px" c="#166534" mt={2}>
            100% attendance compliance rate
          </Text>
        </Paper>
      </SimpleGrid>

      {/* 30-Day Worked Hours Trend Smooth Area Chart */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" mb="md">
          <div>
            <Group gap="xs">
              <ThemeIcon size="md" color="blue" radius="md" variant="light">
                <IconTrendingUp size={18} />
              </ThemeIcon>
              <div>
                <Title order={4} size="sm" c="#09090B">
                  Worked Hours Trend (Last 30 Days)
                </Title>
                <Text size="xs" c="#71717A">
                  Continuous work time trend with daily 8.0-hour standard baseline.
                </Text>
              </div>
            </Group>
          </div>
          <Group gap="xs">
            <Badge size="xs" color="blue" variant="light">
              Target: 8.0h / day
            </Badge>
            <Button size="compact-xs" variant="subtle" color="blue" onClick={() => setBreakdownModalOpen(true)}>
              Full History
            </Button>
          </Group>
        </Group>

        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="h" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
                formatter={(val) => [`${val} hrs`, 'Worked Hours']}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#attendanceGradient)"
                dot={{ fill: '#2563EB', r: 3 }}
                activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* Daily Attendance History Table */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" mb="md">
          <Title order={4} size="sm" c="#09090B">
            Recent Daily Logs
          </Title>
          <Button size="compact-xs" variant="light" color="blue" onClick={() => setBreakdownModalOpen(true)}>
            View Complete Breakdown
          </Button>
        </Group>

        <Table highlightOnHover border={0}>
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Date</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Check-In</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Check-Out</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Worked Hours</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>Status</Table.Th>
              <Table.Th style={{ color: '#64748B', fontSize: '11px', textAlign: 'right' }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attendanceLogs.map((log, i) => (
              <Table.Tr key={i}>
                <Table.Td style={{ fontWeight: 600, fontSize: '13px', color: '#09090B' }}>{log.date}</Table.Td>
                <Table.Td style={{ fontSize: '12px', color: '#334155' }}>{log.checkIn}</Table.Td>
                <Table.Td style={{ fontSize: '12px', color: '#334155' }}>{log.checkOut}</Table.Td>
                <Table.Td style={{ fontWeight: 600, fontSize: '12px', color: '#09090B' }}>{log.workedHours}</Table.Td>
                <Table.Td>
                  <Badge
                    size="xs"
                    color={log.status === 'PRESENT' ? 'teal' : log.status === 'LATE' ? 'orange' : 'red'}
                    variant="light"
                  >
                    {log.status}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    color="blue"
                    onClick={() => {
                      setCorrectionDate(log.date);
                      setCorrectionModalOpen(true);
                    }}
                  >
                    Flag Issue
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* MODAL 1: Complete Work Breakdown Modal */}
      <Modal
        opened={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size="md" color="blue" radius="md">
              <IconCalendarStats size={18} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={800} c="#0F172A">
                Detailed Shift & Work Hours Breakdown
              </Text>
              <Text size="10px" c="#64748B">
                Day-by-day record of check-in, check-out, break times, and total net hours
              </Text>
            </div>
          </Group>
        }
        size="xl"
        radius="lg"
        centered
      >
        <Stack gap="md">
          {/* Summary Strip */}
          <SimpleGrid cols={3} spacing="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Text size="10px" c="#1E40AF" fw={700}>TOTAL WORKED</Text>
              <Text size="md" fw={900} c="#1D4ED8">{dynamicTotalWorkedHours} Hours</Text>
            </Paper>
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Text size="10px" c="#166534" fw={700}>AVG DAILY HOURS</Text>
              <Text size="md" fw={900} c="#15803D">8.1 Hours / Day</Text>
            </Paper>
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF' }}>
              <Text size="10px" c="#6B21A8" fw={700}>ATTENDANCE RATE</Text>
              <Text size="md" fw={900} c="#7E22CE">98.4% (21/22 Days)</Text>
            </Paper>
          </SimpleGrid>

          <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Date & Day</Table.Th>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Check-In</Table.Th>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Check-Out</Table.Th>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Break Time</Table.Th>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Net Worked</Table.Th>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Variance</Table.Th>
                <Table.Th style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B' }}>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {detailedBreakdown.map((row, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    <Text size="xs" fw={700} c="#0F172A">{row.date}</Text>
                    <Text size="10px" c="#64748B">{row.day}</Text>
                  </Table.Td>
                  <Table.Td><Text size="xs" c="#334155">{row.checkIn}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="#334155">{row.checkOut}</Text></Table.Td>
                  <Table.Td><Text size="xs" c="#64748B">{row.breakTime}</Text></Table.Td>
                  <Table.Td><Text size="xs" fw={700} c="#0F172A">{row.workedHours}</Text></Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={row.overtime.startsWith('+') ? 'teal' : row.overtime.startsWith('-') ? 'orange' : 'gray'} variant="light">
                      {row.overtime}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={row.status === 'PRESENT' ? 'teal' : 'orange'} variant="filled">
                      {row.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="flex-end" mt="xs">
            <Button size="xs" variant="default" onClick={() => setBreakdownModalOpen(false)}>
              Close Breakdown
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL 2: Attendance Correction Modal */}
      <Modal
        opened={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title="Request Attendance Correction"
        centered
        size="md"
      >
        <Stack gap="sm">
          <Text size="xs" c="#64748B">
            Flag missing check-out or wrong entry time. Submitted requests are sent directly to HR Manager for review.
          </Text>

          <TextInput
            label="Log Date"
            type="date"
            value={correctionDate}
            onChange={(e) => setCorrectionDate(e.currentTarget.value)}
          />

          <Group grow>
            <TextInput
              label="Correct Check-In Time"
              placeholder="e.g. 09:00 AM"
              value={correctCheckIn}
              onChange={(e) => setCorrectCheckIn(e.currentTarget.value)}
            />
            <TextInput
              label="Correct Check-Out Time"
              placeholder="e.g. 06:00 PM"
              value={correctCheckOut}
              onChange={(e) => setCorrectCheckOut(e.currentTarget.value)}
            />
          </Group>

          <Textarea
            label="Reason for Correction"
            placeholder="Explain why entry was missed or incorrect..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />

          <Group justify="end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setCorrectionModalOpen(false)}>
              Cancel
            </Button>
            <Button color="dark" onClick={handleSubmitCorrection}>
              Submit Request to HR
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};
