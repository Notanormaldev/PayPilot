import React from 'react';
import { Paper, Group, Text, Badge } from '@mantine/core';

interface MetricCardProps {
  label: string;
  value: string | number;
  badgeText?: string;
  badgeColor?: string;
  subtext?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  badgeText,
  badgeColor = 'blue',
  subtext,
  icon,
}) => {
  return (
    <Paper p="md" radius="sm">
      <Group justify="space-between" align="flex-start" mb="xs">
        <Text size="xs" fw={700} c="#71717A" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </Text>
        {icon}
      </Group>

      <Group justify="space-between" align="baseline">
        <Text
          size="28px"
          fw={700}
          c="#09090B"
          style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}
        >
          {value}
        </Text>

        {badgeText && (
          <Badge size="sm" variant="light" color={badgeColor} radius="xs">
            {badgeText}
          </Badge>
        )}
      </Group>

      {subtext && (
        <Text size="xs" c="#64748B" mt={4}>
          {subtext}
        </Text>
      )}
    </Paper>
  );
};
