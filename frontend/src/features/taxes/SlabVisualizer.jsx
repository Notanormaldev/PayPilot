import React from 'react';
import { Paper, Stack, Group, Text, Badge, Progress, SimpleGrid, ThemeIcon, Tooltip } from '@mantine/core';
import { IconLayersLinked, IconInfoCircle, IconCheck, IconCoins } from '@tabler/icons-react';

export const SlabVisualizer = ({ taxResult, regimeCode }) => {
  if (!taxResult || !taxResult.taxBreakdown || !taxResult.taxBreakdown.slabs) {
    return null;
  }

  const { slabs, baseTax, totalTaxPayable, taxableIncome } = taxResult;

  const getRateColor = (rate) => {
    if (rate === 0) return 'teal';
    if (rate <= 10) return 'blue';
    if (rate <= 20) return 'orange';
    return 'red';
  };

  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs">
          <ThemeIcon size="md" radius="md" color="indigo" variant="light">
            <IconLayersLinked size={18} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="#0F172A">
              Dynamic Slab-by-Slab Tax Distribution
            </Text>
            <Text size="11px" c="#64748B">
              Loaded directly from Tax Rules Database ({regimeCode === 'NEW' ? 'New Regime u/s 115BAC' : 'Old Regime'})
            </Text>
          </div>
        </Group>

        <Badge size="md" color={taxableIncome <= 1200000 && regimeCode === 'NEW' ? 'teal' : 'indigo'} variant="light">
          {taxableIncome <= 1200000 && regimeCode === 'NEW' ? '✓ Eligible for 100% 87A Rebate' : `Taxable: ₹${taxableIncome.toLocaleString('en-IN')}`}
        </Badge>
      </Group>

      {/* Slabs Grid */}
      <Stack gap="sm">
        {slabs.map((slab, idx) => {
          const slabCapacity = slab.maxIncome ? slab.maxIncome - slab.minIncome : 1000000;
          const percentageFilled = slabCapacity > 0 ? Math.min(100, Math.round((slab.taxableAmountInSlab / slabCapacity) * 100)) : 0;
          const isActive = slab.taxableAmountInSlab > 0;

          return (
            <Paper
              key={slab.slabId || idx}
              p="sm"
              radius="sm"
              style={{
                backgroundColor: isActive ? '#F8FAFC' : '#FCFCFD',
                border: isActive ? '1px solid #CBD5E1' : '1px dashed #E2E8F0',
                transition: 'all 0.2s ease',
              }}
            >
              <Group justify="space-between" align="center" mb={6}>
                <Group gap="xs">
                  <Badge size="sm" color={getRateColor(slab.taxRate)} variant="filled">
                    {slab.taxRate}%
                  </Badge>
                  <Text size="xs" fw={700} c="#1E293B">
                    {slab.rangeLabel}
                  </Text>
                </Group>

                <Group gap="md">
                  <Text size="xs" c="#64748B">
                    Taxable Portion:{' '}
                    <strong style={{ color: isActive ? '#0F172A' : '#94A3B8' }}>
                      ₹{slab.taxableAmountInSlab.toLocaleString('en-IN')}
                    </strong>
                  </Text>
                  <Text size="xs" fw={700} c={isActive && slab.taxForSlab > 0 ? '#DC2626' : '#16A34A'}>
                    Tax: ₹{Math.round(slab.taxForSlab).toLocaleString('en-IN')}
                  </Text>
                </Group>
              </Group>

              {/* Progress Bar */}
              <Progress
                value={percentageFilled}
                size="sm"
                radius="xl"
                color={getRateColor(slab.taxRate)}
                animated={isActive && slab.taxRate > 0}
                style={{ backgroundColor: '#EDF2F7' }}
              />

              <Text size="10px" c="#64748B" mt={4}>
                {slab.explanation}
              </Text>
            </Paper>
          );
        })}
      </Stack>

      {/* Summary Footer */}
      <Paper p="sm" radius="sm" mt="md" style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconCoins size={18} color="#475569" />
            <Text size="xs" fw={600} c="#334155">
              Total Slab Base Tax:
            </Text>
          </Group>
          <Text size="sm" fw={800} c="#0F172A">
            ₹{Math.round(baseTax).toLocaleString('en-IN')}
          </Text>
        </Group>
      </Paper>
    </Paper>
  );
};
