import React, { useState, useMemo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Modal,
  TextInput,
  Select,
  SimpleGrid,
  Card,
  Switch,
  ActionIcon,
  Menu,
  Tooltip,
  Alert,
  Divider,
  Box,
  NumberInput,
  Table,
  ScrollArea,
  Code,
} from '@mantine/core';
import {
  IconCalculator,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCopy,
  IconDotsVertical,
  IconAlertTriangle,
  IconCheck,
  IconArrowUp,
  IconArrowDown,
  IconSparkles,
  IconReceipt2,
  IconScale,
  IconCoins,
  IconVariable,
  IconPercentage,
  IconMathFunction,
  IconPlayCard,
  IconDeviceFloppy,
  IconX,
  IconShieldCheck,
  IconEye,
} from '@tabler/icons-react';
import { useSalaryStructures } from '../hooks/useSalaryStructures';
import { salaryStructureService } from '../services/salaryStructureService';
import { useAuthUser } from '../../auth/hooks/useAuthUser';

// Category Definitions
const CATEGORY_OPTIONS = [
  { value: 'BASIC', label: 'Basic Salary (Base)' },
  { value: 'ALLOWANCE', label: 'Allowance / Earnings' },
  { value: 'GROSS', label: 'Gross Salary (Total Earnings)' },
  { value: 'DEDUCTION', label: 'Deduction (PF, PT, TDS, ESI)' },
  { value: 'NET', label: 'Net Take-Home Pay' },
];

const CATEGORY_COLORS = {
  BASIC: 'blue',
  ALLOWANCE: 'teal',
  GROSS: 'indigo',
  DEDUCTION: 'red',
  NET: 'green',
};

const COMPUTATION_METHODS = [
  { value: 'FORMULA', label: '🧮 Custom Math Formula' },
  { value: 'PERCENTAGE', label: '📊 Percentage of Component' },
  { value: 'FIXED', label: '💰 Fixed Amount' },
];

// 1-Click Preset Structure Templates
const STRUCTURE_PRESETS = [
  {
    name: 'Standard Indian CTC Structure (Base + HRA + Special + PF + PT + TDS)',
    rules: [
      {
        name: 'Basic Salary',
        code: 'BASIC',
        category: 'BASIC',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage * 0.5',
      },
      {
        name: 'House Rent Allowance (HRA)',
        code: 'HRA',
        category: 'ALLOWANCE',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC * 0.5',
      },
      {
        name: 'Special Allowance',
        code: 'SPL_ALW',
        category: 'ALLOWANCE',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage - BASIC - HRA',
      },
      {
        name: 'Gross Earnings',
        code: 'GROSS',
        category: 'GROSS',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC + HRA + SPL_ALW',
      },
      {
        name: 'Provident Fund (EPF Employee 12%)',
        code: 'PF',
        category: 'DEDUCTION',
        computationMethod: 'FORMULA',
        formulaExpression: 'min(BASIC * 0.12, 1800)',
      },
      {
        name: 'Professional Tax (PT)',
        code: 'PT',
        category: 'DEDUCTION',
        computationMethod: 'FIXED',
        amount: 200,
      },
      {
        name: 'Tax Deducted at Source (TDS)',
        code: 'TDS',
        category: 'DEDUCTION',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS * 0.05',
      },
      {
        name: 'Net Take-Home Pay',
        code: 'NET',
        category: 'NET',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS - PF - PT - TDS',
      },
    ],
  },
  {
    name: '40-20-40 Flexi CTC (Basic + HRA + Conveyance + Flexi Allowance)',
    rules: [
      {
        name: 'Basic Pay',
        code: 'BASIC',
        category: 'BASIC',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage * 0.4',
      },
      {
        name: 'House Rent Allowance',
        code: 'HRA',
        category: 'ALLOWANCE',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC * 0.5',
      },
      {
        name: 'Conveyance Allowance',
        code: 'CONV',
        category: 'ALLOWANCE',
        computationMethod: 'FIXED',
        amount: 1600,
      },
      {
        name: 'Flexible Benefit Allowance',
        code: 'FLEXI',
        category: 'ALLOWANCE',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage - BASIC - HRA - CONV',
      },
      {
        name: 'Gross Total',
        code: 'GROSS',
        category: 'GROSS',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC + HRA + CONV + FLEXI',
      },
      {
        name: 'EPF Deduction (12%)',
        code: 'PF',
        category: 'DEDUCTION',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC * 0.12',
      },
      {
        name: 'Net Pay',
        code: 'NET',
        category: 'NET',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS - PF',
      },
    ],
  },
  {
    name: 'Executive Leadership Scale (High CTC with Perks & Statutory TDS)',
    rules: [
      {
        name: 'Executive Basic',
        code: 'BASIC',
        category: 'BASIC',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage * 0.45',
      },
      {
        name: 'Executive HRA',
        code: 'HRA',
        category: 'ALLOWANCE',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC * 0.5',
      },
      {
        name: 'Management Performance Allowance',
        code: 'MGMT_ALW',
        category: 'ALLOWANCE',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage - BASIC - HRA',
      },
      {
        name: 'Gross Salary',
        code: 'GROSS',
        category: 'GROSS',
        computationMethod: 'FORMULA',
        formulaExpression: 'BASIC + HRA + MGMT_ALW',
      },
      {
        name: 'Statutory PF (Capped ₹1,800)',
        code: 'PF',
        category: 'DEDUCTION',
        computationMethod: 'FIXED',
        amount: 1800,
      },
      {
        name: 'TDS Withholding (15% Scale)',
        code: 'TDS',
        category: 'DEDUCTION',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS * 0.15',
      },
      {
        name: 'Net Compensation',
        code: 'NET',
        category: 'NET',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS - PF - TDS',
      },
    ],
  },
  {
    name: 'Contractor & Consultant Retainer (Section 194J 10% TDS)',
    rules: [
      {
        name: 'Professional Retainer Fees',
        code: 'RETAINER',
        category: 'BASIC',
        computationMethod: 'FORMULA',
        formulaExpression: 'wage',
      },
      {
        name: 'Gross Retainer',
        code: 'GROSS',
        category: 'GROSS',
        computationMethod: 'FORMULA',
        formulaExpression: 'RETAINER',
      },
      {
        name: 'TDS Section 194J (10%)',
        code: 'TDS_194J',
        category: 'DEDUCTION',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS * 0.10',
      },
      {
        name: 'Net Payout',
        code: 'NET',
        category: 'NET',
        computationMethod: 'FORMULA',
        formulaExpression: 'GROSS - TDS_194J',
      },
    ],
  },
];

