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
  Progress,
  ThemeIcon,
  Divider,
  Modal,
  TextInput,
  Textarea,
  Select,
  Alert,
  Tooltip,
  RingProgress,
  ActionIcon,
  Avatar,
} from '@mantine/core';
import {
  IconDashboard,
  IconClock,
  IconClockCheck,
  IconClockOff,
  IconReceipt2,
  IconCalendarTime,
  IconReceiptTax,
  IconFileText,
  IconDownload,
  IconArrowRight,
  IconCheck,
  IconAlertTriangle,
  IconSparkles,
  IconConfetti,
  IconBell,
  IconChevronRight,
  IconPlus,
  IconUser,
  IconCalendar,
  IconHeartHandshake,
  IconCake,
  IconBriefcase,
  IconShieldCheck,
  IconBuildingBank,
} from '@tabler/icons-react';

import { useAuthUser } from '../../auth/hooks/useAuthUser';
import { attendanceService } from '../../attendance/services/attendanceService';
import { generatePayslipPdf } from '../../../lib/payslipPdfGenerator';
import { HolidayCalendarModal } from './HolidayCalendarModal';
import { getUpcomingIndianHolidays, getHolidayCountdown } from '../data/indianHolidays2026';
import { IconCalendarEvent } from '@tabler/icons-react';

