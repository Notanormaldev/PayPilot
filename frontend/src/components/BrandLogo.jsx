import React from 'react';
import { Group, Text, Box } from '@mantine/core';

export const BrandLogo = ({ size = 28, withText = true, subtitle = null, withBadge = false }) => {
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
          <Group gap={6} wrap="nowrap">
            <Text fw={700} size="md" c="#2F3037" style={{ letterSpacing: '-0.3px', lineHeight: 1.2, fontSize: '16px' }}>
              Pay<span style={{ color: '#2563EB' }}>Pilot</span>
            </Text>
            {withBadge && (
              <Text size="9px" fw={700} c="#D97706" bg="#FEF3C7" px={5} py={1} style={{ borderRadius: 4, letterSpacing: '0.5px' }}>
                PRO
              </Text>
            )}
          </Group>
          {subtitle && (
            <Text size="9px" fw={600} c="#71717A" style={{ letterSpacing: '0.6px', marginTop: 1 }}>
              {subtitle}
            </Text>
          )}
        </Box>
      )}
    </Group>
  );
};
