import React, { useState, useEffect } from 'react';
import { Paper, Stack, Group, Text, Button, Avatar, SimpleGrid, Box } from '@mantine/core';
import { IconReceipt2, IconCoin, IconGift, IconFileText } from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';

export const SelfServicePortal = () => {
  const [checkedIn, setCheckedIn] = useState(true);
  const [seconds, setSeconds] = useState(13424); // 03:43:44

  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('paypilot_user_avatar') || null);

  useEffect(() => {
    let interval = null;
    if (checkedIn) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    const handleAvatar = (e) => setAvatarUrl(e.detail);
    window.addEventListener('paypilot_avatar_updated', handleAvatar);

    return () => {
      clearInterval(interval);
      window.removeEventListener('paypilot_avatar_updated', handleAvatar);
    };
  }, [checkedIn]);

  const formatTime = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  };

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
      }}
    >
      <Text fw={700} size="xs" c="#92400E" mb="xs" style={{ letterSpacing: '0.5px' }}>
        EMPLOYEE SELF-SERVICE PORTAL
      </Text>

      <Stack gap="sm">
        {/* User Greeting */}
        <Group gap="xs">
          <UserAvatar
            size={36}
            radius="xl"
            src={avatarUrl}
            name="Kartik Kumar"
            id="EMP-8492"
          />
          <div>
            <Text size="xs" fw={700} c="#09090B">
              Hello! Kartik Kumar
            </Text>
            <Text size="10px" c="#71717A">
              Welcome to PayPilot Portal
            </Text>
          </div>
        </Group>

        {/* Timer Box */}
        <Box
          p="xs"
          style={{
            backgroundColor: '#09090B',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <Text size="16px" fw={800} c="#FFFFFF" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {formatTime(seconds)}
          </Text>
          <Button
            size="xs"
            color={checkedIn ? 'orange' : 'teal'}
            mt={6}
            fullWidth
            onClick={() => setCheckedIn(!checkedIn)}
            styles={{
              root: { height: 26, fontSize: '11px', fontWeight: 700 },
            }}
          >
            {checkedIn ? 'Check Out' : 'Check In'}
          </Button>
        </Box>

        {/* Salary Details Grid */}
        <div>
          <Text size="11px" fw={700} c="#09090B" mb={6}>
            Salary Details
          </Text>
          <SimpleGrid cols={2} spacing="xs">
            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDE68A',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <IconCoin size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
              <Text size="10px" fw={600} c="#09090B">
                Salary
              </Text>
            </Paper>

            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDE68A',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <IconReceipt2 size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
              <Text size="10px" fw={600} c="#09090B">
                Payslip
              </Text>
            </Paper>

            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDE68A',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <IconFileText size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
              <Text size="10px" fw={600} c="#09090B">
                Earnings
              </Text>
            </Paper>

            <Paper
              p="xs"
              radius="sm"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDE68A',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <IconGift size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
              <Text size="10px" fw={600} c="#09090B">
                Benefits
              </Text>
            </Paper>
          </SimpleGrid>
        </div>
      </Stack>
    </Paper>
  );
};
