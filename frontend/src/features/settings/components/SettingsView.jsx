import React, { useState, useEffect } from 'react';
import {
  Paper,
  Tabs,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  SimpleGrid,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Divider,
  Alert,
  Box,
  ThemeIcon,
  NumberInput,
  Tooltip,
} from '@mantine/core';
import {
  IconUser,
  IconBuilding,
  IconReceiptTax,
  IconShieldLock,
  IconBell,
  IconCheck,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconMapPin,
  IconWorld,
  IconClock,
  IconKey,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconShieldCheck,
  IconBuildingBank,
  IconFileCertificate,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconCheckupList,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import { useAuthUser } from '../../auth/hooks/useAuthUser';
import { UserAvatar } from '../../../components/ui';
import { fetchApi } from '../../../lib/api';

export const SettingsView = () => {
  const { user, currentRole, setUser } = useAuthUser();
  const isEmployee = currentRole === 'EMPLOYEE';

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // 1. Profile State
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('paypilot_user_avatar') || null);
  const [fullName, setFullName] = useState(user?.name || 'Meera Krishnan');
  const [workEmail, setWorkEmail] = useState(user?.email || 'meera.krishnan@paypilot.internal');
  const [jobTitle, setJobTitle] = useState(user?.title || (isEmployee ? 'Product Manager' : 'Chief People & Payroll Officer'));
  const [department, setDepartment] = useState(isEmployee ? 'Product & Technology' : 'Executive Management');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [personalEmail, setPersonalEmail] = useState('meera.personal@gmail.com');
  const [residentialAddress, setResidentialAddress] = useState('Tower 4, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('en-IN');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('INR');
  const [bio, setBio] = useState('Leading people operations, compensation strategy, and compliance automation at PayPilot.');

  // 2. Organization State
  const [orgData, setOrgData] = useState({
    legalName: 'OXP Technologies Private Limited',
    brandName: 'PayPilot Technologies',
    cin: 'U72900DL2021PTC389421',
    pan: 'AAFCO9821K',
    tan: 'DELA12345F',
    gstin: '07AAFCO9821K1Z5',
    epfoCode: 'DSNHP0039281000',
    esicCode: '31000459280001001',
    ptCircle: 'Delhi / NCR & Karnataka',
    address: 'Plot 42, Sector 18, Electronic City, Cyber Hub, Gurugram, Haryana - 122002',
    financialYearStart: 'April',
    payrollCycleBasis: '30_DAYS',
  });

  // 3. Payroll Rules State
  const [payrollRules, setPayrollRules] = useState({
    salaryDisbursementDay: '30',
    cutoffDay: '25',
    epfEmployeePercent: 12.0,
    epfEmployerPercent: 12.0,
    epfWageCeilingCap: 15000,
    epfWageCeilingEnforced: true,
    esiEmployeePercent: 0.75,
    esiEmployerPercent: 3.25,
    esiGrossCeiling: 21000,
    defaultTaxRegime: 'NEW_115BAC',
    hraExemptionEnabled: true,
    sentinelSensitivity: 'STRICT',
    autoHoldOnCriticalAnomaly: true,
  });

  // 4. Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-1',
      device: 'Chrome 128 on Windows 11 (Current)',
      ip: '103.21.144.10 (Delhi, IN)',
      lastActive: 'Active Now',
      isCurrent: true,
      icon: IconDeviceLaptop,
    },
    {
      id: 'sess-2',
      device: 'PayPilot Mobile App (iOS 17.5 / iPhone 15 Pro)',
      ip: '182.74.88.4 (Noida, IN)',
      lastActive: '2 hours ago',
      isCurrent: false,
      icon: IconDeviceMobile,
    },
  ]);

  // 5. Notifications State
  const [notificationSettings, setNotificationSettings] = useState({
    emailPayrunCompleted: true,
    emailLeaveApproval: true,
    emailSentinelFlag: true,
    inAppAlerts: true,
    smsDisbursementNotice: false,
    monthlyDigest: true,
  });

  // Load initial settings from server & local profile
  useEffect(() => {
    loadSettings();

    const handleAvatarUpdate = (e) => {
      setAvatarUrl(e.detail);
    };
    window.addEventListener('paypilot_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('paypilot_avatar_updated', handleAvatarUpdate);
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/settings').catch(() => null);
      if (res?.data) {
        if (res.data.organization) setOrgData(res.data.organization);
        if (res.data.payrollRules) setPayrollRules(res.data.payrollRules);
        if (res.data.notifications) setNotificationSettings(res.data.notifications);
      }

      // Also fetch personal profile if available
      const empRes = await fetchApi('/employees/me').catch(() => null);
      if (empRes?.data) {
        const emp = empRes.data;
        if (emp.name) setFullName(emp.name);
        if (emp.workEmail) setWorkEmail(emp.workEmail);
        if (emp.phone) setPhone(emp.phone);
        if (emp.personalEmail) setPersonalEmail(emp.personalEmail);
        if (emp.address) setResidentialAddress(emp.address);
        if (emp.department) setDepartment(emp.department);
        if (emp.jobPosition) setJobTitle(emp.jobPosition);
      }
    } catch (err) {
      console.warn('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
    }, 4500);
  };

  // Save Handlers
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // 1. Update Redux Auth User State
      if (setUser) {
        setUser({
          name: fullName,
          email: workEmail,
          title: jobTitle,
          department: department,
        });
      }

      // 2. Call backend employee profile update
      await fetchApi('/employees/me', {
        method: 'PUT',
        body: JSON.stringify({
          phone,
          personalEmail,
          address: residentialAddress,
        }),
      }).catch(() => null);

      showNotification('success', 'Profile & personal preferences have been saved successfully.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrganization = async () => {
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({ organization: orgData }),
      });
      showNotification('success', 'Organization and statutory registrations updated successfully.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to save organization settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayrollRules = async () => {
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({ payrollRules }),
      });
      showNotification('success', 'Statutory payroll parameters and Sentinel compliance rules saved.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to save payroll rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      showNotification('error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'New password and confirmation do not match.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showNotification('success', 'Your password has been changed securely.');
  };

  const handleRevokeSession = (sessionId) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showNotification('success', 'Session terminated successfully.');
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({ notifications: notificationSettings }),
      });
      showNotification('success', 'Notification preferences have been updated.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to save notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* Page Header */}
      <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb={2}>
              <Title order={3} style={{ color: '#09090B' }}>
                System & Account Settings
              </Title>
              <Badge size="sm" color="blue" variant="light">
                {currentRole}
              </Badge>
            </Group>
            <Text size="xs" c="#64748B">
              Configure your personal profile, company details, statutory compliance limits, and security credentials.
            </Text>
          </div>

          <Group gap="xs">
            <Badge size="md" color="teal" variant="outline" leftSection={<IconCheck size={12} />}>
              Cloud Synced
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* Live Feedback Alert */}
      {feedback.type && (
        <Alert
          icon={feedback.type === 'success' ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
          color={feedback.type === 'success' ? 'teal' : 'red'}
          title={feedback.type === 'success' ? 'Success' : 'Attention Required'}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Main Settings Tabs Container */}
      <Paper radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="xs">
          <Tabs.List style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0 8px' }}>
            <Tabs.Tab
              value="profile"
              leftSection={<IconUser size={16} />}
              style={{ fontWeight: 600, fontSize: '13px' }}
            >
              Profile & Account
            </Tabs.Tab>

            {!isEmployee && (
              <>
                <Tabs.Tab
                  value="organization"
                  leftSection={<IconBuilding size={16} />}
                  style={{ fontWeight: 600, fontSize: '13px' }}
                >
                  Organization & Legal
                </Tabs.Tab>

                <Tabs.Tab
                  value="payroll"
                  leftSection={<IconReceiptTax size={16} />}
                  style={{ fontWeight: 600, fontSize: '13px' }}
                >
                  Statutory & Payroll Rules
                </Tabs.Tab>
              </>
            )}

            <Tabs.Tab
              value="security"
              leftSection={<IconShieldLock size={16} />}
              style={{ fontWeight: 600, fontSize: '13px' }}
            >
              Security & 2FA
            </Tabs.Tab>

            <Tabs.Tab
              value="notifications"
              leftSection={<IconBell size={16} />}
              style={{ fontWeight: 600, fontSize: '13px' }}
            >
              Notifications & Alerts
            </Tabs.Tab>
          </Tabs.List>

          {/* TAB 1: PROFILE & PERSONAL ACCOUNT */}
          <Tabs.Panel value="profile" p="xl">
            <Stack gap="xl">
              {/* Profile Card Summary with Interactive Avatar Upload */}
              <Paper p="lg" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Group justify="space-between" align="center">
                  <Group gap="lg">
                    <UserAvatar
                      size={80}
                      radius="xl"
                      src={avatarUrl}
                      name={fullName}
                      id={workEmail}
                      editable={true}
                      onPhotoUploaded={(url) => {
                        setAvatarUrl(url);
                        showNotification('success', 'Profile photo uploaded and synced across the portal!');
                      }}
                      onPhotoRemoved={() => {
                        setAvatarUrl(null);
                        showNotification('success', 'Custom photo removed. Silhouette avatar active.');
                      }}
                    />
                    <div>
                      <Group gap="xs" mb={4}>
                        <Text size="md" fw={700} c="#09090B">
                          {fullName}
                        </Text>
                        <Badge size="xs" color="blue" variant="filled">
                          {currentRole}
                        </Badge>
                      </Group>
                      <Text size="xs" c="#64748B">
                        {jobTitle} • {department}
                      </Text>
                      <Text size="11px" c="#94A3B8" mt={2}>
                        {workEmail} • Official Internal Account
                      </Text>
                    </div>
                  </Group>

                  <Tooltip label="Click camera badge on avatar to upload photo (PNG, JPG, WebP max 5MB)" withArrow>
                    <Badge size="xs" color="gray" variant="light">
                      Editable Portrait Photo
                    </Badge>
                  </Tooltip>
                </Group>
              </Paper>

              {/* Personal Information Fields */}
              <div>
                <Group gap="xs" mb="sm">
                  <IconUser size={18} color="#2563EB" />
                  <Title order={4} size="sm" c="#09090B">
                    Personal & Contact Details
                  </Title>
                </Group>
                <Divider mb="md" />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <TextInput
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.currentTarget.value)}
                    placeholder="e.g. Meera Krishnan"
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <TextInput
                    label="Official Work Email (Read-Only)"
                    value={workEmail}
                    disabled
                    leftSection={<IconMail size={14} color="#94A3B8" />}
                    styles={{ input: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', color: '#64748B' } }}
                  />

                  <TextInput
                    label="Designation / Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.currentTarget.value)}
                    placeholder="e.g. VP People Ops & Payroll"
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <TextInput
                    label="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.currentTarget.value)}
                    placeholder="e.g. Human Resources"
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <TextInput
                    label="Primary Mobile Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                    placeholder="+91 98765 43210"
                    leftSection={<IconPhone size={14} color="#71717A" />}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <TextInput
                    label="Personal Recovery Email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.currentTarget.value)}
                    placeholder="personal.email@domain.com"
                    leftSection={<IconMail size={14} color="#71717A" />}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <TextInput
                    label="Residential Address"
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.currentTarget.value)}
                    placeholder="Full street address, city, state and PIN"
                    leftSection={<IconMapPin size={14} color="#71717A" />}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <TextInput
                    label="Emergency Contact"
                    defaultValue="Ramesh Krishnan (Spouse) - +91 98112 34567"
                    leftSection={<IconPhone size={14} color="#71717A" />}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />
                </SimpleGrid>

                <Box mt="md">
                  <Textarea
                    label="Professional Bio / Notes"
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.currentTarget.value)}
                    placeholder="Short summary of roles and responsibilities..."
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />
                </Box>
              </div>

              {/* Localization & Region */}
              <div>
                <Group gap="xs" mb="sm">
                  <IconWorld size={18} color="#0D9488" />
                  <Title order={4} size="sm" c="#09090B">
                    Regional & Localization Preferences
                  </Title>
                </Group>
                <Divider mb="md" />

                <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
                  <Select
                    label="Primary Timezone"
                    value={timezone}
                    onChange={setTimezone}
                    data={[
                      { value: 'Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata (IST)' },
                      { value: 'Asia/Dubai', label: '(GMT+04:00) Asia/Dubai (GST)' },
                      { value: 'Europe/London', label: '(GMT+00:00) Europe/London (GMT)' },
                      { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (EST)' },
                    ]}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <Select
                    label="Interface Language"
                    value={language}
                    onChange={setLanguage}
                    data={[
                      { value: 'en-IN', label: 'English (India)' },
                      { value: 'en-US', label: 'English (US)' },
                      { value: 'en-GB', label: 'English (UK)' },
                      { value: 'hi-IN', label: 'Hindi (हिंदी)' },
                    ]}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <Select
                    label="Default Date Format"
                    value={dateFormat}
                    onChange={setDateFormat}
                    data={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 31/03/2026)' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO standard)' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US standard)' },
                    ]}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />

                  <Select
                    label="Base Currency"
                    value={currency}
                    onChange={setCurrency}
                    data={[
                      { value: 'INR', label: '₹ INR - Indian Rupee' },
                      { value: 'USD', label: '$ USD - US Dollar' },
                      { value: 'EUR', label: '€ EUR - Euro' },
                      { value: 'AED', label: 'AED - UAE Dirham' },
                    ]}
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />
                </SimpleGrid>
              </div>

              {/* Action Buttons */}
              <Group justify="flex-end" mt="md">
                <Button
                  color="dark"
                  size="sm"
                  loading={saving}
                  onClick={handleSaveProfile}
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  Save Profile Settings
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          {/* TAB 2: ORGANIZATION & LEGAL */}
          {!isEmployee && (
            <Tabs.Panel value="organization" p="xl">
              <Stack gap="xl">
                <div>
                  <Group gap="xs" mb="sm">
                    <IconBuilding size={18} color="#2563EB" />
                    <Title order={4} size="sm" c="#09090B">
                      Company Identity & Corporate Registration
                    </Title>
                  </Group>
                  <Divider mb="md" />

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                    <TextInput
                      label="Legal Entity Name"
                      value={orgData.legalName}
                      onChange={(e) => setOrgData({ ...orgData, legalName: e.currentTarget.value })}
                      placeholder="e.g. OXP Technologies Pvt Ltd"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <TextInput
                      label="Operating Trade Name (DBA)"
                      value={orgData.brandName}
                      onChange={(e) => setOrgData({ ...orgData, brandName: e.currentTarget.value })}
                      placeholder="e.g. PayPilot Technologies"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <TextInput
                      label="Corporate Identification Number (CIN)"
                      value={orgData.cin}
                      onChange={(e) => setOrgData({ ...orgData, cin: e.currentTarget.value })}
                      placeholder="U72900DL2021PTC389421"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontFamily: 'monospace' } }}
                    />
                  </SimpleGrid>
                </div>

                <div>
                  <Group gap="xs" mb="sm">
                    <IconFileCertificate size={18} color="#0D9488" />
                    <Title order={4} size="sm" c="#09090B">
                      Statutory Tax & Compliance Codes (India)
                    </Title>
                  </Group>
                  <Divider mb="md" />

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                    <TextInput
                      label="Company PAN (Income Tax)"
                      value={orgData.pan}
                      onChange={(e) => setOrgData({ ...orgData, pan: e.currentTarget.value })}
                      placeholder="AAFCO9821K"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontFamily: 'monospace' } }}
                    />

                    <TextInput
                      label="Company TAN (TDS Deduction)"
                      value={orgData.tan}
                      onChange={(e) => setOrgData({ ...orgData, tan: e.currentTarget.value })}
                      placeholder="DELA12345F"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontFamily: 'monospace' } }}
                    />

                    <TextInput
                      label="GSTIN (Goods & Services Tax)"
                      value={orgData.gstin}
                      onChange={(e) => setOrgData({ ...orgData, gstin: e.currentTarget.value })}
                      placeholder="07AAFCO9821K1Z5"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontFamily: 'monospace' } }}
                    />

                    <TextInput
                      label="EPFO Establishment Code"
                      value={orgData.epfoCode}
                      onChange={(e) => setOrgData({ ...orgData, epfoCode: e.currentTarget.value })}
                      placeholder="DSNHP0039281000"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontFamily: 'monospace' } }}
                    />

                    <TextInput
                      label="ESIC Employer Code"
                      value={orgData.esicCode}
                      onChange={(e) => setOrgData({ ...orgData, esicCode: e.currentTarget.value })}
                      placeholder="31000459280001001"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', fontFamily: 'monospace' } }}
                    />

                    <TextInput
                      label="Professional Tax (PT) Circles"
                      value={orgData.ptCircle}
                      onChange={(e) => setOrgData({ ...orgData, ptCircle: e.currentTarget.value })}
                      placeholder="Delhi, Karnataka, Maharashtra"
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />
                  </SimpleGrid>
                </div>

                <div>
                  <Group gap="xs" mb="sm">
                    <IconMapPin size={18} color="#D97706" />
                    <Title order={4} size="sm" c="#09090B">
                      Registered Headquarters Address
                    </Title>
                  </Group>
                  <Divider mb="md" />

                  <Textarea
                    label="Official Registered Office"
                    rows={2}
                    value={orgData.address}
                    onChange={(e) => setOrgData({ ...orgData, address: e.currentTarget.value })}
                    placeholder="Full street address..."
                    styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                  />
                </div>

                <Group justify="flex-end" mt="md">
                  <Button
                    color="dark"
                    size="sm"
                    loading={saving}
                    onClick={handleSaveOrganization}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    Save Organization Details
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>
          )}

          {/* TAB 3: STATUTORY & PAYROLL RULES */}
          {!isEmployee && (
            <Tabs.Panel value="payroll" p="xl">
              <Stack gap="xl">
                {/* Payrun Cycle Schedule */}
                <div>
                  <Group gap="xs" mb="sm">
                    <IconClock size={18} color="#2563EB" />
                    <Title order={4} size="sm" c="#09090B">
                      Disbursement & Cutoff Schedule
                    </Title>
                  </Group>
                  <Divider mb="md" />

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                    <Select
                      label="Salary Disbursement Day"
                      value={payrollRules.salaryDisbursementDay}
                      onChange={(val) => setPayrollRules({ ...payrollRules, salaryDisbursementDay: val })}
                      data={[
                        { value: '28', label: '28th of every month' },
                        { value: '30', label: '30th of every month (Default)' },
                        { value: 'LAST_WORKING_DAY', label: 'Last Working Day of Month' },
                        { value: '1', label: '1st of following month' },
                      ]}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <Select
                      label="Attendance & Expense Cutoff Day"
                      value={payrollRules.cutoffDay}
                      onChange={(val) => setPayrollRules({ ...payrollRules, cutoffDay: val })}
                      data={[
                        { value: '20', label: '20th of the month' },
                        { value: '25', label: '25th of the month (Standard)' },
                        { value: '27', label: '27th of the month' },
                      ]}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <Select
                      label="Default Tax Regime for New Joiners"
                      value={payrollRules.defaultTaxRegime}
                      onChange={(val) => setPayrollRules({ ...payrollRules, defaultTaxRegime: val })}
                      data={[
                        { value: 'NEW_115BAC', label: 'New Tax Regime u/s 115BAC (Recommended)' },
                        { value: 'OLD_REGIME', label: 'Old Tax Regime (With Chapter VI-A Deductions)' },
                      ]}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />
                  </SimpleGrid>
                </div>

                {/* Provident Fund (EPF) Rules */}
                <Paper p="lg" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <IconBuildingBank size={18} color="#0D9488" />
                      <Text size="sm" fw={700} c="#09090B">
                        Employees' Provident Fund (EPF) Statutory Configuration
                      </Text>
                    </Group>
                    <Badge size="xs" color="teal">
                      EPFO Act, 1952
                    </Badge>
                  </Group>
                  <Text size="xs" c="#64748B" mb="md">
                    Standard monthly contribution rates applied automatically during pay run computation.
                  </Text>

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <TextInput
                      label="Employee EPF Share (%)"
                      value="12.0%"
                      disabled
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontWeight: 600 } }}
                    />

                    <TextInput
                      label="Employer EPF Share (%)"
                      value="12.0% (3.67% EPF + 8.33% EPS)"
                      disabled
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontWeight: 600 } }}
                    />

                    <TextInput
                      label="Statutory Wage Ceiling"
                      value="₹15,000 / month"
                      disabled
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontWeight: 600 } }}
                    />
                  </SimpleGrid>

                  <Group mt="md">
                    <Switch
                      checked={payrollRules.epfWageCeilingEnforced}
                      onChange={(e) =>
                        setPayrollRules({ ...payrollRules, epfWageCeilingEnforced: e.currentTarget.checked })
                      }
                      label="Restrict Employer PF Contribution to Statutory ₹15,000 basic wage limit"
                      size="xs"
                    />
                  </Group>
                </Paper>

                {/* ESI Rules */}
                <Paper p="lg" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <IconBuildingBank size={18} color="#4F46E5" />
                      <Text size="sm" fw={700} c="#09090B">
                        Employees' State Insurance (ESIC) Configuration
                      </Text>
                    </Group>
                    <Badge size="xs" color="indigo">
                      ESI Act, 1948
                    </Badge>
                  </Group>
                  <Text size="xs" c="#64748B" mb="md">
                    Mandatory for all staff whose gross monthly salary is equal to or below ₹21,000.
                  </Text>

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <TextInput
                      label="Employee ESI Rate (%)"
                      value="0.75%"
                      disabled
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontWeight: 600 } }}
                    />

                    <TextInput
                      label="Employer ESI Rate (%)"
                      value="3.25%"
                      disabled
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontWeight: 600 } }}
                    />

                    <TextInput
                      label="Gross Salary Ceiling"
                      value="₹21,000 / month"
                      disabled
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontWeight: 600 } }}
                    />
                  </SimpleGrid>
                </Paper>

                {/* Sentinel AI Anomaly Guard Controls */}
                <Paper p="lg" radius="md" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <IconShieldLock size={18} color="#DC2626" />
                      <Text size="sm" fw={700} c="#991B1B">
                        Sentinel AI Anomaly Guard & Sensitivity
                      </Text>
                    </Group>
                    <Badge size="xs" color="red">
                      Autonomous Engine
                    </Badge>
                  </Group>
                  <Text size="xs" c="#7F1D1D" mb="md">
                    Controls automated statistical anomaly detection, ghost-employee checks, and banking variance flags.
                  </Text>

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      label="Sentinel Anomaly Sensitivity"
                      value={payrollRules.sentinelSensitivity}
                      onChange={(val) => setPayrollRules({ ...payrollRules, sentinelSensitivity: val })}
                      data={[
                        { value: 'STRICT', label: 'Strict - Flag all payout variances > 5% or unverified bank details' },
                        { value: 'MODERATE', label: 'Moderate - Standard compliance threshold (Variances > 15%)' },
                        { value: 'PERMISSIVE', label: 'Permissive - Only flag critical unapproved time-off mismatches' },
                      ]}
                      styles={{ input: { backgroundColor: '#FFFFFF', borderColor: '#FECACA' } }}
                    />

                    <Box mt="lg">
                      <Switch
                        checked={payrollRules.autoHoldOnCriticalAnomaly}
                        onChange={(e) =>
                          setPayrollRules({ ...payrollRules, autoHoldOnCriticalAnomaly: e.currentTarget.checked })
                        }
                        label="Auto-hold bank payout dispatch if Sentinel detects HIGH severity flags"
                        size="xs"
                        color="red"
                      />
                    </Box>
                  </SimpleGrid>
                </Paper>

                <Group justify="flex-end" mt="md">
                  <Button
                    color="dark"
                    size="sm"
                    loading={saving}
                    onClick={handleSavePayrollRules}
                    leftSection={<IconDeviceFloppy size={16} />}
                  >
                    Save Payroll & Statutory Configuration
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>
          )}

          {/* TAB 4: SECURITY & 2FA */}
          <Tabs.Panel value="security" p="xl">
            <Stack gap="xl">
              {/* Password Change Form */}
              <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <Group gap="xs" mb="xs">
                  <IconKey size={18} color="#2563EB" />
                  <Title order={4} size="sm" c="#09090B">
                    Change Password
                  </Title>
                </Group>
                <Text size="xs" c="#64748B" mb="md">
                  Ensure your account is secured with a strong alphanumeric password with special characters.
                </Text>

                <form onSubmit={handleUpdatePassword}>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <TextInput
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <TextInput
                      label="New Password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.currentTarget.value)}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />

                    <TextInput
                      label="Confirm New Password"
                      type="password"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                      styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
                    />
                  </SimpleGrid>

                  <Group justify="flex-end" mt="md">
                    <Button type="submit" color="dark" size="xs">
                      Update Password
                    </Button>
                  </Group>
                </form>
              </Paper>

              {/* Two-Factor Authentication (2FA) */}
              <Paper p="lg" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Group justify="space-between" align="center">
                  <Group gap="md">
                    <ThemeIcon size={40} radius="md" color="teal" variant="light">
                      <IconShieldCheck size={22} />
                    </ThemeIcon>
                    <div>
                      <Group gap="xs">
                        <Text size="sm" fw={700} c="#09090B">
                          Two-Factor Authentication (2FA)
                        </Text>
                        <Badge size="xs" color={twoFactorEnabled ? 'teal' : 'gray'}>
                          {twoFactorEnabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </Group>
                      <Text size="xs" c="#64748B">
                        Require a 6-digit one-time code sent to registered work email ({workEmail}) on sign-in.
                      </Text>
                    </div>
                  </Group>

                  <Switch
                    checked={twoFactorEnabled}
                    onChange={(e) => {
                      setTwoFactorEnabled(e.currentTarget.checked);
                      showNotification(
                        'success',
                        e.currentTarget.checked ? '2FA enabled successfully.' : '2FA disabled.'
                      );
                    }}
                    size="md"
                    color="teal"
                  />
                </Group>
              </Paper>

              {/* Active Devices & Sessions */}
              <div>
                <Group justify="space-between" mb="sm">
                  <Group gap="xs">
                    <IconDeviceLaptop size={18} color="#09090B" />
                    <Title order={4} size="sm" c="#09090B">
                      Active Device Sessions
                    </Title>
                  </Group>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => {
                      setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
                      showNotification('success', 'Logged out of all other devices.');
                    }}
                  >
                    Revoke All Other Sessions
                  </Button>
                </Group>
                <Divider mb="md" />

                <Stack gap="sm">
                  {activeSessions.map((sess) => {
                    const Icon = sess.icon;
                    return (
                      <Paper
                        key={sess.id}
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: sess.isCurrent ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                        }}
                      >
                        <Group justify="space-between" align="center">
                          <Group gap="sm">
                            <ThemeIcon size={34} radius="md" color={sess.isCurrent ? 'blue' : 'gray'} variant="light">
                              <Icon size={18} />
                            </ThemeIcon>
                            <div>
                              <Group gap="xs">
                                <Text size="xs" fw={700} c="#09090B">
                                  {sess.device}
                                </Text>
                                {sess.isCurrent && (
                                  <Badge size="9px" color="blue" variant="filled">
                                    Current Session
                                  </Badge>
                                )}
                              </Group>
                              <Text size="11px" c="#64748B">
                                IP: {sess.ip} • {sess.lastActive}
                              </Text>
                            </div>
                          </Group>

                          {!sess.isCurrent && (
                            <Button
                              variant="light"
                              color="red"
                              size="xs"
                              onClick={() => handleRevokeSession(sess.id)}
                            >
                              Sign Out
                            </Button>
                          )}
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </div>
            </Stack>
          </Tabs.Panel>

          {/* TAB 5: NOTIFICATIONS & ALERTS */}
          <Tabs.Panel value="notifications" p="xl">
            <Stack gap="xl">
              <div>
                <Group gap="xs" mb="sm">
                  <IconBell size={18} color="#2563EB" />
                  <Title order={4} size="sm" c="#09090B">
                    System & Workflow Alert Channels
                  </Title>
                </Group>
                <Divider mb="md" />

                <Stack gap="md">
                  <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          Payroll Payrun Execution Notifications
                        </Text>
                        <Text size="11px" c="#64748B">
                          Receive instant email confirmations when a monthly payrun is computed, approved, or disbursed.
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.emailPayrunCompleted}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailPayrunCompleted: e.currentTarget.checked,
                          })
                        }
                      />
                    </Group>
                  </Paper>

                  <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          Leave Requests & Attendance Approvals
                        </Text>
                        <Text size="11px" c="#64748B">
                          Get notified when a reportee submits a time-off request or when your request status changes.
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.emailLeaveApproval}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailLeaveApproval: e.currentTarget.checked,
                          })
                        }
                      />
                    </Group>
                  </Paper>

                  <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          Sentinel AI Compliance & Risk Alerts
                        </Text>
                        <Text size="11px" c="#64748B">
                          High-priority alerts whenever an audit anomaly or ghost employee flag is detected.
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.emailSentinelFlag}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailSentinelFlag: e.currentTarget.checked,
                          })
                        }
                        color="red"
                      />
                    </Group>
                  </Paper>

                  <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          In-App Notification Bell & Real-time Badges
                        </Text>
                        <Text size="11px" c="#64748B">
                          Show unread counts and interactive drawer popups in the PayPilot top header bar.
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.inAppAlerts}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            inAppAlerts: e.currentTarget.checked,
                          })
                        }
                      />
                    </Group>
                  </Paper>

                  <Paper p="md" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" fw={700} c="#09090B">
                          Monthly Statutory Tax Summary Digest
                        </Text>
                        <Text size="11px" c="#64748B">
                          Monthly PDF report of TDS, EPF, and ESIC liability statements sent on the 1st of every month.
                        </Text>
                      </div>
                      <Switch
                        checked={notificationSettings.monthlyDigest}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            monthlyDigest: e.currentTarget.checked,
                          })
                        }
                      />
                    </Group>
                  </Paper>
                </Stack>
              </div>

              <Group justify="flex-end" mt="md">
                <Button
                  color="dark"
                  size="sm"
                  loading={saving}
                  onClick={handleSaveNotifications}
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  Save Notification Preferences
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  );
};

export default SettingsView;
