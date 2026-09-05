import React from 'react';
import { Group, TextInput, ActionIcon, Badge, Tooltip, Box, Text } from '@mantine/core';
import {
  IconSearch,
  IconSparkles,
  IconBell,
  IconDatabase,
  IconBuildingSkyscraper,
} from '@tabler/icons-react';
import { BrandLogo } from './BrandLogo';
import { UserMenu } from '../features/auth/components/UserMenu';

export const Header = ({ onOpenCopilot, onViewLanding }) => {
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
      {/* Left: Brand Logo & Org */}
      <Group gap="lg">
        <div onClick={onViewLanding} title="View PayPilot Landing Page" style={{ cursor: 'pointer' }}>
          <BrandLogo size={32} />
        </div>

        <Group gap={6} style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: 16 }}>
          <IconBuildingSkyscraper size={16} color="#64748B" />
          <Text size="xs" fw={700} c="#09090B">
            PayPilot Global Inc.
          </Text>
          <Badge size="xs" color="gray" variant="outline" style={{ textTransform: 'none' }}>
            IN-EN ▼
          </Badge>
        </Group>
      </Group>

      {/* Middle: Universal Search Bar */}
      <Box style={{ width: '380px' }}>
        <TextInput
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
      </Box>

      {/* Right: Live Telemetry, Copilot Launcher, Notifications & User Menu */}
      <Group gap="sm">
        {/* Postgres Live Telemetry */}
        <Tooltip label="Render PostgreSQL (Singapore): Connected with SSL" withArrow>
          <Badge
            size="xs"
            variant="dot"
            color="teal"
            styles={{ root: { backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' } }}
          >
            Postgres: Live
          </Badge>
        </Tooltip>

        {/* Redis Live Telemetry */}
        <Tooltip label="Redis Cloud Cluster (Port 14974): In-Memory 60s Cache Active" withArrow>
          <Badge
            size="xs"
            variant="dot"
            color="teal"
            styles={{ root: { backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' } }}
          >
            Redis: Active
          </Badge>
        </Tooltip>

        {/* Copilot Action Button */}
        <Tooltip label="Launch Gemini 2.5 Sentinel Copilot" withArrow>
          <ActionIcon
            variant="outline"
            size="md"
            color="blue"
            onClick={onOpenCopilot}
            style={{
              borderColor: '#BFDBFE',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
            }}
          >
            <IconSparkles size={16} />
          </ActionIcon>
        </Tooltip>

        {/* Notifications */}
        <ActionIcon variant="subtle" size="md" color="gray">
          <IconBell size={16} color="#71717A" />
        </ActionIcon>

        {/* User Identity & Role Switcher */}
        <UserMenu />
      </Group>
    </header>
  );
};
