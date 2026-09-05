import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Badge,
  Divider,
  SimpleGrid,
  Paper,
  Box,
  Select,
} from '@mantine/core';
import {
  IconLock,
  IconMail,
  IconUser,
  IconArrowRight,
  IconSparkles,
} from '@tabler/icons-react';
import { BrandLogo } from '../../../../components/BrandLogo';
import { useAuthUser } from '../../../auth/hooks/useAuthUser';
import { UserAvatar } from '../../../../components/ui';

export const AuthModal = ({ opened, onClose, initialMode = 'signin', onAuthSuccess }) => {
  const { login, register } = useAuthUser();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRoleState] = useState('EMPLOYEE');
  const [department, setDepartment] = useState('Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (overrideEmail, overrideRole) => {
    setLoading(true);
    setError(null);
    const targetEmail = overrideEmail || email;
    const targetRole = overrideRole || role;

    try {
      await login(targetEmail, password, targetRole);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
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
      await register({ email, password, name, role, department });
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = (empEmail, empRole) => {
    // Directly login without populating the fields
    handleLogin(empEmail, empRole);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      centered
      radius="lg"
      withCloseButton={true}
      title={<BrandLogo size={32} subtitle="AUTONOMOUS PAYROLL" />}
      styles={{
        content: { padding: '8px 12px 16px' },
        header: { borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' },
      }}
    >
      <Stack gap="md" mt="sm">
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

        {/* 1-Click Fast Personas */}
        {!isRegister && (
          <div>
            <Text size="xs" fw={700} c="#64748B" mb={8} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant 1-Click Demo Personas
            </Text>
            <SimpleGrid cols={2} spacing="xs">
              <Paper
                p="xs"
                radius="md"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleFastLogin('meera.krishnan@paypilot.internal', 'ADMIN')}
                styles={{ root: { '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' } } }}
              >
                <Group gap="xs" wrap="nowrap" align="center">
                  <UserAvatar size={34} radius="xl" name="Meera Krishnan" id="meera" />
                  <div style={{ minWidth: 0 }}>
                    <Badge size="xs" color="blue" variant="light" mb={2}>ADMIN</Badge>
                    <Text size="11px" fw={700} c="#09090B" truncate>Meera Krishnan</Text>
                    <Text size="9px" c="#71717A" truncate>Chief Executive</Text>
                  </div>
                </Group>
              </Paper>

              <Paper
                p="xs"
                radius="md"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleFastLogin('neha.gupta@paypilot.internal', 'HR_PAYROLL_MANAGER')}
                styles={{ root: { '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' } } }}
              >
                <Group gap="xs" wrap="nowrap" align="center">
                  <UserAvatar size={34} radius="xl" name="Neha Gupta" id="neha" />
                  <div style={{ minWidth: 0 }}>
                    <Badge size="xs" color="indigo" variant="light" mb={2}>PAYROLL LEAD</Badge>
                    <Text size="11px" fw={700} c="#09090B" truncate>Neha Gupta</Text>
                    <Text size="9px" c="#71717A" truncate>Payroll Specialist</Text>
                  </div>
                </Group>
              </Paper>

              <Paper
                p="xs"
                radius="md"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleFastLogin('tanvi.kapoor@paypilot.internal', 'HR_MANAGER')}
                styles={{ root: { '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' } } }}
              >
                <Group gap="xs" wrap="nowrap" align="center">
                  <UserAvatar size={34} radius="xl" name="Tanvi Kapoor" id="tanvi" />
                  <div style={{ minWidth: 0 }}>
                    <Badge size="xs" color="teal" variant="light" mb={2}>HR MANAGER</Badge>
                    <Text size="11px" fw={700} c="#09090B" truncate>Tanvi Kapoor</Text>
                    <Text size="9px" c="#71717A" truncate>People Operations</Text>
                  </div>
                </Group>
              </Paper>

              <Paper
                p="xs"
                radius="md"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleFastLogin('kartik.kumar@paypilot.internal', 'EMPLOYEE')}
                styles={{ root: { '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF' } } }}
              >
                <Group gap="xs" wrap="nowrap" align="center">
                  <UserAvatar size={34} radius="xl" name="Kartik Kumar" id="kartik" />
                  <div style={{ minWidth: 0 }}>
                    <Badge size="xs" color="gray" variant="light" mb={2}>EMPLOYEE</Badge>
                    <Text size="11px" fw={700} c="#09090B" truncate>Kartik Kumar</Text>
                    <Text size="9px" c="#71717A" truncate>Staff Member</Text>
                  </div>
                </Group>
              </Paper>
            </SimpleGrid>
            <Divider label="OR SIGN IN WITH CREDENTIALS" labelPosition="center" color="#E2E8F0" my="sm" />
          </div>
        )}

        {/* Input Fields */}
        <Stack gap="sm">
          {isRegister && (
            <>
              <TextInput
                label="Full Name"
                placeholder="e.g. Meera Krishnan"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                leftSection={<IconUser size={14} color="#71717A" />}
              />

              <Select
                label="Department"
                data={['Executive', 'Engineering', 'Product', 'HR & People', 'Finance', 'Sales', 'Operations']}
                value={department}
                onChange={setDepartment}
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
              />
            </>
          )}

          <TextInput
            label="Work Email"
            placeholder="name@paypilot.internal"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            leftSection={<IconMail size={14} color="#71717A" />}
          />

          <PasswordInput
            label="Security Password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            leftSection={<IconLock size={14} color="#71717A" />}
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
      </Stack>
    </Modal>
  );
};
