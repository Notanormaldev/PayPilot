import React, { useState, useMemo } from 'react';
import {
  Modal,
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Title,
  TextInput,
  Select,
  SegmentedControl,
  ThemeIcon,
  Tooltip,
  Divider,
  ActionIcon,
  Box,
  Alert,
} from '@mantine/core';
import {
  IconCalendar,
  IconCalendarEvent,
  IconSearch,
  IconDownload,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
  IconBuildingCommunity,
  IconCheck,
  IconPlus,
  IconInfoCircle,
  IconArrowRight,
  IconPlaneDeparture,
} from '@tabler/icons-react';

import {
  INDIAN_HOLIDAYS_2026,
  OFFICE_LOCATIONS,
  HOLIDAY_TYPES,
  filterIndianHolidays,
  getHolidayCountdown,
  downloadIcsCalendar,
} from '../data/indianHolidays2026';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HolidayCalendarModal = ({ opened, onClose, onApplyRhLeave }) => {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'calendar'
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar Grid Month State (0 = Jan 2026, 9 = Oct 2026, 8 = Sep 2026)
  const [activeMonthIdx, setActiveMonthIdx] = useState(8); // Default to September 2026 (current in-app context)
  const [selectedHolidayDetail, setSelectedHolidayDetail] = useState(null);

  // Filtered Holidays List
  const filteredHolidays = useMemo(() => {
    return filterIndianHolidays({
      location: selectedLocation,
      type: selectedType,
      quarter: selectedQuarter,
      search: searchQuery,
    });
  }, [selectedLocation, selectedType, selectedQuarter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const gazetted = filteredHolidays.filter((h) => h.type === 'GAZETTED').length;
    const restricted = filteredHolidays.filter((h) => h.type === 'RESTRICTED').length;
    const longWeekends = filteredHolidays.filter((h) => h.isLongWeekend).length;
    return { gazetted, restricted, longWeekends, total: filteredHolidays.length };
  }, [filteredHolidays]);

  // Calendar Month Matrix for 2026
  const monthCalendarData = useMemo(() => {
    const year = 2026;
    const month = activeMonthIdx; // 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Days in month
    const totalDays = lastDay.getDate();

    // Day of week for 1st day (0 = Sunday -> shift so Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevDays.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    // Current month days with holidays
    const monthHolidays = INDIAN_HOLIDAYS_2026.filter((h) => {
      const d = new Date(h.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const currentDays = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const matchingHolidays = monthHolidays.filter((h) => h.date === dateStr);
      currentDays.push({
        day,
        dateStr,
        isCurrentMonth: true,
        holidays: matchingHolidays,
        isWeekend: (() => {
          const d = new Date(year, month, day).getDay();
          return d === 0 || d === 6;
        })(),
      });
    }

    // Next month filler days to complete grid (42 cells max)
    const totalFilled = prevDays.length + currentDays.length;
    const remaining = totalFilled % 7 === 0 ? 0 : 7 - (totalFilled % 7);
    const nextDays = [];
    for (let i = 1; i <= remaining; i++) {
      nextDays.push({ day: i, isCurrentMonth: false });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [activeMonthIdx]);

  const handleExportIcs = () => {
    downloadIcsCalendar(filteredHolidays);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'GAZETTED':
        return <Badge size="xs" color="indigo" variant="filled">🟣 Gazetted (Mandatory)</Badge>;
      case 'RESTRICTED':
        return <Badge size="xs" color="orange" variant="filled">🟠 Restricted (RH)</Badge>;
      case 'REGIONAL':
        return <Badge size="xs" color="teal" variant="filled">🟢 Regional / State</Badge>;
      default:
        return <Badge size="xs" color="gray" variant="light">{type}</Badge>;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="lg"
      padding={0}
      withCloseButton={false}
      styles={{
        content: {
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        },
        body: { padding: 0 },
      }}
    >
      {/* 1. HERO HEADER BANNER */}
      <Box
        p="lg"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
          color: '#FFFFFF',
          position: 'relative',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Group gap="xs" mb={4}>
              <Badge size="sm" color="indigo" variant="filled">
                CBDT & DoPT COMPLIANT
              </Badge>
              <Badge size="sm" color="teal" variant="light">
                CALENDAR YEAR 2026
              </Badge>
            </Group>
            <Title order={3} c="#FFFFFF">
              🇮🇳 Indian Statutory & Festival Holiday Calendar
            </Title>
            <Text size="xs" c="#CBD5E1" mt={4}>
              Gazetted public holidays, optional restricted holidays (RH), and long weekend planner for PayPilot teams
            </Text>
          </div>

          <Group gap="xs">
            <Button
              size="xs"
              variant="filled"
              color="indigo"
              leftSection={<IconDownload size={14} />}
              onClick={handleExportIcs}
              style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
            >
              Export to Calendar (.ICS)
            </Button>
            <ActionIcon variant="subtle" color="gray" onClick={onClose} size="lg" radius="xl" c="#FFFFFF">
              ✕
            </ActionIcon>
          </Group>
        </Group>

        {/* STATS STRIP */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" mt="md">
          <Paper p="xs" radius="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Text size="10px" c="#94A3B8" style={{ textTransform: 'uppercase' }}>
              Total Holidays
            </Text>
            <Text size="lg" fw={800} c="#FFFFFF">
              {stats.total} Days
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Text size="10px" c="#A5B4FC" style={{ textTransform: 'uppercase' }}>
              🟣 Gazetted (Mandatory)
            </Text>
            <Text size="lg" fw={800} c="#A5B4FC">
              {stats.gazetted} Days
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Text size="10px" c="#FED7AA" style={{ textTransform: 'uppercase' }}>
              🟠 Restricted (RH Choice)
            </Text>
            <Text size="lg" fw={800} c="#FDBA74">
              {stats.restricted} Days
            </Text>
          </Paper>

          <Paper p="xs" radius="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Text size="10px" c="#86EFAC" style={{ textTransform: 'uppercase' }}>
              🌴 Long Weekends
            </Text>
            <Text size="lg" fw={800} c="#4ADE80">
              {stats.longWeekends} Trips
            </Text>
          </Paper>
        </SimpleGrid>
      </Box>

      {/* 2. FILTER & VIEW TOGGLE CONTROLS BAR */}
      <Box p="md" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          {/* View Mode Switcher */}
          <SegmentedControl
            size="xs"
            value={viewMode}
            onChange={setViewMode}
            data={[
              { label: '📋 Timeline & List View', value: 'timeline' },
              { label: '📅 Month Calendar Grid', value: 'calendar' },
            ]}
            styles={{
              root: { backgroundColor: '#F1F5F9' },
              indicator: { backgroundColor: '#4F46E5' },
              label: { fontWeight: 600, fontSize: '11px' },
            }}
          />

          {/* Location Filter */}
          <Group gap="xs">
            <Select
              size="xs"
              placeholder="Filter by Office Location"
              value={selectedLocation}
              onChange={setSelectedLocation}
              data={OFFICE_LOCATIONS}
              leftSection={<IconBuildingCommunity size={14} color="#64748B" />}
              style={{ minWidth: '220px' }}
            />

            {/* Quarter Filter */}
            <Select
              size="xs"
              value={selectedQuarter}
              onChange={setSelectedQuarter}
              data={[
                { value: 'ALL', label: 'All Quarters (CY 2026)' },
                { value: 'Q1', label: 'Q1 (Jan – Mar)' },
                { value: 'Q2', label: 'Q2 (Apr – Jun)' },
                { value: 'Q3', label: 'Q3 (Jul – Sep)' },
                { value: 'Q4', label: 'Q4 (Oct – Dec)' },
              ]}
              style={{ width: '150px' }}
            />
          </Group>
        </Group>

        {/* Category Pills & Search */}
        <Group justify="space-between" align="center" mt="sm" wrap="wrap" gap="xs">
          <Group gap={6} wrap="wrap">
            {HOLIDAY_TYPES.map((t) => (
              <Button
                key={t.value}
                size="compact-xs"
                variant={selectedType === t.value ? 'filled' : 'light'}
                color={t.badgeColor || 'indigo'}
                onClick={() => setSelectedType(t.value)}
                styles={{
                  root: {
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                  },
                }}
              >
                {t.label} ({t.count})
              </Button>
            ))}
          </Group>

          <TextInput
            size="xs"
            placeholder="Search holiday, festival..."
            leftSection={<IconSearch size={14} color="#94A3B8" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '200px' }}
          />
        </Group>
      </Box>

      {/* 3. MAIN CONTENT BODY */}
      <Box p="md" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* VIEW A: TIMELINE & LIST VIEW */}
        {viewMode === 'timeline' && (
          <Stack gap="sm">
            {filteredHolidays.length === 0 ? (
              <Paper p="xl" ta="center" style={{ backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1' }}>
                <Text size="sm" c="#64748B">
                  No holidays match your selected filter criteria.
                </Text>
                <Button size="xs" variant="subtle" color="indigo" mt="xs" onClick={() => {
                  setSelectedLocation('ALL');
                  setSelectedType('ALL');
                  setSelectedQuarter('ALL');
                  setSearchQuery('');
                }}>
                  Reset All Filters
                </Button>
              </Paper>
            ) : (
              filteredHolidays.map((hol) => {
                const isUpcoming = new Date(hol.date) >= new Date('2026-09-06');
                const countdownStr = getHolidayCountdown(hol.date);

                return (
                  <Paper
                    key={hol.id}
                    p="sm"
                    radius="md"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: hol.isLongWeekend ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      {/* Left: Date Block & Title */}
                      <Group gap="md" align="flex-start" wrap="nowrap">
                        {/* Big Date Badge */}
                        <Paper
                          p="xs"
                          radius="md"
                          ta="center"
                          style={{
                            minWidth: '64px',
                            backgroundColor: hol.type === 'GAZETTED' ? '#EEF2FF' : hol.type === 'RESTRICTED' ? '#FFF7ED' : '#F0FDFA',
                            border: hol.type === 'GAZETTED' ? '1px solid #C7D2FE' : hol.type === 'RESTRICTED' ? '1px solid #FED7AA' : '1px solid #99F6E4',
                          }}
                        >
                          <Text size="10px" fw={800} c={hol.type === 'GAZETTED' ? '#4338CA' : hol.type === 'RESTRICTED' ? '#C2410C' : '#0F766E'} style={{ textTransform: 'uppercase' }}>
                            {MONTH_NAMES[hol.month - 1].slice(0, 3)}
                          </Text>
                          <Text size="lg" fw={800} c="#0F172A" style={{ lineHeight: 1 }}>
                            {hol.date.split('-')[2]}
                          </Text>
                          <Text size="9px" c="#64748B" mt={2}>
                            {hol.day.slice(0, 3)}
                          </Text>
                        </Paper>

                        <div>
                          <Group gap="xs" align="center">
                            <Text size="sm" fw={700} c="#0F172A">
                              {hol.name}
                            </Text>
                            {getTypeBadge(hol.type)}
                            {hol.isLongWeekend && (
                              <Badge size="xs" color="grape" variant="light" leftSection={<IconPlaneDeparture size={12} />}>
                                Long Weekend
                              </Badge>
                            )}
                          </Group>

                          <Text size="xs" c="#475569" mt={3} style={{ lineHeight: 1.4 }}>
                            {hol.description}
                          </Text>

                          {/* Long Weekend Planner Tip */}
                          {hol.longWeekendTip && (
                            <Paper
                              p="4px 8px"
                              radius="sm"
                              mt={6}
                              style={{
                                backgroundColor: '#FAF5FF',
                                border: '1px solid #E9D5FF',
                                display: 'inline-block',
                              }}
                            >
                              <Text size="10px" fw={600} c="#7E22CE">
                                💡 Vacation Pro-Tip: {hol.longWeekendTip}
                              </Text>
                            </Paper>
                          )}

                          {/* Location Applicability */}
                          <Group gap={4} mt={6}>
                            <Text size="10px" c="#94A3B8">
                              Applies to:
                            </Text>
                            {hol.locations.includes('ALL') ? (
                              <Badge size="xs" color="gray" variant="outline" styles={{ root: { height: 16, fontSize: '9px' } }}>
                                All India Branches
                              </Badge>
                            ) : (
                              hol.locations.map((loc) => (
                                <Badge key={loc} size="xs" color="blue" variant="outline" styles={{ root: { height: 16, fontSize: '9px' } }}>
                                  {loc}
                                </Badge>
                              ))
                            )}
                          </Group>
                        </div>
                      </Group>

                      {/* Right: Countdown & Action */}
                      <Stack align="flex-end" gap="xs" style={{ minWidth: '120px' }}>
                        <Badge size="sm" color={isUpcoming ? 'blue' : 'gray'} variant={isUpcoming ? 'light' : 'subtle'}>
                          {countdownStr}
                        </Badge>

                        {hol.type === 'RESTRICTED' && isUpcoming && onApplyRhLeave && (
                          <Button
                            size="xs"
                            color="orange"
                            variant="light"
                            leftSection={<IconPlus size={12} />}
                            onClick={() => {
                              onApplyRhLeave({
                                date: hol.date,
                                name: hol.name,
                              });
                              onClose();
                            }}
                          >
                            Apply RH
                          </Button>
                        )}
                      </Stack>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        )}

        {/* VIEW B: MONTH CALENDAR GRID VIEW */}
        {viewMode === 'calendar' && (
          <Stack gap="md">
            {/* Month Navigator Header */}
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ActionIcon
                  variant="default"
                  size="sm"
                  disabled={activeMonthIdx === 0}
                  onClick={() => setActiveMonthIdx((prev) => Math.max(0, prev - 1))}
                >
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <Title order={4} c="#0F172A">
                  {MONTH_NAMES[activeMonthIdx]} 2026
                </Title>
                <ActionIcon
                  variant="default"
                  size="sm"
                  disabled={activeMonthIdx === 11}
                  onClick={() => setActiveMonthIdx((prev) => Math.min(11, prev + 1))}
                >
                  <IconChevronRight size={16} />
                </ActionIcon>
              </Group>

              {/* Month Quick Jumper Pills */}
              <Group gap={4} wrap="wrap">
                {MONTH_NAMES.map((m, idx) => (
                  <Button
                    key={m}
                    size="compact-xs"
                    variant={activeMonthIdx === idx ? 'filled' : 'subtle'}
                    color="indigo"
                    onClick={() => setActiveMonthIdx(idx)}
                    styles={{ root: { fontSize: '10px', height: 22, padding: '0 6px' } }}
                  >
                    {m.slice(0, 3)}
                  </Button>
                ))}
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 12 }} spacing="md">
              {/* Calendar Grid (8 cols) */}
              <div style={{ gridColumn: 'span 8' }}>
                <Paper p="sm" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  {/* Weekday Headers */}
                  <SimpleGrid cols={7} spacing="xs" mb="xs">
                    {DAYS_OF_WEEK.map((d) => (
                      <Text key={d} size="xs" fw={700} ta="center" c={d === 'Sat' || d === 'Sun' ? '#94A3B8' : '#475569'}>
                        {d}
                      </Text>
                    ))}
                  </SimpleGrid>

                  {/* Date Cells */}
                  <SimpleGrid cols={7} spacing="xs">
                    {monthCalendarData.map((cell, idx) => {
                      const hasHoliday = cell.isCurrentMonth && cell.holidays && cell.holidays.length > 0;
                      const hol = hasHoliday ? cell.holidays[0] : null;

                      let cellBg = '#FFFFFF';
                      let borderColor = '#F1F5F9';
                      let textColor = '#0F172A';

                      if (!cell.isCurrentMonth) {
                        cellBg = '#F8FAFC';
                        textColor = '#CBD5E1';
                      } else if (hasHoliday) {
                        if (hol.type === 'GAZETTED') {
                          cellBg = '#EEF2FF';
                          borderColor = '#C7D2FE';
                          textColor = '#312E81';
                        } else if (hol.type === 'RESTRICTED') {
                          cellBg = '#FFF7ED';
                          borderColor = '#FED7AA';
                          textColor = '#9A3412';
                        } else {
                          cellBg = '#F0FDFA';
                          borderColor = '#99F6E4';
                          textColor = '#115E59';
                        }
                      } else if (cell.isWeekend) {
                        cellBg = '#F8FAFC';
                        textColor = '#94A3B8';
                      }

                      return (
                        <Paper
                          key={idx}
                          p="xs"
                          radius="sm"
                          style={{
                            backgroundColor: cellBg,
                            border: `1px solid ${borderColor}`,
                            minHeight: '64px',
                            cursor: hasHoliday ? 'pointer' : 'default',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={() => {
                            if (hasHoliday) setSelectedHolidayDetail(hol);
                          }}
                        >
                          <Group justify="space-between" align="flex-start">
                            <Text size="xs" fw={hasHoliday ? 800 : 500} c={textColor}>
                              {cell.day}
                            </Text>
                            {hasHoliday && (
                              <Box
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: hol.type === 'GAZETTED' ? '#4F46E5' : hol.type === 'RESTRICTED' ? '#EA580C' : '#0D9488',
                                }}
                              />
                            )}
                          </Group>

                          {hasHoliday && (
                            <Text size="9px" fw={700} c={textColor} lineClamp={2} mt={4} style={{ lineHeight: 1.1 }}>
                              {hol.name}
                            </Text>
                          )}
                        </Paper>
                      );
                    })}
                  </SimpleGrid>
                </Paper>
              </div>

              {/* Holiday Details Inspector Side-Panel (4 cols) */}
              <div style={{ gridColumn: 'span 4' }}>
                <Paper p="md" radius="md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
                  <Text size="xs" fw={700} c="#0F172A" mb="xs" style={{ textTransform: 'uppercase' }}>
                    Holiday Inspector
                  </Text>

                  {selectedHolidayDetail ? (
                    <Stack gap="xs">
                      <Group gap="xs">
                        <Text size="sm" fw={800} c="#0F172A">
                          {selectedHolidayDetail.name}
                        </Text>
                      </Group>
                      {getTypeBadge(selectedHolidayDetail.type)}

                      <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <Text size="11px" fw={600} c="#475569">
                          📅 {selectedHolidayDetail.date} ({selectedHolidayDetail.day})
                        </Text>
                        <Text size="11px" c="#64748B" mt={2}>
                          ⏳ {getHolidayCountdown(selectedHolidayDetail.date)}
                        </Text>
                      </Paper>

                      <Text size="xs" c="#334155" style={{ lineHeight: 1.4 }}>
                        {selectedHolidayDetail.description}
                      </Text>

                      {selectedHolidayDetail.longWeekendTip && (
                        <Alert color="grape" icon={<IconSparkles size={14} />} p="xs">
                          <Text size="10px" fw={600}>
                            {selectedHolidayDetail.longWeekendTip}
                          </Text>
                        </Alert>
                      )}

                      {selectedHolidayDetail.type === 'RESTRICTED' && onApplyRhLeave && (
                        <Button
                          fullWidth
                          size="xs"
                          color="orange"
                          leftSection={<IconPlus size={14} />}
                          mt="xs"
                          onClick={() => {
                            onApplyRhLeave({
                              date: selectedHolidayDetail.date,
                              name: selectedHolidayDetail.name,
                            });
                            onClose();
                          }}
                        >
                          Request Restricted Leave (RH)
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    <Stack align="center" justify="center" p="md" style={{ height: '80%' }}>
                      <ThemeIcon size="lg" radius="xl" color="indigo" variant="light">
                        <IconCalendarEvent size={20} />
                      </ThemeIcon>
                      <Text size="xs" c="#64748B" ta="center">
                        Click on any highlighted date in the calendar to view full festival details and leave tips.
                      </Text>
                    </Stack>
                  )}
                </Paper>
              </div>
            </SimpleGrid>
          </Stack>
        )}
      </Box>

      {/* 4. FOOTER NOTE */}
      <Box p="sm" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <Group justify="space-between" align="center">
          <Text size="10px" c="#64748B">
            📌 Employees are entitled to 16 Gazetted Holidays + up to 3 Restricted Holidays (RH) per calendar year.
          </Text>
          <Button size="xs" variant="default" onClick={onClose}>
            Close Calendar
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};
