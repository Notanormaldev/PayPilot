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
  Box,
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
import { ActiveShiftCard } from './ActiveShiftCard';
import { IconCalendarEvent } from '@tabler/icons-react';

export const EmployeeDashboardView = ({ onNavigate }) => {
  const { user } = useAuthUser();
  const userName = user?.name || 'Kartik Kumar';
  const userRole = user?.designation || 'Staff Product Manager';
  const userDept = user?.department || 'Product';
  const userEmpCode = 'EMP-8492'; // Formatted company employee identifier (replacing raw database cuid)

  // Dynamic Time-Based Greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning ☀️';
    if (hour >= 12 && hour < 17) return 'Good Afternoon 🌤️';
    if (hour >= 17 && hour < 22) return 'Good Evening 🌆';
    return 'Good Night 🌙';
  };

  // Holiday Calendar Modal State
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  // Dedicated Employee Tax Computation Modal State
  const [taxModalOpen, setTaxModalOpen] = useState(false);

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
        id: userEmpCode,
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

  return (
    <Stack gap="lg">
      {/* 1. HERO GREETING & ATTENDANCE WEB PUNCH CARD */}
      <Paper
        p="xl"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <div>
            <Group gap="xs" mb="xs">
              <Badge size="sm" color="teal" variant="light">
                EMPLOYEE WORKSPACE
              </Badge>
              <Badge size="sm" color="indigo" variant="light">
                {userEmpCode}
              </Badge>
            </Group>
            <Title order={2} c="#0F172A" fw={800}>
              Hey, {userName}! {getTimeGreeting()}
            </Title>
            <Text size="xs" c="#64748B" mt={4}>
              {userRole} • {userDept} Department • Standard 40h Work Week (Mon–Fri)
            </Text>
          </div>

          {/* Unified Active Shift & Overtime Card */}
          <ActiveShiftCard employeeCode={userEmpCode} />
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
              onClick={() => setTaxModalOpen(true)}
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

      {/* Personalized Employee Tax Computation & EPFO Modal */}
      <Modal
        opened={taxModalOpen}
        onClose={() => setTaxModalOpen(false)}
        size="lg"
        radius="lg"
        padding={0}
        withCloseButton={false}
        styles={{
          content: { borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' },
          body: { padding: 0 },
        }}
      >
        <Box p="lg" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="xs" mb={4}>
                <Badge size="sm" color="teal" variant="light">
                  FY 2026-27 (AY 2027-28)
                </Badge>
                <Badge size="sm" color="indigo" variant="light">
                  {userEmpCode}
                </Badge>
              </Group>
              <Title order={3} c="#0F172A">
                🇮🇳 {userName}'s Tax Computation
              </Title>
              <Text size="xs" c="#64748B" mt={2}>
                Personalized statutory tax assessment & monthly TDS calculation under Section 115BAC
              </Text>
            </div>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setTaxModalOpen(false)}
              size="lg"
              radius="xl"
            >
              ✕
            </ActionIcon>
          </Group>

          {/* Quick Stats */}
          <SimpleGrid cols={3} spacing="xs" mt="md">
            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <Text size="10px" fw={700} c="#64748B" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Annual Gross Salary
              </Text>
              <Text size="md" fw={800} c="#0F172A">
                ₹15,00,000
              </Text>
            </Paper>
            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
              }}
            >
              <Text size="10px" fw={700} c="#4F46E5" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Standard Deduction
              </Text>
              <Text size="md" fw={800} c="#4338CA">
                -₹75,000
              </Text>
            </Paper>
            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
              }}
            >
              <Text size="10px" fw={700} c="#059669" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Net Taxable Income
              </Text>
              <Text size="md" fw={800} c="#047857">
                ₹14,25,000
              </Text>
            </Paper>
          </SimpleGrid>
        </Box>

        <Box p="lg" style={{ backgroundColor: '#F8FAFC' }}>
          <Stack gap="md">
            {/* Step-by-Step Slab Breakdown Card */}
            <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" mb="xs">
                <Text size="xs" fw={700} c="#0F172A" style={{ textTransform: 'uppercase' }}>
                  New Tax Regime Slab Breakdown (u/s 115BAC)
                </Text>
                <Badge size="xs" color="indigo">FY 2026-27 Slabs</Badge>
              </Group>

              <Stack gap={6}>
                <Group justify="space-between" p="xs" style={{ backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <Text size="xs" c="#475569">₹0 to ₹4,00,000 (0% Rate)</Text>
                  <Text size="xs" fw={700} c="#0F172A">₹0</Text>
                </Group>
                <Group justify="space-between" p="xs" style={{ backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <Text size="xs" c="#475569">₹4,00,001 to ₹8,00,000 (5% on ₹4,00,000)</Text>
                  <Text size="xs" fw={700} c="#0F172A">₹20,000</Text>
                </Group>
                <Group justify="space-between" p="xs" style={{ backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <Text size="xs" c="#475569">₹8,00,001 to ₹12,00,000 (10% on ₹4,00,000)</Text>
                  <Text size="xs" fw={700} c="#0F172A">₹40,000</Text>
                </Group>
                <Group justify="space-between" p="xs" style={{ backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <Text size="xs" c="#475569">₹12,00,001 to ₹14,25,000 (15% on ₹2,25,000)</Text>
                  <Text size="xs" fw={700} c="#0F172A">₹33,750</Text>
                </Group>

                <Divider my={4} />

                <Group justify="space-between">
                  <Text size="xs" fw={700} c="#0F172A">Total Slab Base Tax</Text>
                  <Text size="xs" fw={800} c="#0F172A">₹93,750</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="#64748B">Health & Education Cess (4%)</Text>
                  <Text size="xs" fw={700} c="#64748B">₹3,750</Text>
                </Group>
                <Group justify="space-between" p="xs" style={{ backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                  <div>
                    <Text size="xs" fw={800} c="#1E40AF">Total Annual Tax Liability</Text>
                    <Text size="10px" c="#3B82F6">Monthly Salary TDS: ₹8,125 / month</Text>
                  </div>
                  <Text size="lg" fw={900} c="#1D4ED8">₹97,500</Text>
                </Group>
              </Stack>
            </Paper>

            {/* EPFO & Statutory Pension Card */}
            <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" mb="xs">
                <Text size="xs" fw={700} c="#0F172A" style={{ textTransform: 'uppercase' }}>
                  EPFO Monthly Contributions & Pension
                </Text>
                <Badge size="xs" color="teal">UAN: 101849204918</Badge>
              </Group>

              <SimpleGrid cols={2} spacing="xs">
                <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <Text size="10px" c="#166534">Employee EPF (12%)</Text>
                  <Text size="sm" fw={800} c="#15803D">₹4,800 / mo</Text>
                  <Text size="9px" c="#166534">Credited to Provident Fund (A/c 1)</Text>
                </Paper>
                <Paper p="xs" radius="sm" style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF' }}>
                  <Text size="10px" c="#6B21A8">Employer Share (EPF + EPS Split)</Text>
                  <Text size="sm" fw={800} c="#7E22CE">₹3,550 (EPF) + ₹1,250 (EPS)</Text>
                  <Text size="9px" c="#7E22CE">Age 58 Pension Cutoff: Active</Text>
                </Paper>
              </SimpleGrid>
            </Paper>

            <Group justify="flex-end" gap="xs">
              <Button size="xs" variant="default" onClick={() => setTaxModalOpen(false)}>
                Close Statement
              </Button>
              <Button
                size="xs"
                color="indigo"
                leftSection={<IconDownload size={14} />}
                onClick={() => {
                  alert('Tax Computation Statement (FY 2026-27) exported to PDF.');
                }}
              >
                Download Statement (PDF)
              </Button>
            </Group>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
};
