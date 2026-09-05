import React from 'react';
import { Paper, Group, Stack, Text, Badge, Button, Grid, Box } from '@mantine/core';
import { IconPlayerPlay, IconChevronRight, IconAlertCircle } from '@tabler/icons-react';

export const WelcomeBanner = ({ kpis, onRunPayroll, userName = 'Meera Krishnan' }) => {
  const netPay = kpis?.monthlyPayrollCost ? (kpis.monthlyPayrollCost * 0.85) : 172523654;
  const employeesCount = kpis?.totalEmployees || 1308;

  return (
    <Stack gap="xs">
      <Text size="xl" fw={800} c="#09090B">
        Welcome {userName}!
      </Text>

      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Group gap="xs">
            <Text fw={700} size="sm" c="#09090B">
              Process Pay Run for September 2026
            </Text>
            <Badge size="xs" color="teal" variant="light" fw={700}>
              APPROVED
            </Badge>
          </Group>
        </Group>

        <Grid align="center">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
              EMPLOYEES' NET PAY
            </Text>
            <Text size="22px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{netPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
              PAYMENT DATE
            </Text>
            <Text size="15px" fw={700} c="#09090B">
              30 Sep 2026
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 2 }}>
            <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
              NO. OF EMPLOYEES
            </Text>
            <Text size="15px" fw={700} c="#09090B">
              {employeesCount}
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 3 }} style={{ textAlign: 'right' }}>
            <Button
              color="dark"
              size="sm"
              radius="sm"
              onClick={onRunPayroll}
              rightSection={<IconChevronRight size={14} />}
            >
              View Details
            </Button>
          </Grid.Col>
        </Grid>

        <Text size="11px" c="#71717A" mt="sm">
          Pay your employees on 30/09/2026. Record it here once you make the payment.
        </Text>
      </Paper>
    </Stack>
  );
};
