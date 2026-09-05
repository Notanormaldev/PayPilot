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
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Brand & Wordmark */}
      <Group gap="sm">
        <img src="/logo.svg" alt="PayPilot" style={{ width: 30, height: 30 }} />
        <div>
          <Group gap={6} align="center">
            <Text fw={800} size="md" c="#09090B" style={{ letterSpacing: '-0.02em' }}>
              PayPilot
            </Text>
            <Badge size="xs" variant="outline" color="dark" radius="xs" style={{ textTransform: 'uppercase', fontSize: 10 }}>
              HRMS OXP
            </Badge>
          </Group>
        </div>
      </Group>

      {/* Center Search & Live Indicators */}
      <Group gap="md">
        <TextInput
          placeholder="Search employees, payslips, contracts (⌘K)..."
          leftSection={<IconSearch size={14} color="#71717A" />}
          styles={{
            input: {
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              color: '#09090B',
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
              root: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', border: '1px solid', color: '#52525B' },
            }}
          >
            Render Postgres
          </Badge>
          <Badge
            size="sm"
            variant="dot"
            color="teal"
            styles={{
              root: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', border: '1px solid', color: '#52525B' },
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
          color="dark"
          leftSection={<IconSparkles size={14} color="#2563EB" />}
          onClick={onOpenCopilot}
          styles={{
            root: {
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              color: '#09090B',
              '&:hover': { borderColor: '#09090B' },
            },
          }}
        >
          Ask Copilot
        </Button>

        {/* Interactive Role Switcher for Judges */}
        <Menu shadow="sm" width={220}>
          <Menu.Target>
            <Button
              size="xs"
              variant="default"
              rightSection={<IconChevronDown size={12} />}
              styles={{
                root: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  color: '#09090B',
                },
              }}
            >
              Role: <Text span fw={700} c="blue" ml={4}>{currentRole}</Text>
            </Button>
          </Menu.Target>
          <Menu.Dropdown bg="#FFFFFF" style={{ borderColor: '#E2E8F0' }}>
            <Menu.Label c="#71717A">Simulate RBAC Role</Menu.Label>
            <Menu.Item onClick={() => onSelectRole('ADMIN')} c="#09090B">
              ADMIN (Full Access)
            </Menu.Item>
            <Menu.Item onClick={() => onSelectRole('PAYROLL_OFFICER')} c="#09090B">
              PAYROLL_OFFICER (Runs & Sentinel)
            </Menu.Item>
            <Menu.Item onClick={() => onSelectRole('HR_OFFICER')} c="#09090B">
              HR_OFFICER (Employees & Leaves)
            </Menu.Item>
            <Menu.Item onClick={() => onSelectRole('EMPLOYEE')} c="#09090B">
              EMPLOYEE (Self-Service)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Avatar color="dark" radius="xl" size="sm">
          AD
        </Avatar>
      </Group>
    </header>
  );
};
