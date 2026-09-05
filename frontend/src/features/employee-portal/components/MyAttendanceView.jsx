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
} from '@mantine/core';
import {
  IconClock,
  IconCalendarTime,
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconClockCheck,
  IconClockOff,
} from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const MyAttendanceView = () => {
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionDate, setCorrectionDate] = useState('2026-09-04');
  const [correctCheckIn, setCorrectCheckIn] = useState('09:00 AM');
  const [correctCheckOut, setCorrectCheckOut] = useState('06:00 PM');
  const [reason, setReason] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(null);

  // Shift Punch State with Local Storage Persistence
  const [checkedIn, setCheckedIn] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_checked_in');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [checkInTime, setCheckInTime] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_start');
    return saved ? parseInt(saved, 10) : Date.now() - (2 * 3600 + 22 * 60 + 53) * 1000;
  });

  const [shiftCompleted, setShiftCompleted] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_today_completed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [elapsedSec, setElapsedSec] = useState(0);

  // Shift Target: 8 hours = 28,800 seconds
  const TARGET_SECONDS = 8 * 3600;

  // Attendance History List
  const [attendanceLogs, setAttendanceLogs] = useState([
    { date: 'Sep 04, 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', workedHours: '8.0 hrs', status: 'PRESENT' },
    { date: 'Sep 03, 2026', checkIn: '09:28 AM', checkOut: '06:00 PM', workedHours: '7.5 hrs', status: 'LATE' },
    { date: 'Sep 02, 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', workedHours: '8.0 hrs', status: 'PRESENT' },
    { date: 'Sep 01, 2026', checkIn: '09:02 AM', checkOut: '06:10 PM', workedHours: '8.1 hrs', status: 'PRESENT' },
    { date: 'Aug 29, 2026', checkIn: '09:00 AM', checkOut: '06:00 PM', workedHours: '8.0 hrs', status: 'PRESENT' },
    { date: 'Aug 28, 2026', checkIn: '09:18 AM', checkOut: '06:00 PM', workedHours: '7.7 hrs', status: 'LATE' },
  ]);

  // Live timer loop
  useEffect(() => {
    let interval = null;
    if (checkedIn && checkInTime) {
      const updateClock = () => {
        const diff = Math.max(0, Math.floor((Date.now() - checkInTime) / 1000));
        setElapsedSec(diff);
      };
      updateClock();
      interval = setInterval(updateClock, 1000);
    } else {
      setElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkedIn, checkInTime]);

  const handleToggleCheckIn = () => {
    const now = Date.now();
    if (!checkedIn) {
      // Check In
      setCheckedIn(true);
      setCheckInTime(now);
      setShiftCompleted(false);
      localStorage.setItem('paypilot_shift_checked_in', 'true');
      localStorage.setItem('paypilot_shift_start', now.toString());
      localStorage.setItem('paypilot_shift_today_completed', 'false');
    } else {
      // Check Out - complete shift and move to Recent Daily Logs
      const workedHrsVal = (elapsedSec / 3600).toFixed(1);
      const checkInStr = new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const checkOutStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      const newLog = {
        date: todayStr,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        workedHours: `${workedHrsVal} hrs`,
        status: parseFloat(workedHrsVal) >= 7.5 ? 'PRESENT' : 'HALF_DAY',
      };

      setAttendanceLogs([newLog, ...attendanceLogs]);
      setCheckedIn(false);
      setShiftCompleted(true);
      localStorage.setItem('paypilot_shift_checked_in', 'false');
      localStorage.setItem('paypilot_shift_today_completed', 'true');
      localStorage.removeItem('paypilot_shift_start');
    }
  };

  const formatHours = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  };

  const remainingSec = Math.max(0, TARGET_SECONDS - elapsedSec);
  const remainingHrs = Math.floor(remainingSec / 3600);
  const remainingMins = Math.floor((remainingSec % 3600) / 60);

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

          <Button
            color="dark"
            leftSection={<IconEdit size={16} />}
            onClick={() => setCorrectionModalOpen(true)}
          >
            Request Correction
          </Button>
        </Group>
      </Paper>

      {/* TODAY'S LOG & LIVE SHIFT PUNCH CARD */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Group justify="space-between" align="center" mb="sm">
          <Group gap="xs">
            <Text fw={800} size="sm" c="#09090B">
              TODAY'S SHIFT LOG ({todayFormattedDate})
            </Text>
            <Badge
              size="xs"
              color={checkedIn ? 'teal' : shiftCompleted ? 'blue' : 'gray'}
              variant="filled"
            >
              {checkedIn ? 'ACTIVE SHIFT IN PROGRESS' : shiftCompleted ? 'SHIFT COMPLETED' : 'NOT CHECKED IN'}
            </Badge>
          </Group>
          <Text size="xs" c="#71717A">
            Standard Daily Target: <b>08h 00m</b>
          </Text>
        </Group>

        {/* Live Work Time Dark Card */}
        <Box
          p="md"
          style={{
            backgroundColor: '#09090B',
            borderRadius: '12px',
            color: '#FFFFFF',
          }}
        >
          <Group justify="space-between" align="center" mb="xs">
            <Text size="11px" fw={700} c="#94A3B8" style={{ letterSpacing: '1px' }}>
              LIVE WORKED TIME
            </Text>
            <Group gap="xs">
              <Text size="11px" c="#CBD5E1">
                Check-In:{' '}
                <b>
                  {checkInTime && checkedIn
                    ? new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '09:23 PM'}
                </b>
              </Text>
              <Text size="11px" c="#F59E0B" fw={700}>
                Remaining: {remainingHrs}h {remainingMins}m
              </Text>
            </Group>
          </Group>

          {/* Big Digital Clock */}
          <Text
            size="36px"
            fw={900}
            c="#F59E0B"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              textAlign: 'center',
              letterSpacing: '2px',
              padding: '8px 0',
            }}
          >
            {checkedIn ? formatHours(elapsedSec) : '00 : 00 : 00'}
          </Text>

          {/* Action Button */}
          <Button
            fullWidth
            size="md"
            color={checkedIn ? 'orange' : 'teal'}
            leftSection={checkedIn ? <IconClockOff size={18} /> : <IconClockCheck size={18} />}
            onClick={handleToggleCheckIn}
            style={{
              fontWeight: 800,
              fontSize: '14px',
              borderRadius: '8px',
            }}
          >
            {checkedIn ? 'Check Out of Shift' : 'Check In to Shift'}
          </Button>
        </Box>
      </Paper>

      {submittedMessage && (
        <Alert icon={<IconCheck size={16} />} color="teal" title="Correction Request Sent" withCloseButton onClose={() => setSubmittedMessage(null)}>
          {submittedMessage}
        </Alert>
      )}

      {/* Monthly Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
              Total Worked Hours
            </Text>
            <IconClock size={18} color="#2563EB" />
          </Group>
          <Text size="xl" fw={800} c="#09090B">
            168.5 hrs
          </Text>
          <Text size="10px" c="#166534" mt={2}>
            Target: 160 hrs • 105% of monthly quota
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

      {/* 30-Day Worked Hours Trend Bar Chart */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4} size="sm" c="#09090B">
              Worked Hours Trend (Last 30 Days)
            </Title>
            <Text size="xs" c="#71717A">
              Daily recorded work hours compared to standard 8-hour target baseline.
            </Text>
          </div>
          <Badge size="xs" color="blue" variant="light">
            Target: 8.0h / day
          </Badge>
        </Group>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090B', color: '#FFFFFF', borderRadius: '6px', fontSize: '12px' }}
                formatter={(val) => [`${val} hrs`, 'Worked Hours']}
              />
              <Bar dataKey="hours" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* Daily Attendance History Table */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Title order={4} size="sm" c="#09090B" mb="md">
          Recent Daily Logs
        </Title>

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

      {/* Attendance Correction Modal */}
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
