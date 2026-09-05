import React, { useState, useMemo } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Modal,
  TextInput,
  Select,
  SimpleGrid,
  Card,
  Switch,
  ActionIcon,
  Menu,
  Tooltip,
  Alert,
  Divider,
  Box,
  NumberInput,
  Tabs,
} from '@mantine/core';
import {
  IconCalendarTime,
  IconPlus,
  IconClock,
  IconUsers,
  IconCheck,
  IconTrash,
  IconEdit,
  IconCopy,
  IconDotsVertical,
  IconAlertTriangle,
  IconInfoCircle,
  IconSparkles,
  IconMoonStars,
  IconSun,
  IconBriefcase,
  IconUserCheck,
} from '@tabler/icons-react';
import { useSchedules } from '../hooks/useSchedules';
import { scheduleService } from '../services/scheduleService';

const DAY_KEYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

// Preset Templates
const PRESET_TEMPLATES = [
  {
    id: 'STANDARD_40H',
    name: 'Standard 40h Full-Time (Mon–Fri 09:00 - 18:00)',
    description: 'Standard 5-day corporate schedule with 1-hour unpaid lunch break.',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
  },
  {
    id: 'EXTENDED_48H',
    name: '6-Day Operations (Mon–Sat 09:00 - 18:00)',
    description: '6-day plant / logistics work week complying with 48-hour statutory limit.',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
  },
  {
    id: 'NIGHT_40H',
    name: 'Night Shift Roster (Mon–Fri 20:00 - 05:00)',
    description: 'Overnight shift with cross-midnight hours and 60-min break.',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    startTime: '20:00',
    endTime: '05:00',
    breakMinutes: 60,
  },
  {
    id: 'MORNING_FLEX_41H',
    name: 'Early Morning Flex (Mon–Fri 08:30 - 17:30)',
    description: '41.25 hours/week with 45-min lunch break.',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    startTime: '08:30',
    endTime: '17:30',
    breakMinutes: 45,
  },
  {
    id: 'WEEKEND_PART_TIME',
    name: 'Weekend Part-Time (Sat–Sun 09:00 - 18:00)',
    description: '16 hours/week for weekend support staff.',
    days: ['SAT', 'SUN'],
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
  },
];

// Helper to compute daily hours
function computeDailyMinutes(startTime, endTime, breakMinutes) {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let diffM = (endH * 60 + endM) - (startH * 60 + startM);
  if (diffM < 0) {
    diffM += 24 * 60; // overnight shift
  }
  const breakM = parseInt(breakMinutes, 10) || 0;
  return Math.max(0, diffM - breakM);
}

