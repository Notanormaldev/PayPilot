import React, { useState } from 'react';
import { Paper, Stack, Group, Text, Badge, Button, Modal, TextInput } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconShieldX, IconSparkles } from '@tabler/icons-react';
import { fetchApi } from '../lib/api';

export interface SentinelFlagItem {
  id: string;
  flagType: string;
  severity: string;
  deterministicReasonJson: any;
  aiExplanation?: string;
  status: string;
  payslip?: {
    id: string;
    employee: {
      id: string;
      name: string;
      department: string;
    };
  };
}

interface SentinelDrawerProps {
  flags: SentinelFlagItem[];
  onFlagResolved: () => void;
}

export const SentinelDrawer: React.FC<SentinelDrawerProps> = ({ flags, onFlagResolved }) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<SentinelFlagItem | null>(null);
  const [overrideNote, setOverrideNote] = useState('');

  const handleResolve = async (flagId: string) => {
    setResolvingId(flagId);
    try {
      await fetchApi(`/sentinel/flags/${flagId}/resolve`, { method: 'POST' });
      onFlagResolved();
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!selectedFlag || !overrideNote) return;
    try {
      await fetchApi(`/sentinel/flags/${selectedFlag.id}/override`, {
        method: 'POST',
        body: JSON.stringify({ note: overrideNote }),
      });
      setOverrideModalOpen(false);
      setOverrideNote('');
      onFlagResolved();
    } catch (err: any) {
      alert(`Override failed: ${err.message}`);
    }
  };

  const openFlags = flags.filter((f) => f.status === 'OPEN');

  if (openFlags.length === 0) {
    return (
      <Paper p="lg" radius="sm">
        <Group gap="sm">
          <IconCheck size={20} color="#10B981" />
          <div>
            <Text size="sm" fw={600} c="#10B981">
              Zero Active Sentinel Anomaly Flags
            </Text>
            <Text size="xs" c="#64748B">
              All payroll records, contracts, and attendance logs conform to regulatory standards.
            </Text>
          </div>
        </Group>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="xs" fw={700} c="#71717A" style={{ letterSpacing: '0.04em' }}>
          SENTINEL ANOMALY DETECTION ENGINE ({openFlags.length} BLOCKING FLAGS)
        </Text>
      </Group>

      {openFlags.map((flag) => {
        const isHigh = flag.severity === 'HIGH';
        const empName = flag.payslip?.employee?.name || 'Employee';

        return (
          <Paper
            key={flag.id}
            p="md"
            radius="sm"
            style={{
              borderLeft: isHigh ? '3px solid #EF4444' : '3px solid #F59E0B',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  {isHigh ? <IconShieldX size={16} color="#EF4444" /> : <IconAlertTriangle size={16} color="#D97706" />}
                  <Text size="sm" fw={700} c="#09090B">
                    {flag.flagType.replace(/_/g, ' ')}
                  </Text>
                </Group>

                <Badge size="xs" color={isHigh ? 'red' : 'yellow'} variant="light">
                  {flag.severity} RISK
                </Badge>
              </Group>

              <Text size="xs" c="#3F3F46">
                Target: <Text span fw={600} c="blue">{empName}</Text> ({flag.payslip?.employee?.department || 'Staff'})
              </Text>

              {/* AI & Deterministic Explanation */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '8px 12px',
                  borderRadius: '4px',
                }}
              >
                <Group gap={6} mb={4}>
                  <IconSparkles size={12} color="#2563EB" />
                  <Text size="11px" fw={600} c="#2563EB">
                    Sentinel AI Audit Insight
                  </Text>
                </Group>
                <Text size="xs" c="#52525B">
                  {flag.aiExplanation || JSON.stringify(flag.deterministicReasonJson?.reason || 'Verification needed')}
                </Text>
              </div>

              {/* Action Buttons */}
              <Group gap="xs" justify="flex-end" mt={4}>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    setSelectedFlag(flag);
                    setOverrideModalOpen(true);
                  }}
                >
                  Override with Note
                </Button>

                <Button
                  size="xs"
                  color="dark"
                  loading={resolvingId === flag.id}
                  onClick={() => handleResolve(flag.id)}
                >
                  Resolve & Recompute
                </Button>
              </Group>
            </Stack>
          </Paper>
        );
      })}

      {/* Override Modal */}
      <Modal
        opened={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Document Override Justification"
        styles={{ content: { backgroundColor: '#FFFFFF', color: '#09090B' }, header: { backgroundColor: '#FFFFFF' } }}
      >
        <Stack gap="md">
          <Text size="xs" c="#64748B">
            An audit log event will be created documenting who authorized this override and why.
          </Text>
          <TextInput
            placeholder="E.g. Bank details manually verified over video call..."
            value={overrideNote}
            onChange={(e) => setOverrideNote(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" size="xs" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" size="xs" onClick={handleOverrideSubmit}>
              Confirm Override
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};
