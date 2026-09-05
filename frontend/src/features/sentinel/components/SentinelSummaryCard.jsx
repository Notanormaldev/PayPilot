import React from 'react';
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  Grid,
  ThemeIcon,
  Box,
} from '@mantine/core';
import {
  IconShieldCheck,
  IconShieldExclamation,
  IconChevronRight,
  IconSparkles,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';

export const SentinelSummaryCard = ({ flags = [], onOpenSentinel }) => {
  const openFlagsCount = Array.isArray(flags) ? flags.length : 0;
  const isAllClear = openFlagsCount === 0;

  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Group gap="sm" align="center">
          <ThemeIcon
            size="lg"
            radius="md"
            color={isAllClear ? 'teal' : 'red'}
            variant="light"
          >
            {isAllClear ? <IconShieldCheck size={22} /> : <IconShieldExclamation size={22} />}
          </ThemeIcon>
          <div>
            <Group gap="xs" align="center">
              <Text fw={800} size="sm" c="#09090B">
                SENTINEL AUTONOMOUS AUDIT & COMPLIANCE GUARD
              </Text>
              <Badge
                size="sm"
                color={isAllClear ? 'teal' : 'red'}
                variant={isAllClear ? 'filled' : 'light'}
                fw={700}
              >
                {isAllClear ? '100% VERIFIED' : `${openFlagsCount} BLOCKING ANOMALIES`}
              </Badge>
            </Group>
            <Text size="xs" c="#64748B" mt={2}>
              Real-time pre-execution payroll verification, statutory adherence, and KYC validation engine
            </Text>
          </div>
        </Group>

        <Button
          color="dark"
          size="sm"
          radius="sm"
          onClick={onOpenSentinel}
          rightSection={<IconChevronRight size={14} />}
        >
          Open Sentinel Audit Center
        </Button>
      </Group>

      <Grid mt="md" gutter="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
              OPEN AUDIT FLAGS
            </Text>
            <Group gap="xs" align="baseline" mt={2}>
              <Text size="20px" fw={800} c={isAllClear ? '#059669' : '#DC2626'} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {openFlagsCount}
              </Text>
              <Text size="xs" c="#64748B">
                {isAllClear ? 'Zero blockers detected' : 'Requires verification'}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
              STATUTORY COMPLIANCE
            </Text>
            <Group gap="xs" align="baseline" mt={2}>
              <Text size="20px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {isAllClear ? '100%' : '99.4%'}
              </Text>
              <Text size="xs" c="#059669" fw={600}>
                EPF • ESI • TDS Rules Active
              </Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="11px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
              SENTINEL AUDIT STATE
            </Text>
            <Group gap="xs" align="baseline" mt={2}>
              <Text size="14px" fw={700} c="#09090B">
                Live Sentinel Engine
              </Text>
              <Badge size="xs" color="teal" variant="dot">
                Active
              </Badge>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

export default SentinelSummaryCard;
