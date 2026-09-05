import React, { useState } from 'react';
import { Group, Avatar, Menu, Text, UnstyledButton, Badge, Box, Modal, Button, Stack, ThemeIcon } from '@mantine/core';
import { IconChevronDown, IconShieldCheck, IconUser, IconLogout, IconSettings, IconAlertTriangle } from '@tabler/icons-react';
import { useAuthUser } from '../hooks/useAuthUser';
import { UserAvatar } from '../../../components/ui';

export const UserMenu = ({ onNavigateTab }) => {
  const { user, currentRole, logout } = useAuthUser();
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('paypilot_user_avatar') || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    logout();
  };

  return (
    <>
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
          <Menu.Label>User Identity & Photo</Menu.Label>
          <Box p="xs" style={{ borderRadius: '6px', backgroundColor: '#F8FAFC' }}>
            <Group gap="xs" wrap="nowrap" align="center">
              <UserAvatar
                size={42}
                radius="xl"
                src={avatarUrl}
                name={user?.name || 'Meera Krishnan'}
                id={user?.email || 'meera'}
                editable={true}
                onPhotoUploaded={(url) => setAvatarUrl(url)}
                onPhotoRemoved={() => setAvatarUrl(null)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" fw={700} c="#09090B" truncate>
                  {user?.name || 'Meera Krishnan'}
                </Text>
                <Text size="10px" c="#71717A" truncate>
                  {user?.email || 'meera.krishnan@paypilot.internal'}
                </Text>
                <Text size="9px" c="#2563EB" fw={600} mt={2}>
                  Click avatar to upload photo
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
            onClick={() => setConfirmOpen(true)}
            style={{ fontWeight: 600, fontSize: '12px' }}
          >
            Sign Out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Sign Out Confirmation Modal */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="xl" color="red" variant="light">
              <IconLogout size={16} />
            </ThemeIcon>
            <Text fw={700} size="sm" c="#09090B">
              Confirm Sign Out
            </Text>
          </Group>
        }
        centered
        size="sm"
        radius="md"
        styles={{
          header: { borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' },
          body: { paddingTop: '16px' },
        }}
      >
        <Stack gap="md">
          <Text size="xs" c="#64748B" style={{ lineHeight: 1.5 }}>
            Are you sure you want to sign out of PayPilot? You will end the session for{' '}
            <strong style={{ color: '#09090B' }}>{user?.name || 'Meera Krishnan'}</strong> ({user?.email || 'meera.krishnan@paypilot.internal'}).
          </Text>

          <Group justify="flex-end" gap="xs" mt="xs">
            <Button
              variant="default"
              size="xs"
              onClick={() => setConfirmOpen(false)}
              styles={{ root: { fontWeight: 600 } }}
            >
              No, Cancel
            </Button>
            <Button
              color="red"
              size="xs"
              onClick={handleConfirmLogout}
              leftSection={<IconLogout size={14} />}
              styles={{ root: { fontWeight: 600 } }}
            >
              Yes, Sign Out
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
