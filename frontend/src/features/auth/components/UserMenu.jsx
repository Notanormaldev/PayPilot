import React from 'react';
import { Group, Avatar, Menu, Text, UnstyledButton, Badge } from '@mantine/core';
import { IconChevronDown, IconShieldCheck, IconUser, IconSwitchHorizontal } from '@tabler/icons-react';
import { useAuthUser } from '../hooks/useAuthUser';

export const UserMenu = () => {
  const { user, currentRole, changeRole } = useAuthUser();

  const roleColors = {
    ADMIN: 'blue',
    HR_OFFICER: 'teal',
    PAYROLL_OFFICER: 'indigo',
    EMPLOYEE: 'gray',
  };

  return (
    <Menu shadow="md" width={240} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Group gap="xs">
            <Avatar
              size={30}
              radius="xl"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
              alt={user.name}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Text size="xs" fw={700} c="#09090B">
                {user.name}
              </Text>
              <Badge size="9px" color={roleColors[currentRole] || 'blue'} variant="light" px={4} py={0}>
                {currentRole}
              </Badge>
            </div>
            <IconChevronDown size={14} color="#71717A" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <Menu.Label>Executive Identity</Menu.Label>
        <Menu.Item leftSection={<IconUser size={14} />}>
          <div>
            <Text size="xs" fw={600} c="#09090B">
              {user.name}
            </Text>
            <Text size="10px" c="#71717A">
              {user.email}
            </Text>
          </div>
        </Menu.Item>

        <Menu.Divider />
        <Menu.Label>Switch Simulation Role</Menu.Label>
        <Menu.Item
          leftSection={<IconShieldCheck size={14} color="#2563EB" />}
          onClick={() => changeRole('ADMIN')}
        >
          <Group justify="space-between">
            <Text size="xs">Admin / Executive</Text>
            {currentRole === 'ADMIN' && <Badge size="xs" color="blue">Active</Badge>}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSwitchHorizontal size={14} color="#0D9488" />}
          onClick={() => changeRole('HR_OFFICER')}
        >
          <Group justify="space-between">
            <Text size="xs">HR Officer</Text>
            {currentRole === 'HR_OFFICER' && <Badge size="xs" color="teal">Active</Badge>}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSwitchHorizontal size={14} color="#4F46E5" />}
          onClick={() => changeRole('PAYROLL_OFFICER')}
        >
          <Group justify="space-between">
            <Text size="xs">Payroll Specialist</Text>
            {currentRole === 'PAYROLL_OFFICER' && <Badge size="xs" color="indigo">Active</Badge>}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<IconUser size={14} color="#71717A" />}
          onClick={() => changeRole('EMPLOYEE')}
        >
          <Group justify="space-between">
            <Text size="xs">Employee Portal</Text>
            {currentRole === 'EMPLOYEE' && <Badge size="xs" color="gray">Active</Badge>}
          </Group>
        </Menu.Item>

        <Menu.Divider />
        <Menu.Item
          color="red"
          onClick={() => {
            localStorage.removeItem('paypilot_auth_token');
            localStorage.removeItem('paypilot_refresh_token');
            window.location.reload();
          }}
        >
          <Text size="xs" c="red" fw={600}>
            Sign Out / Switch Account
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
