import React from 'react';
import { Group, Text, Box } from '@mantine/core';

export const BrandLogo = ({ size = 32, withText = true, subtitle = 'AUTONOMOUS PAYROLL' }) => {
  return (
    <Group gap="xs" wrap="nowrap" style={{ cursor: 'pointer' }}>
      <Box style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="/logo.svg"
          alt="PayPilot Logo"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>
      {withText && (
        <Box>
          <Group gap={4} wrap="nowrap">
            <Text fw={800} size="md" c="#09090B" style={{ letterSpacing: '-0.4px', lineHeight: 1.1 }}>
              Pay<span style={{ color: '#2563EB' }}>Pilot</span>
            </Text>
            <Text size="9px" fw={700} c="#D97706" bg="#FEF3C7" px={5} py={1} style={{ borderRadius: 4, letterSpacing: '0.5px' }}>
              PRO
            </Text>
          </Group>
          {subtitle && (
            <Text size="9px" fw={700} c="#71717A" style={{ letterSpacing: '0.8px', marginTop: 1 }}>
              {subtitle}
            </Text>
          )}
        </Box>
      )}
    </Group>
  );
};
