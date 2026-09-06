import React from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Paper,
  ThemeIcon,
  Divider,
  SimpleGrid,
  Box,
} from '@mantine/core';
import {
  IconClockCheck,
  IconSparkles,
  IconCoin,
  IconHourglass,
  IconShieldCheck,
  IconClockOff,
  IconTrendingUp,
} from '@tabler/icons-react';

export const OvertimePromptModal = ({
  opened,
  onClose,
  onStartOvertime,
  onClockOut,
  remainingOtHours = '20.0',
  hourlyRate = 781.25,
  currentOtPercent = 0,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="md" radius="md" color="amber" variant="light">
            <IconSparkles size={18} />
          </ThemeIcon>
          <Text fw={800} size="sm" c="#0F172A">
            Standard Shift Completed • Overtime Authorization
          </Text>
        </Group>
      }
      size="lg"
      centered
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        header: {
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '12px',
        },
        body: {
          paddingTop: '16px',
        },
      }}
    >
      <Stack gap="md">
        {/* Status Callout Banner */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
          }}
        >
          <Group justify="space-between" align="center" mb={6}>
            <Group gap="xs">
              <Badge color="amber" variant="filled" size="sm">
                8.0 HRS GOAL COMPLETED
              </Badge>
              <Text size="xs" fw={700} c="#92400E">
                Shift Target Reached
              </Text>
            </Group>
            <Badge color="teal" variant="light" size="xs">
              Active Session
            </Badge>
          </Group>
          <Text size="sm" c="#78350F" fw={500} lh={1.5}>
            Your scheduled 8.0-hour work shift for today has officially concluded. Since you are still active, would you like to transition into <b>Overtime (OT) Mode</b>?
          </Text>
        </Paper>

        {/* Policy & Compensation Breakdown Cards */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Group gap="xs" mb={4}>
              <ThemeIcon size="xs" color="teal" variant="light">
                <IconCoin size={12} />
              </ThemeIcon>
              <Text size="10px" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
                Compensation
              </Text>
            </Group>
            <Text size="sm" fw={800} c="#059669">
              ₹{hourlyRate.toFixed(2)} / hr
            </Text>
            <Text size="9px" c="#94A3B8">
              Added to payroll payout
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Group gap="xs" mb={4}>
              <ThemeIcon size="xs" color="indigo" variant="light">
                <IconHourglass size={12} />
              </ThemeIcon>
              <Text size="10px" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
                Monthly Quota
              </Text>
            </Group>
            <Text size="sm" fw={800} c="#4F46E5">
              20.0 Hours Max
            </Text>
            <Text size="9px" c="#94A3B8">
              Standard company policy
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Group gap="xs" mb={4}>
              <ThemeIcon size="xs" color="amber" variant="light">
                <IconTrendingUp size={12} />
              </ThemeIcon>
              <Text size="10px" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
                Remaining Quota
              </Text>
            </Group>
            <Text size="sm" fw={800} c="#D97706">
              {remainingOtHours}h Left
            </Text>
            <Text size="9px" c="#94A3B8">
              {currentOtPercent}% utilized this month
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Informational bullet points */}
        <Paper p="sm" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <Stack gap={4}>
            <Group gap="xs" align="flex-start">
              <ThemeIcon size="xs" color="teal" variant="light" mt={2}>
                <IconShieldCheck size={12} />
              </ThemeIcon>
              <Text size="xs" c="#166534">
                <b>Real-Time Tracking:</b> Overtime hours and earned compensation will be tracked live and preserved across logins.
              </Text>
            </Group>
            <Group gap="xs" align="flex-start">
              <ThemeIcon size="xs" color="teal" variant="light" mt={2}>
                <IconClockCheck size={12} />
              </ThemeIcon>
              <Text size="xs" c="#166534">
                <b>Flexible Punch Out:</b> You can punch out anytime to safely end your overtime session.
              </Text>
            </Group>
          </Stack>
        </Paper>

        <Divider />

        {/* Action Buttons */}
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            onClick={onClose}
          >
            Remind Me Later
          </Button>

          <Group gap="xs">
            <Button
              variant="outline"
              color="red"
              size="sm"
              leftSection={<IconClockOff size={16} />}
              onClick={() => {
                onClockOut();
                onClose();
              }}
            >
              Clock Out for Today
            </Button>
            <Button
              variant="filled"
              color="teal"
              size="sm"
              leftSection={<IconSparkles size={16} />}
              onClick={() => {
                onStartOvertime();
                onClose();
              }}
              style={{
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
              }}
            >
              Yes, Start Overtime Work
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
