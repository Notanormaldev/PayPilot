import React, { useState, useEffect } from 'react';
import {
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
  UnstyledButton,
  Alert,
} from '@mantine/core';
import {
  IconLock,
  IconMail,
  IconUser,
  IconArrowRight,
  IconKey,
  IconRefresh,
  IconArrowLeft,
  IconCheck,
  IconClockHour4,
  IconAlertCircle,
  IconHourglassEmpty,
  IconShieldCheck,
} from '@tabler/icons-react';
import { BrandLogo } from '../../../../components/BrandLogo';
import { useAuthUser } from '../../../auth/hooks/useAuthUser';
import { authService } from '../../../auth/services/authService';
import { UserAvatar } from '../../../../components/ui';

export const AuthPage = ({ initialMode = 'signin', onBack, onAuthSuccess }) => {
  const { login, register, verifyOtp, resendOtp } = useAuthUser();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'pending_approval'

  // Registration / Auth Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRoleState] = useState('EMPLOYEE');
  const [department, setDepartment] = useState('HR & People');

  // Dynamic admin existence status
  const [adminExists, setAdminExists] = useState(true);
  const [pendingUserData, setPendingUserData] = useState(null);

  // OTP Verification fields
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPendingError, setIsPendingError] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setStep('form');
    setError(null);
    setIsPendingError(false);
    setSuccessMsg(null);
    setOtpCode('');

    authService.checkAdminExists().then((exists) => {
      setAdminExists(exists);
      if (!exists) {
        setRoleState('ADMIN');
        setDepartment('Executive');
      } else {
        setRoleState('EMPLOYEE');
        setDepartment('HR & People');
      }
    });
  }, [initialMode]);

  const handleLogin = async (overrideEmail, overrideRole) => {
    setLoading(true);
    setError(null);
    setIsPendingError(false);
    const targetEmail = overrideEmail || email;
    const targetRole = overrideRole || role;

    try {
      await login(targetEmail, password || 'PayPilot@2026', targetRole);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      const errMsg = err.message || 'Authentication failed';
      setError(errMsg);
      if (
        errMsg.toLowerCase().includes('pending') ||
        errMsg.toLowerCase().includes('approval') ||
        errMsg.toLowerCase().includes('administrator approval')
      ) {
        setIsPendingError(true);
      }
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
    setIsPendingError(false);
    setSuccessMsg(null);

    try {
      const res = await register({ email, password, name, role, department });
      if (res && res.pendingVerification) {
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
      const res = await verifyOtp(email, otpCode.trim());
      if (res?.pendingApproval) {
        setStep('pending_approval');
        setPendingUserData(res.user || { name, email, role, department });
        setSuccessMsg(null);
        setError(null);
      } else {
        if (onAuthSuccess) onAuthSuccess();
      }
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
    handleLogin(empEmail, empRole);
  };

  const roleOptions = adminExists
    ? [
        { value: 'HR_MANAGER', label: 'HR Manager (HR Operations & Leaves)' },
        { value: 'HR_PAYROLL_USER', label: 'HR Payroll User (HR + Payrun Operations)' },
        { value: 'HR_PAYROLL_MANAGER', label: 'HR Payroll Manager (Full Payroll Configuration)' },
        { value: 'EMPLOYEE', label: 'Employee Self-Service (Instant Access)' },
      ]
    : [
        { value: 'ADMIN', label: 'Executive / Administrator (Initial Setup)' },
        { value: 'HR_MANAGER', label: 'HR Manager (HR Operations & Leaves)' },
        { value: 'HR_PAYROLL_USER', label: 'HR Payroll User (HR + Payrun Operations)' },
        { value: 'HR_PAYROLL_MANAGER', label: 'HR Payroll Manager (Full Payroll Configuration)' },
        { value: 'EMPLOYEE', label: 'Employee Self-Service (Instant Access)' },
      ];

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] relative flex flex-col justify-between items-center py-6 sm:py-10 px-4 sm:px-6 md:px-8 font-sans">
      {/* Background guide lines matching landing page */}
      <div className="w-full max-w-[1060px] h-full absolute left-1/2 transform -translate-x-1/2 top-0 pointer-events-none z-0">
        <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)]"></div>
        <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)]"></div>
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-[1060px] flex justify-center items-center relative z-10 pb-6 border-b border-[rgba(55,50,47,0.08)]">
        <div onClick={onBack} className="cursor-pointer">
          <BrandLogo size={30} subtitle="AUTONOMOUS PAYROLL" />
        </div>
      </div>

      {/* Main Auth Card Container */}
      <div className="w-full max-w-[560px] bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0px_8px_30px_rgba(55,50,47,0.08)] border border-[rgba(55,50,47,0.12)] relative z-10 my-8">
        <Stack gap="md">
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <>
              {/* Header Title */}
              <div className="text-center mb-1">
                <Text size="xl" fw={700} c="#37322F" className="font-serif text-2xl">
                  {isRegister ? 'Create Your Account' : 'Welcome to PayPilot'}
                </Text>
                <Text size="xs" c="#605A57" mt={4}>
                  {isRegister
                    ? 'Enter your work details to register your PayPilot organization user'
                    : 'Access your autonomous payroll dashboard or pick a demo persona below'}
                </Text>
              </div>

              {/* Mode Switcher */}
              <Group justify="center" mb={4}>
                <Box
                  style={{
                    backgroundColor: '#F1F5F9',
                    padding: '4px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    gap: '4px',
                  }}
                >
                  <Button
                    size="xs"
                    radius="md"
                    variant={!isRegister ? 'filled' : 'subtle'}
                    style={{
                      backgroundColor: !isRegister ? '#37322F' : 'transparent',
                      color: !isRegister ? '#FFFFFF' : '#64748B',
                      fontWeight: 600,
                      boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                      setIsPendingError(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="xs"
                    radius="md"
                    variant={isRegister ? 'filled' : 'subtle'}
                    style={{
                      backgroundColor: isRegister ? '#37322F' : 'transparent',
                      color: isRegister ? '#FFFFFF' : '#64748B',
                      fontWeight: 600,
                      boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                      setIsPendingError(false);
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </Group>

              {error && (
                <Alert
                  icon={isPendingError ? <IconClockHour4 size={16} /> : <IconAlertCircle size={16} />}
                  color={isPendingError ? 'yellow' : 'red'}
                  title={isPendingError ? 'Admin Approval Required' : 'Authentication Error'}
                  radius="md"
                  styles={{
                    root: {
                      backgroundColor: isPendingError ? '#FFFBEB' : '#FEF2F2',
                      borderColor: isPendingError ? '#FDE68A' : '#FEE2E2',
                    },
                    title: {
                      color: isPendingError ? '#92400E' : '#991B1B',
                      fontWeight: 700,
                    },
                    message: {
                      color: isPendingError ? '#B45309' : '#DC2626',
                      fontSize: '12px',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Quick 1-Click Persona Shortcuts */}
              {!isRegister && (
                <div>
                  <Text size="xs" fw={700} c="#37322F" mb={8} style={{ letterSpacing: '0.2px' }}>
                    ⚡ 1-Click Quick Demo Access:
                  </Text>
                  <SimpleGrid cols={2} spacing="xs">
                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                      onClick={() => handleFastLogin('meera.krishnan@paypilot.internal', 'ADMIN')}
                      styles={{ root: { '&:hover': { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' } } }}
                    >
                      <Group gap="xs" wrap="nowrap" align="center">
                        <UserAvatar size={36} radius="xl" name="Meera Krishnan" id="meera" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Badge size="xs" color="blue" variant="light" mb={2} style={{ fontSize: '9.5px', height: '18px' }}>
                            ADMIN
                          </Badge>
                          <Text size="11.5px" fw={700} c="#09090B" truncate>
                            Meera Krishnan
                          </Text>
                          <Text size="10px" c="#64748B" truncate>
                            Chief Officer
                          </Text>
                        </div>
                      </Group>
                    </Paper>

                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                      onClick={() => handleFastLogin('neha.gupta@paypilot.internal', 'HR_PAYROLL_MANAGER')}
                      styles={{ root: { '&:hover': { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' } } }}
                    >
                      <Group gap="xs" wrap="nowrap" align="center">
                        <UserAvatar size={36} radius="xl" name="Neha Gupta" id="neha" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Badge size="xs" color="indigo" variant="light" mb={2} style={{ fontSize: '9.5px', height: '18px' }}>
                            PAYROLL MGR
                          </Badge>
                          <Text size="11.5px" fw={700} c="#09090B" truncate>
                            Neha Gupta
                          </Text>
                          <Text size="10px" c="#64748B" truncate>
                            Full Payroll Config
                          </Text>
                        </div>
                      </Group>
                    </Paper>

                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                      onClick={() => handleFastLogin('rahul.sharma@paypilot.internal', 'HR_PAYROLL_USER')}
                      styles={{ root: { '&:hover': { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' } } }}
                    >
                      <Group gap="xs" wrap="nowrap" align="center">
                        <UserAvatar size={36} radius="xl" name="Rahul Sharma" id="rahul" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Badge size="xs" color="cyan" variant="light" mb={2} style={{ fontSize: '9.5px', height: '18px' }}>
                            PAYROLL USER
                          </Badge>
                          <Text size="11.5px" fw={700} c="#09090B" truncate>
                            Rahul Sharma
                          </Text>
                          <Text size="10px" c="#64748B" truncate>
                            HR + Payrun Ops
                          </Text>
                        </div>
                      </Group>
                    </Paper>

                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                      onClick={() => handleFastLogin('tanvi.kapoor@paypilot.internal', 'HR_MANAGER')}
                      styles={{ root: { '&:hover': { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' } } }}
                    >
                      <Group gap="xs" wrap="nowrap" align="center">
                        <UserAvatar size={36} radius="xl" name="Tanvi Kapoor" id="tanvi" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Badge size="xs" color="teal" variant="light" mb={2} style={{ fontSize: '9.5px', height: '18px' }}>
                            HR MANAGER
                          </Badge>
                          <Text size="11.5px" fw={700} c="#09090B" truncate>
                            Tanvi Kapoor
                          </Text>
                          <Text size="10px" c="#64748B" truncate>
                            People Ops
                          </Text>
                        </div>
                      </Group>
                    </Paper>

                    <Paper
                      p="xs"
                      radius="md"
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        gridColumn: 'span 2',
                      }}
                      onClick={() => handleFastLogin('kartik.kumar@paypilot.internal', 'EMPLOYEE')}
                      styles={{ root: { '&:hover': { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' } } }}
                    >
                      <Group gap="xs" wrap="nowrap" align="center">
                        <UserAvatar size={36} radius="xl" name="Kartik Kumar" id="kartik" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Badge size="xs" color="gray" variant="light" mb={2} style={{ fontSize: '9.5px', height: '18px' }}>
                            EMPLOYEE PORTAL
                          </Badge>
                          <Text size="11.5px" fw={700} c="#09090B" truncate>
                            Kartik Kumar
                          </Text>
                          <Text size="10px" c="#64748B" truncate>
                            Staff Product Specialist (Self-Service)
                          </Text>
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
                      placeholder="e.g. Kartik Kumar"
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      leftSection={<IconUser size={14} color="#71717A" />}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <Select
                      label="Department"
                      data={['HR & People', 'Finance', 'Executive', 'Engineering', 'Product', 'Sales', 'Operations']}
                      value={department}
                      onChange={setDepartment}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <Select
                      label="Role Permission"
                      description={
                        role === 'EMPLOYEE'
                          ? 'Instant access to employee portal upon email verification.'
                          : 'Requires Admin approval before login access is granted.'
                      }
                      data={roleOptions}
                      value={role}
                      onChange={setRoleState}
                      styles={{
                        input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
                        description: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
                      }}
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
                  style={{ backgroundColor: '#37322F' }}
                >
                  {isRegister ? 'Register & Send OTP' : 'Sign In to PayPilot'}
                </Button>
              </Stack>
            </>
          )}

          {/* STEP 2: OTP VERIFICATION SCREEN */}
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
                style={{ backgroundColor: '#37322F' }}
              >
                Verify OTP & Access System
              </Button>

              <Group justify="space-between" align="center" mt="xs">
                <UnstyledButton onClick={() => setStep('form')}>
                  <Group gap={4}>
                    <IconArrowLeft size={14} color="#64748B" />
                    <Text size="xs" c="#64748B" fw={500}>
                      Back to Form
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

          {/* STEP 3: PENDING ADMIN APPROVAL SCREEN */}
          {step === 'pending_approval' && (
            <Stack gap="md">
              <Box style={{ textAlign: 'center' }}>
                <Box
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <IconHourglassEmpty size={28} />
                </Box>
                <Badge color="yellow" size="md" variant="filled" mb="xs">
                  AWAITING ADMIN APPROVAL
                </Badge>
                <Text size="lg" fw={700} c="#09090B">
                  Registration Submitted
                </Text>
                <Text size="xs" c="#64748B" mt={4}>
                  Your work email has been verified. Because your account requests{' '}
                  <span style={{ fontWeight: 600, color: '#09090B' }}>
                    {pendingUserData?.role?.replace('_', ' ') || role}
                  </span>{' '}
                  privileges, access to PayPilot requires Administrator approval.
                </Text>
              </Box>

              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Account Name:</Text>
                    <Text size="xs" fw={600} c="#09090B">{pendingUserData?.name || name || 'Applicant'}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Work Email:</Text>
                    <Text size="xs" fw={600} c="#2563EB">{pendingUserData?.email || email}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Requested Role:</Text>
                    <Badge size="xs" color="indigo" variant="light">
                      {pendingUserData?.role || role}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Department:</Text>
                    <Text size="xs" fw={600} c="#09090B">{pendingUserData?.department || department}</Text>
                  </Group>
                  <Divider my={4} />
                  <Group justify="space-between">
                    <Text size="xs" c="#64748B">Status:</Text>
                    <Badge size="xs" color="yellow" variant="filled">
                      Pending Admin Review
                    </Badge>
                  </Group>
                </Stack>
              </Paper>

              <Alert
                icon={<IconShieldCheck size={16} />}
                color="blue"
                radius="md"
                title="Next Step"
                styles={{
                  root: { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
                  title: { color: '#1E40AF', fontWeight: 600, fontSize: '12px' },
                  message: { color: '#1E3A8A', fontSize: '11px' },
                }}
              >
                Your organization's Administrator can approve this request from the <strong>Approvals</strong> tab or <strong>User Management</strong> settings. Once approved, you can log in directly.
              </Alert>

              <Button
                fullWidth
                color="dark"
                size="md"
                onClick={() => {
                  setStep('form');
                  setIsRegister(false);
                  setError(null);
                  setIsPendingError(false);
                }}
                leftSection={<IconArrowLeft size={16} />}
                style={{ backgroundColor: '#37322F' }}
              >
                Back to Sign In
              </Button>
            </Stack>
          )}
        </Stack>
      </div>

      {/* Dedicated Auth Footer */}
      <div className="w-full max-w-[1060px] text-center text-xs text-[#605A57] relative z-10 pt-4 border-t border-[rgba(55,50,47,0.08)]">
        © 2026 PayPilot Global Inc. Secure Autonomous HRMS & Statutory Payroll System.
      </div>
    </div>
  );
};

export default AuthPage;