export const EmployeeDashboardView = ({ onNavigate }) => {
  const { user } = useAuthUser();
  const userName = user?.name || 'Kartik Kumar';
  const userRole = user?.designation || 'Staff Product Manager';
  const userDept = user?.department || 'Product';
  const userEmpId = user?.id || 'EMP-8492';

  // Holiday Calendar Modal State
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  // Live Shift Attendance State (Synchronized with localStorage)
  const [checkedIn, setCheckedIn] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_checked_in');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [checkInTime, setCheckInTime] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_start');
    return saved ? parseInt(saved, 10) : Date.now() - (3 * 3600 + 44 * 60 + 20) * 1000;
  });

  const [elapsedSec, setElapsedSec] = useState(0);
  const [punching, setPunching] = useState(false);

  // Modals on Dashboard
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);
  const [regularizeReason, setRegularizeReason] = useState('');
  const [regularizeSubmitted, setRegularizeSubmitted] = useState(false);

  // Live stopwatch loop
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

  const handleTogglePunch = async () => {
    setPunching(true);
    const newCheckedIn = !checkedIn;
    const now = Date.now();

    try {
      await attendanceService.recordPunch(userEmpId, newCheckedIn ? 'CHECK_IN' : 'CHECK_OUT');
    } catch (e) {
      console.warn('Punch recording fallback:', e.message);
    } finally {
      setPunching(false);
    }

    setCheckedIn(newCheckedIn);
    localStorage.setItem('paypilot_shift_checked_in', JSON.stringify(newCheckedIn));

    if (newCheckedIn) {
      setCheckInTime(now);
      localStorage.setItem('paypilot_shift_start', now.toString());
    } else {
      localStorage.removeItem('paypilot_shift_start');
    }
  };

  const formatTimer = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  };

  const checkInDisplayStr = checkInTime && checkedIn
    ? new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '09:28 AM';

  const handleDownloadLatestPayslip = () => {
    generatePayslipPdf(
      {
        month: 'August 2026',
        date: '31-Aug-2026',
        id: 'PS-2026-08',
        gross: 125000,
        deductions: 18958,
        net: 106042,
      },
      {
        name: userName,
        id: userEmpId,
        department: userDept,
        designation: userRole,
      }
    );
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveModalOpen(false);
      setLeaveSubmitted(false);
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
    }, 1500);
  };

  const handleRegularizeSubmit = (e) => {
    e.preventDefault();
    setRegularizeSubmitted(true);
    setTimeout(() => {
      setRegularizeModalOpen(false);
      setRegularizeSubmitted(false);
      setRegularizeReason('');
    }, 1500);
  };

  // Shift target progress (8 hours = 28,800 sec)
  const shiftPercent = Math.min(100, Math.round((elapsedSec / (8 * 3600)) * 100));

  return (
    <Stack gap="lg">
      {/* 1. HERO GREETING & ATTENDANCE WEB PUNCH CARD */}
      <Paper
        p="xl"
        radius="md"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <div>
            <Group gap="xs" mb={4}>
              <Badge size="sm" color="teal" variant="filled">
                EMPLOYEE WORKSPACE
              </Badge>
              <Badge size="sm" color="indigo" variant="light">
                {userEmpId}
              </Badge>
            </Group>
            <Title order={2} c="#FFFFFF">
              Welcome back, {userName}! 👋
            </Title>
            <Text size="xs" c="#94A3B8" mt={4}>
              {userRole} • {userDept} Department • Standard 40h Work Week (Mon–Fri)
            </Text>
            <Group gap="xs" mt="sm">
              <Button
                size="xs"
                variant="light"
                color="indigo"
                leftSection={<IconCalendarEvent size={14} />}
                onClick={() => setHolidayModalOpen(true)}
                styles={{
                  root: {
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    color: '#C7D2FE',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.35)' },
                  },
                }}
              >
                2026 Indian Holiday Calendar
              </Button>
            </Group>
          </div>

          {/* Web Punch Live Shift Box */}
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              minWidth: '320px',
            }}
          >
            <Group justify="space-between" align="center" mb="xs">
              <Group gap="xs">
                <ThemeIcon size="sm" color={checkedIn ? 'teal' : 'gray'} radius="xl">
                  {checkedIn ? <IconClockCheck size={14} /> : <IconClockOff size={14} />}
                </ThemeIcon>
                <Text size="xs" fw={700} c="#FFFFFF">
                  {checkedIn ? 'Active Work Shift' : 'Off Clock / On Break'}
                </Text>
              </Group>
              <Badge size="xs" color={checkedIn ? 'teal' : 'gray'}>
                {checkedIn ? `Punched In at ${checkInDisplayStr}` : 'Not Checked In'}
              </Badge>
            </Group>

            <Group justify="space-between" align="center" my="xs">
              <div>
                <Text size="10px" c="#94A3B8" style={{ textTransform: 'uppercase' }}>
                  Today's Shift Timer
                </Text>
                <Text size="xl" fw={800} c={checkedIn ? '#4ADE80' : '#94A3B8'} style={{ fontFamily: 'monospace' }}>
                  {formatTimer(elapsedSec)}
                </Text>
              </div>

              <Button
                size="sm"
                color={checkedIn ? 'red' : 'teal'}
                variant="filled"
                loading={punching}
                leftSection={checkedIn ? <IconClockOff size={16} /> : <IconClockCheck size={16} />}
                onClick={handleTogglePunch}
                style={{
                  boxShadow: checkedIn
                    ? '0 4px 12px rgba(239, 68, 68, 0.35)'
                    : '0 4px 12px rgba(20, 184, 166, 0.35)',
                }}
              >
                {checkedIn ? 'Web Punch Out' : 'Web Punch In'}
              </Button>
            </Group>

            {/* Today's Shift Progress Meter */}
            <div>
              <Group justify="space-between" mb={2}>
                <Text size="10px" c="#94A3B8">
                  Shift Goal: 8.0 Hrs (09:30 AM – 06:30 PM)
                </Text>
                <Text size="10px" fw={700} c="#FFFFFF">
                  {shiftPercent}%
                </Text>
              </Group>
              <Progress value={shiftPercent} size="xs" color="teal" radius="xl" animated={checkedIn} />
            </div>
          </Paper>
        </Group>
      </Paper>

      {/* 2. CORE 3-CARD INTERACTIVE ESS GRID */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {/* CARD 1: Compensation & Next Payday */}
        <Paper
          p="lg"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <ThemeIcon size="md" radius="md" color="blue" variant="light">
                <IconReceipt2 size={18} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={700} c="#0F172A" style={{ textTransform: 'uppercase' }}>
                  Compensation & Payday
                </Text>
                <Text size="10px" c="#64748B">
                  Monthly Net Take-Home
                </Text>
              </div>
            </Group>
            <Badge size="xs" color="blue" variant="light">
              Monthly Cycle
            </Badge>
          </Group>

          <Stack gap="xs" my="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="10px" c="#166534">
                    Last Disbursed Salary (August 2026)
                  </Text>
                  <Text size="lg" fw={800} c="#15803D">
                    ₹1,06,042
                  </Text>
                </div>
                <Badge size="xs" color="teal" variant="filled">
                  ✓ Bank Disbursed
                </Badge>
              </Group>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="10px" c="#1E40AF">
                    Next Payday: Sep 30, 2026
                  </Text>
                  <Text size="xs" fw={700} c="#1D4ED8">
                    ⏳ 18 Days to next payout
                  </Text>
                </div>
                <Text size="10px" c="#64748B">
                  Direct Deposit
                </Text>
              </Group>
            </Paper>
          </Stack>

          <Group grow gap="xs" mt="md">
            <Button
              size="xs"
              color="blue"
              variant="light"
              leftSection={<IconDownload size={14} />}
              onClick={handleDownloadLatestPayslip}
            >
              Latest Payslip (PDF)
            </Button>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              rightSection={<IconChevronRight size={14} />}
              onClick={() => onNavigate && onNavigate('my-payslips')}
            >
              All Payslips
            </Button>
          </Group>
        </Paper>

        {/* CARD 2: Leave Balances & Quick Request */}
        <Paper
          p="lg"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <ThemeIcon size="md" radius="md" color="teal" variant="light">
                <IconCalendarTime size={18} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={700} c="#0F172A" style={{ textTransform: 'uppercase' }}>
                  My Leave Balances
                </Text>
                <Text size="10px" c="#64748B">
                  Annual Allotment (2026)
                </Text>
              </div>
            </Group>
            <Badge size="xs" color="teal" variant="light">
              28 Days Total
            </Badge>
          </Group>

          <Stack gap="xs" my="xs">
            {/* Privilege Leave */}
            <div>
              <Group justify="space-between" mb={2}>
                <Text size="11px" c="#475569">
                  Earned / Privilege Leave (PL)
                </Text>
                <Text size="11px" fw={700} c="#0F172A">
                  10 / 15 Days
                </Text>
              </Group>
              <Progress value={66.6} size="xs" color="indigo" radius="xl" />
            </div>

            {/* Casual Leave */}
            <div>
              <Group justify="space-between" mb={2}>
                <Text size="11px" c="#475569">
                  Casual Leave (CL)
                </Text>
                <Text size="11px" fw={700} c="#0F172A">
                  9 / 12 Days
                </Text>
              </Group>
              <Progress value={75} size="xs" color="blue" radius="xl" />
            </div>

            {/* Sick Leave */}
            <div>
              <Group justify="space-between" mb={2}>
                <Text size="11px" c="#475569">
                  Sick Leave (SL)
                </Text>
                <Text size="11px" fw={700} c="#0F172A">
                  9 / 10 Days
                </Text>
              </Group>
              <Progress value={90} size="xs" color="teal" radius="xl" />
            </div>
          </Stack>

          <Group grow gap="xs" mt="md">
            <Button
              size="xs"
              color="teal"
              variant="filled"
              leftSection={<IconPlus size={14} />}
              onClick={() => setLeaveModalOpen(true)}
            >
              Request Time Off
            </Button>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              rightSection={<IconChevronRight size={14} />}
              onClick={() => onNavigate && onNavigate('my-time-off')}
            >
              Leave History
            </Button>
          </Group>
        </Paper>

        {/* CARD 3: Tax & Statutory Intelligence */}
        <Paper
          p="lg"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Group justify="space-between" align="center" mb="sm">
            <Group gap="xs">
              <ThemeIcon size="md" radius="md" color="indigo" variant="light">
                <IconReceiptTax size={18} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={700} c="#0F172A" style={{ textTransform: 'uppercase' }}>
                  Tax & EPFO Status
                </Text>
                <Text size="10px" c="#64748B">
                  FY 2026-27 Reforms
                </Text>
              </div>
            </Group>
            <Badge size="xs" color="teal" variant="filled">
              🎉 100% Tax Free
            </Badge>
          </Group>

          <Stack gap="xs" my="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="10px" c="#64748B">
                    Active Tax Regime
                  </Text>
                  <Text size="xs" fw={700} c="#0F172A">
                    New Regime (u/s 115BAC)
                  </Text>
                </div>
                <Badge size="xs" color="indigo">
                  Std Ded: ₹75,000
                </Badge>
              </Group>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="10px" c="#64748B">
                    EPFO Universal A/c (UAN)
                  </Text>
                  <Text size="xs" fw={700} c="#0F172A">
                    101849204918 (₹4,800/mo)
                  </Text>
                </div>
                <Badge size="xs" color="teal" variant="light">
                  Active
                </Badge>
              </Group>
            </Paper>
          </Stack>

          <Group grow gap="xs" mt="md">
            <Button
              size="xs"
              color="indigo"
              variant="light"
              leftSection={<IconReceiptTax size={14} />}
              onClick={() => onNavigate && onNavigate('my-taxes')}
            >
              My Tax Computation
            </Button>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              onClick={() => onNavigate && onNavigate('my-contract')}
            >
              My Contract
            </Button>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* 3. BOTTOM SECTION: ACTION CENTER & COMPANY PULSE */}
      <SimpleGrid cols={{ base: 1, md: 12 }} spacing="lg">
        {/* LEFT 7 COLS: Action Center & Pending To-Dos */}
        <div style={{ gridColumn: 'span 7' }}>
          <Paper
            p="lg"
            radius="md"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Group justify="space-between" align="center" mb="md">
              <Group gap="xs">
                <ThemeIcon size="md" radius="md" color="orange" variant="light">
                  <IconAlertTriangle size={18} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={700} c="#0F172A">
                    Action Center & Pending Items
                  </Text>
                  <Text size="11px" c="#64748B">
                    Action required to keep your employee record and compliance up to date
                  </Text>
                </div>
              </Group>
              <Badge size="sm" color="orange" variant="light">
                2 Pending
              </Badge>
            </Group>

            <Stack gap="xs">
              {/* Item 1: Attendance Regularization */}
              <Paper p="sm" radius="sm" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <ThemeIcon size="md" color="orange" radius="xl">
                      <IconClock size={16} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={700} c="#92400E">
                        Attendance Regularization Required
                      </Text>
                      <Text size="11px" c="#B45309">
                        Missing punch-out recorded on August 28, 2026. Submit regularization reason to manager.
                      </Text>
                    </div>
                  </Group>
                  <Button
                    size="xs"
                    color="orange"
                    variant="filled"
                    onClick={() => setRegularizeModalOpen(true)}
                  >
                    Regularize Punch
                  </Button>
                </Group>
              </Paper>

              {/* Item 2: Tax Declaration */}
              <Paper p="sm" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <ThemeIcon size="md" color="teal" radius="xl">
                      <IconShieldCheck size={16} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={700} c="#166534">
                        FY 2026-27 Chapter VI-A Investment Declarations
                      </Text>
                      <Text size="11px" c="#15803D">
                        Submission portal is open. Declare NPS, Insurance, and HRA proofs before Dec 31.
                      </Text>
                    </div>
                  </Group>
                  <Button
                    size="xs"
                    color="teal"
                    variant="light"
                    onClick={() => onNavigate && onNavigate('my-taxes')}
                  >
                    Declare Now
                  </Button>
                </Group>
              </Paper>

              {/* Item 3: Completed Handbook Acknowledgement */}
              <Paper p="sm" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <ThemeIcon size="md" color="gray" radius="xl" variant="light">
                      <IconCheck size={16} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={600} c="#334155">
                        Employee Code of Conduct & Remote Work Policy
                      </Text>
                      <Text size="11px" c="#64748B">
                        Acknowledged and digitally signed on August 15, 2026.
                      </Text>
                    </div>
                  </Group>
                  <Badge size="xs" color="gray">
                    ✓ Completed
                  </Badge>
                </Group>
              </Paper>
            </Stack>
          </Paper>
        </div>

        {/* RIGHT 5 COLS: Company Announcements & Culture Pulse */}
        <div style={{ gridColumn: 'span 5' }}>
          <Paper
            p="lg"
            radius="md"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Group justify="space-between" align="center" mb="md">
              <Group gap="xs">
                <ThemeIcon size="md" radius="md" color="grape" variant="light">
                  <IconConfetti size={18} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={700} c="#0F172A">
                    Holidays & Company Pulse
                  </Text>
                  <Text size="11px" c="#64748B">
                    Upcoming events, team celebrations & notices
                  </Text>
                </div>
              </Group>
              <Button
                size="compact-xs"
                variant="light"
                color="indigo"
                leftSection={<IconCalendarEvent size={12} />}
                onClick={() => setHolidayModalOpen(true)}
              >
                Calendar
              </Button>
            </Group>

            <Stack gap="xs">
              {/* Dynamic Upcoming Indian Holidays */}
              {getUpcomingIndianHolidays('2026-09-06', 2).map((hol) => (
                <Paper
                  key={hol.id}
                  p="xs"
                  radius="sm"
                  style={{
                    backgroundColor: hol.type === 'GAZETTED' ? '#FAF5FF' : '#FFF7ED',
                    border: hol.type === 'GAZETTED' ? '1px solid #E9D5FF' : '1px solid #FED7AA',
                    cursor: 'pointer',
                  }}
                  onClick={() => setHolidayModalOpen(true)}
                >
                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color={hol.type === 'GAZETTED' ? 'grape' : 'orange'} radius="xl">
                        <IconCalendar size={14} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" fw={700} c={hol.type === 'GAZETTED' ? '#6B21A8' : '#C2410C'}>
                          {hol.date.split('-')[1]}/{hol.date.split('-')[2]}: {hol.name}
                        </Text>
                        <Text size="10px" c={hol.type === 'GAZETTED' ? '#7E22CE' : '#9A3412'}>
                          {hol.day} • {hol.type === 'GAZETTED' ? 'Gazetted Public Holiday' : 'Restricted Holiday (RH)'}
                          {hol.isLongWeekend && ' (🌴 3-Day Weekend)'}
                        </Text>
                      </div>
                    </Group>
                    <Badge size="xs" color={hol.type === 'GAZETTED' ? 'grape' : 'orange'}>
                      {getHolidayCountdown(hol.date)}
                    </Badge>
                  </Group>
                </Paper>
              ))}

              {/* Peer Birthday */}
              <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFF1F2', border: '1px solid #FECDD3' }}>
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="pink" radius="xl">
                      <IconCake size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={700} c="#9F1239">
                        Aarti Sharma's Birthday 🎉
                      </Text>
                      <Text size="10px" c="#BE123C">
                        Tomorrow (Sep 07) • Lead Frontend Engineer
                      </Text>
                    </div>
                  </Group>
                  <Badge size="xs" color="pink">
                    Tomorrow
                  </Badge>
                </Group>
              </Paper>

              {/* Company Notice */}
              <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Group gap="xs">
                  <ThemeIcon size="sm" color="blue" radius="xl">
                    <IconBell size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" fw={700} c="#0F172A">
                      Q3 All-Hands Town Hall
                    </Text>
                    <Text size="10px" c="#64748B">
                      Friday, Sep 11 at 4:00 PM IST • Executive updates & AMA
                    </Text>
                  </div>
                </Group>
              </Paper>

              {/* Full Holiday Calendar Trigger Button */}
              <Button
                fullWidth
                size="xs"
                variant="light"
                color="indigo"
                mt={4}
                leftSection={<IconCalendarEvent size={14} />}
                onClick={() => setHolidayModalOpen(true)}
              >
                View Full 2026 Indian Holiday Calendar
              </Button>
            </Stack>
          </Paper>
        </div>
      </SimpleGrid>

      {/* MODAL: Leave Request */}
      <Modal
        opened={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size="sm" color="teal" radius="md">
              <IconPlus size={14} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="#0F172A">
              Submit Leave / Time Off Request
            </Text>
          </Group>
        }
        centered
        radius="md"
      >
        <form onSubmit={handleApplyLeave}>
          <Stack gap="sm">
            {leaveSubmitted && (
              <Alert color="teal" icon={<IconCheck size={16} />}>
                Leave request submitted successfully! Forwarded to manager for approval.
              </Alert>
            )}

            <Select
              label="Leave Type"
              size="xs"
              value={leaveType}
              onChange={setLeaveType}
              data={[
                'Casual Leave (9 Days Left)',
                'Sick Leave (9 Days Left)',
                'Earned / Paid Leave (10 Days Left)',
                'Restricted / Optional Holiday (RH) (2 Days Left)',
              ]}
              required
            />

            <SimpleGrid cols={2} spacing="xs">
              <TextInput
                label="Start Date"
                type="date"
                size="xs"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                required
              />
              <TextInput
                label="End Date"
                type="date"
                size="xs"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                required
              />
            </SimpleGrid>

            <Textarea
              label="Reason for Leave"
              size="xs"
              placeholder="e.g. Personal family engagement or travel"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              minRows={2}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button size="xs" variant="default" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button size="xs" color="teal" type="submit" loading={leaveSubmitted}>
                Submit Request
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* MODAL: Attendance Regularization */}
      <Modal
        opened={regularizeModalOpen}
        onClose={() => setRegularizeModalOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size="sm" color="orange" radius="md">
              <IconClock size={14} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="#0F172A">
              Regularize Attendance for August 28, 2026
            </Text>
          </Group>
        }
        centered
        radius="md"
      >
        <form onSubmit={handleRegularizeSubmit}>
          <Stack gap="sm">
            {regularizeSubmitted && (
              <Alert color="teal" icon={<IconCheck size={16} />}>
                Regularization request submitted to your reporting manager (Meera Krishnan).
              </Alert>
            )}

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <Text size="xs" fw={600} c="#92400E">
                Date: August 28, 2026
              </Text>
              <Text size="11px" c="#B45309">
                Recorded: Check-in at 09:18 AM • Missing Check-out
              </Text>
            </Paper>

            <SimpleGrid cols={2} spacing="xs">
              <TextInput label="Actual Check-In" size="xs" defaultValue="09:18 AM" required />
              <TextInput label="Actual Check-Out" size="xs" defaultValue="06:15 PM" required />
            </SimpleGrid>

            <Textarea
              label="Reason for Regularization"
              size="xs"
              placeholder="e.g. Left office for client meeting / biometric reader offline"
              value={regularizeReason}
              onChange={(e) => setRegularizeReason(e.target.value)}
              minRows={2}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button size="xs" variant="default" onClick={() => setRegularizeModalOpen(false)}>
                Cancel
              </Button>
              <Button size="xs" color="orange" type="submit" loading={regularizeSubmitted}>
                Submit Regularization
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* 2026 Indian Holiday & Festival Calendar Modal */}
      <HolidayCalendarModal
        opened={holidayModalOpen}
        onClose={() => setHolidayModalOpen(false)}
        onApplyRhLeave={(rhData) => {
          setLeaveType('Restricted / Optional Holiday (RH) (2 Days Left)');
          setLeaveStartDate(rhData.date);
          setLeaveEndDate(rhData.date);
          setLeaveReason(`Restricted Holiday (RH): ${rhData.name}`);
          setLeaveModalOpen(true);
        }}
      />
    </Stack>
  );
};
