import React, { useState, useMemo, useEffect } from 'react';
import {
  Paper,
  Table,
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
  Pagination,
  Divider,
  Box,
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
  IconX,
} from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';
import { fetchApi } from '../../../lib/api';

export const EmployeeTable = ({ employees = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState('15');
  const [page, setPage] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const empList = useMemo(() => (Array.isArray(employees) ? employees : []), [employees]);

  // Extract unique departments for dropdown
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

  // Compute stats
  const stats = useMemo(() => {
    let active = 0;
    let onLeave = 0;
    let inactive = 0;
    empList.forEach((e) => {
      const s = e?.status || 'ACTIVE';
      if (s === 'ACTIVE') active++;
      else if (s === 'ON_LEAVE') onLeave++;
      else inactive++;
    });
    return { total: empList.length, active, onLeave, inactive };
  }, [empList]);

  // Filtered list
  const filtered = useMemo(() => {
    return empList.filter((e) => {
      if (!e) return false;

      // Department filter
      if (departmentFilter !== 'ALL' && e.department !== departmentFilter) {
        return false;
      }

      // Status filter
      const empStatus = e.status || 'ACTIVE';
      if (statusFilter !== 'ALL' && empStatus !== statusFilter) {
        return false;
      }

      // Search term filter
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
  }, [empList, search, departmentFilter, statusFilter]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, departmentFilter, statusFilter, pageSize]);

  // Paginated slice
  const pageSizeNum = parseInt(pageSize, 10) || 15;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum));
  const currentPage = Math.min(page, totalPages);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSizeNum;
    return filtered.slice(startIndex, startIndex + pageSizeNum);
  }, [filtered, currentPage, pageSizeNum]);

  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * pageSizeNum + 1;
  const endEntry = Math.min(currentPage * pageSizeNum, filtered.length);

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

  const clearFilters = () => {
    setSearch('');
    setDepartmentFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || departmentFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Section with Stats */}
      <Stack gap="md" mb="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <div>
            <Group gap="xs" align="center" mb={4}>
              <IconUsers size={20} color="#0284C7" />
              <Text fw={700} size="sm" c="#09090B" style={{ letterSpacing: '0.02em' }}>
                EMPLOYEE REGISTRY & ACTIVE DIRECTORY
              </Text>
              <Badge size="sm" color="blue" variant="filled">
                {stats.total} Total
              </Badge>
            </Group>
            <Text size="xs" c="#71717A">
              Master organization personnel directory, active compensation scales, and direct deposit verification
            </Text>
          </div>

          {/* Quick Stats Badges */}
          <Group gap="xs" wrap="wrap">
            <Badge size="sm" color="teal" variant="light">
              ● {stats.active} Active
            </Badge>
            <Badge size="sm" color="orange" variant="light">
              ● {stats.onLeave} On Leave
            </Badge>
            {stats.inactive > 0 && (
              <Badge size="sm" color="gray" variant="light">
                ● {stats.inactive} Inactive
              </Badge>
            )}
          </Group>
        </Group>

        {/* Filter Controls Bar */}
        <Paper
          p="xs"
          radius="md"
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="xs" style={{ flex: 1, minWidth: '280px' }}>
              <TextInput
                placeholder="Search by name, ID, email, role, bank..."
                size="xs"
                style={{ flex: 1, minWidth: '220px' }}
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
                  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#09090B' },
                }}
              />

              <Select
                size="xs"
                style={{ width: '170px' }}
                placeholder="Department"
                value={departmentFilter}
                onChange={(val) => setDepartmentFilter(val || 'ALL')}
                data={departmentOptions}
                styles={{
                  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#09090B' },
                }}
              />

              <Select
                size="xs"
                style={{ width: '140px' }}
                placeholder="Status"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val || 'ALL')}
                data={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active Only' },
                  { value: 'ON_LEAVE', label: 'On Leave' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                styles={{
                  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#09090B' },
                }}
              />

              {hasActiveFilters && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={clearFilters}
                  leftSection={<IconX size={12} />}
                >
                  Reset
                </Button>
              )}
            </Group>

            {/* Page Size Selector */}
            <Group gap="xs">
              <Text size="xs" c="#64748B" fw={500}>
                Per page:
              </Text>
              <Select
                size="xs"
                style={{ width: '115px' }}
                value={pageSize}
                onChange={(val) => setPageSize(val || '15')}
                data={[
                  { value: '15', label: '15 / page' },
                  { value: '20', label: '20 / page' },
                  { value: '50', label: '50 / page' },
                  { value: '100', label: '100 / page' },
                ]}
                styles={{
                  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#09090B' },
                }}
              />
            </Group>
          </Group>
        </Paper>
      </Stack>

      {/* Table Section */}
      <Box style={{ overflowX: 'auto' }}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}>EMPLOYEE</Table.Th>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}>ROLE & DEPT</Table.Th>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}>CONTRACT TYPE</Table.Th>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}>BASE SALARY</Table.Th>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}>BANK ACC / IFSC</Table.Th>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700 }}>STATUS</Table.Th>
              <Table.Th style={{ color: '#475569', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>
                ACTIONS
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedEmployees.map((emp) => {
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
                <Table.Tr key={emp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <UserAvatar
                        size={34}
                        radius="xl"
                        src={emp.avatarUrl}
                        name={nameDisplay}
                        id={empIdDisplay}
                      />
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          {nameDisplay}
                        </Text>
                        <Text size="10px" c="#64748B">
                          {emp.workEmail || emp.email || empIdDisplay}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#09090B" fw={600}>
                      {roleDisplay}
                    </Text>
                    <Text size="10px" c="#64748B">
                      {deptDisplay}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    {activeContract ? (
                      <Badge size="xs" color="blue" variant="light">
                        {activeContract.contractType || activeContract.salaryStructure?.name || 'Full-Time'}
                      </Badge>
                    ) : (
                      <Badge size="xs" color="red" variant="filled">
                        NO CONTRACT
                      </Badge>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {activeContract && activeContract.wage
                        ? `₹${Number(activeContract.wage).toLocaleString('en-IN')}/mo`
                        : '—'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    {hasBank ? (
                      <Group gap={4}>
                        <IconCheck size={14} color="#16A34A" />
                        <div>
                          <Text size="xs" c="#16A34A" fw={600}>
                            Verified
                          </Text>
                          <Text size="10px" c="#64748B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {acc}
                          </Text>
                        </div>
                      </Group>
                    ) : (
                      <Badge size="xs" color="gray" variant="light">
                        Not Registered
                      </Badge>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Badge
                      size="xs"
                      color={
                        empStatus === 'ACTIVE'
                          ? 'teal'
                          : empStatus === 'ON_LEAVE'
                          ? 'orange'
                          : 'gray'
                      }
                      variant={empStatus === 'ON_LEAVE' ? 'filled' : 'light'}
                    >
                      {empStatus.replace('_', ' ')}
                    </Badge>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon size="sm" variant="subtle" color="gray" loading={statusUpdatingId === emp.id}>
                            <IconDotsVertical size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Label>Status Management</Menu.Label>
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

                      <Tooltip label="Delete / Offboard Employee" withArrow>
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="subtle"
                          onClick={() => handleOpenDelete(emp)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}

            {paginatedEmployees.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px' }}>
                  <Stack align="center" gap="xs">
                    <IconAlertTriangle size={28} color="#94A3B8" />
                    <Text size="sm" fw={600} c="#475569">
                      No employee records found
                    </Text>
                    <Text size="xs" c="#94A3B8">
                      {hasActiveFilters
                        ? 'Try clearing search filters or selecting different criteria.'
                        : 'No employee records are present in the directory.'}
                    </Text>
                    {hasActiveFilters && (
                      <Button size="xs" variant="light" color="blue" onClick={clearFilters} mt="xs">
                        Clear All Filters
                      </Button>
                    )}
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Pagination & Summary Footer */}
      <Divider my="md" color="#E2E8F0" />
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <div>
          <Text size="xs" c="#64748B">
            Showing <b style={{ color: '#09090B' }}>{startEntry}–{endEntry}</b> of{' '}
            <b style={{ color: '#09090B' }}>{filtered.length}</b> employees
            {filtered.length !== empList.length && (
              <span> (filtered from {empList.length} total)</span>
            )}
          </Text>
          <Text size="10px" c="#94A3B8">
            Page {currentPage} of {totalPages}
          </Text>
        </div>

        {totalPages > 1 && (
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setPage}
            size="sm"
            radius="md"
            withEdges
            color="dark"
            styles={{
              control: {
                border: '1px solid #E2E8F0',
                fontWeight: 600,
              },
            }}
          />
        )}
      </Group>

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
    </Paper>
  );
};

export default EmployeeTable;
