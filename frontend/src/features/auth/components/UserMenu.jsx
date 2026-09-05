import React from 'react';
import { Group, Avatar, Menu, Text, UnstyledButton, Badge, Box } from '@mantine/core';
import { IconChevronDown, IconShieldCheck, IconUser, IconLogout } from '@tabler/icons-react';
import { useAuthUser } from '../hooks/useAuthUser';

export const UserMenu = () => {
  const { user, currentRole, logout } = useAuthUser();

  const roleColors = {
    ADMIN: 'blue',
    HR_MANAGER: 'teal',
    HR_OFFICER: 'teal',
    HR_PAYROLL_MANAGER: 'indigo',
    PAYROLL_OFFICER: 'indigo',
    EMPLOYEE: 'gray',
  };

  const roleLabels = {
    ADMIN: 'Executive / Administrator',
    HR_MANAGER: 'HR Manager',
    HR_OFFICER: 'HR Officer',
    HR_PAYROLL_MANAGER: 'Payroll Specialist',
    PAYROLL_OFFICER: 'Payroll Specialist',
    EMPLOYEE: 'Employee Portal',
  };

  const activeRoleLabel = roleLabels[currentRole] || currentRole || 'Executive / Administrator';
  const roleColor = roleColors[currentRole] || 'blue';

  return (
    <Menu shadow="md" width={240} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Group gap="xs">
            <Avatar
              size={30}
              radius="xl"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
              alt={user?.name || 'User'}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Text size="xs" fw={700} c="#09090B">
                {user?.name || 'Meera Krishnan'}
              </Text>
              <Badge size="9px" color={roleColor} variant="light" px={4} py={0}>
                {currentRole}
              </Badge>
            </div>
            <IconChevronDown size={14} color="#71717A" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <Menu.Label>User Identity</Menu.Label>
        <Box p="xs" style={{ borderRadius: '6px', backgroundColor: '#F8FAFC' }}>
          <Group gap="xs" wrap="nowrap">
            <IconUser size={16} color="#64748B" />
            <div>
              <Text size="xs" fw={700} c="#09090B">
                {user?.name || 'Meera Krishnan'}
              </Text>
              <Text size="10px" c="#71717A">
                {user?.email || 'meera.krishnan@paypilot.internal'}
              </Text>
            </div>
          </Group>
        </Box>

        <Menu.Divider my="xs" />
        <Menu.Label>Assigned System Role</Menu.Label>
        <Box p="xs" style={{ borderRadius: '6px', backgroundColor: '#F8FAFC' }}>
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconShieldCheck size={16} color="#2563EB" />
              <Text size="xs" fw={700} c="#09090B">
                {activeRoleLabel}
              </Text>
            </Group>
            <Badge size="xs" color={roleColor} variant="filled">
              {currentRole}
            </Badge>
          </Group>
        </Box>

        <Menu.Divider my="xs" />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} color="#DC2626" />}
          onClick={logout}
          style={{ fontWeight: 600, fontSize: '12px' }}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
