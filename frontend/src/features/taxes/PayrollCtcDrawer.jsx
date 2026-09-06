import React from 'react';
import {
  Drawer,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  SimpleGrid,
  Divider,
  ThemeIcon,
  Table,
  Slider,
  Select,
  Alert,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconBriefcase,
  IconShieldCheck,
  IconReceipt2,
  IconAward,
  IconCoins,
  IconInfoCircle,
  IconAlertCircle,
  IconBolt,
} from '@tabler/icons-react';

export const PayrollCtcDrawer = ({
  opened,
  onClose,
  payrollResult,
  serviceTenureYears,
  setServiceTenureYears,
  bonusPercentage,
  setBonusPercentage,
  stateCode,
  setStateCode,
}) => {
  if (!payrollResult) return null;

  const {
    earnings,
    employerContributions,
    epfoBreakdown,
    employeeDeductions,
    takeHome,
    gratuityStatutory,
    statutoryBonusInfo,
    disabilitySchemeInfo,
    statutoryProfile,
  } = payrollResult;

  const isAge58Cutoff = epfoBreakdown?.employerShare?.isAge58PensionCutoff || statutoryProfile?.isAge58Plus;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="md" color="indigo" radius="md">
            <IconBriefcase size={18} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="#0F172A">
              CTC, Statutory EPF/EPS & Gratuity Breakdown
            </Text>
            <Text size="11px" c="#64748B">
              Compliant with EPFO 1952, EPS 1995, Payment of Gratuity Act 1972 & Bonus Act 1965
            </Text>
          </div>
        </Group>
      }
      position="right"
      size="xl"
    >
      <Stack gap="md">
        {/* Top KPI Card Strip */}
        <SimpleGrid cols={3} spacing="xs">
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="10px" fw={700} c="#64748B" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Annual CTC
            </Text>
            <Text size="lg" fw={800} c="#0F172A">
              ₹{payrollResult.annualCTC.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c="#64748B">
              ₹{payrollResult.monthlyCTC.toLocaleString('en-IN')} / month
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Text size="10px" fw={700} c="#1D4ED8" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Gross Salary
            </Text>
            <Text size="lg" fw={800} c="#1E40AF">
              ₹{earnings.grossSalary.annual.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c="#3B82F6">
              ₹{earnings.grossSalary.monthly.toLocaleString('en-IN')} / month
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Text size="10px" fw={700} c="#15803D" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Net Take-Home
            </Text>
            <Text size="lg" fw={800} c="#166534">
              ₹{takeHome.annual.toLocaleString('en-IN')}
            </Text>
            <Text size="10px" c="#16A34A">
              ₹{takeHome.monthly.toLocaleString('en-IN')} / mo ({takeHome.takeHomePercentage}%)
            </Text>
          </Paper>
        </SimpleGrid>

        {/* State and Tenure Configurator */}
        <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <SimpleGrid cols={3} spacing="sm">
            <div>
              <Text size="xs" fw={600} c="#0F172A" mb={4}>
                Work Location State (PT)
              </Text>
              <Select
                size="xs"
                value={stateCode}
                onChange={setStateCode}
                data={[
                  { value: 'MH', label: 'Maharashtra (₹2,500/yr)' },
                  { value: 'KA', label: 'Karnataka (₹2,400/yr)' },
                  { value: 'DL', label: 'Delhi NCR (₹0/yr)' },
                  { value: 'GJ', label: 'Gujarat (₹2,400/yr)' },
                  { value: 'TN', label: 'Tamil Nadu (₹2,500/yr)' },
                  { value: 'TS', label: 'Telangana (₹2,400/yr)' },
                ]}
              />
            </div>

            <div>
              <Text size="xs" fw={600} c="#0F172A" mb={4}>
                Completed Tenure: {serviceTenureYears} Years
              </Text>
              <Slider
                size="xs"
                min={1}
                max={35}
                step={1}
                value={serviceTenureYears}
                onChange={setServiceTenureYears}
                marks={[
                  { value: 5, label: '5y (Eligible)' },
                  { value: 15, label: '15y' },
                  { value: 30, label: '30y' },
                ]}
                color="indigo"
              />
            </div>

            <div>
              <Text size="xs" fw={600} c="#0F172A" mb={4}>
                Bonus Rate: {bonusPercentage}%
              </Text>
              <Slider
                size="xs"
                min={8.33}
                max={20}
                step={0.5}
                value={bonusPercentage}
                onChange={setBonusPercentage}
                marks={[
                  { value: 8.33, label: '8.33% Min' },
                  { value: 20, label: '20% Max' },
                ]}
                color="orange"
              />
            </div>
          </SimpleGrid>
        </Paper>

        {/* EPFO EPS (Pension) & EPF Account 1 Allocation Card */}
        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <ThemeIcon size="sm" color={isAge58Cutoff ? 'cyan' : 'indigo'} radius="xl">
                <IconShieldCheck size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={700} c="#0F172A">
                  EPFO 1952 & EPS 1995 Statutory Allocation
                </Text>
                <Text size="10px" c="#64748B">
                  Employee Age: {statutoryProfile?.age || 32} Years • Pension Scheme Cutoff Analysis
                </Text>
              </div>
            </Group>
            <Badge size="xs" color={isAge58Cutoff ? 'cyan' : 'indigo'} variant="filled">
              {isAge58Cutoff ? '⚡ Age 58 Cutoff: 100% to EPF A/c 1' : '✓ Active EPS Pension Allocation'}
            </Badge>
          </Group>

          <SimpleGrid cols={3} spacing="xs" mb="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Text size="10px" c="#64748B">Employee Share (12%)</Text>
              <Text size="xs" fw={700} c="#0F172A">
                ₹{epfoBreakdown?.employeeShare?.monthly?.toLocaleString('en-IN') || employeeDeductions.epf.monthly.toLocaleString('en-IN')}/mo
              </Text>
              <Text size="9px" c="#64748B">100% to EPF Account 1</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: isAge58Cutoff ? '#F0FDF4' : '#EEF2FF', border: '1px solid #CBD5E1' }}>
              <Text size="10px" c={isAge58Cutoff ? '#166534' : '#3730A3'}>Employer EPF (A/c 1)</Text>
              <Text size="xs" fw={700} c={isAge58Cutoff ? '#15803D' : '#4338CA'}>
                ₹{epfoBreakdown?.employerShare?.epfAc1Monthly?.toLocaleString('en-IN') || 0}/mo
              </Text>
              <Text size="9px" c={isAge58Cutoff ? '#166534' : '#4338CA'}>
                {isAge58Cutoff ? '100% of Employer Share' : '3.67% Basic + Wage Excess'}
              </Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: isAge58Cutoff ? '#FFFBEB' : '#F0FDF4', border: '1px solid #CBD5E1' }}>
              <Text size="10px" c={isAge58Cutoff ? '#92400E' : '#166534'}>Employer EPS (A/c 10 Pension)</Text>
              <Text size="xs" fw={700} c={isAge58Cutoff ? '#B45309' : '#15803D'}>
                ₹{epfoBreakdown?.employerShare?.epsAc10Monthly?.toLocaleString('en-IN') || 0}/mo
              </Text>
              <Text size="9px" c={isAge58Cutoff ? '#92400E' : '#166534'}>
                {isAge58Cutoff ? 'Ceased (Age ≥ 58)' : '8.33% capped at ₹15k wage'}
              </Text>
            </Paper>
          </SimpleGrid>

          <Text size="10px" c="#475569">
            <strong>Statutory Rule:</strong> {epfoBreakdown?.employerShare?.epsExplanation || 'EPFO contribution is 12% employee + 12% employer split.'}
          </Text>
        </Paper>

        {/* Payment of Gratuity Act 1972 Card */}
        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <ThemeIcon size="sm" color="teal" radius="xl">
                <IconAward size={14} />
              </ThemeIcon>
              <Text size="xs" fw={700} c="#0F172A">
                Payment of Gratuity Act, 1972
              </Text>
            </Group>
            <Badge size="xs" color={gratuityStatutory.eligible ? 'teal' : 'orange'}>
              {gratuityStatutory.eligible ? '✓ Fully Eligible (>= 5 Yrs)' : 'Vesting Period (Pending < 5 Yrs)'}
            </Badge>
          </Group>

          <SimpleGrid cols={3} spacing="xs">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4' }}>
              <Text size="10px" c="#166534">Annual Accrual (15/26 Rule)</Text>
              <Text size="xs" fw={700} c="#15803D">₹{gratuityStatutory.annualAccrual.toLocaleString('en-IN')}</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4' }}>
              <Text size="10px" c="#166534">Total Gratuity Accrued ({serviceTenureYears} Yrs)</Text>
              <Text size="xs" fw={700} c="#15803D">₹{gratuityStatutory.totalGratuityAccrued.toLocaleString('en-IN')}</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC' }}>
              <Text size="10px" c="#64748B">Tax Exemption Ceiling u/s 10(10)</Text>
              <Text size="xs" fw={700} c="#0F172A">₹{gratuityStatutory.maxTaxExemptLimit.toLocaleString('en-IN')}</Text>
            </Paper>
          </SimpleGrid>

          <Text size="10px" c="#64748B" mt={6}>
            Formula: <code>(15 / 26) * Monthly Basic (₹{earnings.basic.monthly.toLocaleString('en-IN')}) * {serviceTenureYears} completed years</code>
          </Text>
        </Paper>

        {/* Disability Relief Info if applicable */}
        {disabilitySchemeInfo?.isApplicable && (
          <Paper p="sm" radius="md" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <Group justify="space-between">
              <Group gap="xs">
                <Text size="xs" fw={700} c="#065F46">
                  ♿ Persons with Disabilities (PwD) Statutory Benefits
                </Text>
              </Group>
              <Badge size="xs" color="teal">
                Section 80U Relief: ₹{disabilitySchemeInfo.exemptionAmount80U.toLocaleString('en-IN')}
              </Badge>
            </Group>
            <Text size="10px" c="#047857" mt={2}>
              ESI wage ceiling is elevated to <strong>₹25,000/month</strong> for employees with certified disability (with Central Government employer contribution reimbursement scheme).
            </Text>
          </Paper>
        )}

        {/* Detailed Earnings and Deductions Table */}
        <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Text size="xs" fw={700} c="#0F172A" mb="xs">
            Detailed Monthly vs Annual Salary Structure
          </Text>

          <Table striped highlightOnHover withTableBorder withColumnBorders fontSize="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Salary Component</Table.Th>
                <Table.Th>Monthly (₹)</Table.Th>
                <Table.Th>Annual (₹)</Table.Th>
                <Table.Th>Nature & Statutory Rule</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td fw={600}>Basic Salary (40%)</Table.Td>
                <Table.Td>₹{earnings.basic.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td>₹{earnings.basic.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="blue">Taxable</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td fw={600}>House Rent Allowance (HRA)</Table.Td>
                <Table.Td>₹{earnings.hra.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td>₹{earnings.hra.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="teal">Exempt u/s 10(13A) (Old)</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td fw={600}>Special Allowance</Table.Td>
                <Table.Td>₹{earnings.specialAllowance.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td>₹{earnings.specialAllowance.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="blue">Fully Taxable</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td fw={600}>Statutory Bonus ({statutoryBonusInfo.rateApplied}%)</Table.Td>
                <Table.Td>₹{earnings.statutoryBonus.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td>₹{earnings.statutoryBonus.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="orange">Bonus Act 1965</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
                <Table.Td fw={700}>Gross Salary</Table.Td>
                <Table.Td fw={700}>₹{earnings.grossSalary.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td fw={700}>₹{earnings.grossSalary.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td>-</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="#DC2626">(-) Employee EPF (12%)</Table.Td>
                <Table.Td c="#DC2626">-₹{employeeDeductions.epf.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td c="#DC2626">-₹{employeeDeductions.epf.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="gray">Statutory PF</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="#DC2626">(-) Professional Tax ({stateCode})</Table.Td>
                <Table.Td c="#DC2626">-₹{employeeDeductions.professionalTax.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td c="#DC2626">-₹{employeeDeductions.professionalTax.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="gray">State PT Act</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td c="#DC2626">(-) Income Tax TDS</Table.Td>
                <Table.Td c="#DC2626">-₹{employeeDeductions.incomeTaxTDS.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td c="#DC2626">-₹{employeeDeductions.incomeTaxTDS.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="indigo">Income Tax Act</Badge></Table.Td>
              </Table.Tr>
              <Table.Tr style={{ backgroundColor: '#F0FDF4' }}>
                <Table.Td fw={800} c="#166534">Net In-Hand Take Home</Table.Td>
                <Table.Td fw={800} c="#166534">₹{takeHome.monthly.toLocaleString('en-IN')}</Table.Td>
                <Table.Td fw={800} c="#166534">₹{takeHome.annual.toLocaleString('en-IN')}</Table.Td>
                <Table.Td><Badge size="xs" color="teal">Bank Transfer</Badge></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </Drawer>
  );
};
