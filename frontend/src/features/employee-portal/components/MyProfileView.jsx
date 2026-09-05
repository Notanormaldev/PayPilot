import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Avatar,
  Text,
  Badge,
  TextInput,
  Textarea,
  Button,
  SimpleGrid,
  Title,
  Divider,
  Box,
  Tooltip,
  Alert,
} from '@mantine/core';
import {
  IconUser,
  IconLock,
  IconPhone,
  IconMail,
  IconMapPin,
  IconPhoneCall,
  IconCheck,
  IconInfoCircle,
  IconBuildingSkyscraper,
  IconUserCheck,
  IconBriefcase,
  IconClock,
} from '@tabler/icons-react';
import { fetchApi } from '../../../lib/api';
import { UserAvatar } from '../../../components/ui';

export const MyProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Editable state
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('paypilot_user_avatar') || null);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [personalEmail, setPersonalEmail] = useState('kartik.personal@gmail.com');
  const [address, setAddress] = useState('B-402, Cyber Heights, Sector 62, Noida, UP - 201301');
  const [emergencyContact, setEmergencyContact] = useState('Aarti Kumar (Spouse) - +91 98123 45678');

  useEffect(() => {
    fetchProfile();

    const handleAvatarUpdate = (e) => {
      setAvatarUrl(e.detail);
    };
    window.addEventListener('paypilot_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('paypilot_avatar_updated', handleAvatarUpdate);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/employees/me').catch(() => ({}));
      if (res?.data) {
        setProfile(res.data);
        if (res.data.avatarUrl) {
          setAvatarUrl(res.data.avatarUrl);
          localStorage.setItem('paypilot_user_avatar', res.data.avatarUrl);
        }
        if (res.data.phone) setPhone(res.data.phone);
        if (res.data.personalEmail) setPersonalEmail(res.data.personalEmail);
        if (res.data.address) setAddress(res.data.address);
        if (res.data.emergencyContact) setEmergencyContact(res.data.emergencyContact);
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await fetchApi('/employees/me', {
        method: 'PUT',
        body: JSON.stringify({ phone, personalEmail, address, emergencyContact }),
      });
      setSuccessMsg('Your personal contact details have been updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* Top Banner Card */}
      <Paper p="xl" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <Group gap="md">
            <UserAvatar
              size={68}
              radius="xl"
              src={avatarUrl}
              name={profile?.name || 'Kartik Kumar'}
              id={profile?.id || 'EMP-8492'}
              editable={true}
              onPhotoUploaded={(url) => {
                setAvatarUrl(url);
                setSuccessMsg('Profile photo updated successfully!');
              }}
              onPhotoRemoved={() => {
                setAvatarUrl(null);
                setSuccessMsg('Profile photo removed. Unique silhouette avatar restored.');
              }}
            />
            <div>
              <Group gap="xs" mb={2}>
                <Title order={3} style={{ color: '#09090B' }}>
                  {profile?.name || 'Kartik Kumar'}
                </Title>
                <Badge size="xs" color="teal" variant="light">
                  {profile?.status || 'ACTIVE'}
                </Badge>
              </Group>
              <Text size="xs" c="#64748B" fw={500}>
                {profile?.jobPosition || 'Product Manager'} • {profile?.department || 'Product'}
              </Text>
              <Text size="11px" c="#94A3B8" mt={2}>
                Employee ID: <strong style={{ color: '#2563EB' }}>EMP-8492</strong> • Work Email: {profile?.workEmail || 'kartik.kumar@paypilot.internal'}
              </Text>
            </div>
          </Group>

          <Badge size="md" color="blue" variant="outline">
            Self-Service Active
          </Badge>
        </Group>
      </Paper>

      {successMsg && (
        <Alert icon={<IconCheck size={16} />} color="teal" title="Updated Successfully">
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert icon={<IconInfoCircle size={16} />} color="red" title="Update Failed">
          {errorMsg}
        </Alert>
      )}

      {/* Grid: Read-Only Official Information vs Editable Personal Details */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Read-Only Official Parameters */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconBriefcase size={18} color="#2563EB" />
              <Title order={4} size="sm" c="#09090B">
                Official HR Record (Read-Only)
              </Title>
            </Group>
            <Tooltip label="Official parameters are managed exclusively by HR Administration" withArrow>
              <Badge size="xs" color="gray" leftSection={<IconLock size={12} />}>
                HR Controlled
              </Badge>
            </Tooltip>
          </Group>

          <Stack gap="sm">
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Text size="11px" c="#71717A" fw={600}>Department</Text>
              <Text size="xs" fw={700} c="#09090B">{profile?.department || 'Product & Technology'}</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Text size="11px" c="#71717A" fw={600}>Reporting Manager</Text>
              <Text size="xs" fw={700} c="#09090B">{profile?.manager?.name || 'Meera Krishnan (VP People Ops)'}</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Text size="11px" c="#71717A" fw={600}>Job Position</Text>
              <Text size="xs" fw={700} c="#09090B">{profile?.jobPosition || 'Product Manager - Core Engine'}</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Text size="11px" c="#71717A" fw={600}>Working Schedule</Text>
              <Text size="xs" fw={700} c="#09090B">{profile?.schedule?.name || 'Standard 40h Weekly (Mon-Fri 09:00 - 18:00)'}</Text>
            </Paper>

            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Text size="11px" c="#71717A" fw={600}>Salary Structure Scale</Text>
              <Text size="xs" fw={700} c="#2563EB">Corporate Product Scale v2.1</Text>
            </Paper>
          </Stack>
        </Paper>

        {/* Editable Self-Service Personal Details */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconUser size={18} color="#0D9488" />
              <Title order={4} size="sm" c="#09090B">
                Personal Contact Information (Self-Service)
              </Title>
            </Group>
            <Badge size="xs" color="teal">
              Editable
            </Badge>
          </Group>

          <Stack gap="sm">
            <TextInput
              label="Mobile Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
              leftSection={<IconPhone size={14} color="#71717A" />}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />

            <TextInput
              label="Personal Email Address"
              placeholder="personal@gmail.com"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.currentTarget.value)}
              leftSection={<IconMail size={14} color="#71717A" />}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />

            <Textarea
              label="Residential Address"
              placeholder="Full mailing address..."
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />

            <TextInput
              label="Emergency Contact (Name, Relation & Phone)"
              placeholder="Contact Person - Phone Number"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.currentTarget.value)}
              leftSection={<IconPhoneCall size={14} color="#71717A" />}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />

            <Button
              color="dark"
              size="sm"
              mt="xs"
              loading={saving}
              onClick={handleSave}
              leftSection={<IconCheck size={16} />}
            >
              Save Profile Changes
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
};
