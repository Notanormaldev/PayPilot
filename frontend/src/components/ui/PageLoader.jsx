import React from 'react';
import { Box, Stack, Text, Badge, Paper } from '@mantine/core';

export const PageLoader = ({
  message = 'Loading workspace & synchronizing data...',
  subtitle = 'Autonomous Payroll & Sentinel Compliance Engine',
  fullScreen = false,
  minHeight = '420px',
}) => {
  const content = (
    <Stack align="center" justify="center" gap="md" py="xl">
      {/* Animated Logo Pulse Container */}
      <Box
        style={{
          position: 'relative',
          width: 72,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulsing ring animation */}
        <Box
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 70%)',
            animation: 'paypilot-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* Center Logo Icon */}
        <Paper
          radius="xl"
          p={10}
          style={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.16)',
            border: '1px solid #DBEAFE',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <img
            src="/logo.svg"
            alt="PayPilot"
            style={{ width: 34, height: 34, objectFit: 'contain' }}
          />
        </Paper>
      </Box>

      {/* Message & Status */}
      <Stack align="center" gap={4}>
        <Text size="sm" fw={700} c="#0F172A" style={{ letterSpacing: '-0.2px' }}>
          {message}
        </Text>
        <Text size="xs" c="#64748B">
          {subtitle}
        </Text>
      </Stack>

      {/* Sleek Animated Loader Bar */}
      <Box
        style={{
          width: 140,
          height: 3,
          backgroundColor: '#E2E8F0',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '40%',
            backgroundColor: '#2563EB',
            borderRadius: 4,
            animation: 'paypilot-indeterminate 1.2s infinite ease-in-out',
          }}
        />
      </Box>

      <Badge size="xs" color="blue" variant="light" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Live Sync Active
      </Badge>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes paypilot-pulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.9;
          }
        }
        @keyframes paypilot-indeterminate {
          0% {
            left: -40%;
          }
          50% {
            left: 50%;
            width: 60%;
          }
          100% {
            left: 100%;
            width: 40%;
          }
        }
      `}</style>
    </Stack>
  );

  if (fullScreen) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {content}
    </Box>
  );
};

export default PageLoader;
