import React from 'react';
import { Stack, UnstyledButton, Group, Text, Badge, Box } from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconReceipt2,
  IconClock,
  IconCheckupList,
  IconShieldExclamation,
  IconFileText,
  IconPigMoney,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';

export const Sidebar = ({ activeTab, onTabChange, openSentinelFlagsCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'employees', label: 'Employees', icon: IconUsers },
    { id: 'payroll', label: 'Pay Runs', icon: IconReceipt2 },
    { id: 'time-off', label: 'Leave & Attendance', icon: IconClock },
    { id: 'approvals', label: 'Approvals', icon: IconCheckupList },
    {
      id: 'sentinel',
      label: 'Sentinel Audit',
      icon: IconShieldExclamation,
      badge: openSentinelFlagsCount > 0 ? `${openSentinelFlagsCount} Risk` : null,
      badgeColor: 'red',
    },
    { id: 'taxes', label: 'Taxes & Forms', icon: IconFileText },
    { id: 'loans', label: 'Loans', icon: IconPigMoney },
    { id: 'reports', label: 'Reports', icon: IconChartBar },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: '60px',
      }}
    >
      <Stack gap={4}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <UnstyledButton
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isActive ? '#F1F5F9' : 'transparent',
                color: isActive ? '#09090B' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                transition: 'all 0.15s ease',
              }}
            >
              <Group gap="xs">
                <Icon size={16} color={isActive ? '#09090B' : '#94A3B8'} />
                <Text size="xs" fw={isActive ? 700 : 500} c={isActive ? '#09090B' : '#64748B'}>
                  {item.label}
                </Text>
              </Group>

              {item.badge && (
                <Badge size="xs" color={item.badgeColor || 'gray'} variant="filled">
                  {item.badge}
                </Badge>
              )}
            </UnstyledButton>
          );
        })}
      </Stack>

      {/* Bottom Contact Support / Help */}
      <Box p="xs" style={{ borderTop: '1px solid #F1F5F9' }}>
        <Text size="11px" c="#71717A" fw={600} style={{ cursor: 'pointer' }}>
          Contact Support • Docs
        </Text>
        <Text size="9px" c="#A1A1AA" mt={2}>
          PayPilot Autonomous v2.4.0
        </Text>
      </Box>
    </aside>
  );
};
