import React from 'react';
import { Stack, UnstyledButton, Group, Text, Badge, Box, Tooltip } from '@mantine/core';
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
  IconUser,
  IconCalendarTime,
  IconReceiptTax,
  IconBell,
  IconCalculator,
} from '@tabler/icons-react';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';

export const Sidebar = ({ activeTab, onTabChange, openSentinelFlagsCount = 0, collapsed = false }) => {
  const { currentRole } = useAuthUser();

  // Employee Self-Service Navigation Items
  const employeeNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'my-profile', label: 'My Profile', icon: IconUser },
    { id: 'my-attendance', label: 'My Attendance', icon: IconClock },
    { id: 'my-time-off', label: 'My Time Off', icon: IconCalendarTime },
    { id: 'my-contract', label: 'My Contract', icon: IconFileText },
    { id: 'my-payslips', label: 'My Payslips', icon: IconReceipt2 },
    { id: 'my-taxes', label: 'My Tax Summary', icon: IconReceiptTax },
    { id: 'notifications', label: 'Notifications', icon: IconBell, badge: '2 New', badgeColor: 'blue' },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  // Administrative Navigation Items
  const adminRoleNavPermissions = {
    ADMIN: ['dashboard', 'employees', 'schedules', 'salary-structures', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
    HR_MANAGER: ['dashboard', 'employees', 'schedules', 'salary-structures', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
    HR_PAYROLL_MANAGER: ['dashboard', 'employees', 'schedules', 'salary-structures', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
  };

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'employees', label: 'Employees', icon: IconUsers },
    { id: 'schedules', label: 'Work Schedules', icon: IconCalendarTime },
    { id: 'salary-structures', label: 'Salary Structures', icon: IconCalculator },
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
    { id: 'reports', label: 'Reports', icon: IconChartBar },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  const isEmployee = currentRole === 'EMPLOYEE';
  const visibleNavItems = isEmployee
    ? employeeNavItems
    : adminNavItems.filter((item) => (adminRoleNavPermissions[currentRole] || adminRoleNavPermissions['ADMIN']).includes(item.id));

  return (
    <aside
      style={{
        width: collapsed ? '68px' : '240px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        padding: collapsed ? '16px 8px' : '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: '60px',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.2s ease',
        overflowX: 'hidden',
      }}
    >
      <Stack gap={4}>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          const buttonContent = (
            <UnstyledButton
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                padding: collapsed ? '10px 0' : '8px 12px',
                borderRadius: '6px',
                backgroundColor: isActive ? '#F1F5F9' : 'transparent',
                color: isActive ? '#09090B' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <Group gap="xs" wrap="nowrap" justify={collapsed ? 'center' : 'flex-start'}>
                <Icon size={18} color={isActive ? '#2563EB' : '#64748B'} />
                {!collapsed && (
                  <Text size="xs" fw={isActive ? 700 : 500} c={isActive ? '#09090B' : '#64748B'} truncate>
                    {item.label}
                  </Text>
                )}
              </Group>

              {!collapsed && item.badge && (
                <Badge size="xs" color={item.badgeColor || 'gray'} variant="filled">
                  {item.badge}
                </Badge>
              )}
            </UnstyledButton>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} label={item.label} position="right" withArrow>
                {buttonContent}
              </Tooltip>
            );
          }

          return buttonContent;
        })}
      </Stack>

      {/* Bottom Role Indicator & Support */}
      <Box p="xs" style={{ borderTop: '1px solid #F1F5F9', textAlign: collapsed ? 'center' : 'left' }}>
        {!collapsed ? (
          <>
            <Text size="11px" c="#71717A" fw={600} style={{ cursor: 'pointer' }}>
              Contact Support • Docs
            </Text>
            <Text size="9px" c="#A1A1AA" mt={2}>
              PayPilot Autonomous v2.4.0
            </Text>
          </>
        ) : (
          <Tooltip label="PayPilot v2.4.0 • Contact Support" position="right" withArrow>
            <Text size="9px" c="#A1A1AA" fw={700}>
              v2.4
            </Text>
          </Tooltip>
        )}
      </Box>
    </aside>
  );
};
