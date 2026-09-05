import React, { useMemo, useState } from 'react';
import { Group, TextInput, ActionIcon, Box, Indicator, Menu, Text, Badge, Stack, Button, UnstyledButton, Paper, ScrollArea } from '@mantine/core';
import { IconSearch, IconBell, IconChecks, IconCalendarEvent, IconReceipt2, IconSpeakerphone, IconEdit, IconUsers, IconShieldExclamation, IconFileText, IconChartBar, IconLayoutDashboard, IconClock, IconChevronRight } from '@tabler/icons-react';
import { BrandLogo } from '../BrandLogo';
import { UserMenu } from '../../features/auth/components/UserMenu';
import { useNotifications } from '../../features/employee-portal/hooks/useNotifications';

export const Header = ({ onOpenCopilot, onViewLanding, onNavigateTab, currentRole, employees = [], payruns = [], flags = [] }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const results = useMemo(() => {
    const permissions = {
      ADMIN: ['dashboard', 'employees', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
      HR_MANAGER: ['dashboard', 'employees', 'time-off', 'approvals', 'reports', 'settings'],
      HR_PAYROLL_MANAGER: ['dashboard', 'payroll', 'time-off', 'sentinel', 'taxes', 'reports', 'settings'],
      EMPLOYEE: ['my-profile', 'my-attendance', 'my-time-off', 'my-contract', 'my-payslips', 'my-taxes', 'notifications', 'settings'],
    };
    const navigation = [
      ['dashboard', 'Dashboard', IconLayoutDashboard], ['employees', 'Employees', IconUsers], ['payroll', 'Pay Runs', IconReceipt2],
      ['time-off', 'Leave & Attendance', IconClock], ['approvals', 'Approvals', IconChecks], ['sentinel', 'Sentinel Audit', IconShieldExclamation],
      ['taxes', 'Taxes & Forms', IconFileText], ['reports', 'Reports', IconChartBar], ['settings', 'Settings', IconFileText],
      ['my-profile', 'My Profile', IconUsers], ['my-attendance', 'My Attendance', IconClock], ['my-time-off', 'My Time Off', IconClock],
      ['my-contract', 'My Contract', IconFileText], ['my-payslips', 'My Payslips', IconReceipt2], ['my-taxes', 'My Tax Summary', IconFileText],
      ['notifications', 'Notifications', IconBell],
    ].filter(([id]) => (permissions[currentRole] || permissions.ADMIN).includes(id));
    const term = searchQuery.trim().toLowerCase();
    if (!term) return navigation.slice(0, 5).map(([id, label, Icon]) => ({ id, label, type: 'Go to', Icon }));

    const matches = navigation
      .filter(([, label]) => label.toLowerCase().includes(term))
      .map(([id, label, Icon]) => ({ id, label, type: 'Go to', Icon }));
    const canSearchEmployees = permissions[currentRole]?.includes('employees');
    const canSearchPayruns = permissions[currentRole]?.includes('payroll');
    const canSearchFlags = permissions[currentRole]?.includes('sentinel');
    const employeeResults = canSearchEmployees ? employees.filter((employee) => [employee.name, employee.employeeId, employee.department, employee.email].some((value) => String(value || '').toLowerCase().includes(term))).slice(0, 5).map((employee) => ({ id: 'employees', label: employee.name || employee.employeeId || 'Employee', detail: employee.department || employee.email || 'Employee record', type: 'Employee', Icon: IconUsers })) : [];
    const payrunResults = canSearchPayruns ? payruns.filter((payrun) => [payrun.name, payrun.id, payrun.status, payrun.period].some((value) => String(value || '').toLowerCase().includes(term))).slice(0, 5).map((payrun) => ({ id: 'payroll', label: payrun.name || payrun.period || `Pay run ${payrun.id}`, detail: payrun.status || 'Pay run', type: 'Pay run', Icon: IconReceipt2 })) : [];
    const flagResults = canSearchFlags ? flags.filter((flag) => [flag.title, flag.description, flag.employeeName, flag.severity].some((value) => String(value || '').toLowerCase().includes(term))).slice(0, 5).map((flag) => ({ id: 'sentinel', label: flag.title || flag.employeeName || 'Sentinel flag', detail: flag.severity || flag.description || 'Open audit flag', type: 'Audit flag', Icon: IconShieldExclamation })) : [];
    return [...matches, ...employeeResults, ...payrunResults, ...flagResults].slice(0, 10);
  }, [currentRole, employees, flags, payruns, searchQuery]);

  const selectResult = (result) => {
    onNavigateTab?.(result.id);
    setSearchQuery('');
    setSearchFocused(false);
  };

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
      <Group gap="lg">
        <div onClick={onViewLanding} title="PayPilot" style={{ cursor: onViewLanding ? 'pointer' : 'default' }}>
          <BrandLogo size={32} />
        </div>
      </Group>

      {/* Middle: Universal Search Bar */}
      <Box style={{ width: 'min(380px, 42vw)', minWidth: '180px', position: 'relative', flex: '0 1 380px' }}>
        <TextInput
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setSearchFocused(false);
            if (event.key === 'Enter' && results[0]) selectResult(results[0]);
          }}
          placeholder="Search Employee, Payrun, Tax Form, or Flag..."
          size="xs"
          leftSection={<IconSearch size={14} color="#71717A" />}
          styles={{
            input: {
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              color: '#09090B',
              fontSize: '12px',
              borderRadius: '6px',
            },
          }}
        />
        {searchFocused && (
          <Paper shadow="md" withBorder p={4} style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200, minWidth: '260px' }}>
            <ScrollArea.Autosize mah={360}>
              {results.length > 0 ? results.map((result, index) => {
                const ResultIcon = result.Icon;
                return <UnstyledButton key={`${result.type}-${result.label}-${index}`} onClick={() => selectResult(result)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 5 }}>
                  <ResultIcon size={16} color="#64748B" />
                  <Box style={{ flex: 1, minWidth: 0 }}><Text size="xs" fw={600} truncate>{result.label}</Text><Text size="10px" c="dimmed" truncate>{result.detail || result.type}</Text></Box>
                  <IconChevronRight size={14} color="#CBD5E1" />
                </UnstyledButton>;
              }) : <Text size="xs" c="dimmed" ta="center" p="md">No permitted matches found</Text>}
            </ScrollArea.Autosize>
          </Paper>
        )}
      </Box>

      {/* Right: Notifications & User Menu */}
      <Group gap="sm">
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
  );
};
