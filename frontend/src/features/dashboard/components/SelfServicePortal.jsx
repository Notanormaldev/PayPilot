import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  SimpleGrid,
  Box,
  Badge,
  Modal,
  Table,
  Divider,
} from '@mantine/core';
import {
  IconReceipt2,
  IconCoin,
  IconGift,
  IconFileText,
  IconClockCheck,
  IconClockOff,
  IconDownload,
} from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';
import { useAuthUser } from '../../auth/hooks/useAuthUser';
import { attendanceService } from '../../attendance/services/attendanceService';
import { generatePayslipPdf } from '../../../lib/payslipPdfGenerator';

export const SelfServicePortal = () => {
  const { user } = useAuthUser();
  const userName = user?.name || 'Aarav Sharma';
  const userEmail = user?.email || 'employee@paypilot.com';

  // Dynamic Shift State & Local Storage Persistence
  const [checkedIn, setCheckedIn] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_checked_in');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [checkInTime, setCheckInTime] = useState(() => {
    const saved = localStorage.getItem('paypilot_shift_start');
    return saved ? parseInt(saved, 10) : Date.now() - (3 * 3600 + 43 * 60 + 52) * 1000;
  });

  const [elapsedSec, setElapsedSec] = useState(0);
  const [punching, setPunching] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'salary' | 'payslip' | 'earnings' | 'benefits'

  // Timer loop based on real clock timestamps
  useEffect(() => {
    let interval = null;
    if (checkedIn && checkInTime) {
      const updateElapsed = () => {
        const diff = Math.max(0, Math.floor((Date.now() - checkInTime) / 1000));
        setElapsedSec(diff);
      };
      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkedIn, checkInTime]);

  const handleTogglePunch = async () => {
    setPunching(true);
    const newCheckedIn = !checkedIn;
    const now = Date.now();

    try {
      await attendanceService.recordPunch(user?.id || 'emp_1', newCheckedIn ? 'CHECK_IN' : 'CHECK_OUT');
    } catch (e) {
      console.warn('Punch recording API fallback:', e.message);
    } finally {
      setPunching(false);
    }

    setCheckedIn(newCheckedIn);
    localStorage.setItem('paypilot_shift_checked_in', JSON.stringify(newCheckedIn));

    if (newCheckedIn) {
      setCheckInTime(now);
      localStorage.setItem('paypilot_shift_start', now.toString());
    } else {
      localStorage.removeItem('paypilot_shift_start');
    }
  };

  const formatTime = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  };

  const formatCheckInDisplay = () => {
    if (!checkInTime || !checkedIn) return 'Not Checked In';
    return new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadPayslip = () => {
    generatePayslipPdf(
      {
        month: 'August 2026',
        date: '31-Aug-2026',
        id: 'PS-2026-08',
        gross: 116000,
        deductions: 20700,
        net: 95300,
      },
      {
        name: userName,
        id: 'EMP-8492',
        department: 'Engineering & Product',
        designation: 'Staff Software Engineer',
      }
    );
  };

  return (
    <>
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
        }}
      >
        <Group justify="space-between" align="center" mb="xs">
          <Text fw={700} size="xs" c="#92400E" style={{ letterSpacing: '0.5px' }}>
            EMPLOYEE SELF-SERVICE PORTAL
          </Text>
          <Badge size="xs" color={checkedIn ? 'teal' : 'gray'} variant="light">
            {checkedIn ? 'Active Shift' : 'Off Clock'}
          </Badge>
        </Group>

        <Stack gap="sm">
          {/* User Greeting */}
          <Group gap="xs">
            <UserAvatar
              size={36}
              radius="xl"
              name={userName}
              id="EMP-8492"
            />
            <div>
              <Text size="xs" fw={700} c="#09090B">
                Hello! {userName}
              </Text>
              <Text size="10px" c="#71717A">
                {userEmail} • Engineering
              </Text>
            </div>
          </Group>

          {/* Dynamic Live Shift Timer Box */}
          <Box
            p="xs"
            style={{
              backgroundColor: '#09090B',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Text size="10px" c="#A1A1AA" fw={600} style={{ letterSpacing: '0.5px' }} mb={2}>
              LIVE TODAY'S WORK TIME
            </Text>

            <Text size="20px" fw={800} c="#F59E0B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {checkedIn ? formatTime(elapsedSec) : '00 : 00 : 00'}
            </Text>

            <Group justify="space-between" px={4} mt={2} mb={6}>
              <Text size="9px" c="#94A3B8">
                Check-In: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatCheckInDisplay()}</span>
              </Text>
              <Text size="9px" c="#94A3B8">
                Target: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>08h 00m</span>
              </Text>
            </Group>

            <Button
              size="xs"
              color={checkedIn ? 'orange' : 'teal'}
              fullWidth
              loading={punching}
              onClick={handleTogglePunch}
              leftSection={checkedIn ? <IconClockOff size={14} /> : <IconClockCheck size={14} />}
              styles={{
                root: { height: 28, fontSize: '11px', fontWeight: 700 },
              }}
            >
              {checkedIn ? 'Check Out of Shift' : 'Clock In for Shift'}
            </Button>
          </Box>

          {/* Salary Details & Interactive Action Grid */}
          <div>
            <Text size="11px" fw={700} c="#09090B" mb={6}>
              Quick Employee Services
            </Text>
            <SimpleGrid cols={2} spacing="xs">
              <Paper
                p="xs"
                radius="sm"
                onClick={() => setActiveModal('salary')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FDE68A',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconCoin size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
                <Text size="10px" fw={600} c="#09090B">
                  Salary Details
                </Text>
              </Paper>

              <Paper
                p="xs"
                radius="sm"
                onClick={() => setActiveModal('payslip')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FDE68A',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconReceipt2 size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
                <Text size="10px" fw={600} c="#09090B">
                  Payslip Statement
                </Text>
              </Paper>

              <Paper
                p="xs"
                radius="sm"
                onClick={() => setActiveModal('earnings')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FDE68A',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconFileText size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
                <Text size="10px" fw={600} c="#09090B">
                  YTD Earnings
                </Text>
              </Paper>

              <Paper
                p="xs"
                radius="sm"
                onClick={() => setActiveModal('benefits')}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FDE68A',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconGift size={16} color="#D97706" style={{ margin: '0 auto 2px' }} />
                <Text size="10px" fw={600} c="#09090B">
                  Benefits & Perks
                </Text>
              </Paper>
            </SimpleGrid>
          </div>
        </Stack>
      </Paper>

      {/* Salary Structure Modal */}
      <Modal
        opened={activeModal === 'salary'}
        onClose={() => setActiveModal(null)}
        title="Monthly Salary Structure Breakdown"
        centered
        size="md"
      >
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="xs" c="#64748B">Employee</Text>
            <Text size="xs" fw={700} c="#09090B">{userName} (EMP-8492)</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="#64748B">Pay Structure</Text>
            <Badge size="xs" color="blue">Regular Full-Time (Executive)</Badge>
          </Group>
          <Divider my={4} />
          <Table verticalSpacing="xs">
            <Table.Tbody>
              <Table.Tr><Table.Td style={{ fontSize: 12 }}>Basic Salary</Table.Td><Table.Td style={{ textAlign: 'right', fontWeight: 600, fontSize: 12 }}>₹72,500</Table.Td></Table.Tr>
              <Table.Tr><Table.Td style={{ fontSize: 12 }}>House Rent Allowance (HRA)</Table.Td><Table.Td style={{ textAlign: 'right', fontWeight: 600, fontSize: 12 }}>₹29,000</Table.Td></Table.Tr>
              <Table.Tr><Table.Td style={{ fontSize: 12 }}>Special Allowance</Table.Td><Table.Td style={{ textAlign: 'right', fontWeight: 600, fontSize: 12 }}>₹14,500</Table.Td></Table.Tr>
              <Table.Tr><Table.Td style={{ fontSize: 12, color: '#DC2626' }}>Provident Fund (PF) Deduction</Table.Td><Table.Td style={{ textAlign: 'right', fontWeight: 600, fontSize: 12, color: '#DC2626' }}>-₹7,250</Table.Td></Table.Tr>
              <Table.Tr><Table.Td style={{ fontSize: 12, color: '#DC2626' }}>TDS Income Tax Deduction</Table.Td><Table.Td style={{ textAlign: 'right', fontWeight: 600, fontSize: 12, color: '#DC2626' }}>-₹13,450</Table.Td></Table.Tr>
            </Table.Tbody>
          </Table>
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Group justify="space-between">
              <Text size="xs" fw={700} c="#1E40AF">Net Take-Home Monthly Salary</Text>
              <Text size="sm" fw={800} c="#1D4ED8">₹95,300</Text>
            </Group>
          </Paper>
        </Stack>
      </Modal>

      {/* Payslip Modal */}
      <Modal
        opened={activeModal === 'payslip'}
        onClose={() => setActiveModal(null)}
        title="Official Payslip Download"
        centered
        size="sm"
      >
        <Stack gap="sm" style={{ textAlign: 'center' }}>
          <Text size="xs" c="#475569">
            Download your official digitally verified PDF payslip statement for August 2026.
          </Text>
          <Button
            color="dark"
            leftSection={<IconDownload size={16} />}
            onClick={() => {
              handleDownloadPayslip();
              setActiveModal(null);
            }}
          >
            Download PDF Payslip
          </Button>
        </Stack>
      </Modal>

      {/* Earnings Modal */}
      <Modal
        opened={activeModal === 'earnings'}
        onClose={() => setActiveModal(null)}
        title="YTD Financial Year Summary"
        centered
        size="md"
      >
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="xs" c="#64748B">FY 2026-27 Gross Income</Text>
            <Text size="sm" fw={800} c="#09090B">₹13,92,000</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="#64748B">Total TDS Deducted</Text>
            <Text size="xs" fw={700} c="#DC2626">₹1,61,400</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="#64748B">EPF Accumulated</Text>
            <Text size="xs" fw={700} c="#059669">₹87,000</Text>
          </Group>
        </Stack>
      </Modal>

      {/* Benefits Modal */}
      <Modal
        opened={activeModal === 'benefits'}
        onClose={() => setActiveModal(null)}
        title="Employee Benefits & Corporate Coverage"
        centered
        size="md"
      >
        <Stack gap="xs">
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B">🏥 Group Health Insurance (Floater)</Text>
            <Text size="11px" c="#64748B">₹10,00,000 coverage for employee + dependents (ICICI Lombard)</Text>
          </Paper>
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B">🌴 Annual Paid Leave Allowance</Text>
            <Text size="11px" c="#64748B">37 Days Total (Casual: 12, Sick: 10, Earned: 15)</Text>
          </Paper>
          <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Text size="xs" fw={700} c="#09090B">🎓 Learning & Development Allowance</Text>
            <Text size="11px" c="#64748B">₹50,000 annual reimbursement for certifications & courses</Text>
          </Paper>
        </Stack>
      </Modal>
    </>
  );
};
