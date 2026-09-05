import React from 'react';
import { Group, Avatar, Menu, Text, UnstyledButton, Badge, Box } from '@mantine/core';
import { IconChevronDown, IconShieldCheck, IconUser, IconLogout, IconSettings } from '@tabler/icons-react';
import { useAuthUser } from '../hooks/useAuthUser';
import { UserAvatar } from '../../../components/ui';

export const UserMenu = ({ onNavigateTab }) => {
  const { user, currentRole, logout } = useAuthUser();
  const [avatarUrl, setAvatarUrl] = React.useState(() => localStorage.getItem('paypilot_user_avatar') || null);

  React.useEffect(() => {
    const handleUpdate = (e) => setAvatarUrl(e.detail);
    window.addEventListener('paypilot_avatar_updated', handleUpdate);
    return () => window.removeEventListener('paypilot_avatar_updated', handleUpdate);
  }, []);

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
            <UserAvatar
              size={30}
              radius="xl"
              src={avatarUrl}
              name={user?.name || 'Meera Krishnan'}
              id={user?.email || 'meera'}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <Text size="xs" fw={700} c="#09090B" style={{ whiteSpace: 'nowrap' }}>
                {user?.name || 'Meera Krishnan'}
              </Text>
              <Badge
                size="xs"
                color={roleColor}
                variant="light"
                styles={{
                  root: {
                    height: 16,
                    fontSize: '9px',
                    fontWeight: 600,
                    textTransform: 'none',
                    padding: '0 5px',
                    marginTop: '2px',
                  },
                }}
              >
                {activeRoleLabel}
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
          leftSection={<IconSettings size={14} color="#2563EB" />}
          onClick={() => {
            if (onNavigateTab) onNavigateTab('settings');
          }}
          style={{ fontWeight: 600, fontSize: '12px' }}
        >
          Account & Settings
        </Menu.Item>

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
