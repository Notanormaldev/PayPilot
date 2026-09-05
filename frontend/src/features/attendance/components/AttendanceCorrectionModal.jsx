import React, { useState, useEffect } from 'react';
import {
  Modal,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Alert,
  Checkbox,
  Box,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconFingerprint,
  IconClock,
  IconAlertTriangle,
  IconCheck,
  IconShieldCheck,
  IconUser,
  IconCalendar,
  IconSparkles,
  IconAdjustments,
} from '@tabler/icons-react';
import { attendanceService } from '../services/attendanceService';
import { UserAvatar } from '../../../components/ui';

const REASON_PRESETS = [
  'Biometric failure',
  'Work from home connectivity issue',
  'Client site visit / Field duty',
  'Manager pre-approved exception',
  'System / Punch clock outage',
  'Forgot to punch (Verified by Team Lead)',
  'Official travel / Conference',
];

const SHIFT_PRESETS = [
  { label: 'Standard Day (9:00 AM - 6:00 PM)', in: '09:00', out: '18:00', hours: 8.0, ot: 0 },
  { label: 'Morning Half-Day (9:00 AM - 1:30 PM)', in: '09:00', out: '13:30', hours: 4.5, ot: 0 },
  { label: 'Afternoon Half-Day (1:30 PM - 6:00 PM)', in: '13:30', out: '18:00', hours: 4.5, ot: 0 },
  { label: 'Extended + 2h OT (9:00 AM - 8:30 PM)', in: '09:00', out: '20:30', hours: 10.0, ot: 2.0 },
];

