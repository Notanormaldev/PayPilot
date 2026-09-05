import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Badge,
  Divider,
  SimpleGrid,
  Box,
  Select,
} from '@mantine/core';
import {
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUser,
  IconBuildingSkyscraper,
  IconBrandGoogle,
  IconArrowRight,
} from '@tabler/icons-react';
import { BrandLogo } from '../../../components/BrandLogo';
import { fetchApi } from '../../../lib/api';
import { useDispatch } from 'react-redux';
import { setRole, setUser, setSignedIn } from '../state/authSlice';

export const AuthPage = ({ onAuthSuccess }) => {
  const dispatch = useDispatch();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('meera.krishnan@paypilot.internal');
  const [password, setPassword] = useState('PayPilot@2026');
  const [name, setName] = useState('Meera Krishnan');
  const [role, setRoleState] = useState('ADMIN');
  const [department, setDepartment] = useState('Executive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (overrideEmail, overrideRole) => {
    setLoading(true);
    setError(null);
    const targetEmail = overrideEmail || email;
    const targetRole = overrideRole || role;

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail, role: targetRole }),
      });

      if (res.accessToken) {
        localStorage.setItem('paypilot_auth_token', res.accessToken);
        if (res.refreshToken) localStorage.setItem('paypilot_refresh_token', res.refreshToken);
        localStorage.setItem('paypilot_active_role', res.user?.role || targetRole);

        dispatch(setRole(res.user?.role || targetRole));
        dispatch(setUser(res.user));
        dispatch(setSignedIn(true));

        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, role, department }),
      });

      if (res.accessToken) {
        localStorage.setItem('paypilot_auth_token', res.accessToken);
        if (res.refreshToken) localStorage.setItem('paypilot_refresh_token', res.refreshToken);
        localStorage.setItem('paypilot_active_role', res.user?.role || role);

        dispatch(setRole(res.user?.role || role));
        dispatch(setUser(res.user));
        dispatch(setSignedIn(true));

        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = (empEmail, empRole) => {
    setEmail(empEmail);
    setRoleState(empRole);
    handleLogin(empEmail, empRole);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: '24px',
      }}
    >
      <Paper
        p={36}
        radius="lg"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        }}
      >
        <Stack gap="lg">
          {/* Top Branding */}
          <Box style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '8px' }}>
              <BrandLogo size={42} />
            </div>
            <Text size="sm" c="#71717A">
              Autonomous HRMS & Sentinel Payroll Engine
            </Text>
          </Box>

          {/* Mode Switcher */}
          <Group justify="center" gap="xs">
            <Button
              size="xs"
              variant={!isRegister ? 'filled' : 'subtle'}
              color="dark"
              onClick={() => setIsRegister(false)}
            >
              Sign In
            </Button>
            <Button
              size="xs"
              variant={isRegister ? 'filled' : 'subtle'}
              color="dark"
              onClick={() => setIsRegister(true)}
            >
              Create Account
            </Button>
          </Group>

          {error && (
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2' }}>
              <Text size="xs" c="#DC2626" fw={600}>
                {error}
              </Text>
            </Paper>
          )}

          {/* Form Fields */}
          <Stack gap="sm">
            {isRegister && (
              <>
                <TextInput
                  label="Full Name"
                  placeholder="e.g. Meera Krishnan"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  leftSection={<IconUser size={14} color="#71717A" />}
                  styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                />

                <Select
                  label="Department"
                  data={['Executive', 'Engineering', 'Product', 'HR & People', 'Finance', 'Sales', 'Operations']}
                  value={department}
                  onChange={setDepartment}
                  styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                />

                <Select
                  label="Role Permission"
                  data={[
                    { value: 'ADMIN', label: 'Executive / Administrator' },
                    { value: 'HR_MANAGER', label: 'HR Manager' },
                    { value: 'HR_PAYROLL_MANAGER', label: 'Payroll Specialist' },
                    { value: 'EMPLOYEE', label: 'Employee Self-Service' },
                  ]}
                  value={role}
                  onChange={setRoleState}
                  styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                />
              </>
            )}

            <TextInput
              label="Work Email"
              placeholder="name@paypilot.internal"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              leftSection={<IconMail size={14} color="#71717A" />}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />

            <PasswordInput
              label="Security Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              leftSection={<IconLock size={14} color="#71717A" />}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />

            <Button
              fullWidth
              color="dark"
              size="md"
              mt="xs"
              loading={loading}
              onClick={isRegister ? handleRegister : () => handleLogin()}
              rightSection={<IconArrowRight size={16} />}
            >
              {isRegister ? 'Register & Continue' : 'Sign In to PayPilot'}
            </Button>
          </Stack>

          <Divider label="OR 1-CLICK DEMO ACCESS" labelPosition="center" color="#E2E8F0" />

          {/* One-Click Fast Personas */}
          <SimpleGrid cols={2} spacing="xs">
            <Paper
              p="xs"
              radius="sm"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              onClick={() => handleFastLogin('meera.krishnan@paypilot.internal', 'ADMIN')}
            >
              <Group gap={6} mb={2}>
                <Badge size="xs" color="blue" variant="light">ADMIN</Badge>
              </Group>
              <Text size="11px" fw={700} c="#09090B">Meera Krishnan</Text>
              <Text size="9px" c="#71717A">Chief Officer</Text>
            </Paper>

            <Paper
              p="xs"
              radius="sm"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              onClick={() => handleFastLogin('neha.gupta@paypilot.internal', 'HR_PAYROLL_MANAGER')}
            >
              <Group gap={6} mb={2}>
                <Badge size="xs" color="indigo" variant="light">PAYROLL</Badge>
              </Group>
              <Text size="11px" fw={700} c="#09090B">Neha Gupta</Text>
              <Text size="9px" c="#71717A">Payroll Lead</Text>
            </Paper>

            <Paper
              p="xs"
              radius="sm"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              onClick={() => handleFastLogin('tanvi.kapoor@paypilot.internal', 'HR_MANAGER')}
            >
              <Group gap={6} mb={2}>
                <Badge size="xs" color="teal" variant="light">HR</Badge>
              </Group>
              <Text size="11px" fw={700} c="#09090B">Tanvi Kapoor</Text>
              <Text size="9px" c="#71717A">People Ops</Text>
            </Paper>

            <Paper
              p="xs"
              radius="sm"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              onClick={() => handleFastLogin('kartik.kumar@paypilot.internal', 'EMPLOYEE')}
            >
              <Group gap={6} mb={2}>
                <Badge size="xs" color="gray" variant="light">EMPLOYEE</Badge>
              </Group>
              <Text size="11px" fw={700} c="#09090B">Kartik Kumar</Text>
              <Text size="9px" c="#71717A">Product Manager</Text>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Paper>
    </div>
  );
};