export const WorkSchedulesView = ({ onRefresh }) => {
  const { schedules, loading, fetchSchedules } = useSchedules();

  // Create / Edit Modal State
  const [modalOpened, setModalOpened] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleActive, setScheduleActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // 7-day configuration state
  const [dayConfigs, setDayConfigs] = useState(() => {
    const init = {};
    DAY_KEYS.forEach((d) => {
      init[d] = {
        enabled: ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(d),
        startTime: '09:00',
        endTime: '18:00',
        breakMinutes: 60,
      };
    });
    return init;
  });

  // Assign Employees Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedScheduleForAssign, setSelectedScheduleForAssign] = useState(null);
  const [assignDepartment, setAssignDepartment] = useState('Engineering');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetSchedule, setTargetSchedule] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Live Auto-Calculation of Weekly Scheduled Hours
  const calculationSummary = useMemo(() => {
    let totalWeeklyMinutes = 0;
    let totalBreakMinutes = 0;
    let workingDaysCount = 0;

    const dailyBreakdowns = {};

    DAY_KEYS.forEach((dayKey) => {
      const cfg = dayConfigs[dayKey];
      if (cfg.enabled) {
        workingDaysCount++;
        const dailyNetM = computeDailyMinutes(cfg.startTime, cfg.endTime, cfg.breakMinutes);
        totalWeeklyMinutes += dailyNetM;
        totalBreakMinutes += parseInt(cfg.breakMinutes, 10) || 0;
        dailyBreakdowns[dayKey] = (dailyNetM / 60).toFixed(2);
      } else {
        dailyBreakdowns[dayKey] = 0;
      }
    });

    const weeklyHours = Number((totalWeeklyMinutes / 60).toFixed(2));
    const totalBreakHours = Number((totalBreakMinutes / 60).toFixed(2));
    const avgHoursPerDay = workingDaysCount > 0 ? Number((weeklyHours / workingDaysCount).toFixed(2)) : 0;

    return {
      weeklyHours,
      totalBreakHours,
      workingDaysCount,
      avgHoursPerDay,
      dailyBreakdowns,
      isCompliant: weeklyHours <= 48,
    };
  }, [dayConfigs]);

  // Apply Preset Template
  const handleApplyPreset = (template) => {
    setScheduleName(template.name);
    const updated = {};
    DAY_KEYS.forEach((d) => {
      const isWorkDay = template.days.includes(d);
      updated[d] = {
        enabled: isWorkDay,
        startTime: template.startTime,
        endTime: template.endTime,
        breakMinutes: template.breakMinutes,
      };
    });
    setDayConfigs(updated);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingScheduleId(null);
    setScheduleName('Standard 40h Work Schedule');
    setScheduleActive(true);
    setFormError(null);
    handleApplyPreset(PRESET_TEMPLATES[0]);
    setModalOpened(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sched) => {
    setEditingScheduleId(sched.id);
    setScheduleName(sched.name);
    setScheduleActive(sched.isActive);
    setFormError(null);

    const updated = {};
    DAY_KEYS.forEach((d) => {
      const existingLine = sched.lines?.find((l) => l.dayOfWeek === d);
      if (existingLine) {
        updated[d] = {
          enabled: true,
          startTime: existingLine.startTime || '09:00',
          endTime: existingLine.endTime || '18:00',
          breakMinutes: existingLine.breakMinutes !== undefined ? existingLine.breakMinutes : 60,
        };
      } else {
        updated[d] = {
          enabled: false,
          startTime: '09:00',
          endTime: '18:00',
          breakMinutes: 60,
        };
      }
    });
    setDayConfigs(updated);
    setModalOpened(true);
  };

  // Save Schedule
  const handleSaveSchedule = async (e) => {
    e?.preventDefault();
    if (!scheduleName.trim()) {
      setFormError('Please provide a schedule name.');
      return;
    }

    const lines = [];
    DAY_KEYS.forEach((d) => {
      const cfg = dayConfigs[d];
      if (cfg.enabled) {
        lines.push({
          dayOfWeek: d,
          startTime: cfg.startTime,
          endTime: cfg.endTime,
          breakMinutes: parseInt(cfg.breakMinutes, 10) || 0,
        });
      }
    });

    if (lines.length === 0) {
      setFormError('Please enable at least one working day in the schedule.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingScheduleId) {
        await scheduleService.updateSchedule(editingScheduleId, {
          name: scheduleName.trim(),
          isActive: scheduleActive,
          lines,
        });
      } else {
        await scheduleService.createSchedule({
          name: scheduleName.trim(),
          isActive: scheduleActive,
          lines,
        });
      }

      setModalOpened(false);
      await fetchSchedules();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to save schedule:', err);
      setFormError(err.message || 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Schedule
  const handleConfirmDelete = async () => {
    if (!targetSchedule?.id) return;
    setDeleting(true);
    try {
      await scheduleService.deleteSchedule(targetSchedule.id);
      setDeleteModalOpen(false);
      setTargetSchedule(null);
      await fetchSchedules();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Assign Employees by Department
  const handleAssignDepartment = async () => {
    if (!selectedScheduleForAssign?.id) return;
    setAssigning(true);
    setAssignSuccess(null);
    try {
      const res = await scheduleService.assignEmployees(selectedScheduleForAssign.id, {
        department: assignDepartment,
      });
      setAssignSuccess(res.message || 'Assigned successfully!');
      await fetchSchedules();
      if (onRefresh) onRefresh();
      setTimeout(() => {
        setAssignModalOpen(false);
        setAssignSuccess(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to assign employees:', err);
    } finally {
      setAssigning(false);
    }
  };

  // Duplicate schedule
  const handleDuplicate = async (sched) => {
    try {
      const lines = (sched.lines || []).map((l) => ({
        dayOfWeek: l.dayOfWeek,
        startTime: l.startTime,
        endTime: l.endTime,
        breakMinutes: l.breakMinutes,
      }));

      await scheduleService.createSchedule({
        name: `${sched.name} (Copy)`,
        isActive: true,
        lines,
      });
      await fetchSchedules();
    } catch (err) {
      console.error('Failed to duplicate schedule:', err);
    }
  };

  return (
    <Stack gap="lg">
      {/* Header Section */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <div>
            <Group gap="xs" align="center" mb={4}>
              <IconCalendarTime size={22} color="#0284C7" />
              <Text fw={800} size="md" c="#09090B">
                WORK SCHEDULES & SHIFT ROSTER
              </Text>
              <Badge size="sm" color="blue" variant="filled">
                {schedules.length} Active Profiles
              </Badge>
            </Group>
            <Text size="xs" c="#64748B">
              Define standard shift timings, daily break allowances, and auto-compute weekly scheduled hours
            </Text>
          </div>

          <Group gap="xs">
            <Button
              size="sm"
              color="dark"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenCreate}
            >
              Create Work Schedule
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Schedules Cards Grid */}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {schedules.map((sched) => {
          const isStandard = sched.weeklyHours === 40;
          const isExtended = sched.weeklyHours > 40 && sched.weeklyHours <= 48;
          const isHeavy = sched.weeklyHours > 48;

          return (
            <Card
              key={sched.id}
              padding="md"
              radius="md"
              withBorder
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                {/* Top: Name & Actions */}
                <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} size="sm" c="#09090B" truncate>
                      {sched.name}
                    </Text>
                    <Text size="11px" c="#64748B">
                      {sched.workingDaysCount || 5} Working Days / Week
                    </Text>
                  </div>

                  <Group gap={4} wrap="nowrap">
                    <Badge
                      size="xs"
                      color={sched.isActive ? 'teal' : 'gray'}
                      variant={sched.isActive ? 'light' : 'outline'}
                    >
                      {sched.isActive ? 'Active' : 'Inactive'}
                    </Badge>

                    <Menu position="bottom-end" shadow="md">
                      <Menu.Target>
                        <ActionIcon size="sm" variant="subtle" color="gray">
                          <IconDotsVertical size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Schedule Actions</Menu.Label>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleOpenEdit(sched)}
                        >
                          Edit Shifts & Timings
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconUserCheck size={14} color="#0284C7" />}
                          onClick={() => {
                            setSelectedScheduleForAssign(sched);
                            setAssignModalOpen(true);
                          }}
                        >
                          Assign Staff / Department
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => handleDuplicate(sched)}
                        >
                          Duplicate Schedule
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => {
                            setTargetSchedule(sched);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Delete Schedule
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>

                {/* Main Metric: Weekly Scheduled Hours */}
                <Paper
                  p="xs"
                  radius="sm"
                  mb="sm"
                  style={{
                    backgroundColor: isStandard ? '#F0FDF4' : isExtended ? '#F0F9FF' : isHeavy ? '#FFFBEB' : '#F8FAFC',
                    border: `1px solid ${isStandard ? '#BBF7D0' : isExtended ? '#BAE6FD' : isHeavy ? '#FDE68A' : '#E2E8F0'}`,
                  }}
                >
                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="10px" c="#64748B" fw={700}>
                        WEEKLY SCHEDULED HOURS
                      </Text>
                      <Text size="lg" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {sched.weeklyHours} <span style={{ fontSize: '12px', fontWeight: 500 }}>hrs/week</span>
                      </Text>
                    </div>

                    <Badge
                      size="xs"
                      color={isStandard ? 'teal' : isExtended ? 'blue' : isHeavy ? 'orange' : 'gray'}
                      variant="filled"
                    >
                      {isStandard ? 'Standard 40h' : isExtended ? 'Extended 48h' : isHeavy ? 'Overtime 48h+' : 'Part-Time'}
                    </Badge>
                  </Group>
                </Paper>

                {/* 7-Day Mini Timeline Bar */}
                <Text size="11px" fw={600} c="#475569" mb={4}>
                  Weekly Shift Schedule:
                </Text>
                <SimpleGrid cols={7} spacing={4} mb="md">
                  {DAY_KEYS.map((d) => {
                    const line = sched.lines?.find((l) => l.dayOfWeek === d);
                    const isWorking = !!line;
                    return (
                      <Tooltip
                        key={d}
                        label={isWorking ? `${DAY_LABELS[d]}: ${line.startTime} - ${line.endTime} (${line.dailyHours || 8}h, Break ${line.breakMinutes || 60}m)` : `${DAY_LABELS[d]}: Rest Day / Off`}
                        withArrow
                      >
                        <Box
                          style={{
                            textAlign: 'center',
                            padding: '6px 2px',
                            borderRadius: '4px',
                            backgroundColor: isWorking ? '#0F172A' : '#F1F5F9',
                            color: isWorking ? '#FFFFFF' : '#94A3B8',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          <div>{d}</div>
                          <div style={{ fontSize: '9px', fontWeight: 500, opacity: isWorking ? 0.9 : 0.6 }}>
                            {isWorking ? `${line.dailyHours || 8}h` : 'OFF'}
                          </div>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </SimpleGrid>
              </div>

              {/* Bottom: Assigned Count & Assign CTA */}
              <div>
                <Divider my="xs" color="#F1F5F9" />
                <Group justify="space-between" align="center">
                  <Group gap={4}>
                    <IconUsers size={14} color="#64748B" />
                    <Text size="xs" c="#64748B">
                      <b>{sched.assignedEmployeesCount || 0}</b> employees assigned
                    </Text>
                  </Group>

                  <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    onClick={() => {
                      setSelectedScheduleForAssign(sched);
                      setAssignModalOpen(true);
                    }}
                  >
                    Assign Staff
                  </Button>
                </Group>
              </div>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Schedule Builder Modal (Create / Edit) */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="xs">
            <IconCalendarTime size={20} color="#0284C7" />
            <Text fw={700} size="sm" c="#09090B">
              {editingScheduleId ? 'Edit Work Schedule & Shift Hours' : 'Create New Work Schedule & Shifts'}
            </Text>
          </Group>
        }
        size="xl"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <form onSubmit={handleSaveSchedule}>
          <Stack gap="md">
            {formError && (
              <Alert color="red" title="Error" icon={<IconAlertTriangle size={16} />}>
                {formError}
              </Alert>
            )}

            {/* Schedule Name & Active Toggle */}
            <Group justify="space-between" align="flex-end">
              <TextInput
                label="Work Schedule Name"
                placeholder="e.g. Engineering Standard 40h (Mon-Fri)"
                required
                style={{ flex: 1 }}
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
              />

              <Switch
                label="Active Schedule"
                checked={scheduleActive}
                onChange={(e) => setScheduleActive(e.currentTarget.checked)}
                color="teal"
                mb={6}
              />
            </Group>

            {/* 1-Click Preset Template Selector */}
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" align="center" mb={6}>
                <Group gap={6}>
                  <IconSparkles size={16} color="#4F46E5" />
                  <Text size="xs" fw={700} c="#0F172A">
                    1-Click Shift Templates & Presets:
                  </Text>
                </Group>
                <Text size="11px" c="#64748B">
                  Click to auto-populate 7-day timings
                </Text>
              </Group>

              <Group gap="xs" wrap="wrap">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <Button
                    key={tmpl.id}
                    size="xs"
                    variant="light"
                    color="indigo"
                    onClick={() => handleApplyPreset(tmpl)}
                  >
                    {tmpl.name.split(' (')[0]}
                  </Button>
                ))}
              </Group>
            </Paper>

            {/* 7-Day Shift Matrix */}
            <div>
              <Text size="xs" fw={700} c="#0F172A" mb={6}>
                7-Day Shift Timings & Break Allowance:
              </Text>

              <Stack gap={6}>
                {DAY_KEYS.map((dayKey) => {
                  const cfg = dayConfigs[dayKey];
                  const dailyHours = calculationSummary.dailyBreakdowns[dayKey];

                  return (
                    <Paper
                      key={dayKey}
                      p="xs"
                      radius="sm"
                      style={{
                        backgroundColor: cfg.enabled ? '#FFFFFF' : '#F8FAFC',
                        border: `1px solid ${cfg.enabled ? '#CBD5E1' : '#E2E8F0'}`,
                        opacity: cfg.enabled ? 1 : 0.75,
                      }}
                    >
                      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                        {/* Day Name & Enable Switch */}
                        <Group gap="xs" style={{ width: '150px' }}>
                          <Switch
                            checked={cfg.enabled}
                            onChange={(e) => {
                              setDayConfigs({
                                ...dayConfigs,
                                [dayKey]: { ...cfg, enabled: e.currentTarget.checked },
                              });
                            }}
                            color="dark"
                            size="sm"
                          />
                          <Text size="xs" fw={700} c={cfg.enabled ? '#09090B' : '#94A3B8'}>
                            {DAY_LABELS[dayKey]}
                          </Text>
                        </Group>

                        {/* Shift Times */}
                        {cfg.enabled ? (
                          <Group gap="xs" style={{ flex: 1 }}>
                            <TextInput
                              label="Start Time"
                              type="time"
                              size="xs"
                              value={cfg.startTime}
                              onChange={(e) => {
                                setDayConfigs({
                                  ...dayConfigs,
                                  [dayKey]: { ...cfg, startTime: e.target.value },
                                });
                              }}
                              styles={{ input: { width: '110px', fontWeight: 600 } }}
                            />

                            <Text size="xs" c="#94A3B8" mt={18}>
                              to
                            </Text>

                            <TextInput
                              label="End Time"
                              type="time"
                              size="xs"
                              value={cfg.endTime}
                              onChange={(e) => {
                                setDayConfigs({
                                  ...dayConfigs,
                                  [dayKey]: { ...cfg, endTime: e.target.value },
                                });
                              }}
                              styles={{ input: { width: '110px', fontWeight: 600 } }}
                            />

                            <Select
                              label="Unpaid Break"
                              size="xs"
                              value={String(cfg.breakMinutes)}
                              onChange={(val) => {
                                setDayConfigs({
                                  ...dayConfigs,
                                  [dayKey]: { ...cfg, breakMinutes: parseInt(val, 10) || 0 },
                                });
                              }}
                              data={[
                                { value: '0', label: 'No Break (0m)' },
                                { value: '30', label: '30 mins' },
                                { value: '45', label: '45 mins' },
                                { value: '60', label: '1 hour (60m)' },
                                { value: '90', label: '1.5 hours (90m)' },
                              ]}
                              styles={{ input: { width: '130px' } }}
                            />
                          </Group>
                        ) : (
                          <Text size="xs" c="#94A3B8" style={{ flex: 1, fontStyle: 'italic' }}>
                            Weekly Rest Day (Off Duty)
                          </Text>
                        )}

                        {/* Daily Net Hours Live Pill */}
                        <Badge
                          size="sm"
                          color={cfg.enabled ? 'blue' : 'gray'}
                          variant={cfg.enabled ? 'light' : 'outline'}
                          style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '75px', textAlign: 'center' }}
                        >
                          {cfg.enabled ? `${dailyHours} hrs` : 'Off'}
                        </Badge>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </div>

            {/* Real-Time Auto-Calculated Weekly Summary Box */}
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: calculationSummary.isCompliant ? '#F0FDF4' : '#FFFBEB',
                border: `1px solid ${calculationSummary.isCompliant ? '#BBF7D0' : '#FDE68A'}`,
              }}
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <div>
                  <Text size="11px" c="#64748B" fw={700}>
                    AUTOMATICALLY CALCULATED WEEKLY SCHEDULED HOURS
                  </Text>
                  <Group gap="xs" align="baseline">
                    <Text size="xl" fw={900} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {calculationSummary.weeklyHours}
                    </Text>
                    <Text size="sm" c="#64748B" fw={600}>
                      Total Hours / Week
                    </Text>
                  </Group>
                  <Text size="xs" c="#475569">
                    {calculationSummary.workingDaysCount} active working days • Total breaks:{' '}
                    {calculationSummary.totalBreakHours}h/week • Avg: {calculationSummary.avgHoursPerDay}h/day
                  </Text>
                </div>

                <Badge
                  size="md"
                  color={calculationSummary.isCompliant ? 'teal' : 'orange'}
                  variant="filled"
                >
                  {calculationSummary.isCompliant
                    ? '✔ Compliant (<= 48h/week)'
                    : '⚠ Overtime Schedule (> 48h/week)'}
                </Badge>
              </Group>
            </Paper>

            {/* Modal Actions */}
            <Group justify="flex-end" gap="xs" mt="sm">
              <Button size="xs" variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                color="dark"
                type="submit"
                loading={saving}
                leftSection={<IconCheck size={14} />}
              >
                {editingScheduleId ? 'Save Changes' : 'Create Schedule'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Assign Employees Modal */}
      <Modal
        opened={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignSuccess(null);
        }}
        title={
          <Group gap="xs">
            <IconUserCheck size={18} color="#0284C7" />
            <Text fw={700} size="sm" c="#09090B">
              Assign Staff to Schedule
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <Stack gap="md">
          {assignSuccess && (
            <Alert color="teal" icon={<IconCheck size={16} />} title="Success">
              {assignSuccess}
            </Alert>
          )}

          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B">
              {selectedScheduleForAssign?.name}
            </Text>
            <Text size="11px" c="#64748B">
              {selectedScheduleForAssign?.weeklyHours} hrs/week • Currently assigned:{' '}
              {selectedScheduleForAssign?.assignedEmployeesCount || 0} employees
            </Text>
          </Paper>

          <Select
            label="Assign by Department"
            description="Assign all employees belonging to this department to this work schedule"
            value={assignDepartment}
            onChange={(val) => setAssignDepartment(val || 'Engineering')}
            data={[
              'Engineering',
              'Product',
              'Design',
              'Data & AI',
              'Human Resources',
              'Payroll & Compliance',
              'Finance & Accounts',
              'Sales',
              'Marketing',
              'Customer Success',
              'Legal & Compliance',
              'Operations',
            ]}
          />

          <Group justify="flex-end" gap="xs" mt="md">
            <Button size="xs" variant="default" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              color="blue"
              loading={assigning}
              onClick={handleAssignDepartment}
              leftSection={<IconCheck size={14} />}
            >
              Assign Department Staff
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={18} color="#DC2626" />
            <Text fw={700} size="sm" c="#991B1B">
              Delete Work Schedule
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: { backgroundColor: '#FFFFFF', borderColor: '#FECACA' },
          header: { backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' },
        }}
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Confirm Schedule Deletion">
            <Text size="xs" c="#991B1B" fw={600}>
              Are you sure you want to delete <b>{targetSchedule?.name}</b>?
            </Text>
          </Alert>

          <Text size="xs" c="#64748B">
            Employees currently linked to this schedule will be unassigned and reverted to default.
          </Text>

          <Group justify="flex-end" gap="xs">
            <Button size="xs" variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              color="red"
              loading={deleting}
              onClick={handleConfirmDelete}
              leftSection={<IconTrash size={14} />}
            >
              Yes, Delete Schedule
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default WorkSchedulesView;
