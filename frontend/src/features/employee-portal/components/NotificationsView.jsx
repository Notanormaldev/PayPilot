import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Title,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconCheck,
  IconReceipt2,
  IconCalendarEvent,
  IconEdit,
  IconSpeakerphone,
  IconChecks,
} from '@tabler/icons-react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationsView = () => {
  const [filter, setFilter] = useState('all');
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const filteredItems = notifications.filter((i) => (filter === 'unread' ? i.unread : true));

  const getIcon = (type) => {
    switch (type) {
      case 'leave':
        return <IconCalendarEvent size={18} color="#0D9488" />;
      case 'payslip':
        return <IconReceipt2 size={18} color="#2563EB" />;
      case 'attendance':
        return <IconEdit size={18} color="#D97706" />;
      default:
        return <IconSpeakerphone size={18} color="#4F46E5" />;
    }
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb={4}>
              <Title order={3} c="#09090B">
                My Notifications Feed
              </Title>
              {unreadCount > 0 && (
                <Badge size="sm" color="red" variant="filled">
                  {unreadCount} Unread
                </Badge>
              )}
            </Group>
            <Text size="xs" c="#64748B">
              Updates on leave requests, payslips, attendance corrections, and company HR announcements.
            </Text>
          </div>

          <Button
            size="xs"
            variant="light"
            color="gray"
            leftSection={<IconChecks size={14} />}
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        </Group>
      </Paper>

      {/* Filter Bar */}
      <Group justify="space-between">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          data={[
            { label: 'All Notifications', value: 'all' },
            { label: `Unread (${unreadCount})`, value: 'unread' },
          ]}
          size="xs"
        />
      </Group>

      {/* Feed List */}
      <Stack gap="xs">
        {filteredItems.map((item) => (
          <Paper
            key={item.id}
            p="md"
            radius="md"
            style={{
              backgroundColor: item.unread ? '#EFF6FF' : '#FFFFFF',
              border: item.unread ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <Box mt={2}>{getIcon(item.type)}</Box>
                <div>
                  <Group gap="xs" mb={2}>
                    <Text size="xs" fw={700} c="#09090B">
                      {item.title}
                    </Text>
                    {item.unread && (
                      <Badge size="9px" color="blue">
                        New
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="#334155" style={{ lineHeight: 1.4 }}>
                    {item.message}
                  </Text>
                  <Text size="10px" c="#94A3B8" mt={4}>
                    {item.timestamp}
                  </Text>
                </div>
              </Group>

              {item.unread && (
                <Tooltip label="Mark as read" withArrow>
                  <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => markRead(item.id)}>
                    <IconCheck size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Paper>
        ))}

        {filteredItems.length === 0 && (
          <Paper p="xl" radius="md" style={{ textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1' }}>
            <Text size="xs" c="#71717A">
              No unread notifications right now.
            </Text>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
};