// Helper to simulate rules locally
function simulateRulesLocally(wage = 100000, rules = []) {
  const context = {
    wage: Number(wage),
    WAGE: Number(wage),
    gross: 0,
    GROSS: 0,
    deductions: 0,
    DEDUCTIONS: 0,
    net: 0,
    NET: 0,
  };

  const computedLines = [];
  let totalEarnings = 0;
  let totalDeductions = 0;

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    let amount = 0;
    const method = rule.computationMethod;

    if (method === 'FIXED') {
      amount = Number(rule.amount || 0);
    } else if (method === 'PERCENTAGE') {
      const baseCode = (rule.percentageOf || 'WAGE').toUpperCase();
      const baseVal = context[baseCode] !== undefined ? context[baseCode] : (context[rule.percentageOf] || context.wage);
      const pct = Number(rule.percentageValue || 0);
      const multiplier = pct > 1 ? pct / 100 : pct;
      amount = Number((baseVal * multiplier).toFixed(2));
    } else if (method === 'FORMULA' && rule.formulaExpression) {
      try {
        let expr = String(rule.formulaExpression)
          .replace(/min\(/g, 'Math.min(')
          .replace(/max\(/g, 'Math.max(');
        const keys = Object.keys(context);
        const values = Object.values(context);
        const fn = new Function(...keys, `return Number(${expr});`);
        const res = fn(...values);
        amount = isNaN(res) ? 0 : Number(res.toFixed(2));
      } catch (e) {
        amount = 0;
      }
    }

    amount = Math.max(0, Number(amount.toFixed(2)));

    const codeKey = (rule.code || '').trim();
    if (codeKey) {
      context[codeKey] = amount;
      context[codeKey.toUpperCase()] = amount;
      context[codeKey.toLowerCase()] = amount;
    }

    if (rule.category === 'BASIC' || rule.category === 'ALLOWANCE' || rule.category === 'GROSS') {
      if (rule.category !== 'GROSS') {
        totalEarnings += amount;
      }
    } else if (rule.category === 'DEDUCTION') {
      totalDeductions += amount;
    }

    context.GROSS = totalEarnings;
    context.gross = totalEarnings;
    context.DEDUCTIONS = totalDeductions;
    context.deductions = totalDeductions;
    context.NET = Math.max(0, totalEarnings - totalDeductions);
    context.net = context.NET;

    computedLines.push({
      ...rule,
      amount,
      runningGross: totalEarnings,
      runningDeductions: totalDeductions,
      runningNet: context.NET,
    });
  }

  return {
    wage: Number(wage),
    grossEarnings: Number(totalEarnings.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netTakeHome: Number(context.NET.toFixed(2)),
    lines: computedLines,
  };
}

export const SalaryStructuresView = ({ onRefresh }) => {
  const { structures, loading, fetchStructures } = useSalaryStructures();
  const { currentRole } = useAuthUser();
  const isPayrollManagerOrAdmin = currentRole === 'ADMIN' || currentRole === 'HR_PAYROLL_MANAGER';
  const isReadOnly = !isPayrollManagerOrAdmin;

  // Builder Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStructureId, setEditingStructureId] = useState(null);
  const [structureName, setStructureName] = useState('');
  const [structureActive, setStructureActive] = useState(true);
  const [rules, setRules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Live Sandbox Simulation Wage
  const [sandboxWage, setSandboxWage] = useState(100000);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetStructure, setTargetStructure] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Standalone Simulator Modal State
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [activeSimulatorStructure, setActiveSimulatorStructure] = useState(null);

  // Live simulation for builder modal
  const liveSimulation = useMemo(() => {
    return simulateRulesLocally(sandboxWage, rules);
  }, [sandboxWage, rules]);

  // Handle open Create
  const handleOpenCreate = () => {
    if (isReadOnly) return;
    setEditingStructureId(null);
    setStructureName('Custom Indian Compensation Structure');
    setStructureActive(true);
    setFormError(null);
    handleApplyPreset(STRUCTURE_PRESETS[0]);
    setModalOpen(true);
  };

  // Handle open Edit/View
  const handleOpenEdit = (st) => {
    setEditingStructureId(st.id);
    setStructureName(st.name);
    setStructureActive(st.isActive);
    setFormError(null);
    setRules(
      (st.rules || []).map((r, idx) => ({
        id: r.id || `rule_${idx}`,
        name: r.name,
        code: r.code,
        category: r.category,
        sequence: r.sequence !== undefined ? r.sequence : (idx + 1) * 10,
        computationMethod: r.computationMethod,
        amount: r.amount !== null && r.amount !== undefined ? r.amount : '',
        percentageOf: r.percentageOf || 'BASIC',
        percentageValue: r.percentageValue !== null && r.percentageValue !== undefined ? r.percentageValue : 50,
        formulaExpression: r.formulaExpression || '',
      }))
    );
    setModalOpen(true);
  };

  // Apply Preset
  const handleApplyPreset = (preset) => {
    setStructureName(preset.name);
    setRules(
      preset.rules.map((r, idx) => ({
        id: `rule_preset_${idx}`,
        name: r.name,
        code: r.code,
        category: r.category,
        sequence: (idx + 1) * 10,
        computationMethod: r.computationMethod,
        amount: r.amount !== undefined ? r.amount : '',
        percentageOf: r.percentageOf || 'BASIC',
        percentageValue: r.percentageValue !== undefined ? r.percentageValue : 50,
        formulaExpression: r.formulaExpression || '',
      }))
    );
  };

  // Add new rule
  const handleAddRule = () => {
    const newSeq = (rules.length + 1) * 10;
    setRules([
      ...rules,
      {
        id: `rule_${Date.now()}`,
        name: 'New Custom Allowance',
        code: `ALW_${rules.length + 1}`,
        category: 'ALLOWANCE',
        sequence: newSeq,
        computationMethod: 'FORMULA',
        amount: '',
        percentageOf: 'BASIC',
        percentageValue: 20,
        formulaExpression: 'BASIC * 0.2',
      },
    ]);
  };

  // Update rule field
  const handleUpdateRule = (index, field, value) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  // Remove rule
  const handleRemoveRule = (index) => {
    const updated = rules.filter((_, idx) => idx !== index);
    setRules(updated);
  };

  // Move rule Up / Down
  const handleMoveRule = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...rules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Renumber sequences
    updated.forEach((r, idx) => {
      r.sequence = (idx + 1) * 10;
    });

    setRules(updated);
  };

  // Insert Variable helper
  const handleInsertVariable = (index, varName) => {
    const current = rules[index].formulaExpression || '';
    const updatedExpr = current ? `${current} + ${varName}` : varName;
    handleUpdateRule(index, 'formulaExpression', updatedExpr);
  };

  // Save structure
  const handleSaveStructure = async (e) => {
    e?.preventDefault();
    if (!structureName.trim()) {
      setFormError('Please enter a structure name.');
      return;
    }

    if (rules.length === 0) {
      setFormError('Please add at least one salary rule.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: structureName.trim(),
        isActive: structureActive,
        rules: rules.map((r, idx) => ({
          name: r.name.trim(),
          code: (r.code || `RULE_${idx + 1}`).trim().toUpperCase(),
          category: r.category,
          sequence: (idx + 1) * 10,
          computationMethod: r.computationMethod,
          amount: r.amount !== '' && r.amount !== null ? Number(r.amount) : null,
          percentageOf: r.percentageOf ? String(r.percentageOf).toUpperCase() : null,
          percentageValue: r.percentageValue !== '' && r.percentageValue !== null ? Number(r.percentageValue) : null,
          formulaExpression: r.formulaExpression ? String(r.formulaExpression).trim() : null,
        })),
      };

      if (editingStructureId) {
        await salaryStructureService.updateStructure(editingStructureId, payload);
      } else {
        await salaryStructureService.createStructure(payload);
      }

      setModalOpen(false);
      await fetchStructures();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to save salary structure:', err);
      setFormError(err.message || 'Failed to save salary structure.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Structure
  const handleConfirmDelete = async () => {
    if (!targetStructure?.id) return;
    setDeleting(true);
    try {
      await salaryStructureService.deleteStructure(targetStructure.id);
      setDeleteModalOpen(false);
      setTargetStructure(null);
      await fetchStructures();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete structure:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Duplicate Structure
  const handleDuplicate = async (st) => {
    try {
      await salaryStructureService.createStructure({
        name: `${st.name} (Copy)`,
        isActive: true,
        rules: (st.rules || []).map((r, idx) => ({
          name: r.name,
          code: r.code,
          category: r.category,
          sequence: (idx + 1) * 10,
          computationMethod: r.computationMethod,
          amount: r.amount,
          percentageOf: r.percentageOf,
          percentageValue: r.percentageValue,
          formulaExpression: r.formulaExpression,
        })),
      });
      await fetchStructures();
    } catch (err) {
      console.error('Failed to duplicate structure:', err);
    }
  };

  return (
    <Stack gap="lg">
      {/* Read-Only Notice for HR Payroll User */}
      {isReadOnly && (
        <Alert
          icon={<IconShieldCheck size={18} />}
          color="blue"
          radius="md"
          variant="light"
          title={`Role: ${currentRole ? currentRole.replace(/_/g, ' ') : 'User'} (Read-Only Salary Rules)`}
          styles={{
            root: { border: '1px solid #BFDBFE', backgroundColor: '#EFF6FF' },
            title: { color: '#1E40AF', fontWeight: 700 },
            message: { color: '#1E3A8A', fontSize: '12px' },
          }}
        >
          You have view and simulation permissions for salary structures and calculation rules. Configuration changes (adding rules, editing formulas, modifying PF/TDS ratios) are restricted to HR Payroll Managers and Admins to preserve financial calculation integrity.
        </Alert>
      )}

      {/* Header Section */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <div>
            <Group gap="xs" align="center" mb={4}>
              <IconCalculator size={22} color="#0284C7" />
              <Text fw={800} size="md" c="#09090B">
                SALARY STRUCTURE BUILDER & FORMULA ENGINE
              </Text>
              <Badge size="sm" color="blue" variant="filled">
                {structures.length} Active Structures
              </Badge>
              {isReadOnly && (
                <Badge size="sm" color="cyan" variant="outline">
                  Read-Only Mode
                </Badge>
              )}
            </Group>
            <Text size="xs" c="#64748B">
              {isReadOnly
                ? 'Inspect salary structures, review statutory formulas, and test real-time salary calculations in the live sandbox.'
                : 'Create, reorder, and configure compensation rules: fixed allowances, percentage scales, and custom mathematical formulas (Basic, HRA, PF, TDS)'}
            </Text>
          </div>

          <Group gap="xs">
            {!isReadOnly ? (
              <Button
                size="sm"
                color="dark"
                leftSection={<IconPlus size={16} />}
                onClick={handleOpenCreate}
              >
                Create Salary Structure
              </Button>
            ) : (
              <Tooltip label="Structure creation is restricted to HR Payroll Manager & Admin">
                <Button
                  size="sm"
                  color="gray"
                  variant="light"
                  disabled
                  leftSection={<IconPlus size={16} />}
                >
                  Create Salary Structure
                </Button>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      {/* Salary Structures Cards Grid */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {structures.map((st) => {
          const rulesList = st.rules || [];
          const basicRule = rulesList.find((r) => r.category === 'BASIC' || r.code === 'BASIC');
          const deductionsCount = rulesList.filter((r) => r.category === 'DEDUCTION').length;
          const allowancesCount = rulesList.filter((r) => r.category === 'ALLOWANCE').length;

          return (
            <Card
              key={st.id}
              padding="md"
              radius="md"
              withBorder
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div>
                {/* Header: Title & Actions */}
                <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} size="sm" c="#09090B">
                      {st.name}
                    </Text>
                    <Group gap="xs" mt={2}>
                      <Badge size="xs" color="blue" variant="light">
                        {rulesList.length} Rules Defined
                      </Badge>
                      <Badge size="xs" color={st.isActive ? 'teal' : 'gray'} variant="outline">
                        {st.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Group>
                  </div>

                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon size="sm" variant="subtle" color="gray">
                        <IconDotsVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Structure Actions</Menu.Label>
                      <Menu.Item
                        leftSection={isReadOnly ? <IconEye size={14} /> : <IconEdit size={14} />}
                        onClick={() => handleOpenEdit(st)}
                      >
                        {isReadOnly ? 'View Structure & Rules' : 'Edit Rules & Formulas'}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconCalculator size={14} color="#0284C7" />}
                        onClick={() => {
                          setActiveSimulatorStructure(st);
                          setSimulatorOpen(true);
                        }}
                      >
                        Live Salary Simulator
                      </Menu.Item>
                      {!isReadOnly && (
                        <>
                          <Menu.Item
                            leftSection={<IconCopy size={14} />}
                            onClick={() => handleDuplicate(st)}
                          >
                            Duplicate Structure
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => {
                              setTargetStructure(st);
                              setDeleteModalOpen(true);
                            }}
                          >
                            Delete / Deactivate
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Group>

                {/* Ordered Rules Overview Table */}
                <Paper p="xs" radius="sm" mb="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Stack gap={4}>
                    <Text size="10px" fw={700} c="#64748B">
                      ORDERED RULE COMPUTATION SEQUENCE:
                    </Text>
                    {rulesList.slice(0, 6).map((r, idx) => (
                      <Group key={r.id || idx} justify="space-between" wrap="nowrap" gap="xs">
                        <Group gap={4} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                          <Code style={{ fontSize: '10px', fontWeight: 700 }}>{r.code}</Code>
                          <Text size="11px" c="#334155" truncate>
                            {r.name}
                          </Text>
                        </Group>

                        <Group gap={4} wrap="nowrap">
                          <Badge size="xs" color={CATEGORY_COLORS[r.category] || 'gray'} variant="dot">
                            {r.category}
                          </Badge>
                          <Text size="10px" c="#64748B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {r.computationMethod === 'FIXED'
                              ? `₹${r.amount}`
                              : r.computationMethod === 'PERCENTAGE'
                              ? `${r.percentageValue}% of ${r.percentageOf}`
                              : r.formulaExpression}
                          </Text>
                        </Group>
                      </Group>
                    ))}
                    {rulesList.length > 6 && (
                      <Text size="10px" c="#94A3B8" ta="center">
                        + {rulesList.length - 6} more rules...
                      </Text>
                    )}
                  </Stack>
                </Paper>
              </div>

              {/* Bottom Card Footer */}
              <div>
                <Divider my="xs" color="#F1F5F9" />
                <Group justify="space-between" align="center">
                  <Text size="xs" c="#64748B">
                    <b>{st.contractsCount || 0}</b> employees assigned
                  </Text>

                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
                      leftSection={<IconCalculator size={12} />}
                      onClick={() => {
                        setActiveSimulatorStructure(st);
                        setSimulatorOpen(true);
                      }}
                    >
                      Simulate
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={isReadOnly ? <IconEye size={12} /> : <IconEdit size={12} />}
                      onClick={() => handleOpenEdit(st)}
                    >
                      {isReadOnly ? 'View Rules' : 'Edit Rules'}
                    </Button>
                  </Group>
                </Group>
              </div>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Interactive Salary Structure Builder / Inspector Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="xs">
            <IconCalculator size={20} color="#0284C7" />
            <Text fw={700} size="sm" c="#09090B">
              {isReadOnly
                ? 'Inspect Salary Structure & Rule Formulas (Read-Only)'
                : editingStructureId
                ? 'Edit Salary Structure & Rule Formulas'
                : 'Create Salary Structure & Rule Engine'}
            </Text>
            {isReadOnly && (
              <Badge size="xs" color="cyan" variant="filled">
                Read-Only
              </Badge>
            )}
          </Group>
        }
        size="90%"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <form onSubmit={handleSaveStructure}>
          <Stack gap="md">
            {isReadOnly && (
              <Alert icon={<IconShieldCheck size={16} />} color="blue" variant="light" py="xs">
                <Text size="xs" c="#1E40AF" fw={500}>
                  <b>Read-Only Mode:</b> You can inspect formula expressions and test computations in the live sandbox. Modifying rule formulas is restricted to HR Payroll Managers and Admins.
                </Text>
              </Alert>
            )}

            {formError && (
              <Alert color="red" title="Error" icon={<IconAlertTriangle size={16} />}>
                {formError}
              </Alert>
            )}

            {/* Structure Name & Status */}
            <Group justify="space-between" align="flex-end">
              <TextInput
                label="Salary Structure Name"
                placeholder="e.g. Standard Corporate CTC (50-50 Base & HRA)"
                required
                readOnly={isReadOnly}
                disabled={isReadOnly}
                style={{ flex: 1 }}
                value={structureName}
                onChange={(e) => setStructureName(e.target.value)}
              />

              <Switch
                label="Active Structure"
                checked={structureActive}
                disabled={isReadOnly}
                onChange={(e) => setStructureActive(e.currentTarget.checked)}
                color="teal"
                mb={6}
              />
            </Group>

            {/* 1-Click Preset Template Selector (Admin/Manager only) */}
            {!isReadOnly && (
              <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Group justify="space-between" align="center" mb={6}>
                  <Group gap={6}>
                    <IconSparkles size={16} color="#4F46E5" />
                    <Text size="xs" fw={700} c="#0F172A">
                      1-Click Indian Compensation Presets:
                    </Text>
                  </Group>
                  <Text size="11px" c="#64748B">
                    Auto-populate standard rule sequence & statutory formulas
                  </Text>
                </Group>

                <Group gap="xs" wrap="wrap">
                  {STRUCTURE_PRESETS.map((preset, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      size="xs"
                      variant="light"
                      color="indigo"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {preset.name.split(' (')[0]}
                    </Button>
                  ))}
                </Group>
              </Paper>
            )}

            {/* Dynamic Rules Table / Rows */}
            <div>
              <Group justify="space-between" align="center" mb="xs">
                <div>
                  <Text size="xs" fw={700} c="#0F172A">
                    Configured Salary Rules & Computation Logic:
                  </Text>
                  <Text size="10px" c="#64748B">
                    Rules execute sequentially in order.
                  </Text>
                </div>

                {!isReadOnly && (
                  <Button
                    type="button"
                    size="xs"
                    variant="light"
                    color="blue"
                    leftSection={<IconPlus size={14} />}
                    onClick={handleAddRule}
                  >
                    + Add Salary Rule
                  </Button>
                )}
              </Group>

              <ScrollArea.Autosize mah="420px">
                <Stack gap="xs">
                  {rules.map((rule, index) => {
                    return (
                      <Paper
                        key={rule.id || index}
                        p="xs"
                        radius="md"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <Stack gap="xs">
                          {/* Row Top: Reorder, Name, Code, Category & Delete */}
                          <Group justify="space-between" align="center" wrap="nowrap">
                            <Group gap={4} wrap="nowrap">
                              <Badge size="sm" color="dark" variant="filled">
                                #{index + 1}
                              </Badge>

                              {/* Up / Down Reorder */}
                              {!isReadOnly && (
                                <>
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    disabled={index === 0}
                                    onClick={() => handleMoveRule(index, 'up')}
                                  >
                                    <IconArrowUp size={14} />
                                  </ActionIcon>
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    disabled={index === rules.length - 1}
                                    onClick={() => handleMoveRule(index, 'down')}
                                  >
                                    <IconArrowDown size={14} />
                                  </ActionIcon>
                                </>
                              )}
                            </Group>

                            {/* Name & Code */}
                            <Group gap="xs" style={{ flex: 1 }}>
                              <TextInput
                                placeholder="Rule Name (e.g. House Rent Allowance)"
                                size="xs"
                                style={{ flex: 1 }}
                                value={rule.name}
                                disabled={isReadOnly}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateRule(index, 'name', e.target.value)}
                              />

                              <TextInput
                                placeholder="Code (e.g. HRA)"
                                size="xs"
                                style={{ width: '120px' }}
                                value={rule.code}
                                disabled={isReadOnly}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateRule(index, 'code', e.target.value.toUpperCase())}
                                styles={{ input: { fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 } }}
                              />

                              <Select
                                size="xs"
                                style={{ width: '170px' }}
                                value={rule.category}
                                disabled={isReadOnly}
                                onChange={(val) => handleUpdateRule(index, 'category', val || 'ALLOWANCE')}
                                data={CATEGORY_OPTIONS}
                              />
                            </Group>

                            {/* Delete Rule */}
                            {!isReadOnly && (
                              <ActionIcon
                                size="xs"
                                color="red"
                                variant="subtle"
                                onClick={() => handleRemoveRule(index)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            )}
                          </Group>

                          {/* Row Bottom: Computation Method & Formula */}
                          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                              <Select
                                label="Computation Method"
                                size="xs"
                                style={{ width: '220px' }}
                                value={rule.computationMethod}
                                disabled={isReadOnly}
                                onChange={(val) => handleUpdateRule(index, 'computationMethod', val || 'FORMULA')}
                                data={COMPUTATION_METHODS}
                              />

                              {/* Fixed Amount */}
                              {rule.computationMethod === 'FIXED' && (
                                <NumberInput
                                  label="Fixed Monthly Amount (₹)"
                                  size="xs"
                                  style={{ width: '180px' }}
                                  value={rule.amount}
                                  disabled={isReadOnly}
                                  readOnly={isReadOnly}
                                  onChange={(val) => handleUpdateRule(index, 'amount', val)}
                                  placeholder="e.g. 200"
                                />
                              )}

                              {/* Percentage */}
                              {rule.computationMethod === 'PERCENTAGE' && (
                                <Group gap="xs">
                                  <NumberInput
                                    label="Percentage Value (%)"
                                    size="xs"
                                    style={{ width: '140px' }}
                                    value={rule.percentageValue}
                                    disabled={isReadOnly}
                                    readOnly={isReadOnly}
                                    onChange={(val) => handleUpdateRule(index, 'percentageValue', val)}
                                    placeholder="50"
                                  />
                                  <TextInput
                                    label="Percentage Of Component Code"
                                    size="xs"
                                    style={{ width: '150px' }}
                                    value={rule.percentageOf || 'BASIC'}
                                    disabled={isReadOnly}
                                    readOnly={isReadOnly}
                                    onChange={(e) => handleUpdateRule(index, 'percentageOf', e.target.value.toUpperCase())}
                                    placeholder="BASIC"
                                  />
                                </Group>
                              )}

                              {/* Custom Math Formula */}
                              {rule.computationMethod === 'FORMULA' && (
                                <Box style={{ flex: 1, minWidth: '320px' }}>
                                  <TextInput
                                    label="Mathematical Formula Expression"
                                    size="xs"
                                    placeholder="e.g. BASIC * 0.5 or min(BASIC * 0.12, 1800)"
                                    value={rule.formulaExpression || ''}
                                    disabled={isReadOnly}
                                    readOnly={isReadOnly}
                                    onChange={(e) => handleUpdateRule(index, 'formulaExpression', e.target.value)}
                                    styles={{ input: { fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 } }}
                                  />
                                  {!isReadOnly && (
                                    <Group gap={4} mt={4}>
                                      <Text size="10px" c="#64748B">
                                        Quick insert:
                                      </Text>
                                      {['wage', 'BASIC', 'HRA', 'GROSS', 'SPL_ALW', 'PF', 'min(BASIC * 0.12, 1800)'].map((v) => (
                                        <Badge
                                          key={v}
                                          size="xs"
                                          variant="outline"
                                          color="gray"
                                          style={{ cursor: 'pointer' }}
                                          onClick={() => handleInsertVariable(index, v)}
                                        >
                                          + {v}
                                        </Badge>
                                      ))}
                                    </Group>
                                  )}
                                </Box>
                              )}
                            </Group>
                          </Paper>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </ScrollArea.Autosize>
            </div>

            {/* Live Interactive Sandbox / Simulator */}
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
              }}
            >
              <Group justify="space-between" align="center" mb="xs">
                <Group gap="xs">
                  <IconCalculator size={18} color="#0284C7" />
                  <Text size="xs" fw={700} c="#0F172A">
                    LIVE FORMULA SANDBOX & BREAKDOWN SIMULATION:
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text size="xs" c="#64748B" fw={600}>
                    Test Monthly Base (₹):
                  </Text>
                  <NumberInput
                    size="xs"
                    style={{ width: '140px' }}
                    value={sandboxWage}
                    onChange={(val) => setSandboxWage(Number(val) || 100000)}
                    step={10000}
                    styles={{ input: { fontWeight: 700 } }}
                  />
                </Group>
              </Group>

              {/* Simulation Result Summary */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="xs">
                <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Text size="10px" c="#64748B" fw={700}>
                    GROSS EARNINGS
                  </Text>
                  <Text size="md" fw={800} c="#16A34A" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{liveSimulation.grossEarnings?.toLocaleString('en-IN')}
                  </Text>
                </Paper>

                <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Text size="10px" c="#64748B" fw={700}>
                    TOTAL DEDUCTIONS
                  </Text>
                  <Text size="md" fw={800} c="#DC2626" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{liveSimulation.totalDeductions?.toLocaleString('en-IN')}
                  </Text>
                </Paper>

                <Paper p="xs" radius="sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Text size="10px" c="#64748B" fw={700}>
                    NET TAKE-HOME PAY
                  </Text>
                  <Text size="md" fw={800} c="#0284C7" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{liveSimulation.netTakeHome?.toLocaleString('en-IN')}/mo
                  </Text>
                </Paper>
              </SimpleGrid>

              {/* Mini computed breakdown list */}
              <Group gap="xs" wrap="wrap">
                {liveSimulation.lines.map((l, idx) => (
                  <Badge
                    key={idx}
                    size="sm"
                    color={CATEGORY_COLORS[l.category] || 'gray'}
                    variant="light"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {l.code}: ₹{l.amount?.toLocaleString('en-IN')}
                  </Badge>
                ))}
              </Group>
            </Paper>

            {/* Modal Actions */}
            <Group justify="flex-end" gap="xs" mt="sm">
              <Button type="button" size="xs" variant="default" onClick={() => setModalOpen(false)}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button
                  size="xs"
                  color="dark"
                  type="submit"
                  loading={saving}
                  leftSection={<IconDeviceFloppy size={14} />}
                >
                  {editingStructureId ? 'Save & Update Structure' : 'Create Structure'}
                </Button>
              )}
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Standalone Simulator Modal */}
      <Modal
        opened={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        title={
          <Group gap="xs">
            <IconCalculator size={18} color="#0284C7" />
            <Text fw={700} size="sm" c="#09090B">
              Salary Simulation Sandbox - {activeSimulatorStructure?.name}
            </Text>
          </Group>
        }
        size="lg"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        {activeSimulatorStructure && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text size="xs" c="#64748B">
                Simulate full monthly and annual take-home compensation for any base wage.
              </Text>
              <NumberInput
                label="Monthly CTC / Base (₹)"
                size="xs"
                value={sandboxWage}
                onChange={(val) => setSandboxWage(Number(val) || 100000)}
                step={10000}
                styles={{ input: { fontWeight: 700, width: '160px' } }}
              />
            </Group>

            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ backgroundColor: '#F8FAFC' }}>
                  <Table.Th style={{ fontSize: '11px' }}>CODE</Table.Th>
                  <Table.Th style={{ fontSize: '11px' }}>COMPONENT NAME</Table.Th>
                  <Table.Th style={{ fontSize: '11px' }}>CATEGORY</Table.Th>
                  <Table.Th style={{ fontSize: '11px', textAlign: 'right' }}>COMPUTED (₹)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {simulateRulesLocally(sandboxWage, activeSimulatorStructure.rules).lines.map((l, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>
                      <Code fw={700}>{l.code}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={600} c="#09090B">
                        {l.name}
                      </Text>
                      <Text size="10px" c="#64748B">
                        {l.computationMethod === 'FIXED'
                          ? `Fixed Amount`
                          : l.computationMethod === 'PERCENTAGE'
                          ? `${l.percentageValue}% of ${l.percentageOf}`
                          : l.formulaExpression}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={CATEGORY_COLORS[l.category] || 'gray'} variant="light">
                        {l.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs" fw={700} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        ₹{l.amount?.toLocaleString('en-IN')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Divider color="#E2E8F0" />

            <SimpleGrid cols={3} spacing="sm">
              <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <Text size="10px" c="#64748B" fw={700}>
                  GROSS EARNINGS
                </Text>
                <Text size="sm" fw={800} c="#16A34A" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ₹{simulateRulesLocally(sandboxWage, activeSimulatorStructure.rules).grossEarnings.toLocaleString('en-IN')}
                </Text>
              </Paper>

              <Paper p="xs" radius="sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <Text size="10px" c="#64748B" fw={700}>
                  TOTAL DEDUCTIONS
                </Text>
                <Text size="sm" fw={800} c="#DC2626" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ₹{simulateRulesLocally(sandboxWage, activeSimulatorStructure.rules).totalDeductions.toLocaleString('en-IN')}
                </Text>
              </Paper>

              <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Text size="10px" c="#64748B" fw={700}>
                  NET TAKE-HOME PAY
                </Text>
                <Text size="sm" fw={800} c="#0284C7" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ₹{simulateRulesLocally(sandboxWage, activeSimulatorStructure.rules).netTakeHome.toLocaleString('en-IN')}/mo
                </Text>
              </Paper>
            </SimpleGrid>

            <Group justify="flex-end">
              <Button size="xs" variant="default" onClick={() => setSimulatorOpen(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={18} color="#DC2626" />
            <Text fw={700} size="sm" c="#991B1B">
              Delete Salary Structure
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: { backgroundColor: '#FFFFFF', borderColor: '#FECACA' },
          header: { backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' },
        }}
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Confirm Deletion">
            <Text size="xs" c="#991B1B" fw={600}>
              Are you sure you want to delete structure <b>{targetStructure?.name}</b>?
            </Text>
          </Alert>

          <Text size="xs" c="#64748B">
            If this structure is currently linked to active employee contracts, it will be marked as Inactive instead of permanently deleted to protect payroll integrity.
          </Text>

          <Group justify="flex-end" gap="xs">
            <Button size="xs" variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              color="red"
              loading={deleting}
              onClick={handleConfirmDelete}
              leftSection={<IconTrash size={14} />}
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default SalaryStructuresView;
