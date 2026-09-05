import React, { useState } from 'react';
import {
  Paper,
  Table,
  Group,
  Avatar,
  Text,
  Badge,
  TextInput,
  Stack,
  Button,
} from '@mantine/core';
import { IconSearch, IconAlertCircle, IconCheck, IconUserPlus } from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';

export const EmployeeTable = ({ employees = [] }) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter((e) => {
    const term = search.toLowerCase();
    return (
      e.firstName?.toLowerCase().includes(term) ||
      e.lastName?.toLowerCase().includes(term) ||
      e.employeeNumber?.toLowerCase().includes(term) ||
      e.department?.toLowerCase().includes(term) ||
      e.jobTitle?.toLowerCase().includes(term)
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
          <Text fw={700} size="sm" c="#09090B">
            EMPLOYEE REGISTRY & ACTIVE CONTRACTS
          </Text>
          <Text size="xs" c="#71717A">
            Master records, banking verification, and compensation status
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
            const hasContract = emp.contracts && emp.contracts.length > 0;
            const activeContract = hasContract
              ? emp.contracts.find((c) => c.status === 'RUNNING') || emp.contracts[0]
              : null;
            const hasBank = !!(emp.bankAccountNo && emp.bankIfsc);

            return (
              <Table.Tr key={emp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <Table.Td>
                  <Group gap="xs">
                    <UserAvatar
                      size={32}
                      radius="xl"
                      src={emp.avatarUrl}
                      name={`${emp.firstName} ${emp.lastName}`}
                      id={emp.id || emp.employeeNumber}
                    />
                    <div>
                      <Text size="xs" fw={700} c="#09090B">
                        {emp.firstName} {emp.lastName}
                      </Text>
                      <Text size="10px" c="#71717A">
                        {emp.employeeNumber}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>

                <Table.Td>
                  <Text size="xs" c="#09090B">
                    {emp.jobTitle}
                  </Text>
                  <Text size="10px" c="#71717A">
                    {emp.department}
                  </Text>
                </Table.Td>

                <Table.Td>
                  {activeContract ? (
                    <Badge size="xs" color="blue" variant="light">
                      {activeContract.contractType}
                    </Badge>
                  ) : (
                    <Badge size="xs" color="red" variant="filled">
                      NO ACTIVE CONTRACT
                    </Badge>
                  )}
                </Table.Td>

                <Table.Td>
                  <Text size="xs" fw={700} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {activeContract
                      ? `₹${Number(activeContract.wage).toLocaleString('en-IN')}/mo`
                      : '—'}
                  </Text>
                </Table.Td>

                <Table.Td>
                  {hasBank ? (
                    <Group gap={4}>
                      <IconCheck size={14} color="#16A34A" />
                      <Text size="xs" c="#16A34A">
                        Verified
                      </Text>
                    </Group>
                  ) : (
                    <Group gap={4}>
                      <IconAlertCircle size={14} color="#DC2626" />
                      <Text size="xs" c="#DC2626" fw={600}>
                        Missing IFSC/Acc
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
                    {emp.status}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
