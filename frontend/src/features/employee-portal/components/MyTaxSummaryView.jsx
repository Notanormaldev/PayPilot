import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Title,
  SegmentedControl,
  Tooltip,
  Alert,
  Divider,
} from '@mantine/core';
import {
  IconFileText,
  IconReceiptTax,
  IconDownload,
  IconInfoCircle,
  IconCheck,
  IconLock,
} from '@tabler/icons-react';

export const MyTaxSummaryView = () => {
  const [taxRegime, setTaxRegime] = useState('new'); // 'new' | 'old'
  const [regimeUpdated, setRegimeUpdated] = useState(false);

  const handleRegimeChange = (val) => {
    setTaxRegime(val);
    setRegimeUpdated(true);
    setTimeout(() => setRegimeUpdated(false), 3000);
  };

  return (
    <Stack gap="lg">
      {/* Top Header Card */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Title order={3} c="#09090B">
              My Tax Summary & Form 16
            </Title>
            <Text size="xs" c="#64748B">
              Year-to-Date TDS tax deductions, Income Tax Regime selection, and annual Form 16 portal.
            </Text>
          </div>

          <Badge size="md" color="blue" variant="light">
            FY 2025 - 2026
          </Badge>
        </Group>
      </Paper>

      {regimeUpdated && (
        <Alert icon={<IconCheck size={16} />} color="teal" title="Tax Regime Selection Updated">
          Your tax calculation regime has been set to {taxRegime === 'new' ? 'New Tax Regime (Sec 115BAC)' : 'Old Tax Regime (With Exemptions)'} for FY 2025-26.
        </Alert>
      )}

      {/* YTD TDS Card & Tax Regime Switcher */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* YTD Running TDS Summary */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconReceiptTax size={20} color="#2563EB" />
              <Text size="xs" fw={700} c="#64748B" style={{ textTransform: 'uppercase' }}>
                YTD Income Tax (TDS) Deducted
              </Text>
            </Group>
            <Badge size="xs" color="blue">
              5 Months (Apr - Aug)
            </Badge>
          </Group>

          <Text size="32px" fw={800} c="#09090B">
            ₹ 60,000
          </Text>
          <Text size="xs" c="#64748B" mt={2}>
            Monthly TDS Rate: <strong>₹ 12,000 / month</strong> • Projected Annual TDS: <strong>₹ 144,000</strong>
          </Text>

          <Divider my="sm" color="#F1F5F9" />

          <SimpleGrid cols={2} spacing="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC' }}>
              <Text size="10px" c="#71717A">TDS Quarter 1 (Q1)</Text>
              <Text size="xs" fw={700} c="#09090B">₹ 36,000</Text>
            </Paper>
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC' }}>
              <Text size="10px" c="#71717A">TDS Quarter 2 (Q2 in progress)</Text>
              <Text size="xs" fw={700} c="#09090B">₹ 24,000</Text>
            </Paper>
          </SimpleGrid>
        </Paper>

        {/* Tax Regime Toggle & Comparison */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="sm">
            <Text size="xs" fw={700} c="#09090B">
              Selected Income Tax Regime
            </Text>
            <Badge size="xs" color="teal">
              Cutoff Date: Oct 31, 2026
            </Badge>
          </Group>

          <SegmentedControl
            fullWidth
            value={taxRegime}
            onChange={handleRegimeChange}
            data={[
              { label: 'New Tax Regime (Default)', value: 'new' },
              { label: 'Old Tax Regime (Exemptions)', value: 'old' },
            ]}
            color="dark"
            mb="md"
          />

          {taxRegime === 'new' ? (
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Text size="xs" fw={700} c="#166534">
                ✓ New Tax Regime Active (Sec 115BAC)
              </Text>
              <Text size="11px" c="#15803D" mt={2}>
                Lower tax slab rates applied automatically. No requirement to submit 80C investment proofs or HRA rent receipts.
              </Text>
            </Paper>
          ) : (
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Text size="xs" fw={700} c="#1E40AF">
                ⚡ Old Tax Regime Selected
              </Text>
              <Text size="11px" c="#1D4ED8" mt={2}>
                Allows deductions for 80C (up to ₹1.5L), 80D health insurance, HRA exemption, and Home Loan interest. Submit proof declarations by Dec 15.
              </Text>
            </Paper>
          )}
        </Paper>
      </SimpleGrid>

      {/* Form 16 Download Section */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <IconFileText size={28} color="#94A3B8" />
            <div>
              <Text size="sm" fw={700} c="#09090B">
                Form 16 Annual Tax Certificate (FY 2025-26)
              </Text>
              <Text size="xs" c="#64748B">
                Part A & Part B TDS certificate issued at financial year closure for income tax returns filing.
              </Text>
            </div>
          </Group>

          <Tooltip label="Form 16 for FY 2025-26 will be available for download after May 31, 2026" withArrow>
            <div>
              <Button
                color="dark"
                variant="outline"
                disabled
                leftSection={<IconLock size={16} />}
              >
                Download Form 16 (Available May 2026)
              </Button>
            </div>
          </Tooltip>
        </Group>
      </Paper>
    </Stack>
  );
};
