import React, { useState } from 'react';
import {
  Paper,
  Table,
  Group,
  Text,
  Badge,
  TextInput,
} from '@mantine/core';
import { IconSearch, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';

export const EmployeeTable = ({ employees = [] }) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter((e) => {
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
              {employees.length} Total Registered
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
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.map((emp) => {
            const fullName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
            const empIdDisplay = emp.employeeNumber || (emp.id ? `EMP-${emp.id.slice(-4).toUpperCase()}` : 'EMP-0000');
            const roleDisplay = emp.jobPosition || emp.jobTitle || 'Software Engineer';
            const deptDisplay = emp.department || 'Engineering';

            const hasContract = emp.contracts && emp.contracts.length > 0;
            const activeContract = hasContract
              ? emp.contracts.find((c) => c.status === 'RUNNING') || emp.contracts[0]
              : (emp.wage ? { contractType: 'Regular Full-Time', wage: emp.wage } : null);

            const hasBank = !!(emp.bankAccountNo || emp.bankAccount || emp.bankName);

            return (
              <Table.Tr key={emp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <UserAvatar
                      size={32}
                      radius="xl"
                      src={emp.avatarUrl}
                      name={fullName}
                      id={empIdDisplay}
                    />
                    <div>
                      <Text size="xs" fw={700} c="#09090B">
                        {fullName}
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
                      <Text size="xs" c="#16A34A" fw={600}>
                        Verified
                      </Text>
                    </Group>
                  ) : (
                    <Group gap={4}>
                      <IconAlertCircle size={14} color="#DC2626" />
                      <Text size="xs" c="#DC2626" fw={600}>
                        Missing Bank Info
                      </Text>
                    </Group>
                  )}
                </Table.Td>

                <Table.Td>
                  <Badge
                    size="xs"
                    color={emp.status === 'ACTIVE' ? 'teal' : 'gray'}
                    variant="light"
                  >
                    {emp.status || 'ACTIVE'}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}

          {filtered.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                <Text size="xs" c="#71717A">
                  No employee records match the search filter.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
