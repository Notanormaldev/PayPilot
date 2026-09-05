import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Stepper,
  Button,
  Group,
  TextInput,
  Select,
  Text,
  Paper,
  Stack,
  Table,
  Checkbox,
  Badge,
  Alert,
  SimpleGrid,
  Progress,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconUsers,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconSearch,
  IconAlertCircle,
  IconBuildingBank,
  IconSparkles,
  IconCash,
} from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';
import { salaryStructureService } from '../../salary-structures/services/salaryStructureService';
import { employeeService } from '../../employees/services/employeeService';
import { payrollService } from '../services/payrollService';

export const PayrunCreationWizard = ({ opened, onClose, onPayrunCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1 Form State
  const [selectedStructureId, setSelectedStructureId] = useState('');
  const [payPeriodMonth, setPayPeriodMonth] = useState('09-2026');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [paymentDate, setPaymentDate] = useState('2026-09-30');
  const [cycle, setCycle] = useState('MONTHLY');
  const [payrunName, setPayrunName] = useState('September 2026 Regular Cycle');

  // Step 2 Form State
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set());
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch salary structures and employees on open
  useEffect(() => {
    if (!opened) return;

    const loadData = async () => {
      setLoadingInitial(true);
      setErrorMsg('');
      try {
        const [structRes, empRes] = await Promise.all([
          salaryStructureService.fetchStructures().catch(() => ({ data: [] })),
          employeeService.fetchEmployees().catch(() => ({ data: [] })),
        ]);

        const structList = structRes.data || structRes || [];
        setStructures(structList);
        if (structList.length > 0 && !selectedStructureId) {
          setSelectedStructureId(structList[0].id);
        }

        const empList = empRes.data || empRes.employees || empRes || [];
        const validEmps = Array.isArray(empList) ? empList : [];
        setEmployees(validEmps);

        // By default on first open, select all employees
        if (selectedEmployeeIds.size === 0 && validEmps.length > 0) {
          setSelectedEmployeeIds(new Set(validEmps.map((e) => e.id)));
        }
      } catch (err) {
        console.error('Failed to load wizard setup data:', err);
        setErrorMsg('Failed to fetch initial structures or employee data.');
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [opened]);

  // Handle Month Preset Change
  const handleMonthChange = (val) => {
    setPayPeriodMonth(val);
    if (val === '09-2026') {
      setPeriodStart('2026-09-01');
      setPeriodEnd('2026-09-30');
      setPaymentDate('2026-09-30');
      setPayrunName('September 2026 Regular Cycle');
    } else if (val === '10-2026') {
      setPeriodStart('2026-10-01');
      setPeriodEnd('2026-10-31');
      setPaymentDate('2026-10-31');
      setPayrunName('October 2026 Regular Cycle');
    } else if (val === '08-2026') {
      setPeriodStart('2026-08-01');
      setPeriodEnd('2026-08-31');
      setPaymentDate('2026-08-31');
      setPayrunName('August 2026 Supplementary Batch');
    }
  };

  // Filtered employees in Step 2
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDept = deptFilter === 'ALL' || (emp.department && emp.department.toLowerCase().includes(deptFilter.toLowerCase()));
      const matchesSearch =
        !searchQuery ||
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.workEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobPosition?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [employees, deptFilter, searchQuery]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Toggle single employee
  const toggleEmployee = (id) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all filtered
  const handleSelectAllFiltered = () => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      filteredEmployees.forEach((e) => next.add(e.id));
      return next;
    });
  };

  // Deselect all filtered
  const handleDeselectAllFiltered = () => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      filteredEmployees.forEach((e) => next.delete(e.id));
      return next;
    });
  };

  // Validation
  const canProceedStep1 = selectedStructureId && periodStart && periodEnd && payrunName.trim();
  const canProceedStep2 = selectedEmployeeIds.size > 0;

  // Submit Payrun Creation
  const handleCreatePayrun = async () => {
    if (!canProceedStep2) {
      setErrorMsg('Please select at least 1 employee to include in this payrun.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: payrunName.trim(),
        salaryStructureId: selectedStructureId,
        periodStart,
        periodEnd,
        paymentDate,
        cycle,
        employeeIds: Array.from(selectedEmployeeIds),
      };

      const res = await payrollService.createPayrun(payload);
      if (onPayrunCreated) {
        onPayrunCreated(res.data || res);
      }
      onClose();
      // Reset wizard state
      setActiveStep(0);
    } catch (err) {
      console.error('Payrun creation failed:', err);
      setErrorMsg(err.message || 'Failed to create payrun batch. Please verify fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="xs">
          <Box
            p={6}
            style={{
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconSparkles size={18} />
          </Box>
          <div>
            <Text fw={700} size="md" c="#09090B">
              Initialize New Payrun Batch
            </Text>
            <Text size="xs" c="#64748B">
              2-Step Payrun Creation Wizard • Configure rules and select workforce
            </Text>
          </div>
        </Group>
      }
      styles={{
        content: { backgroundColor: '#FFFFFF', borderRadius: '12px' },
        header: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 20px' },
        body: { padding: '20px' },
      }}
    >
      <Stack gap="lg">
        {/* Progress Stepper */}
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          size="sm"
          color="indigo"
          styles={{
            stepIcon: { borderWidth: 2 },
          }}
        >
          <Stepper.Step
            label="Structure & Period"
            description="Salary rules & dates"
            icon={<IconCalendarEvent size={16} />}
          />
          <Stepper.Step
            label="Eligible Employees"
            description="Choose workforce cohort"
            icon={<IconUsers size={16} />}
          />
        </Stepper>

        {errorMsg && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            radius="md"
            withCloseButton
            onClose={() => setErrorMsg('')}
          >
            {errorMsg}
          </Alert>
        )}

        {/* STEP 1: Structure & Pay Period */}
        {activeStep === 0 && (
          <Stack gap="md">
            <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Text size="xs" fw={700} c="#09090B" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step 1: Select Salary Structure & Pay Period
              </Text>
              <Text size="xs" c="#64748B" mb="md">
                Assign the governing compensation rules and financial calculation window for this payroll run.
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Select
                  label="Governing Salary Structure"
                  placeholder="Choose compensation scale"
                  required
                  value={selectedStructureId}
                  onChange={setSelectedStructureId}
                  data={
                    structures.length > 0
                      ? structures.map((s) => ({
                          value: s.id,
                          label: `${s.name} (${s.rules?.length || 0} Rules)`,
                        }))
                      : [
                          { value: 'default-tech', label: 'Standard Tech Scale v1 (12 Rules)' },
                          { value: 'exec-scale', label: 'Executive Scale v2 (15 Rules)' },
                        ]
                  }
                  description="Determines Basic, HRA, PF, TDS and custom bonus rules"
                />

                <Select
                  label="Pay Period Preset"
                  value={payPeriodMonth}
                  onChange={handleMonthChange}
                  data={[
                    { value: '09-2026', label: 'September 2026 (Regular Cycle)' },
                    { value: '10-2026', label: 'October 2026 (Upcoming)' },
                    { value: '08-2026', label: 'August 2026 (Supplementary)' },
                  ]}
                  description="Auto-fills standard start, end, and payment dates"
                />
              </SimpleGrid>

              <Divider my="md" color="#E2E8F0" />

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <TextInput
                  label="Period Start Date"
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.currentTarget.value)}
                />
                <TextInput
                  label="Period End Date"
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.currentTarget.value)}
                />
                <TextInput
                  label="Direct Deposit Date"
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.currentTarget.value)}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
                <TextInput
                  label="Payrun Batch Name"
                  placeholder="e.g. September 2026 Regular Cycle"
                  required
                  value={payrunName}
                  onChange={(e) => setPayrunName(e.currentTarget.value)}
                />

                <Select
                  label="Payroll Cycle Frequency"
                  value={cycle}
                  onChange={setCycle}
                  data={[
                    { value: 'MONTHLY', label: 'Monthly (End of Month)' },
                    { value: 'BI_WEEKLY', label: 'Bi-Weekly (Fortnightly)' },
                    { value: 'WEEKLY', label: 'Weekly' },
                  ]}
                />
              </SimpleGrid>
            </Paper>

            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color="indigo"
                rightSection={<IconArrowRight size={14} />}
                disabled={!canProceedStep1}
                onClick={() => setActiveStep(1)}
              >
                Proceed to Employee Selection
              </Button>
            </Group>
          </Stack>
        )}

        {/* STEP 2: Choose Eligible Employees */}
        {activeStep === 1 && (
          <Stack gap="md">
            {/* Header & Stats */}
            <Paper p="sm" radius="md" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="xs" fw={700} c="#166534">
                    Selected Workforce Cohort: {selectedEmployeeIds.size} of {employees.length} Employees Included
                  </Text>
                  <Text size="10px" c="#15803D" mt={2}>
                    Only chosen employees will have payslips computed and disbursed in this batch.
                  </Text>
                </div>
                <Badge size="md" color="teal" variant="filled">
                  {Math.round((selectedEmployeeIds.size / (employees.length || 1)) * 100)}% Selected
                </Badge>
              </Group>
              <Progress
                value={(selectedEmployeeIds.size / (employees.length || 1)) * 100}
                color="teal"
                size="xs"
                mt="xs"
                radius="xl"
              />
            </Paper>

            {/* Filter and Search Controls */}
            <Paper p="sm" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" wrap="wrap" gap="xs">
                <Group gap="xs" wrap="nowrap">
                  <TextInput
                    placeholder="Search by name, role, email..."
                    size="xs"
                    leftSection={<IconSearch size={13} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ width: 220 }}
                  />
                  <Select
                    size="xs"
                    placeholder="Filter Department"
                    value={deptFilter}
                    onChange={(val) => setDeptFilter(val || 'ALL')}
                    data={[
                      { value: 'ALL', label: 'All Departments' },
                      ...departments.map((d) => ({ value: d, label: d })),
                    ]}
                    style={{ width: 170 }}
                  />
                </Group>

                <Group gap="xs">
                  <Button size="xs" variant="light" color="indigo" onClick={handleSelectAllFiltered}>
                    Select All Filtered ({filteredEmployees.length})
                  </Button>
                  <Button size="xs" variant="subtle" color="gray" onClick={handleDeselectAllFiltered}>
                    Deselect All
                  </Button>
                </Group>
              </Group>
            </Paper>

            {/* Employee Selection Table */}
            <Box style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <Table verticalSpacing="xs" highlightOnHover>
                <Table.Thead style={{ backgroundColor: '#F8FAFC', position: 'sticky', top: 0, zIndex: 1 }}>
                  <Table.Tr>
                    <Table.Th style={{ width: 40 }}>
                      <Checkbox
                        size="xs"
                        checked={filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedEmployeeIds.has(e.id))}
                        indeterminate={
                          filteredEmployees.some((e) => selectedEmployeeIds.has(e.id)) &&
                          !filteredEmployees.every((e) => selectedEmployeeIds.has(e.id))
                        }
                        onChange={(e) => {
                          if (e.currentTarget.checked) {
                            handleSelectAllFiltered();
                          } else {
                            handleDeselectAllFiltered();
                          }
                        }}
                      />
                    </Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>EMPLOYEE & CODE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>DEPARTMENT & ROLE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>EST. MONTHLY WAGE</Table.Th>
                    <Table.Th style={{ color: '#64748B', fontSize: '11px' }}>BANKING STATUS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployeeIds.has(emp.id);
                      const hasBank = !!(emp.bankAccount && String(emp.bankAccount).trim() !== '');
                      const wage = emp.contracts?.[0]?.wage || emp.wage || 85000;

                      return (
                        <Table.Tr
                          key={emp.id}
                          onClick={() => toggleEmployee(emp.id)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                          }}
                        >
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              size="xs"
                              checked={isSelected}
                              onChange={() => toggleEmployee(emp.id)}
                            />
                          </Table.Td>

                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <UserAvatar size={28} radius="xl" name={emp.name || 'Staff'} id={emp.id} />
                              <div>
                                <Text size="xs" fw={600} c="#09090B">
                                  {emp.name || 'Staff Member'}
                                </Text>
                                <Text size="10px" c="#64748B">
                                  {emp.employeeNumber || `EMP-${emp.id.slice(-4).toUpperCase()}`} • {emp.workEmail}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={500} c="#09090B">
                              {emp.department || 'General'}
                            </Text>
                            <Text size="10px" c="#64748B">
                              {emp.jobPosition || 'Specialist'}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" fw={600} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              ₹ {Number(wage).toLocaleString('en-IN')}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            {hasBank ? (
                              <Badge size="xs" color="teal" variant="light" leftSection={<IconBuildingBank size={10} />}>
                                Verified Direct Deposit
                              </Badge>
                            ) : (
                              <Badge size="xs" color="orange" variant="light">
                                Missing Bank Info
                              </Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        No employees match the active search and department filters.
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Box>

            {/* Footer Buttons */}
            <Group justify="space-between" mt="sm">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => setActiveStep(0)}
              >
                Back to Structure & Period
              </Button>

              <Group gap="xs">
                <Button variant="default" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="dark"
                  leftSection={<IconCash size={15} />}
                  loading={submitting}
                  disabled={!canProceedStep2}
                  onClick={handleCreatePayrun}
                >
                  Create Payrun Batch ({selectedEmployeeIds.size} Employees)
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default PayrunCreationWizard;
