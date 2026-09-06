import React from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Progress,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Menu,
  Box,
} from '@mantine/core';
import {
  IconClockCheck,
  IconClockOff,
  IconSparkles,
  IconCoin,
  IconDotsVertical,
  IconPlayerPlay,
  IconPlayerStop,
  IconRotate,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useShiftAttendance } from '../hooks/useShiftAttendance';
import { OvertimePromptModal } from './OvertimePromptModal';

export const ActiveShiftCard = ({ employeeCode = 'EMP-8492', style = {} }) => {
  const {
    checkedIn,
    checkInTime,
    checkInDisplayStr,
    shiftCompleted,
    rawElapsedSec,
    regularShiftSec,
    isOvertimeActive,
    liveTodayOtSec,
    totalMonthOtSec,
    remainingOtSec,
    shiftPercent,
    overtimePercent,
    overtimeHours,
    remainingOtHours,
    overtimeEarnings,
    todayOtEarnings,
    hourlyRate,
    punching,
    overtimeModalOpen,
    setOvertimeModalOpen,
    startOvertime,
    stopOvertime,
    togglePunch,
    simulateShiftCompleted,
    resetMonthOvertime,
    formatTimer,
    formatHoursMinutes,
  } = useShiftAttendance(employeeCode);

  return (
    <>
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: isOvertimeActive ? '#FFFDF7' : '#F8FAFC',
          border: isOvertimeActive ? '1px solid #FDE68A' : '1px solid #E2E8F0',
          minWidth: '340px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          transition: 'all 0.3s ease',
          ...style,
        }}
      >
        {/* Top Header */}
        <Group justify="space-between" align="center" mb="xs">
          <Group gap="xs">
            <ThemeIcon
              size="sm"
              color={isOvertimeActive ? 'amber' : checkedIn ? 'teal' : 'gray'}
              variant="light"
              radius="xl"
            >
              {isOvertimeActive ? (
                <IconSparkles size={14} />
              ) : checkedIn ? (
                <IconClockCheck size={14} />
              ) : (
                <IconClockOff size={14} />
              )}
            </ThemeIcon>
            <Text size="xs" fw={700} c="#0F172A">
              {isOvertimeActive
                ? 'Active Overtime Shift'
                : checkedIn
                ? 'Active Work Shift'
                : 'Off Clock / On Break'}
            </Text>
          </Group>

          <Group gap={6}>
            <Badge
              size="xs"
              color={isOvertimeActive ? 'amber' : checkedIn ? 'teal' : 'gray'}
              variant="light"
            >
              {isOvertimeActive
                ? `⚡ OVERTIME (+₹${todayOtEarnings})`
                : checkedIn
                ? `Punched In at ${checkInDisplayStr}`
                : 'Not Checked In'}
            </Badge>

            {/* Quick Actions / Simulation Menu */}
            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <ActionIcon size="xs" variant="subtle" color="gray">
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Overtime Actions</Menu.Label>
                {!isOvertimeActive ? (
                  <Menu.Item
                    leftSection={<IconSparkles size={14} color="#D97706" />}
                    onClick={() => setOvertimeModalOpen(true)}
                  >
                    Request / Start Overtime
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    leftSection={<IconPlayerStop size={14} color="#DC2626" />}
                    onClick={stopOvertime}
                  >
                    Stop Overtime Session
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Label>Testing & Demo Tools</Menu.Label>
                <Menu.Item
                  leftSection={<IconPlayerPlay size={14} color="#059669" />}
                  onClick={simulateShiftCompleted}
                >
                  Simulate 8h Shift End
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconRotate size={14} color="#64748B" />}
                  onClick={resetMonthOvertime}
                >
                  Reset Month Overtime
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Timer & Punch Button Section */}
        <Group justify="space-between" align="center" my="xs">
          <div>
            <Text
              size="10px"
              c="#64748B"
              fw={700}
              style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              {isOvertimeActive ? "Today's Overtime Timer" : "Today's Shift Timer"}
            </Text>
            <Text
              size="xl"
              fw={800}
              c={isOvertimeActive ? '#D97706' : checkedIn ? '#059669' : '#64748B'}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {isOvertimeActive
                ? formatTimer(liveTodayOtSec)
                : checkedIn
                ? formatTimer(regularShiftSec)
                : '00 : 00 : 00'}
            </Text>
            {isOvertimeActive && (
              <Text size="9px" fw={600} c="#059669">
                Regular Shift: 08:00:00 ✓ (Completed)
              </Text>
            )}
          </div>

          <Button
            size="sm"
            color={checkedIn ? 'red' : 'teal'}
            variant="filled"
            loading={punching}
            leftSection={checkedIn ? <IconClockOff size={16} /> : <IconClockCheck size={16} />}
            onClick={togglePunch}
            style={{
              boxShadow: checkedIn
                ? '0 4px 12px rgba(239, 68, 68, 0.25)'
                : '0 4px 12px rgba(20, 184, 166, 0.25)',
              fontWeight: 700,
            }}
          >
            {checkedIn ? 'Web Punch Out' : 'Web Punch In'}
          </Button>
        </Group>

        {/* Progress Bars Section */}
        <Stack gap="xs" mt="xs">
          {/* 1. REGULAR SHIFT GOAL PROGRESS BAR */}
          <div>
            <Group justify="space-between" mb={2}>
              <Text size="10px" c="#64748B">
                Shift Goal: 8.0 Hrs (09:30 AM – 06:30 PM)
              </Text>
              <Text size="10px" fw={700} c="#0F172A">
                {shiftPercent}%
              </Text>
            </Group>
            <Progress
              value={shiftPercent}
              size="xs"
              color={shiftPercent >= 100 ? 'teal' : 'teal'}
              radius="xl"
              animated={checkedIn && !isOvertimeActive}
            />
          </div>

          {/* 2. OVERTIME PROGRESS BAR (Always visible as required) */}
          <Box
            p="xs"
            radius="sm"
            style={{
              backgroundColor: isOvertimeActive ? '#FEF3C7' : '#F1F5F9',
              borderRadius: '6px',
              border: isOvertimeActive ? '1px solid #FDE68A' : '1px solid #E2E8F0',
            }}
          >
            <Group justify="space-between" mb={2}>
              <Group gap={4}>
                <IconCoin size={12} color={isOvertimeActive ? '#D97706' : '#64748B'} />
                <Text size="10px" fw={700} c={isOvertimeActive ? '#92400E' : '#475569'}>
                  Overtime (Monthly Limit: 20.0 Hrs)
                </Text>
              </Group>
              <Text size="10px" fw={800} c={isOvertimeActive ? '#B45309' : '#0F172A'}>
                {overtimeHours > 0
                  ? `Remaining: ${remainingOtHours}h • ${overtimePercent}%`
                  : `Remaining: 20:00 Hours • 0%`}
              </Text>
            </Group>

            <Progress
              value={overtimePercent}
              size="xs"
              color="orange"
              radius="xl"
              animated={isOvertimeActive}
            />

            <Group justify="space-between" align="center" mt={4}>
              <Text size="9px" c={isOvertimeActive ? '#92400E' : '#64748B'}>
                Rate: <b>₹{hourlyRate.toFixed(2)}/hr</b> • Max 20h/month
              </Text>
              <Text size="9px" fw={700} c="#059669">
                Earned: ₹{overtimeEarnings}
              </Text>
            </Group>
          </Box>
        </Stack>
      </Paper>

      {/* Shift Completed Overtime Prompt Dialog */}
      <OvertimePromptModal
        opened={overtimeModalOpen}
        onClose={() => setOvertimeModalOpen(false)}
        onStartOvertime={startOvertime}
        onClockOut={togglePunch}
        remainingOtHours={remainingOtHours}
        hourlyRate={hourlyRate}
        currentOtPercent={overtimePercent}
      />
    </>
  );
};
