import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Badge,
  Text,
  Button,
  ThemeIcon,
  Collapse,
} from '@mantine/core';
import {
  IconShieldExclamation,
  IconAlertTriangle,
  IconCheck,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { sentinelService } from '../services/sentinelService';

export const SentinelDrawer = ({ flags = [], onFlagResolved }) => {
  const [resolvingId, setResolvingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleResolve = async (flagId) => {
    setResolvingId(flagId);
    try {
      await sentinelService.resolveFlag(flagId, 'Verified and approved by Executive');
      if (onFlagResolved) onFlagResolved();
    } catch (err) {
      console.error('Resolve failed:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'CRITICAL') return <Badge color="red" size="xs" variant="filled">CRITICAL</Badge>;
    if (sev === 'HIGH') return <Badge color="orange" size="xs" variant="light">HIGH</Badge>;
    return <Badge color="yellow" size="xs" variant="light">MEDIUM</Badge>;
  };

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
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="md" color="red" variant="light">
            <IconShieldExclamation size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="sm" c="#09090B">
              SENTINEL AUTONOMOUS AUDIT
            </Text>
            <Text size="xs" c="#71717A">
              Pre-execution compliance and fraud detection guard
            </Text>
          </div>
        </Group>
        <Badge
          size="sm"
          color={flags.length > 0 ? 'red' : 'teal'}
          variant={flags.length > 0 ? 'light' : 'filled'}
        >
          {flags.length > 0 ? `${flags.length} Blocking Flags` : '0 Active Flags'}
        </Badge>
      </Group>

      <Stack gap="sm">
        {flags.length === 0 ? (
          <Paper p="md" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
            <Group justify="center" gap="xs">
              <IconCheck size={18} color="#16A34A" />
              <Text size="xs" fw={700} c="#166534">
                Sentinel Guard Active: All payroll calculations verified. Zero compliance blockers detected.
              </Text>
            </Group>
          </Paper>
        ) : (
          flags.map((flag) => (
            <Paper
              key={flag.id}
              p="sm"
              radius="sm"
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="xs" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                  <IconAlertTriangle size={16} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb={2}>
                      <Text size="xs" fw={700} c="#09090B">
                        {flag.ruleCode}
                      </Text>
                      {getSeverityBadge(flag.severity)}
                    </Group>

                    <Text size="xs" c="#3F3F46" style={{ lineHeight: 1.4 }}>
                      {flag.message}
                    </Text>

                    {flag.aiExplanation && (
                      <Paper
                        mt="xs"
                        p="xs"
                        radius="xs"
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                        }}
                      >
                        <Group gap={4} mb={2}>
                          <IconSparkles size={12} color="#2563EB" />
                          <Text size="10px" fw={700} c="#1D4ED8">
                            Executive Analysis:
                          </Text>
                        </Group>
                        <Text size="11px" c="#1E40AF">
                          {flag.aiExplanation}
                        </Text>
                      </Paper>
                    )}
                  </div>
                </Group>

                <Button
                  size="xs"
                  color="dark"
                  loading={resolvingId === flag.id}
                  onClick={() => handleResolve(flag.id)}
                  styles={{
                    root: { height: 26, padding: '0 10px', fontSize: '11px', flexShrink: 0 },
                  }}
                >
                  Resolve
                </Button>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Paper>
  );
};
