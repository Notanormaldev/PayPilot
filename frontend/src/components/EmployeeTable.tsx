import React, { useState } from 'react';
import { Paper, Table, Text, Badge, Group, TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconDotsVertical, IconCheck } from '@tabler/icons-react';

interface EmployeeTableProps {
  employees: any[];
  onSelectEmployee?: (emp: any) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onSelectEmployee }) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.jobPosition.toLowerCase().includes(q) ||
      e.workEmail.toLowerCase().includes(q)
    );
  });

  return (
    <Paper p="md" radius="sm">
      <Group justify="space-between" mb="md">
        <div>
          <Text size="xs" fw={700} c="#71717A" style={{ letterSpacing: '0.04em' }}>
            EMPLOYEE HUB & CONTRACT REGISTRY ({filtered.length})
          </Text>
        </div>

        <TextInput
          size="xs"
          placeholder="Filter by name, department, title..."
          leftSection={<IconSearch size={14} color="#71717A" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          styles={{
            input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#09090B' },
          }}
        />
      </Group>

      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>EMPLOYEE</Table.Th>
            <Table.Th>DEPARTMENT</Table.Th>
            <Table.Th>JOB TITLE</Table.Th>
            <Table.Th>CONTRACT WAGE</Table.Th>
            <Table.Th>BANK ACCOUNT</Table.Th>
            <Table.Th>STATUS</Table.Th>
            <Table.Th style={{ width: '40px' }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.map((emp) => {
            const activeContract = emp.contracts?.[0];
            const hasBank = !!emp.bankAccount;

            return (
              <Table.Tr key={emp.id}>
                <Table.Td>
                  <Text size="sm" fw={600} c="#09090B">
                    {emp.name}
                  </Text>
                  <Text size="xs" c="#71717A">
                    {emp.workEmail}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Badge size="xs" variant="outline" color="gray">
                    {emp.department}
                  </Badge>
                </Table.Td>

                <Table.Td>
                  <Text size="xs" c="#3F3F46">
                    {emp.jobPosition}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Text size="xs" fw={600} c="#10B981" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {activeContract ? `₹${Number(activeContract.wage).toLocaleString('en-IN')}` : 'No active contract'}
                  </Text>
                </Table.Td>

                <Table.Td>
                  {hasBank ? (
                    <Group gap={4}>
                      <IconCheck size={14} color="#10B981" />
                      <Text size="xs" c="#52525B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {emp.bankAccount.slice(-4).padStart(emp.bankAccount.length, '•')}
                      </Text>
                    </Group>
                  ) : (
                    <Badge size="xs" color="red" variant="filled">
                      Missing Bank Info
                    </Badge>
                  )}
                </Table.Td>

                <Table.Td>
                  <Badge size="xs" color="teal" variant="light">
                    {emp.status}
                  </Badge>
                </Table.Td>

                <Table.Td>
                  <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => onSelectEmployee?.(emp)}>
                    <IconDotsVertical size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
