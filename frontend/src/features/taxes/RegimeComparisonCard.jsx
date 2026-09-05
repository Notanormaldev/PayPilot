import React from 'react';
import { Paper, Stack, Group, Text, Badge, Button, SimpleGrid, ThemeIcon, Table, Alert, Divider } from '@mantine/core';
import {
  IconScale,
  IconCheck,
  IconArrowRight,
  IconSparkles,
  IconTrendingDown,
  IconInfoCircle,
} from '@tabler/icons-react';

export const RegimeComparisonCard = ({ comparisonResult, currentRegime, onSelectRegime }) => {
  if (!comparisonResult || !comparisonResult.newRegime || !comparisonResult.oldRegime) {
    return null;
  }

  const { newRegime, oldRegime, comparison } = comparisonResult;
  const isNewBetter = comparison.isNewRegimeBetter;
  const isOldBetter = comparison.isOldRegimeBetter;
  const isCurrentOptimal = currentRegime === comparison.recommendedRegime;

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
            <IconScale size={18} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="#0F172A">
              Regime Comparison & AI Recommendation
            </Text>
            <Text size="11px" c="#64748B">
              Live side-by-side analysis of New Tax Regime (u/s 115BAC) vs Old Tax Regime
            </Text>
          </div>
        </Group>

        <Badge
          size="lg"
          color={isNewBetter ? 'teal' : isOldBetter ? 'blue' : 'gray'}
          variant="filled"
          leftSection={<IconSparkles size={14} />}
        >
          {comparison.totalSavings > 0
            ? `Save ₹${comparison.totalSavings.toLocaleString('en-IN')} in ${comparison.recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}`
            : 'Both Regimes Equal'}
        </Badge>
      </Group>

      {/* Recommendation Alert Banner */}
      <Alert
        icon={<IconSparkles size={18} />}
        color={isNewBetter ? 'teal' : isOldBetter ? 'blue' : 'gray'}
        radius="md"
        mb="md"
        title={`Recommended: ${comparison.recommendedRegime === 'NEW' ? 'New Tax Regime (u/s 115BAC)' : 'Old Tax Regime'}`}
      >
        <Text size="xs" style={{ lineHeight: 1.5 }}>
          {comparison.recommendationReason}
        </Text>
        {comparison.breakevenDeductionNeeded > 0 && isNewBetter && (
          <Text size="11px" fw={600} mt={4} c="#0F172A">
            💡 Breakeven Insight: You would need at least <strong>₹{comparison.breakevenDeductionNeeded.toLocaleString('en-IN')}</strong> in eligible Chapter VI-A deductions for the Old Regime to match the New Regime!
          </Text>
        )}
      </Alert>

      {/* Side-by-Side Comparison Grid */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* NEW REGIME CARD */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: isNewBetter ? '#F0FDF4' : '#F8FAFC',
            border: isNewBetter ? '2px solid #22C55E' : '1px solid #E2E8F0',
            position: 'relative',
          }}
        >
          {isNewBetter && (
            <Badge
              size="xs"
              color="teal"
              variant="filled"
              style={{ position: 'absolute', top: -10, right: 12 }}
            >
              ★ RECOMMENDED
            </Badge>
          )}

          <Group justify="space-between" mb="xs">
            <div>
              <Text size="sm" fw={700} c="#0F172A">
                New Tax Regime (u/s 115BAC)
              </Text>
              <Text size="10px" c="#64748B">
                FY 2026-27 Union Budget Reform Slabs
              </Text>
            </div>
            {currentRegime === 'NEW' && (
              <Badge size="xs" color="dark" variant="light">
                Active Selection
              </Badge>
            )}
          </Group>

          <Divider my="xs" color={isNewBetter ? '#BBF7D0' : '#E2E8F0'} />

          <Stack gap={6}>
            <Group justify="space-between">
              <Text size="xs" c="#64748B">Standard Deduction:</Text>
              <Text size="xs" fw={600} c="#0F172A">₹{newRegime.incomeSummary.standardDeduction.toLocaleString('en-IN')}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Exemptions / 80C:</Text>
              <Text size="xs" c="#94A3B8">Not Allowed (Simplified)</Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Taxable Income:</Text>
              <Text size="xs" fw={700} c="#0F172A">₹{newRegime.taxableIncome.toLocaleString('en-IN')}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Section 87A Rebate:</Text>
              <Text size="xs" fw={600} c="#16A34A">
                {newRegime.taxBreakdown.rebate87A > 0 ? `-₹${newRegime.taxBreakdown.rebate87A.toLocaleString('en-IN')}` : '₹0'}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Health & Edu Cess (4%):</Text>
              <Text size="xs" c="#64748B">₹{newRegime.taxBreakdown.cess.amount.toLocaleString('en-IN')}</Text>
            </Group>

            <Divider my={4} color={isNewBetter ? '#BBF7D0' : '#E2E8F0'} />

            <Group justify="space-between">
              <Text size="sm" fw={700} c="#0F172A">Total Tax Payable:</Text>
              <Text size="md" fw={800} c={newRegime.taxBreakdown.totalTaxPayable === 0 ? '#16A34A' : '#DC2626'}>
                ₹{newRegime.taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="11px" c="#64748B">Net Annual In-Hand:</Text>
              <Text size="xs" fw={700} c="#16A34A">₹{newRegime.metrics.netAnnualTakeHome.toLocaleString('en-IN')}</Text>
            </Group>
          </Stack>

          {currentRegime !== 'NEW' && (
            <Button
              fullWidth
              size="xs"
              mt="sm"
              color="teal"
              variant="light"
              onClick={() => onSelectRegime('NEW')}
            >
              Switch to New Regime
            </Button>
          )}
        </Paper>

        {/* OLD REGIME CARD */}
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: isOldBetter ? '#EFF6FF' : '#F8FAFC',
            border: isOldBetter ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            position: 'relative',
          }}
        >
          {isOldBetter && (
            <Badge
              size="xs"
              color="blue"
              variant="filled"
              style={{ position: 'absolute', top: -10, right: 12 }}
            >
              ★ RECOMMENDED
            </Badge>
          )}

          <Group justify="space-between" mb="xs">
            <div>
              <Text size="sm" fw={700} c="#0F172A">
                Old Tax Regime
              </Text>
              <Text size="10px" c="#64748B">
                With 80C, 80D, HRA & Home Loan
              </Text>
            </div>
            {currentRegime === 'OLD' && (
              <Badge size="xs" color="dark" variant="light">
                Active Selection
              </Badge>
            )}
          </Group>

          <Divider my="xs" color={isOldBetter ? '#BFDBFE' : '#E2E8F0'} />

          <Stack gap={6}>
            <Group justify="space-between">
              <Text size="xs" c="#64748B">Standard Deduction:</Text>
              <Text size="xs" fw={600} c="#0F172A">₹{oldRegime.incomeSummary.standardDeduction.toLocaleString('en-IN')}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Claimed Deductions:</Text>
              <Text size="xs" fw={600} c="#2563EB">₹{oldRegime.deductions.totalDeductions.toLocaleString('en-IN')}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Taxable Income:</Text>
              <Text size="xs" fw={700} c="#0F172A">₹{oldRegime.taxableIncome.toLocaleString('en-IN')}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Section 87A Rebate:</Text>
              <Text size="xs" fw={600} c="#16A34A">
                {oldRegime.taxBreakdown.rebate87A > 0 ? `-₹${oldRegime.taxBreakdown.rebate87A.toLocaleString('en-IN')}` : '₹0'}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="#64748B">Health & Edu Cess (4%):</Text>
              <Text size="xs" c="#64748B">₹{oldRegime.taxBreakdown.cess.amount.toLocaleString('en-IN')}</Text>
            </Group>

            <Divider my={4} color={isOldBetter ? '#BFDBFE' : '#E2E8F0'} />

            <Group justify="space-between">
              <Text size="sm" fw={700} c="#0F172A">Total Tax Payable:</Text>
              <Text size="md" fw={800} c={oldRegime.taxBreakdown.totalTaxPayable === 0 ? '#16A34A' : '#DC2626'}>
                ₹{oldRegime.taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="11px" c="#64748B">Net Annual In-Hand:</Text>
              <Text size="xs" fw={700} c="#16A34A">₹{oldRegime.metrics.netAnnualTakeHome.toLocaleString('en-IN')}</Text>
            </Group>
          </Stack>

          {currentRegime !== 'OLD' && (
            <Button
              fullWidth
              size="xs"
              mt="sm"
              color="blue"
              variant="light"
              onClick={() => onSelectRegime('OLD')}
            >
              Switch to Old Regime
            </Button>
          )}
        </Paper>
      </SimpleGrid>
    </Paper>
  );
};
