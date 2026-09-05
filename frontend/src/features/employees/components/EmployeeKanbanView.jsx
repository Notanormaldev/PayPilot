import React, { useState, useMemo } from 'react';
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  TextInput,
  Select,
  Button,
  Modal,
  ActionIcon,
  Menu,
  Tooltip,
  Alert,
  SimpleGrid,
  Box,
  Divider,
  Card,
  Avatar,
  ScrollArea,
} from '@mantine/core';
import {
  IconSearch,
  IconCheck,
  IconTrash,
  IconDotsVertical,
  IconUserCheck,
  IconUserOff,
  IconCalendarTime,
  IconAlertTriangle,
  IconUsers,
  IconFilter,
  IconX,
  IconBuildingCommunity,
  IconBriefcase,
  IconCreditCard,
  IconMail,
  IconGripVertical,
  IconEye,
  IconSparkles,
} from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';
import { fetchApi } from '../../../lib/api';

export const EmployeeKanbanView = ({ employees = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [groupBy, setGroupBy] = useState('STATUS'); // 'STATUS' | 'DEPARTMENT' | 'CONTRACT'

  const [draggedEmpId, setDraggedEmpId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Selected employee detail modal
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const empList = useMemo(() => (Array.isArray(employees) ? employees : []), [employees]);

  // Unique departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const set = new Set();
    empList.forEach((e) => {
      if (e?.department) set.add(e.department);
    });
    const sorted = Array.from(set).sort();
    return [
      { value: 'ALL', label: 'All Departments' },
      ...sorted.map((d) => ({ value: d, label: d })),
    ];
  }, [empList]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return empList.filter((e) => {
      if (!e) return false;

      if (departmentFilter !== 'ALL' && e.department !== departmentFilter) {
        return false;
      }

      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const fullName = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim();
        const matchesName = fullName.toLowerCase().includes(term);
        const matchesEmpNo = e.employeeNumber && e.employeeNumber.toLowerCase().includes(term);
        const matchesDept = e.department && e.department.toLowerCase().includes(term);
        const matchesTitle = (e.jobTitle || e.jobPosition || '').toLowerCase().includes(term);
        const matchesEmail = (e.workEmail || e.email || '').toLowerCase().includes(term);
        const matchesBank = (e.bankAccount || e.bankAccountNo || '').toString().toLowerCase().includes(term);

        if (!matchesName && !matchesEmpNo && !matchesDept && !matchesTitle && !matchesEmail && !matchesBank) {
          return false;
        }
      }

      return true;
    });
  }, [empList, search, departmentFilter]);

  // Generate Columns based on groupBy
  const columns = useMemo(() => {
    if (groupBy === 'STATUS') {
      return [
        {
          id: 'ACTIVE',
          title: 'Active Personnel',
          subtitle: 'Active contracts & on-duty roster',
          color: 'teal',
          headerBg: '#F0FDF4',
          borderColor: '#BBF7D0',
          icon: <IconUserCheck size={16} color="#16A34A" />,
          filterFn: (e) => (e.status || 'ACTIVE') === 'ACTIVE',
        },
        {
          id: 'ON_LEAVE',
          title: 'On Approved Leave',
          subtitle: 'Scheduled PTO, sick & parental leave',
          color: 'orange',
          headerBg: '#FFFBEB',
          borderColor: '#FDE68A',
          icon: <IconCalendarTime size={16} color="#D97706" />,
          filterFn: (e) => (e.status || 'ACTIVE') === 'ON_LEAVE',
        },
        {
          id: 'INACTIVE',
          title: 'Inactive / Transitioning',
          subtitle: 'Probation review, sabbatical or former',
          color: 'gray',
          headerBg: '#F8FAFC',
          borderColor: '#E2E8F0',
          icon: <IconUserOff size={16} color="#64748B" />,
          filterFn: (e) => (e.status || 'ACTIVE') === 'INACTIVE' || (e.status || 'ACTIVE') === 'OFFBOARDED',
        },
      ];
    }

    if (groupBy === 'DEPARTMENT') {
      const depts = [
        'Engineering',
        'Product & Design',
        'Data & AI',
        'Human Resources',
        'Payroll & Compliance',
        'Finance & Accounts',
        'Sales & Growth',
        'Customer Success',
        'Legal & Operations',
      ];

      return depts.map((d) => ({
        id: d,
        title: d,
        subtitle: `Departmental staff`,
        color: 'blue',
        headerBg: '#F0F9FF',
        borderColor: '#BAE6FD',
        icon: <IconBuildingCommunity size={16} color="#0284C7" />,
        filterFn: (e) => {
          const dept = (e.department || '').toLowerCase();
          const target = d.toLowerCase();
          if (target.includes('&')) {
            const parts = target.split('&').map((p) => p.trim());
            return parts.some((p) => dept.includes(p));
          }
          return dept.includes(target) || target.includes(dept);
        },
      }));
    }

    // Default: By Contract Scale
    return [
      {
        id: 'EXECUTIVE',
        title: 'Executive & Leadership',
        subtitle: 'Leadership scales (> ₹1.5L/mo)',
        color: 'indigo',
        headerBg: '#EEF2FF',
        borderColor: '#C7D2FE',
        icon: <IconSparkles size={16} color="#4F46E5" />,
        filterFn: (e) => {
          const wage = e.contracts?.[0]?.wage || e.wage || 0;
          return wage >= 150000;
        },
      },
      {
        id: 'FULL_TIME',
        title: 'Full-Time Salaried',
        subtitle: 'Core staff (₹60k - ₹1.5L/mo)',
        color: 'blue',
        headerBg: '#F0F9FF',
        borderColor: '#BAE6FD',
        icon: <IconBriefcase size={16} color="#0284C7" />,
        filterFn: (e) => {
          const wage = e.contracts?.[0]?.wage || e.wage || 0;
          return wage >= 60000 && wage < 150000;
        },
      },
      {
        id: 'ASSOCIATE',
        title: 'Associate & Operational',
        subtitle: 'Standard scales (< ₹60k/mo)',
        color: 'cyan',
        headerBg: '#ECFEFF',
        borderColor: '#A5F3FC',
        icon: <IconUsers size={16} color="#0891B2" />,
        filterFn: (e) => {
          const wage = e.contracts?.[0]?.wage || e.wage || 0;
          return wage < 60000;
        },
      },
    ];
  }, [groupBy]);

  // Handle Drag & Drop Status Transition
  const handleDragStart = (e, empId) => {
    e.dataTransfer.setData('text/plain', empId);
    setDraggedEmpId(empId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (groupBy === 'STATUS' && dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const empId = e.dataTransfer.getData('text/plain') || draggedEmpId;
    if (!empId) return;

    if (groupBy === 'STATUS') {
      const emp = empList.find((item) => item.id === empId);
      if (emp && emp.status !== targetStatus) {
        await handleUpdateStatus(empId, targetStatus);
      }
    }
  };

  const handleUpdateStatus = async (empId, newStatus) => {
    setStatusUpdatingId(empId);
    try {
      await fetchApi(`/employees/${empId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update employee status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleOpenDelete = (emp) => {
    setTargetEmployee(emp);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetEmployee?.id) return;
    setDeleting(true);
    try {
      await fetchApi(`/employees/${targetEmployee.id}`, { method: 'DELETE' });
      setDeleteModalOpen(false);
      setTargetEmployee(null);
      if (onRefresh) onRefresh();
      else window.location.reload();
    } catch (err) {
      console.error('Failed to delete employee:', err);
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = search.trim() !== '' || departmentFilter !== 'ALL';

  return (
    <Stack gap="md">
      {/* Controls & Filter Bar */}
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="xs" style={{ flex: 1, minWidth: '300px' }}>
            <TextInput
              placeholder="Search employee cards by name, ID, role, department..."
              size="xs"
              style={{ flex: 1, minWidth: '240px' }}
              leftSection={<IconSearch size={14} color="#71717A" />}
              rightSection={
                search ? (
                  <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setSearch('')}>
                    <IconX size={12} />
                  </ActionIcon>
                ) : null
              }
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              styles={{
                input: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', color: '#09090B' },
              }}
            />

            <Select
              size="xs"
              style={{ width: '180px' }}
              placeholder="Department"
              value={departmentFilter}
              onChange={(val) => setDepartmentFilter(val || 'ALL')}
              data={departmentOptions}
              styles={{
                input: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', color: '#09090B' },
              }}
            />

            {hasActiveFilters && (
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                onClick={() => {
                  setSearch('');
                  setDepartmentFilter('ALL');
                }}
                leftSection={<IconX size={12} />}
              >
                Reset
              </Button>
            )}
          </Group>

          {/* Grouping Selector */}
          <Group gap="xs">
            <Text size="xs" c="#64748B" fw={600}>
              Group By:
            </Text>
            <Select
              size="xs"
              style={{ width: '165px' }}
              value={groupBy}
              onChange={(val) => setGroupBy(val || 'STATUS')}
              data={[
                { value: 'STATUS', label: '● Employment Status' },
                { value: 'DEPARTMENT', label: '● Department' },
                { value: 'CONTRACT', label: '● Salary Scale' },
              ]}
              styles={{
                input: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', color: '#09090B', fontWeight: 600 },
              }}
            />
          </Group>
        </Group>
      </Paper>

      {/* Kanban Board Columns Container */}
      <Box
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'stretch',
        }}
      >
        {columns.map((col) => {
          const colEmployees = filteredEmployees.filter(col.filterFn);
          const totalWage = colEmployees.reduce((acc, emp) => {
            const w = emp.contracts?.[0]?.wage || emp.wage || 0;
            return acc + Number(w);
          }, 0);

          const isDropActive = dragOverCol === col.id;

          return (
            <Paper
              key={col.id}
              radius="md"
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                flex: '1 0 340px',
                minWidth: '320px',
                maxWidth: '400px',
                backgroundColor: isDropActive ? '#F0FDF4' : '#F8FAFC',
                border: isDropActive ? '2px dashed #16A34A' : '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Column Header */}
              <Box
                p="sm"
                style={{
                  backgroundColor: col.headerBg,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  borderBottom: `1px solid ${col.borderColor}`,
                }}
              >
                <Group justify="space-between" align="center" mb={4}>
                  <Group gap="xs">
                    {col.icon}
                    <Text fw={700} size="sm" c="#0F172A">
                      {col.title}
                    </Text>
                  </Group>
                  <Badge size="sm" color={col.color} variant="filled">
                    {colEmployees.length}
                  </Badge>
                </Group>
                <Group justify="space-between" align="center">
                  <Text size="11px" c="#64748B">
                    {col.subtitle}
                  </Text>
                  {totalWage > 0 && (
                    <Text size="11px" fw={700} c="#0F172A" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ₹{(totalWage / 100000).toFixed(1)}L/mo
                    </Text>
                  )}
                </Group>
              </Box>

              {/* Column Cards List */}
              <ScrollArea.Autosize mah="calc(100vh - 300px)" p="xs">
                <Stack gap="xs">
                  {colEmployees.map((emp) => {
                    const nameDisplay = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
                    const empIdDisplay = emp.employeeNumber || (emp.id ? `EMP-${emp.id.slice(-4).toUpperCase()}` : 'EMP-0000');
                    const roleDisplay = emp.jobPosition || emp.jobTitle || 'Software Engineer';
                    const deptDisplay = emp.department || 'Engineering';

                    const hasContract = emp.contracts && emp.contracts.length > 0;
                    const activeContract = hasContract
                      ? emp.contracts.find((c) => c.status === 'RUNNING') || emp.contracts[0]
                      : emp.wage
                      ? { contractType: 'Regular Full-Time', wage: emp.wage }
                      : null;

                    const acc = emp?.bankAccount || emp?.bankAccountNo;
                    const hasBank = !!(acc && String(acc).trim() !== '');
                    const empStatus = emp.status || 'ACTIVE';

                    return (
                      <Card
                        key={emp.id}
                        padding="sm"
                        radius="md"
                        withBorder
                        draggable
                        onDragStart={(e) => handleDragStart(e, emp.id)}
                        onClick={() => setSelectedEmp(emp)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          cursor: 'grab',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            borderColor: '#CBD5E1',
                          },
                        }}
                      >
                        {/* Top: Avatar, Name, Employee ID & Menu */}
                        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                          <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                            <UserAvatar
                              size={36}
                              radius="xl"
                              src={emp.avatarUrl}
                              name={nameDisplay}
                              id={empIdDisplay}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Text size="xs" fw={700} c="#09090B" truncate>
                                {nameDisplay}
                              </Text>
                              <Group gap={4} wrap="nowrap">
                                <Badge size="10px" variant="light" color="gray" radius="xs" px={4}>
                                  {empIdDisplay}
                                </Badge>
                                <Text size="10px" c="#64748B" truncate>
                                  {deptDisplay}
                                </Text>
                              </Group>
                            </div>
                          </Group>

                          <Group gap={2} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                            <Menu position="bottom-end" shadow="md">
                              <Menu.Target>
                                <ActionIcon size="xs" variant="subtle" color="gray" loading={statusUpdatingId === emp.id}>
                                  <IconDotsVertical size={14} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Label>Quick Actions</Menu.Label>
                                <Menu.Item
                                  leftSection={<IconEye size={14} />}
                                  onClick={() => setSelectedEmp(emp)}
                                >
                                  View Full Profile
                                </Menu.Item>
                                <Menu.Divider />
                                {empStatus !== 'ACTIVE' && (
                                  <Menu.Item
                                    leftSection={<IconUserCheck size={14} color="#0D9488" />}
                                    onClick={() => handleUpdateStatus(emp.id, 'ACTIVE')}
                                  >
                                    Mark as Active
                                  </Menu.Item>
                                )}
                                {empStatus !== 'ON_LEAVE' && (
                                  <Menu.Item
                                    leftSection={<IconCalendarTime size={14} color="#D97706" />}
                                    onClick={() => handleUpdateStatus(emp.id, 'ON_LEAVE')}
                                  >
                                    Mark as On Leave
                                  </Menu.Item>
                                )}
                                {empStatus !== 'INACTIVE' && (
                                  <Menu.Item
                                    leftSection={<IconUserOff size={14} color="#64748B" />}
                                    onClick={() => handleUpdateStatus(emp.id, 'INACTIVE')}
                                  >
                                    Mark as Inactive
                                  </Menu.Item>
                                )}
                                <Menu.Divider />
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => handleOpenDelete(emp)}
                                >
                                  Offboard & Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Group>

                        {/* Middle: Role & Compensation */}
                        <Stack gap={4} mb="xs">
                          <Text size="11px" fw={600} c="#334155" truncate>
                            {roleDisplay}
                          </Text>

                          <Group justify="space-between" align="center">
                            <Text size="xs" fw={700} c="#0F172A" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {activeContract && activeContract.wage
                                ? `₹${Number(activeContract.wage).toLocaleString('en-IN')}/mo`
                                : '—'}
                            </Text>

                            <Badge size="xs" color="blue" variant="light">
                              {activeContract?.contractType || 'Full-Time'}
                            </Badge>
                          </Group>
                        </Stack>

                        <Divider my={4} color="#F1F5F9" />

                        {/* Bottom: Bank Status & Email */}
                        <Group justify="space-between" align="center" wrap="nowrap" pt={2}>
                          {hasBank ? (
                            <Group gap={4}>
                              <IconCheck size={12} color="#16A34A" />
                              <Text size="10px" c="#16A34A" fw={600}>
                                Bank Verified
                              </Text>
                            </Group>
                          ) : (
                            <Text size="10px" c="#94A3B8">
                              No Bank Details
                            </Text>
                          )}

                          <Group gap={4} onClick={(e) => e.stopPropagation()}>
                            {emp.workEmail && (
                              <Tooltip label={`Email ${emp.workEmail}`} withArrow>
                                <ActionIcon
                                  component="a"
                                  href={`mailto:${emp.workEmail}`}
                                  size="xs"
                                  variant="light"
                                  color="gray"
                                >
                                  <IconMail size={12} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Badge
                              size="xs"
                              color={
                                empStatus === 'ACTIVE'
                                  ? 'teal'
                                  : empStatus === 'ON_LEAVE'
                                  ? 'orange'
                                  : 'gray'
                              }
                              variant="light"
                            >
                              {empStatus.replace('_', ' ')}
                            </Badge>
                          </Group>
                        </Group>
                      </Card>
                    );
                  })}

                  {colEmployees.length === 0 && (
                    <Paper p="lg" radius="sm" style={{ backgroundColor: '#FFFFFF', textAlign: 'center', border: '1px dashed #E2E8F0' }}>
                      <Text size="xs" c="#94A3B8">
                        No employees in this column
                      </Text>
                    </Paper>
                  )}
                </Stack>
              </ScrollArea.Autosize>
            </Paper>
          );
        })}
      </Box>

      {/* Employee Details Modal */}
      <Modal
        opened={!!selectedEmp}
        onClose={() => setSelectedEmp(null)}
        title={
          <Group gap="xs">
            <IconBriefcase size={18} color="#0284C7" />
            <Text fw={700} size="sm" c="#09090B">
              Employee Personnel Card
            </Text>
          </Group>
        }
        size="lg"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        {selectedEmp && (
          <Stack gap="md">
            {/* Header Profile */}
            <Group gap="md">
              <UserAvatar
                size={54}
                radius="xl"
                src={selectedEmp.avatarUrl}
                name={selectedEmp.name}
                id={selectedEmp.employeeNumber}
              />
              <div>
                <Group gap="xs">
                  <Text fw={700} size="md" c="#09090B">
                    {selectedEmp.name}
                  </Text>
                  <Badge size="sm" color="blue" variant="light">
                    {selectedEmp.employeeNumber || `EMP-${selectedEmp.id?.slice(-4).toUpperCase()}`}
                  </Badge>
                  <Badge
                    size="sm"
                    color={
                      selectedEmp.status === 'ACTIVE'
                        ? 'teal'
                        : selectedEmp.status === 'ON_LEAVE'
                        ? 'orange'
                        : 'gray'
                    }
                    variant="filled"
                  >
                    {selectedEmp.status || 'ACTIVE'}
                  </Badge>
                </Group>
                <Text size="xs" c="#64748B">
                  {selectedEmp.jobPosition || selectedEmp.jobTitle} • {selectedEmp.department}
                </Text>
              </div>
            </Group>

            <Divider color="#E2E8F0" />

            {/* Compensation & Contract Details */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Text size="11px" c="#64748B" fw={600}>
                  MONTHLY BASE SALARY
                </Text>
                <Text size="lg" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {selectedEmp.contracts?.[0]?.wage || selectedEmp.wage
                    ? `₹${Number(selectedEmp.contracts?.[0]?.wage || selectedEmp.wage).toLocaleString('en-IN')}`
                    : '—'}
                </Text>
                <Text size="10px" c="#16A34A" fw={600}>
                  Annual CTC: ₹
                  {(((selectedEmp.contracts?.[0]?.wage || selectedEmp.wage || 0) * 12) / 100000).toFixed(2)} Lakhs
                </Text>
              </Paper>

              <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Text size="11px" c="#64748B" fw={600}>
                  ACTIVE CONTRACT TYPE
                </Text>
                <Text size="sm" fw={700} c="#09090B">
                  {selectedEmp.contracts?.[0]?.contractType || 'Regular Full-Time'}
                </Text>
                <Text size="10px" c="#64748B">
                  Salary Structure: {selectedEmp.contracts?.[0]?.salaryStructure?.name || 'Standard Scale v2.1'}
                </Text>
              </Paper>

              <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Text size="11px" c="#64748B" fw={600}>
                  WORK EMAIL & CONTACT
                </Text>
                <Text size="xs" fw={700} c="#09090B">
                  {selectedEmp.workEmail || selectedEmp.email || 'None registered'}
                </Text>
                <Text size="10px" c="#64748B">
                  {selectedEmp.phone || '+91 98765 43210'}
                </Text>
              </Paper>

              <Paper p="sm" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Text size="11px" c="#64748B" fw={600}>
                  DIRECT DEPOSIT BANK ACCOUNT
                </Text>
                <Group gap={4}>
                  <IconCheck size={14} color="#16A34A" />
                  <Text size="xs" fw={700} c="#16A34A">
                    {selectedEmp.bankAccount || selectedEmp.bankAccountNo || 'Verified Account'}
                  </Text>
                </Group>
                <Text size="10px" c="#64748B">
                  IFSC: HDFC0001234 • Direct Auto-Credit Ready
                </Text>
              </Paper>
            </SimpleGrid>

            <Group justify="space-between" mt="sm">
              <Group gap="xs">
                {selectedEmp.status !== 'ACTIVE' && (
                  <Button
                    size="xs"
                    color="teal"
                    variant="light"
                    leftSection={<IconUserCheck size={14} />}
                    onClick={async () => {
                      await handleUpdateStatus(selectedEmp.id, 'ACTIVE');
                      setSelectedEmp(null);
                    }}
                  >
                    Mark Active
                  </Button>
                )}
                {selectedEmp.status !== 'ON_LEAVE' && (
                  <Button
                    size="xs"
                    color="orange"
                    variant="light"
                    leftSection={<IconCalendarTime size={14} />}
                    onClick={async () => {
                      await handleUpdateStatus(selectedEmp.id, 'ON_LEAVE');
                      setSelectedEmp(null);
                    }}
                  >
                    Mark On Leave
                  </Button>
                )}
                {selectedEmp.status !== 'INACTIVE' && (
                  <Button
                    size="xs"
                    color="gray"
                    variant="light"
                    leftSection={<IconUserOff size={14} />}
                    onClick={async () => {
                      await handleUpdateStatus(selectedEmp.id, 'INACTIVE');
                      setSelectedEmp(null);
                    }}
                  >
                    Mark Inactive
                  </Button>
                )}
              </Group>

              <Button size="xs" variant="default" onClick={() => setSelectedEmp(null)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete Offboard Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={18} color="#DC2626" />
            <Text fw={700} size="sm" c="#991B1B">
              Offboard & Delete Employee Record
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
          <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Confirm Employee Deletion">
            <Text size="xs" c="#991B1B" fw={600}>
              Are you sure you want to delete <b>{targetEmployee?.name}</b> from the employee registry?
            </Text>
          </Alert>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B">
              {targetEmployee?.name} ({targetEmployee?.employeeNumber || 'STAFF'})
            </Text>
            <Text size="11px" c="#64748B">
              {targetEmployee?.jobPosition || targetEmployee?.jobTitle || 'Officer'} • {targetEmployee?.department || 'General'}
            </Text>
          </Paper>

          <Group justify="flex-end" gap="xs">
            <Button size="xs" variant="default" onClick={() => setDeleteModalOpen(false)}>
              No, Cancel
            </Button>
            <Button
              size="xs"
              color="red"
              loading={deleting}
              onClick={handleConfirmDelete}
              leftSection={<IconTrash size={14} />}
            >
              Yes, Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default EmployeeKanbanView;
