import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Table,
  Button,
  NumberInput,
  Tabs,
  ThemeIcon,
  Alert,
  SimpleGrid,
} from '@mantine/core';
import {
  IconDatabase,
  IconAdjustments,
  IconCheck,
  IconBuildingBank,
  IconScale,
  IconReceiptTax,
} from '@tabler/icons-react';

export const AdminTaxRuleModal = ({ opened, onClose, rules, onUpdateSlab }) => {
  const [editingSlab, setEditingSlab] = useState(null);
  const [editRate, setEditRate] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!rules) return null;

  const handleStartEdit = (slab) => {
    setEditingSlab(slab);
    setEditRate(slab.taxRate);
  };

  const handleSaveSlab = async () => {
    if (!editingSlab) return;
    const res = await onUpdateSlab(editingSlab.id, { taxRate: editRate });
    if (res?.success) {
      setSaveSuccess(true);
      setEditingSlab(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="md" color="indigo" radius="md">
            <IconDatabase size={18} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="#0F172A">
              Tax Rule Database & Dynamic Configuration Studio
            </Text>
            <Text size="11px" c="#64748B">
              Zero Hardcoded Rules • Real-time DB Relational Schema
            </Text>
          </div>
        </Group>
      }
      size="90%"
    >
      <Stack gap="md">
        {saveSuccess && (
          <Alert icon={<IconCheck size={16} />} color="teal" title="Tax Rule Database Updated">
            Slab rate updated in the database repository. All live calculations have recalculated automatically.
          </Alert>
        )}

        <Tabs defaultValue="slabs">
          <Tabs.List>
            <Tabs.Tab value="slabs" leftSection={<IconReceiptTax size={14} />}>
              Tax Slabs (New & Old)
            </Tabs.Tab>
            <Tabs.Tab value="deductions" leftSection={<IconScale size={14} />}>
              Chapter VI-A Deductions
            </Tabs.Tab>
            <Tabs.Tab value="pt" leftSection={<IconBuildingBank size={14} />}>
              State Professional Tax
            </Tabs.Tab>
            <Tabs.Tab value="statutory" leftSection={<IconAdjustments size={14} />}>
              Gratuity & Statutory Bonus
            </Tabs.Tab>
          </Tabs.List>

          {/* TAB 1: TAX SLABS */}
          <Tabs.Panel value="slabs" pt="md">
            <Stack gap="md">
              <Text size="xs" fw={700} c="#0F172A">
                New Tax Regime Slabs (FY 2026-27 Union Budget Reforms)
              </Text>
              <Table striped highlightOnHover withTableBorder fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Slab ID</Table.Th>
                    <Table.Th>Income Bracket (₹)</Table.Th>
                    <Table.Th>Tax Rate (%)</Table.Th>
                    <Table.Th>Formula Type</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(rules?.slabs?.NEW || []).map((slab) => (
                    <Table.Tr key={slab.id}>
                      <Table.Td><Badge size="xs" color="gray">{slab.id}</Badge></Table.Td>
                      <Table.Td fw={600}>
                        {slab.maxIncome ? `₹${(slab.minIncome / 100000).toFixed(1)}L - ₹${(slab.maxIncome / 100000).toFixed(1)}L` : `Above ₹${(slab.minIncome / 100000).toFixed(1)}L`}
                      </Table.Td>
                      <Table.Td>
                        {editingSlab?.id === slab.id ? (
                          <NumberInput
                            size="xs"
                            min={0}
                            max={50}
                            value={editRate}
                            onChange={setEditRate}
                            style={{ width: 80 }}
                          />
                        ) : (
                          <Badge size="sm" color={slab.taxRate === 0 ? 'teal' : 'blue'}>
                            {slab.taxRate}%
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td><Text size="10px" c="#64748B">{slab.formulaType}</Text></Table.Td>
                      <Table.Td>
                        {editingSlab?.id === slab.id ? (
                          <Group gap="xs">
                            <Button size="compact-xs" color="teal" onClick={handleSaveSlab}>
                              Save
                            </Button>
                            <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setEditingSlab(null)}>
                              Cancel
                            </Button>
                          </Group>
                        ) : (
                          <Button size="compact-xs" variant="light" color="indigo" onClick={() => handleStartEdit(slab)}>
                            Edit Rate
                          </Button>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>

          {/* TAB 2: DEDUCTIONS */}
          <Tabs.Panel value="deductions" pt="md">
            <Stack gap="md">
              <Text size="xs" fw={700} c="#0F172A">
                Old Tax Regime Deductions & Maximum Statutory Limits
              </Text>
              <Table striped highlightOnHover withTableBorder fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Section</Table.Th>
                    <Table.Th>Deduction Description</Table.Th>
                    <Table.Th>Max Annual Limit (₹)</Table.Th>
                    <Table.Th>Formula Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(rules?.deductions || []).map((ded) => (
                    <Table.Tr key={ded.id}>
                      <Table.Td><Badge size="xs" color="blue">{ded.sectionCode}</Badge></Table.Td>
                      <Table.Td fw={600}>{ded.name}</Table.Td>
                      <Table.Td fw={700}>₹{ded.maximumAmount.toLocaleString('en-IN')}</Table.Td>
                      <Table.Td><Text size="10px" c="#64748B">{ded.formulaType}</Text></Table.Td>
                      <Table.Td><Badge size="xs" color="teal">Active</Badge></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>

          {/* TAB 3: PROFESSIONAL TAX */}
          <Tabs.Panel value="pt" pt="md">
            <Stack gap="md">
              <Text size="xs" fw={700} c="#0F172A">
                State Professional Tax Statutory Limits
              </Text>
              <Table striped highlightOnHover withTableBorder fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>State</Table.Th>
                    <Table.Th>Annual Cap (₹)</Table.Th>
                    <Table.Th>Monthly Deduction</Table.Th>
                    <Table.Th>Old Regime Sec 16(iii)</Table.Th>
                    <Table.Th>Description</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(rules?.professionalTaxes || []).map((pt) => (
                    <Table.Tr key={pt.id}>
                      <Table.Td><Badge size="xs" color="dark">{pt.stateCode}</Badge></Table.Td>
                      <Table.Td fw={700}>₹{pt.annualLimit.toLocaleString('en-IN')}</Table.Td>
                      <Table.Td>₹{pt.monthlyDeduction}/mo (Feb: ₹{pt.februaryDeduction})</Table.Td>
                      <Table.Td><Badge size="xs" color="teal">{pt.taxTreatmentOldRegime}</Badge></Table.Td>
                      <Table.Td><Text size="10px" c="#64748B">{pt.description}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>

          {/* TAB 4: GRATUITY & BONUS */}
          <Tabs.Panel value="statutory" pt="md">
            <SimpleGrid cols={2} spacing="md">
              <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Text size="xs" fw={700} c="#0F172A" mb="xs">
                  Payment of Gratuity Act, 1972 Rules
                </Text>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Minimum Service Years:</Text>
                    <Text size="xs" fw={700} c="#0F172A">{rules.gratuity?.minimumServiceYears || 5} Years</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Days Wages Factor:</Text>
                    <Text size="xs" fw={700} c="#0F172A">{rules.gratuity?.daysWagesPerYear || 15} / {rules.gratuity?.wageDivisor || 26}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Max Tax Exemption Limit:</Text>
                    <Text size="xs" fw={700} c="#16A34A">₹{(rules.gratuity?.maxTaxExemption || 2000000).toLocaleString('en-IN')}</Text>
                  </Group>
                </Stack>
              </Paper>

              <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Text size="xs" fw={700} c="#0F172A" mb="xs">
                  Payment of Bonus Act, 1965 Rules
                </Text>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Statutory Rate Range:</Text>
                    <Text size="xs" fw={700} c="#0F172A">{rules.bonus?.minimumBonusRate || 8.33}% - {rules.bonus?.maximumBonusRate || 20}%</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Salary Eligibility Ceiling:</Text>
                    <Text size="xs" fw={700} c="#0F172A">₹{(rules.bonus?.salaryEligibilityLimit || 21000).toLocaleString('en-IN')}/month</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Calculation Wage Limit:</Text>
                    <Text size="xs" fw={700} c="#0F172A">₹{(rules.bonus?.calculationWageLimit || 7000).toLocaleString('en-IN')}/month</Text>
                  </Group>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Modal>
  );
};
