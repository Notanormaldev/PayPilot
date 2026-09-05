import React from 'react';
import { Group, Badge, TextInput, Avatar, Menu, Text, Button } from '@mantine/core';
import { IconSearch, IconSparkles, IconChevronDown } from '@tabler/icons-react';

interface HeaderProps {
  onOpenCopilot: () => void;
  currentRole: string;
  onSelectRole: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCopilot, currentRole, onSelectRole }) => {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#0D0E12',
        borderBottom: '1px solid #262A36',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand & Wordmark */}
      <Group gap="sm">
        <img src="/logo.svg" alt="PayPilot" style={{ width: 32, height: 32 }} />
        <div>
          <Group gap={6} align="center">
            <Text fw={800} size="md" c="#F1F5F9" style={{ letterSpacing: '-0.02em' }}>
              PayPilot
            </Text>
            <Badge size="xs" variant="outline" color="blue" radius="xs" style={{ textTransform: 'uppercase', fontSize: 10 }}>
              HRMS OXP
            </Badge>
          </Group>
        </div>
      </Group>

      {/* Center Search & Live Indicators */}
      <Group gap="md">
        <TextInput
          placeholder="Search employees, payslips, contracts (⌘K)..."
          leftSection={<IconSearch size={14} color="#64748B" />}
          styles={{
            input: {
              backgroundColor: '#14161F',
              borderColor: '#262A36',
              color: '#F1F5F9',
              width: '320px',
              fontSize: '13px',
              fontFamily: 'Plus Jakarta Sans',
            },
          }}
        />

        {/* Live Status Indicators */}
        <Group gap="xs" visibleFrom="md">
          <Badge
            size="sm"
            variant="dot"
            color="teal"
            styles={{
              root: { backgroundColor: '#14161F', borderColor: '#262A36', border: '1px solid', color: '#94A3B8' },
            }}
          >
            Render Postgres
          </Badge>
          <Badge
            size="sm"
            variant="dot"
            color="teal"
            styles={{
              root: { backgroundColor: '#14161F', borderColor: '#262A36', border: '1px solid', color: '#94A3B8' },
            }}
          >
            Redis Cloud
          </Badge>
        </Group>
      </Group>

      {/* Right Controls: Copilot AI & Role Switcher */}
      <Group gap="sm">
        <Button
          size="xs"
          variant="outline"
          color="blue"
          leftSection={<IconSparkles size={14} color="#60A5FA" />}
          onClick={onOpenCopilot}
          styles={{
            root: {
              backgroundColor: '#14161F',
              borderColor: '#262A36',
              color: '#F1F5F9',
              '&:hover': { borderColor: '#3B82F6' },
            },
          }}
        >
          Ask Copilot
        </Button>

        {/* Interactive Role Switcher for Judges */}
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              size="xs"
              variant="default"
              rightSection={<IconChevronDown size={12} />}
              styles={{
                root: {
                  backgroundColor: '#14161F',
                  borderColor: '#262A36',
                  color: '#F1F5F9',
                },
              }}
            >
              Role: <Text span fw={700} c="blue" ml={4}>{currentRole}</Text>
            </Button>
          </Menu.Target>
          <Menu.Dropdown bg="#14161F" style={{ borderColor: '#262A36' }}>
            <Menu.Label c="#94A3B8">Simulate RBAC Role</Menu.Label>
            <Menu.Item onClick={() => onSelectRole('ADMIN')} c="#F1F5F9">
              ADMIN (Full Access)
            </Menu.Item>
            <Menu.Item onClick={() => onSelectRole('PAYROLL_OFFICER')} c="#F1F5F9">
              PAYROLL_OFFICER (Runs & Sentinel)
            </Menu.Item>
            <Menu.Item onClick={() => onSelectRole('HR_OFFICER')} c="#F1F5F9">
              HR_OFFICER (Employees & Leaves)
            </Menu.Item>
            <Menu.Item onClick={() => onSelectRole('EMPLOYEE')} c="#F1F5F9">
              EMPLOYEE (Self-Service)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Avatar color="blue" radius="xl" size="sm">
          AD
        </Avatar>
      </Group>
    </header>
  );
};
