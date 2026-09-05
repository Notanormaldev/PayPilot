import React, { useState } from 'react';
import {
  Paper,
  Table,
  Group,
  Stack,
  Text,
  Badge,
  TextInput,
  Button,
  Modal,
  ActionIcon,
  Menu,
  Tooltip,
  Alert,
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
} from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';
import { fetchApi } from '../../../lib/api';

export const EmployeeTable = ({ employees = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const empList = Array.isArray(employees) ? employees : [];

  const filtered = empList.filter((e) => {
    if (!e) return false;
    const term = search.toLowerCase();
    const fullName = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim();
    return (
      fullName.toLowerCase().includes(term) ||
      (e.employeeNumber && e.employeeNumber.toLowerCase().includes(term)) ||
      (e.department && e.department.toLowerCase().includes(term)) ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes(term)) ||
      (e.jobPosition && e.jobPosition.toLowerCase().includes(term)) ||
      (e.workEmail && e.workEmail.toLowerCase().includes(term)) ||
      (e.email && e.email.toLowerCase().includes(term))
    );
  });

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
      <Group justify="space-between" mb="md">
        <div>
          <Group gap="xs">
            <Text fw={700} size="sm" c="#09090B">
              EMPLOYEE REGISTRY & ACTIVE CONTRACTS
            </Text>
            <Badge size="xs" color="blue" variant="filled">
              {empList.length} Total Registered
            </Badge>
          </Group>
          <Text size="xs" c="#71717A">
            Master records, banking verification, and active compensation status
          </Text>
        </div>

        <Group gap="xs">
          <TextInput
            placeholder="Search employee, ID, department..."
            size="xs"
            leftSection={<IconSearch size={14} color="#71717A" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            styles={{
              input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#09090B' },
            }}
          />
        </Group>
      </Group>

      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr style={{ borderBottom: '1px solid #E2E8F0' }}>
            <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>EMPLOYEE</Table.Th>
            <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>ROLE & DEPT</Table.Th>
            <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>CONTRACT</Table.Th>
            <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>SALARY BASE</Table.Th>
            <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>BANK DETAILS</Table.Th>
            <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>STATUS</Table.Th>
            <Table.Th style={{ color: '#71717A', fontSize: '11px', textAlign: 'right' }}>ACTIONS</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.map((emp) => {
            const nameDisplay = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
            const empIdDisplay = emp.employeeNumber || (emp.id ? `EMP-${emp.id.slice(-4).toUpperCase()}` : 'EMP-0000');
            const roleDisplay = emp.jobPosition || emp.jobTitle || 'Software Engineer';
            const deptDisplay = emp.department || 'Engineering';

            const hasContract = emp.contracts && emp.contracts.length > 0;
            const activeContract = hasContract
              ? emp.contracts.find((c) => c.status === 'RUNNING') || emp.contracts[0]
              : (emp.wage ? { contractType: 'Regular Full-Time', wage: emp.wage } : null);

            const acc = emp?.bankAccount || emp?.bankAccountNo;
            const hasBank = !!(acc && String(acc).trim() !== '');

            const empStatus = emp.status || 'ACTIVE';

            return (
              <Table.Tr key={emp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <UserAvatar
                      size={32}
                      radius="xl"
                      src={emp.avatarUrl}
                      name={nameDisplay}
                      id={empIdDisplay}
                    />
                    <div>
                      <Text size="xs" fw={700} c="#09090B">
                        {nameDisplay}
                      </Text>
                      <Text size="10px" c="#71717A">
                        {emp.workEmail || emp.email || empIdDisplay}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>

                <Table.Td>
                  <Text size="xs" c="#09090B" fw={600}>
                    {roleDisplay}
                  </Text>
                  <Text size="10px" c="#71717A">
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
                      NO ACTIVE CONTRACT
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
                        <Text size="10px" c="#71717A">
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
                        <ActionIcon size="sm" variant="subtle" color="gray">
                          <IconDotsVertical size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Employee Actions</Menu.Label>
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

          {filtered.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                <Text size="xs" c="#71717A">
                  No employee records match the search filter.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

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
          <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Irreversible Action">
            <Text size="xs" c="#991B1B">
              Are you sure you want to offboard and delete <b>{targetEmployee?.name}</b> from the master employee registry?
            </Text>
          </Alert>

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B">
              {targetEmployee?.name} ({targetEmployee?.employeeNumber})
            </Text>
            <Text size="11px" c="#64748B">
              {targetEmployee?.jobPosition || targetEmployee?.jobTitle} • {targetEmployee?.department}
            </Text>
          </Paper>

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
              Offboard & Delete Employee
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
};

export default EmployeeTable;
