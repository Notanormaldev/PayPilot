import React from 'react';
import { Stack, UnstyledButton, Group, Text, Badge } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconUsers,
  IconReceipt2,
  IconCalendarEvent,
  IconAdjustmentsHorizontal,
  IconShieldExclamation,
} from '@tabler/icons-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  openSentinelFlagsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, openSentinelFlagsCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: IconLayoutDashboard },
    { id: 'payroll', label: 'Payroll & Sentinel', icon: IconReceipt2, badge: openSentinelFlagsCount > 0 ? `${openSentinelFlagsCount} flags` : undefined, badgeColor: 'red' },
    { id: 'employees', label: 'Employee Hub', icon: IconUsers },
    { id: 'time-off', label: 'Attendance & Leaves', icon: IconCalendarEvent },
    { id: 'structures', label: 'Salary Rules & CTC', icon: IconAdjustmentsHorizontal },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#F8FAFC',
        borderRight: '1px solid #E2E8F0',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack gap="xs">
        <Text size="xs" fw={700} c="#71717A" px="sm" style={{ letterSpacing: '0.05em' }}>
          CORE PLATFORM
        </Text>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <UnstyledButton
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                border: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Icon size={18} color={isActive ? '#2563EB' : '#64748B'} />
                  <Text size="sm" fw={isActive ? 600 : 500} c={isActive ? '#09090B' : '#64748B'}>
                    {item.label}
                  </Text>
                </Group>
                {item.badge && (
                  <Badge size="xs" color={item.badgeColor} variant="filled">
                    {item.badge}
                  </Badge>
                )}
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>

      {/* Sentinel System Health Mini Widget */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '12px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Group gap="xs" mb={4}>
          <IconShieldExclamation size={14} color="#10B981" />
          <Text size="xs" fw={700} c="#09090B">
            Sentinel Guard v2.4
          </Text>
        </Group>
        <Text size="xs" c="#64748B">
          Autonomous compliance & fraud monitoring active.
        </Text>
      </div>
    </aside>
  );
};
