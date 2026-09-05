import React from 'react';
import { Group, TextInput, ActionIcon, Box } from '@mantine/core';
import { IconSearch, IconBell } from '@tabler/icons-react';
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
      {/* Left: Brand Logo */}
      <Group gap="lg">
        <div onClick={onViewLanding} title="PayPilot" style={{ cursor: onViewLanding ? 'pointer' : 'default' }}>
          <BrandLogo size={32} />
        </div>
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

      {/* Right: Notifications & User Menu */}
      <Group gap="sm">
        {/* Notifications */}
        <ActionIcon variant="subtle" size="md" color="gray">
          <IconBell size={16} color="#71717A" />
        </ActionIcon>

        {/* User Identity */}
        <UserMenu />
      </Group>
    </header>
  );
};
