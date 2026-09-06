import React, { useState, useEffect } from 'react';
import {
  Modal,
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  TextInput,
  Textarea,
  SegmentedControl,
  Switch,
  SimpleGrid,
  ThemeIcon,
  ActionIcon,
  Divider,
  Alert,
  Tooltip,
  ScrollArea,
  Box,
} from '@mantine/core';
import {
  IconCalendarTime,
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconShieldCheck,
  IconClock,
  IconCoins,
  IconUserCheck,
  IconSearch,
  IconSparkles,
  IconX,
  IconInfoCircle,
} from '@tabler/icons-react';
import { attendanceService } from '../services/attendanceService';

export const TimeOffTypesModal = ({ opened, onClose, onRefresh }) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingType, setEditingType] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    unit: 'DAYS',
    requiresAllocation: true,
    requiresApproval: true,
    affectsPayroll: true,
    isActive: true,
    description: '',
  });

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.fetchTimeOffTypes();
      if (res && res.data) {
        setTypes(res.data);
      }
    } catch (err) {
      console.warn('Failed to load leave types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) {
      loadTypes();
      setFormOpen(false);
      setEditingType(null);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [opened]);

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({
      name: '',
      code: '',
      unit: 'DAYS',
      requiresAllocation: true,
      requiresApproval: true,
      affectsPayroll: true,
      isActive: true,
      description: '',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingType(t);
    setFormData({
      name: t.name || '',
      code: t.code || '',
      unit: t.unit || 'DAYS',
      requiresAllocation: t.requiresAllocation ?? true,
      requiresApproval: t.requiresApproval ?? true,
      affectsPayroll: t.affectsPayroll ?? true,
      isActive: t.isActive ?? true,
      description: t.description || '',
    });
    setFormOpen(true);
  };

  const handleSaveType = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Policy name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingType) {
        await attendanceService.updateTimeOffType(editingType.id, formData);
        setSuccessMsg(`Leave Policy "${formData.name}" updated successfully.`);
      } else {
        await attendanceService.createTimeOffType(formData);
        setSuccessMsg(`New Leave Policy "${formData.name}" configured successfully.`);
      }
      setFormOpen(false);
      await loadTypes();
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save time off type:', err);
      setErrorMsg(err.message || 'Failed to save leave policy.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete "${name}"?`)) return;
    try {
      await attendanceService.deleteTimeOffType(id);
      await loadTypes();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredTypes = types.filter((t) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return (
      t.name?.toLowerCase().includes(term) ||
      t.code?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="lg"
      padding={0}
      withCloseButton={false}
      styles={{
        content: {
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        },
        body: { padding: 0 },
      }}
    >
      {/* 1. HERO HEADER */}
      <Box p="lg" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" mb={4}>
              <Badge size="sm" color="indigo" variant="light">
                SECTION 4 A4 COMPLIANT
              </Badge>
              <Badge size="sm" color="teal" variant="light">
                {types.length} Configured Policies
              </Badge>
            </Group>
            <TitleComponent text="Time Off Types & Leave Policy Setup" />
            <Text size="xs" c="#64748B" mt={2}>
              Define organizational leave rules, tracking units (days/hours), balance allocation requirements, and payroll impact
            </Text>
          </div>

          <Group gap="xs">
            {!formOpen && (
              <Button
                size="xs"
                color="indigo"
                variant="filled"
                leftSection={<IconPlus size={14} />}
                onClick={handleOpenCreate}
                style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}
              >
                + New Leave Type
              </Button>
            )}
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={onClose}
              size="lg"
              radius="xl"
              title="Close Modal"
            >
              ✕
            </ActionIcon>
          </Group>
        </Group>

        {/* Success / Error Alerts */}
        {successMsg && (
          <Alert color="teal" icon={<IconCheck size={16} />} mt="sm" p="xs" radius="sm">
            <Text size="xs" fw={600} c="#065F46">{successMsg}</Text>
          </Alert>
        )}
        {errorMsg && (
          <Alert color="red" icon={<IconInfoCircle size={16} />} mt="sm" p="xs" radius="sm">
            <Text size="xs" fw={600} c="#991B1B">{errorMsg}</Text>
          </Alert>
        )}
      </Box>

      {/* 2. BODY CONTENT: FORM OR LIST */}
      <Box p="lg" style={{ backgroundColor: '#F8FAFC', maxHeight: '70vh', overflowY: 'auto' }}>
        {formOpen ? (
          /* CREATE / EDIT POLICY FORM */
          <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Group justify="space-between" align="center" mb="md">
              <Group gap="xs">
                <ThemeIcon size="md" color="indigo" variant="light" radius="md">
                  <IconCalendarTime size={18} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={700} c="#0F172A">
                    {editingType ? `Edit Leave Policy: ${editingType.name}` : 'Configure New Time Off Policy'}
                  </Text>
                  <Text size="11px" c="#64748B">
                    Specify unit tracking, approval workflow, and payroll integration
                  </Text>
                </div>
              </Group>

              <Button size="xs" variant="subtle" color="gray" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </Group>

            <form onSubmit={handleSaveType}>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    size="sm"
                    label="Leave Type Name"
                    placeholder="e.g. Sabbatical Leave, Maternity Benefit"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <TextInput
                    size="sm"
                    label="Short Code"
                    placeholder="e.g. SAB, MAT, CL"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </SimpleGrid>

                <div>
                  <Text size="xs" fw={600} c="#0F172A" mb={4}>
                    Tracking Unit of Measure (UoM)
                  </Text>
                  <SegmentedControl
                    fullWidth
                    size="sm"
                    value={formData.unit}
                    onChange={(val) => setFormData({ ...formData, unit: val })}
                    data={[
                      { label: '📅 Days (Standard Full / Half Day)', value: 'DAYS' },
                      { label: '⏱️ Hours (Hourly Permissions / Comp-off)', value: 'HOURS' },
                    ]}
                    styles={{
                      root: { backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' },
                      indicator: { backgroundColor: '#4F46E5', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' },
                      label: { fontWeight: 600, fontSize: '12px' },
                    }}
                  />
                </div>

                <Textarea
                  size="sm"
                  label="Policy Description & Guidelines"
                  placeholder="Explain eligibility rules, accrual rates, and statutory guidelines..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <Divider my="xs" label="Statutory & Operational Rules" labelPosition="center" />

                {/* 3 Core Rule Switches */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center" mb={4}>
                      <Group gap={6}>
                        <IconCoins size={16} color="#059669" />
                        <Text size="xs" fw={700} c="#0F172A">Requires Allocation</Text>
                      </Group>
                      <Switch
                        checked={formData.requiresAllocation}
                        onChange={(e) => setFormData({ ...formData, requiresAllocation: e.currentTarget.checked })}
                        color="teal"
                        size="sm"
                      />
                    </Group>
                    <Text size="10px" c="#64748B">
                      Employees require an approved balance allocation before applying.
                    </Text>
                  </Paper>

                  <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center" mb={4}>
                      <Group gap={6}>
                        <IconUserCheck size={16} color="#2563EB" />
                        <Text size="xs" fw={700} c="#0F172A">Requires Approval</Text>
                      </Group>
                      <Switch
                        checked={formData.requiresApproval}
                        onChange={(e) => setFormData({ ...formData, requiresApproval: e.currentTarget.checked })}
                        color="blue"
                        size="sm"
                      />
                    </Group>
                    <Text size="10px" c="#64748B">
                      Submitted requests route to HR Manager queue for sign-off.
                    </Text>
                  </Paper>

                  <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center" mb={4}>
                      <Group gap={6}>
                        <IconShieldCheck size={16} color="#D97706" />
                        <Text size="xs" fw={700} c="#0F172A">Affects Payroll</Text>
                      </Group>
                      <Switch
                        checked={formData.affectsPayroll}
                        onChange={(e) => setFormData({ ...formData, affectsPayroll: e.currentTarget.checked })}
                        color="orange"
                        size="sm"
                      />
                    </Group>
                    <Text size="10px" c="#64748B">
                      Loss of Pay (LOP) days deduct directly from monthly gross salary.
                    </Text>
                  </Paper>
                </SimpleGrid>

                <Group justify="flex-end" gap="xs" mt="md">
                  <Button size="sm" variant="default" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    color="indigo"
                    type="submit"
                    loading={submitting}
                    leftSection={<IconCheck size={16} />}
                  >
                    {editingType ? 'Save Policy Changes' : 'Create Leave Policy'}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        ) : (
          /* POLICY CARDS LIST */
          <Stack gap="md">
            {/* Search Filter Bar */}
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <TextInput
                size="xs"
                placeholder="Search leave types by name, code..."
                leftSection={<IconSearch size={14} color="#94A3B8" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, maxWidth: '360px' }}
              />

              <Text size="xs" c="#64748B">
                Showing {filteredTypes.length} of {types.length} policies
              </Text>
            </Group>

            {/* List of Cards */}
            <Stack gap="sm">
              {filteredTypes.map((t) => (
                <Paper
                  key={t.id}
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="md" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                      <ThemeIcon
                        size="lg"
                        radius="md"
                        color={t.unit === 'HOURS' ? 'cyan' : 'indigo'}
                        variant="light"
                      >
                        {t.unit === 'HOURS' ? <IconClock size={20} /> : <IconCalendarTime size={20} />}
                      </ThemeIcon>

                      <div style={{ flex: 1 }}>
                        <Group gap="xs" mb={4} wrap="wrap">
                          <Text size="sm" fw={700} c="#0F172A">
                            {t.name}
                          </Text>
                          {t.code && (
                            <Badge size="xs" color="gray" variant="light">
                              {t.code}
                            </Badge>
                          )}
                          <Badge
                            size="xs"
                            color={t.unit === 'HOURS' ? 'cyan' : 'indigo'}
                            variant="light"
                          >
                            {t.unit === 'HOURS' ? '⏱️ Hourly' : '📅 Daily'}
                          </Badge>
                          {t.affectsPayroll ? (
                            <Badge size="xs" color="orange" variant="light">
                              Affects Payroll (LOP)
                            </Badge>
                          ) : (
                            <Badge size="xs" color="teal" variant="light">
                              Paid Benefit
                            </Badge>
                          )}
                        </Group>

                        <Text size="xs" c="#64748B" mb="xs" style={{ lineHeight: 1.4 }}>
                          {t.description || 'Configured organization leave policy.'}
                        </Text>

                        {/* Rules Pills Strip */}
                        <Group gap="xs" wrap="wrap">
                          <Badge
                            size="xs"
                            variant="outline"
                            color={t.requiresAllocation ? 'teal' : 'gray'}
                          >
                            {t.requiresAllocation ? '✓ Balance Allocation Required' : 'No Pre-Allocation Needed'}
                          </Badge>
                          <Badge
                            size="xs"
                            variant="outline"
                            color={t.requiresApproval ? 'blue' : 'gray'}
                          >
                            {t.requiresApproval ? '✓ Manager Approval Required' : 'Auto-Approved'}
                          </Badge>
                        </Group>
                      </div>
                    </Group>

                    <Group gap="xs" align="center">
                      <Tooltip label="Edit Policy" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="indigo"
                          onClick={() => handleOpenEdit(t)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Deactivate Policy" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(t.id, t.name)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}
      </Box>

      {/* 3. FOOTER */}
      <Box p="md" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <Text size="11px" c="#64748B">
            ⚡ Configured policies automatically dictate employee leave balance calculations & payslip deduction rules.
          </Text>
          <Button size="xs" variant="default" onClick={onClose}>
            Close Settings
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

// Helper title component
const TitleComponent = ({ text }) => (
  <Text size="md" fw={800} c="#0F172A">
    {text}
  </Text>
);