export const AttendanceCorrectionModal = ({
  opened,
  onClose,
  attendance,
  employees = [],
  onSuccess,
}) => {
  const isNewEntry = !attendance?.id;

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('PRESENT');
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('18:00');
  const [workedHours, setWorkedHours] = useState(8.0);
  const [overtimeHours, setOvertimeHours] = useState(0.0);
  const [reason, setReason] = useState('Biometric failure');
  const [customNote, setCustomNote] = useState('');
  const [declaration, setDeclaration] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (opened) {
      setErrorMsg('');
      if (attendance) {
        setSelectedEmpId(attendance.employeeId || '');
        const d = attendance.date ? new Date(attendance.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        setDateStr(d);
        setStatus(attendance.status || 'PRESENT');
        setWorkedHours(attendance.workedHours ? Number(attendance.workedHours) : 8.0);
        setOvertimeHours(attendance.overtimeHours ? Number(attendance.overtimeHours) : 0.0);

        if (attendance.checkIn) {
          const cin = new Date(attendance.checkIn);
          setCheckInTime(`${String(cin.getHours()).padStart(2, '0')}:${String(cin.getMinutes()).padStart(2, '0')}`);
        } else {
          setCheckInTime('09:00');
        }

        if (attendance.checkOut) {
          const cout = new Date(attendance.checkOut);
          setCheckOutTime(`${String(cout.getHours()).padStart(2, '0')}:${String(cout.getMinutes()).padStart(2, '0')}`);
        } else {
          setCheckOutTime('18:00');
        }

        setReason(attendance.correctionReason || 'Biometric failure');
        setCustomNote('');
      } else {
        setSelectedEmpId(employees[0]?.id || '');
        setDateStr(new Date().toISOString().split('T')[0]);
        setStatus('PRESENT');
        setCheckInTime('09:00');
        setCheckOutTime('18:00');
        setWorkedHours(8.0);
        setOvertimeHours(0.0);
        setReason('Biometric failure');
        setCustomNote('');
      }
      setDeclaration(true);
    }
  }, [opened, attendance, employees]);

  // Handle Preset Click
  const handleApplyPreset = (preset) => {
    setCheckInTime(preset.in);
    setCheckOutTime(preset.out);
    setWorkedHours(preset.hours);
    setOvertimeHours(preset.ot);
    if (preset.hours <= 4.5) {
      setStatus('HALF_DAY');
    } else {
      setStatus('PRESENT');
    }
  };

  // Recalculate hours when punch times change
  const handleTimesChange = (inVal, outVal) => {
    if (!inVal || !outVal) return;
    const [inH, inM] = inVal.split(':').map(Number);
    const [outH, outM] = outVal.split(':').map(Number);
    let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Next day fallback
    // Deduct 1 hour for standard lunch if > 5 hours
    const netMins = diffMinutes > 300 ? diffMinutes - 60 : diffMinutes;
    const computedHours = Math.max(0, Math.round((netMins / 60) * 10) / 10);
    setWorkedHours(computedHours);
    if (computedHours > 8) {
      setOvertimeHours(Math.round((computedHours - 8) * 10) / 10);
    } else {
      setOvertimeHours(0);
    }
  };

  const selectedEmployeeObj = attendance?.employee || employees.find((e) => e.id === selectedEmpId);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const finalReason = customNote.trim() ? `${reason}: ${customNote.trim()}` : reason;

    if (!finalReason || finalReason.trim().length < 3) {
      setErrorMsg('Mandatory Reason Required: Please specify a justification (e.g. Biometric failure).');
      return;
    }

    if (!declaration) {
      setErrorMsg('Please confirm the compliance declaration checkbox.');
      return;
    }

    setSubmitting(true);
    try {
      const [cinH, cinM] = checkInTime.split(':').map(Number);
      const [coutH, coutM] = checkOutTime.split(':').map(Number);

      const baseDate = new Date(dateStr);
      const cinDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), cinH, cinM);
      const coutDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), coutH, coutM);

      const payload = {
        employeeId: selectedEmpId || attendance?.employeeId,
        date: dateStr,
        reason: finalReason,
        checkIn: cinDate.toISOString(),
        checkOut: coutDate.toISOString(),
        workedHours: Number(workedHours),
        overtimeHours: Number(overtimeHours),
        status,
      };

      if (isNewEntry) {
        await attendanceService.createManualAttendance(payload);
      } else {
        await attendanceService.correctAttendance(attendance.id, payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Correction submission error:', err);
      setErrorMsg(err.message || 'Failed to save attendance correction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" color="blue" variant="light">
            <IconFingerprint size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="sm" c="#09090B">
              {isNewEntry ? 'Manual Attendance Override & Punch Entry' : 'HR Attendance Punch Correction'}
            </Text>
            <Text size="10px" c="#71717A">
              Statutory Biometric & Telemetry Override Protocol
            </Text>
          </div>
        </Group>
      }
      size="lg"
      radius="md"
      centered
      styles={{
        header: { borderBottom: '1px solid #E2E8F0', padding: '16px 20px' },
        body: { padding: '20px' },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {errorMsg && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="light"
              radius="md"
              withCloseButton
              onClose={() => setErrorMsg('')}
            >
              <Text size="xs" fw={600}>
                {errorMsg}
              </Text>
            </Alert>
          )}

          {/* Employee Card Banner */}
          <Paper
            p="sm"
            radius="md"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            {isNewEntry ? (
              <Select
                label="Select Employee"
                placeholder="Search employee name or ID..."
                data={employees.map((e) => ({
                  value: e.id,
                  label: `${e.firstName || e.name || 'Employee'} (${e.employeeNumber || e.department || 'Staff'})`,
                }))}
                value={selectedEmpId}
                onChange={setSelectedEmpId}
                searchable
                required
                size="xs"
              />
            ) : (
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <UserAvatar
                    size={36}
                    radius="xl"
                    name={selectedEmployeeObj?.name || 'Employee'}
                    id={selectedEmployeeObj?.id}
                  />
                  <div>
                    <Text size="xs" fw={700} c="#09090B">
                      {selectedEmployeeObj?.name || 'Aarav Sharma'}
                    </Text>
                    <Text size="10px" c="#71717A">
                      {selectedEmployeeObj?.jobPosition || 'Specialist'} • {selectedEmployeeObj?.department || 'Operations'}
                    </Text>
                  </div>
                </Group>
                <Badge size="xs" color="blue" variant="light">
                  Date: {new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Badge>
              </Group>
            )}
          </Paper>

          {/* 1-Click Shift Presets */}
          <div>
            <Text size="11px" fw={700} c="#71717A" mb={6}>
              QUICK SHIFT PRESETS
            </Text>
            <Group gap={6}>
              {SHIFT_PRESETS.map((p, idx) => (
                <Button
                  key={idx}
                  size="compact-xs"
                  variant="default"
                  radius="md"
                  onClick={() => handleApplyPreset(p)}
                  style={{ fontSize: '11px', borderColor: '#E2E8F0' }}
                >
                  {p.label}
                </Button>
              ))}
            </Group>
          </div>

          <Divider style={{ borderColor: '#F1F5F9' }} />

          {/* Punch Time & Status Grid */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            <TextInput
              label="Check-In Time"
              type="time"
              value={checkInTime}
              onChange={(e) => {
                setCheckInTime(e.target.value);
                handleTimesChange(e.target.value, checkOutTime);
              }}
              required
              size="xs"
              leftSection={<IconClock size={14} color="#71717A" />}
            />

            <TextInput
              label="Check-Out Time"
              type="time"
              value={checkOutTime}
              onChange={(e) => {
                setCheckOutTime(e.target.value);
                handleTimesChange(checkInTime, e.target.value);
              }}
              required
              size="xs"
              leftSection={<IconClock size={14} color="#71717A" />}
            />

            <Select
              label="Attendance Status"
              value={status}
              onChange={setStatus}
              data={[
                { value: 'PRESENT', label: '🟢 Present (Full Day)' },
                { value: 'HALF_DAY', label: '🟠 Half Day' },
                { value: 'LATE', label: '🟡 Late In' },
                { value: 'INCOMPLETE', label: '🟣 Incomplete Punch' },
                { value: 'ABSENT', label: '🔴 Absent' },
              ]}
              size="xs"
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <NumberInput
              label="Computed Worked Hours"
              value={workedHours}
              onChange={setWorkedHours}
              min={0}
              max={24}
              step={0.5}
              decimalScale={1}
              size="xs"
              rightSection={<Text size="10px" c="#71717A" mr={8}>hrs</Text>}
            />

            <NumberInput
              label="Overtime (OT) Hours"
              value={overtimeHours}
              onChange={setOvertimeHours}
              min={0}
              max={12}
              step={0.5}
              decimalScale={1}
              size="xs"
              rightSection={<Text size="10px" c="#71717A" mr={8}>hrs</Text>}
            />
          </SimpleGrid>

          <Divider style={{ borderColor: '#F1F5F9' }} />

          {/* MANDATORY CORRECTION REASON SECTION */}
          <div>
            <Group justify="space-between" align="center" mb={6}>
              <Text size="12px" fw={700} c="#09090B">
                MANDATORY REASON FOR OVERRIDE <Text component="span" c="red">*</Text>
              </Text>
              <Badge size="xs" color="red" variant="filled">
                Required for Audit
              </Badge>
            </Group>

            {/* Quick Reason Pills */}
            <Group gap={6} mb="xs">
              {REASON_PRESETS.map((r, idx) => {
                const isSelected = reason === r;
                return (
                  <Button
                    key={idx}
                    size="compact-xs"
                    variant={isSelected ? 'filled' : 'outline'}
                    color={isSelected ? 'blue' : 'gray'}
                    radius="xl"
                    onClick={() => setReason(r)}
                    style={{ fontSize: '11px', transition: 'all 0.15s ease' }}
                  >
                    {r}
                  </Button>
                );
              })}
            </Group>

            <TextInput
              placeholder="Selected justification title (e.g. Biometric failure)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              size="xs"
              mb="xs"
            />

            <Textarea
              placeholder="Optional additional context (e.g. Employee punch was logged at gate register #3; device power failure during morning shift)."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              minRows={2}
              size="xs"
            />
          </div>

          {/* Officer Declaration */}
          <Paper
            p="xs"
            radius="md"
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
            }}
          >
            <Checkbox
              checked={declaration}
              onChange={(e) => setDeclaration(e.currentTarget.checked)}
              label={
                <Text size="11px" c="#1E3A8A" fw={500}>
                  I confirm this attendance adjustment is authorized under organizational policy and will be registered in the immutable statutory payroll audit log.
                </Text>
              }
              styles={{ input: { cursor: 'pointer' } }}
            />
          </Paper>

          {/* Modal Actions */}
          <Group justify="flex-end" gap="xs" mt="sm">
            <Button variant="default" size="xs" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="xs"
              color="dark"
              loading={submitting}
              leftSection={<IconCheck size={14} />}
            >
              {isNewEntry ? 'Save Manual Attendance' : 'Confirm Attendance Correction'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AttendanceCorrectionModal;
