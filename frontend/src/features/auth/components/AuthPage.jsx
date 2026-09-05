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
  UnstyledButton,
} from '@mantine/core';
import {
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUser,
  IconArrowRight,
  IconKey,
  IconRefresh,
  IconArrowLeft,
  IconCheck,
} from '@tabler/icons-react';
import { BrandLogo } from '../../../components/BrandLogo';
import { useAuthUser } from '../hooks/useAuthUser';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register, verifyOtp, resendOtp } = useAuthUser();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  
  // Registration / Auth Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRoleState] = useState('ADMIN');
  const [department, setDepartment] = useState('Executive');
  
  // OTP Verification fields
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLogin = async (overrideEmail, overrideRole) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const targetEmail = overrideEmail || email;
    const targetRole = overrideRole || role;

    try {
      await login(targetEmail, password || 'PayPilot@2026', targetRole);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await register({ email, password, name, role, department });
      if (res.pendingVerification) {
        setStep('otp');
        setOtpCode('');
        setSuccessMsg(res.message || `Verification OTP code dispatched to ${email}. Please check your email inbox.`);
      } else {
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please check your email inbox and enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await verifyOtp(email, otpCode.trim());
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await resendOtp(email);
      setSuccessMsg(res.message || `A new 6-digit verification code has been emailed to ${email}.`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
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

          {/* STEP 1: LOGIN / REGISTRATION FORM */}
          {step === 'form' && (
            <>
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
                  placeholder="name@company.com"
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
                  {isRegister ? 'Register & Send OTP' : 'Sign In to PayPilot'}
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
            </>
          )}

          {/* STEP 2: STRICT OTP VERIFICATION SCREEN */}
          {step === 'otp' && (
            <Stack gap="md">
              <Box style={{ textAlign: 'center' }}>
                <Badge color="blue" size="md" variant="light" mb="xs">
                  EMAIL VERIFICATION REQUIRED
                </Badge>
                <Text size="lg" fw={700} c="#09090B">
                  Check Your Email Inbox
                </Text>
                <Text size="xs" c="#64748B" mt={4}>
                  A 6-digit security OTP code was sent via Brevo email to:
                  <br />
                  <span style={{ fontWeight: 700, color: '#2563EB' }}>{email}</span>
                </Text>
              </Box>

              {error && (
                <Paper p="xs" radius="sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                  <Text size="xs" c="#DC2626" fw={600}>
                    {error}
                  </Text>
                </Paper>
              )}

              {successMsg && (
                <Paper p="xs" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <Text size="xs" c="#166534" fw={600}>
                    {successMsg}
                  </Text>
                </Paper>
              )}

              <TextInput
                label="Enter 6-Digit OTP Code from Email"
                placeholder="e.g. 839102"
                value={otpCode}
                onChange={(e) => setOtpCode(e.currentTarget.value.trim())}
                maxLength={6}
                leftSection={<IconKey size={16} color="#71717A" />}
                styles={{
                  input: {
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '4px',
                    textAlign: 'center',
                  },
                }}
              />

              <Button
                fullWidth
                color="dark"
                size="md"
                loading={loading}
                onClick={handleVerifyOtp}
                rightSection={<IconCheck size={16} />}
              >
                Verify OTP & Access System
              </Button>

              <Group justify="space-between" align="center" mt="xs">
                <UnstyledButton onClick={() => setStep('form')}>
                  <Group gap={4}>
                    <IconArrowLeft size={14} color="#64748B" />
                    <Text size="xs" c="#64748B" fw={500}>
                      Back to Sign In
                    </Text>
                  </Group>
                </UnstyledButton>

                <Button
                  size="xs"
                  variant="subtle"
                  color="blue"
                  leftSection={<IconRefresh size={14} />}
                  onClick={handleResendOtp}
                  loading={loading}
                >
                  Resend Email Code
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </Paper>
    </div>
  );
};
