import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Title,
  SimpleGrid,
  Accordion,
  Alert,
  Tooltip,
} from '@mantine/core';
import {
  IconFileText,
  IconLock,
  IconBriefcase,
  IconCurrencyRupee,
  IconCalendar,
  IconHistory,
  IconShieldCheck,
} from '@tabler/icons-react';

export const MyContractView = () => {
  // Current Active Contract
  const activeContract = {
    id: 'CNT-2024-884',
    status: 'RUNNING',
    startDate: 'April 01, 2024',
    wage: '₹ 145,000 / month',
    salaryStructure: 'Corporate Product Scale v2.1 (Indian IT & Services)',
    employmentType: 'Full-Time Permanent',
    noticePeriod: '90 Days',
    probationStatus: 'Completed (Confirmed)',
    workingHours: '40 Hours / Week',
  };

  // Past Contracts History
  const historyContracts = [
    {
      id: 'CNT-2023-412',
      status: 'EXPIRED',
      period: 'Apr 01, 2023 - Mar 31, 2024',
      wage: '₹ 120,000 / month',
      salaryStructure: 'Associate Product Scale v1.0',
      type: 'Full-Time Permanent',
    },
    {
      id: 'CNT-2022-105',
      status: 'EXPIRED',
      period: 'May 15, 2022 - Mar 31, 2023',
      wage: '₹ 95,000 / month',
      salaryStructure: 'Graduate Entry Scale v1.0',
      type: 'Probationary Employee',
    },
  ];

  return (
    <Stack gap="lg">
      {/* Top Header Card */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb={4}>
              <Title order={3} c="#09090B">
                My Employment Contract
              </Title>
              <Badge size="xs" color="gray" leftSection={<IconLock size={12} />}>
                Read-Only Record
              </Badge>
            </Group>
            <Text size="xs" c="#64748B">
              Official active contract terms, compensation scale, and historical agreements.
            </Text>
          </div>

          <Badge size="md" color="teal" variant="filled">
            Active Status: RUNNING
          </Badge>
        </Group>
      </Paper>

      {/* Info Alert */}
      <Alert icon={<IconShieldCheck size={16} />} color="blue" title="Informational Record">
        Contract terms and salary structure assignments are strictly managed by HR Administration. Contact your People Ops manager for contract renewal inquiries.
      </Alert>

      {/* Active Contract Details */}
      <Paper p="xl" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" mb="lg">
          <Group gap="xs">
            <IconBriefcase size={20} color="#2563EB" />
            <Title order={4} size="sm" c="#09090B">
              Current Active Contract ({activeContract.id})
            </Title>
          </Group>

          <Badge color="teal" size="sm">
            Effective from {activeContract.startDate}
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          <Paper p="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Text size="11px" c="#71717A" fw={600}>Monthly Base Compensation</Text>
            <Text size="lg" fw={800} c="#09090B" mt={2}>
              {activeContract.wage}
            </Text>
          </Paper>

          <Paper p="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Text size="11px" c="#71717A" fw={600}>Assigned Salary Structure</Text>
            <Text size="xs" fw={700} c="#2563EB" mt={4}>
              {activeContract.salaryStructure}
            </Text>
          </Paper>

          <Paper p="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Text size="11px" c="#71717A" fw={600}>Employment Type</Text>
            <Text size="xs" fw={700} c="#09090B" mt={4}>
              {activeContract.employmentType}
            </Text>
          </Paper>

          <Paper p="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Text size="11px" c="#71717A" fw={600}>Notice Period</Text>
            <Text size="xs" fw={700} c="#09090B" mt={4}>
              {activeContract.noticePeriod}
            </Text>
          </Paper>

          <Paper p="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Text size="11px" c="#71717A" fw={600}>Probation Status</Text>
            <Text size="xs" fw={700} c="#166534" mt={4}>
              {activeContract.probationStatus}
            </Text>
          </Paper>

          <Paper p="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Text size="11px" c="#71717A" fw={600}>Standard Working Hours</Text>
            <Text size="xs" fw={700} c="#09090B" mt={4}>
              {activeContract.workingHours}
            </Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      {/* Historical Past Contracts */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group gap="xs" mb="md">
          <IconHistory size={18} color="#64748B" />
          <Title order={4} size="sm" c="#09090B">
            Past Contract History
          </Title>
        </Group>

        <Accordion variant="separated" radius="md">
          {historyContracts.map((c) => (
            <Accordion.Item key={c.id} value={c.id}>
              <Accordion.Control>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text size="xs" fw={700} c="#09090B">
                      {c.id}
                    </Text>
                    <Badge size="xs" color="gray" variant="outline">
                      {c.status}
                    </Badge>
                  </Group>
                  <Text size="xs" c="#64748B">
                    {c.period} • {c.wage}
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={2} spacing="xs">
                  <Text size="xs" c="#64748B">
                    Salary Structure: <strong style={{ color: '#09090B' }}>{c.salaryStructure}</strong>
                  </Text>
                  <Text size="xs" c="#64748B">
                    Type: <strong style={{ color: '#09090B' }}>{c.type}</strong>
                  </Text>
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Paper>
    </Stack>
  );
};
