import React, { useState } from 'react';
import { Group, ActionIcon, Box, Indicator, Menu, Text, Badge, Stack, Button, UnstyledButton, Tooltip } from '@mantine/core';
import { IconBell, IconChecks, IconCalendarEvent, IconReceipt2, IconSpeakerphone, IconEdit } from '@tabler/icons-react';
import { BrandLogo } from '../BrandLogo';
import { UserMenu } from '../../features/auth/components/UserMenu';
import { useNotifications } from '../../features/employee-portal/hooks/useNotifications';
import { HolidayCalendarModal } from '../../features/employee-portal/components/HolidayCalendarModal';

export const Header = ({ onOpenCopilot, onViewLanding, onNavigateTab, onToggleSidebar, sidebarCollapsed }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'leave':
        return <IconCalendarEvent size={14} color="#0D9488" />;
      case 'payslip':
        return <IconReceipt2 size={14} color="#2563EB" />;
      case 'attendance':
        return <IconEdit size={14} color="#D97706" />;
      default:
        return <IconSpeakerphone size={14} color="#4F46E5" />;
    }
  };

  return (
    <>
      <header
        style={{
          height: '60px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Brand Logo */}
        <Group gap="md">
          <div onClick={onViewLanding} title="PayPilot" style={{ cursor: onViewLanding ? 'pointer' : 'default' }}>
            <BrandLogo size={32} />
          </div>
        </Group>

        {/* Right: Holiday Calendar, Notifications & User Menu */}
        <Group gap="sm">
          {/* Indian Holiday Calendar Action Button */}
          <Tooltip label="2026 Indian Holiday & Festival Calendar" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              size="md"
              color="indigo"
              radius="md"
              onClick={() => setHolidayModalOpen(true)}
              style={{ border: '1px solid #E0E7FF' }}
            >
              <IconCalendarEvent size={18} color="#4F46E5" />
            </ActionIcon>
          </Tooltip>

          {/* Notifications Bell Dropdown */}
          <Menu shadow="md" width={340} position="bottom-end" withArrow>
          <Menu.Target>
            <UnstyledButton style={{ display: 'inline-flex', position: 'relative' }}>
              <Indicator
                color="red"
                size={16}
                offset={4}
                label={unreadCount > 9 ? '9+' : unreadCount}
                disabled={unreadCount === 0}
                processing={unreadCount > 0}
              >
                <ActionIcon variant="subtle" size="md" color="gray">
                  <IconBell size={18} color={unreadCount > 0 ? '#2563EB' : '#71717A'} />
                </ActionIcon>
              </Indicator>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown p="xs">
            <Group justify="space-between" mb="xs" px="xs" pt="xs">
              <Group gap={6}>
                <Text size="xs" fw={700} c="#09090B">
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <Badge size="xs" color="red" variant="filled">
                    {unreadCount} New
                  </Badge>
                )}
              </Group>

              {unreadCount > 0 && (
                <ActionIcon size="xs" variant="subtle" color="blue" onClick={markAllRead} title="Mark all read">
                  <IconChecks size={14} />
                </ActionIcon>
              )}
            </Group>

            <Menu.Divider />

            <Stack gap={4} my={4} style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {notifications.slice(0, 5).map((n) => (
                <Box
                  key={n.id}
                  p="xs"
                  style={{
                    backgroundColor: n.unread ? '#EFF6FF' : '#FFFFFF',
                    borderRadius: '6px',
                    border: n.unread ? '1px solid #BFDBFE' : '1px solid #F1F5F9',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    markRead(n.id);
                    if (onNavigateTab) onNavigateTab('notifications');
                  }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <Box mt={2}>{getIcon(n.type)}</Box>
                      <div>
                        <Text size="xs" fw={n.unread ? 700 : 600} c="#09090B" style={{ lineHeight: 1.2 }}>
                          {n.title}
                        </Text>
                        <Text size="11px" c="#475569" style={{ lineHeight: 1.3 }} lineClamp={2} mt={2}>
                          {n.message}
                        </Text>
                        <Text size="9px" c="#94A3B8" mt={4}>
                          {n.timestamp}
                        </Text>
                      </div>
                    </Group>
                  </Group>
                </Box>
              ))}

              {notifications.length === 0 && (
                <Text size="xs" c="#94A3B8" ta="center" py="md">
                  No notifications yet
                </Text>
              )}
            </Stack>

            <Menu.Divider />

            <Button
              fullWidth
              size="xs"
              variant="subtle"
              color="blue"
              onClick={() => {
                if (onNavigateTab) onNavigateTab('notifications');
              }}
            >
              View All Notifications Feed
            </Button>
          </Menu.Dropdown>
        </Menu>

        {/* User Identity */}
        <UserMenu onNavigateTab={onNavigateTab} />
      </Group>
    </header>

    <HolidayCalendarModal
      opened={holidayModalOpen}
      onClose={() => setHolidayModalOpen(false)}
      onApplyRhLeave={(rhData) => {
        if (onNavigateTab) {
          onNavigateTab('my-time-off');
        }
      }}
    />
  </>
  );
};
