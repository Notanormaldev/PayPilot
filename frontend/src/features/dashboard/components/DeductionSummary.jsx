import React from 'react';
import { Paper, Grid, Text, Group, Box, Anchor } from '@mantine/core';
import { IconBuildingBank, IconShieldCheck, IconPercentage } from '@tabler/icons-react';

export const DeductionSummary = ({ kpis, employeesCount = 301 }) => {
  return (
    <Grid>
      {/* EPF */}
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            height: '100%',
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
              EPF (PROVIDENT FUND)
            </Text>
            <IconBuildingBank size={16} color="#64748B" />
          </Group>
          <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ₹39,73,913.00
          </Text>
          <Anchor size="11px" c="#2563EB" fw={600} mt="xs" style={{ display: 'inline-block' }}>
            View Details
          </Anchor>
        </Paper>
      </Grid.Col>

      {/* ESI */}
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            height: '100%',
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
              ESI (INSURANCE)
            </Text>
            <IconShieldCheck size={16} color="#64748B" />
          </Group>
          <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ₹91,010.00
          </Text>
          <Anchor size="11px" c="#2563EB" fw={600} mt="xs" style={{ display: 'inline-block' }}>
            View Details
          </Anchor>
        </Paper>
      </Grid.Col>

      {/* TDS Deduction */}
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            height: '100%',
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
              TDS DEDUCTION (TAX)
            </Text>
            <IconPercentage size={16} color="#64748B" />
          </Group>
          <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ₹1,15,89,089.00
          </Text>
          <Anchor size="11px" c="#2563EB" fw={600} mt="xs" style={{ display: 'inline-block' }}>
            View Details
          </Anchor>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
