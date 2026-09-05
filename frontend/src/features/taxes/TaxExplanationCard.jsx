import React from 'react';
import { Paper, Stack, Group, Text, Badge, Accordion, ThemeIcon, Alert, SimpleGrid, Divider } from '@mantine/core';
import {
  IconInfoCircle,
  IconReceiptTax,
  IconArrowRight,
  IconCheck,
  IconScale,
  IconShieldCheck,
  IconFlame,
  IconSparkles,
} from '@tabler/icons-react';

export const TaxExplanationCard = ({ taxResult }) => {
  if (!taxResult || !taxResult.explanationSteps) {
    return null;
  }

  const { incomeSummary, taxableIncome, taxBreakdown, metrics, explanationSteps, regime } = taxResult;
  const isZeroTax = taxBreakdown.totalTaxPayable === 0;

  const getStepIcon = (type) => {
    switch (type) {
      case 'INFO':
        return <IconInfoCircle size={16} />;
      case 'DEDUCTION':
        return <IconShieldCheck size={16} />;
      case 'TAX_CALCULATION':
        return <IconReceiptTax size={16} />;
      case 'REBATE':
        return <IconSparkles size={16} />;
      case 'CESS':
        return <IconFlame size={16} />;
      case 'FINAL':
        return <IconCheck size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const getStepColor = (type) => {
    switch (type) {
      case 'INFO':
        return 'blue';
      case 'DEDUCTION':
        return 'teal';
      case 'TAX_CALCULATION':
        return 'indigo';
      case 'REBATE':
        return 'green';
      case 'CESS':
        return 'orange';
      case 'FINAL':
        return 'violet';
      default:
        return 'gray';
    }
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
          <ThemeIcon size="md" radius="md" color="teal" variant="light">
            <IconSparkles size={18} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="#0F172A">
              Educational Tax Explanation Studio
            </Text>
            <Text size="11px" c="#64748B">
              Clear, transparent step-by-step breakdown of how every rupee was calculated
            </Text>
          </div>
        </Group>

        <Badge size="md" color={isZeroTax ? 'teal' : 'blue'} variant="filled">
          {isZeroTax ? '🎉 100% Tax Free Income' : `Effective Tax Rate: ${metrics.effectiveTaxRate}%`}
        </Badge>
      </Group>

      {/* Special Zero Tax Callout */}
      {isZeroTax && (
        <Alert
          icon={<IconCheck size={18} />}
          color="teal"
          title="Government Tax Relief u/s 87A Activated"
          mb="md"
          radius="md"
        >
          Under the FY 2026-27 Union Budget reforms, salaried individuals earning up to <strong>₹12.75 Lakhs</strong> (Gross Salary minus ₹75,000 Standard Deduction = ₹12 Lakhs Taxable Income) pay <strong>₹0 Income Tax</strong> thanks to the 100% Section 87A rebate!
        </Alert>
      )}

      {/* Visual Calculation Flow Pipeline */}
      <Paper p="sm" radius="md" mb="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <Text size="11px" fw={700} c="#64748B" mb={8} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Visual Calculation Pipeline
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="xs">
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
            <Text size="10px" c="#64748B">1. Gross Income</Text>
            <Text size="xs" fw={700} c="#0F172A">₹{incomeSummary.totalGrossIncome.toLocaleString('en-IN')}</Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Text size="10px" c="#166534">2. Deductions</Text>
            <Text size="xs" fw={700} c="#15803D">
              -₹{(incomeSummary.standardDeduction + (taxResult.deductions?.totalDeductions || 0)).toLocaleString('en-IN')}
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Text size="10px" c="#1E40AF">3. Taxable Income</Text>
            <Text size="xs" fw={700} c="#1D4ED8">₹{taxableIncome.toLocaleString('en-IN')}</Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <Text size="10px" c="#92400E">4. 87A Rebate</Text>
            <Text size="xs" fw={700} c="#B45309">
              {taxBreakdown.rebate87A > 0 ? `-₹${taxBreakdown.rebate87A.toLocaleString('en-IN')}` : '₹0'}
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: isZeroTax ? '#F0FDF4' : '#FEF2F2', border: isZeroTax ? '1px solid #86EFAC' : '1px solid #FECACA' }}>
            <Text size="10px" c={isZeroTax ? '#166534' : '#991B1B'}>5. Final Tax</Text>
            <Text size="xs" fw={800} c={isZeroTax ? '#15803D' : '#DC2626'}>
              ₹{taxBreakdown.totalTaxPayable.toLocaleString('en-IN')}
            </Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      {/* Step-by-Step Explanation Accordion */}
      <Accordion variant="separated" radius="md" defaultValue="step-1">
        {(explanationSteps || []).map((step) => (
          <Accordion.Item
            key={`step-${step.stepNumber}`}
            value={`step-${step.stepNumber}`}
            style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
          >
            <Accordion.Control
              icon={
                <ThemeIcon size="sm" radius="xl" color={getStepColor(step.type)} variant="filled">
                  {getStepIcon(step.type)}
                </ThemeIcon>
              }
            >
              <Group justify="space-between" wrap="nowrap" style={{ width: '100%', paddingRight: '12px' }}>
                <div>
                  <Text size="xs" fw={700} c="#0F172A">
                    Step {step.stepNumber}: {step.title}
                  </Text>
                </div>
                <Badge size="xs" color={getStepColor(step.type)} variant="light">
                  {step.highlight}
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="xs" c="#475569" style={{ lineHeight: 1.6 }}>
                {step.description}
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Paper>
  );
};
