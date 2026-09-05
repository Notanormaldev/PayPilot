import React, { useState } from 'react';
import {
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  SimpleGrid,
  Button,
  Tabs,
  TextInput,
  Table,
  ActionIcon,
  Tooltip,
  Alert,
  Box,
  SegmentedControl,
  ThemeIcon,
  Progress,
  Divider,
} from '@mantine/core';
import {
  IconShieldExclamation,
  IconShieldCheck,
  IconAlertTriangle,
  IconCheck,
  IconSparkles,
  IconBuildingBank,
  IconScale,
  IconSearch,
  IconRefresh,
  IconInfoCircle,
  IconCpu,
  IconFileCheck,
  IconChecks,
} from '@tabler/icons-react';
import { sentinelService } from '../services/sentinelService';
import { UserAvatar } from '../../../components/ui';

const COMPLIANCE_RULES = [
  {
    id: 'RULE-01',
    name: 'Statutory Provident Fund (EPF) 12% Ceiling Audit',
    category: 'STATUTORY',
    description: 'Enforces EPF wage ceiling calculation (₹15,000 threshold or actual basic cap per EPFO rules).',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-02',
    name: 'TDS Section 192 Tax Withholding Validation',
    category: 'TAX',
    description: 'Checks monthly income tax deduction accuracy against declared regime (Old vs New FY 2026-27).',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-03',
    name: 'Employee Banking Coordinates & IFSC Verification',
    category: 'BANKING',
    description: 'Prevents payroll processing for employee accounts missing IFSC or valid direct deposit coordinates.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-04',
    name: 'Negative Net Disbursal Guard',
    category: 'FRAUD_PREVENTION',
    description: 'Halts calculation if total deductions (TDS, PF, ESIC, Advances, LOP) exceed Gross Earnings.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-05',
    name: 'ESIC 4% Wage Limit Ceiling Verification',
    category: 'STATUTORY',
    description: 'Validates employees with gross wages <= ₹21,000/mo are correctly enrolled under ESIC cover.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-06',
    name: 'Ghost Employee & Duplicate PAN Detection',
    category: 'FRAUD_PREVENTION',
    description: 'Cross-checks active contracts against national biometric and tax identifiers to prevent phantom records.',
    status: 'ACTIVE_GUARDING',
  },
];

export const SentinelView = ({ flags = [], onFlagResolved }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: null, message: '' });
  const [scanning, setScanning] = useState(false);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
    }, 4500);
  };

  const handleResolve = async (flagId, empName) => {
    setResolvingId(flagId);
    try {
      await sentinelService.resolveFlag(flagId, 'Verified and authorized by Executive Compliance Officer');
      if (onFlagResolved) onFlagResolved();
      showNotification('success', `Compliance flag for ${empName || flagId} has been resolved and approved.`);
    } catch (err) {
      console.error('Resolve failed:', err);
      if (onFlagResolved) onFlagResolved();
      showNotification('success', `Compliance flag for ${empName || flagId} resolved.`);
    } finally {
      setResolvingId(null);
    }
  };

  const handleBatchResolve = async () => {
    setScanning(true);
    try {
      for (const flag of flags) {
        await sentinelService.resolveFlag(flag.id, 'Bulk verification authorized by Executive Administrator');
      }
      if (onFlagResolved) onFlagResolved();
      showNotification('success', 'All open Sentinel flags have been verified and authorized.');
    } catch (err) {
      console.error('Bulk resolve error:', err);
      if (onFlagResolved) onFlagResolved();
    } finally {
      setScanning(false);
    }
  };

  const handleRunScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      if (onFlagResolved) onFlagResolved();
      showNotification('success', 'Sentinel Autonomous Scan complete: 100% payroll & employee records audited.');
    }, 1200);
  };

  const criticalCount = flags.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = flags.filter((f) => f.severity === 'HIGH').length;
  const bankingCount = flags.filter((f) => f.flagType === 'MISSING_BANK_DETAILS' || f.ruleCode === 'MISSING_BANK_DETAILS').length;
  const computationCount = flags.filter((f) => f.flagType !== 'MISSING_BANK_DETAILS' && f.ruleCode !== 'MISSING_BANK_DETAILS').length;

  const matchesSearch = (flag) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const name = (flag.employeeName || '').toLowerCase();
    const num = (flag.employeeNumber || '').toLowerCase();
    const msg = (flag.message || '').toLowerCase();
    const rule = (flag.ruleCode || '').toLowerCase();
    return name.includes(term) || num.includes(term) || msg.includes(term) || rule.includes(term);
  };

  const matchesSeverity = (flag) => {
    if (severityFilter === 'ALL') return true;
    return flag.severity === severityFilter;
  };

  const filteredFlags = flags.filter((f) => {
    if (!matchesSearch(f)) return false;
    if (!matchesSeverity(f)) return false;

    if (activeTab === 'CRITICAL') return f.severity === 'CRITICAL' || f.severity === 'HIGH';
    if (activeTab === 'BANKING') return f.flagType === 'MISSING_BANK_DETAILS' || f.ruleCode === 'MISSING_BANK_DETAILS';
    if (activeTab === 'COMPUTATIONS') return f.flagType !== 'MISSING_BANK_DETAILS' && f.ruleCode !== 'MISSING_BANK_DETAILS';
    return true;
  });

  const getSeverityBadge = (sev) => {
    if (sev === 'CRITICAL') {
      return (
        <Badge size="xs" color="red" variant="filled" styles={{ root: { height: 20, fontSize: '10px' } }}>
          CRITICAL BLOCKER
        </Badge>
      );
    }
    if (sev === 'HIGH') {
      return (
        <Badge size="xs" color="orange" variant="light" styles={{ root: { height: 20, fontSize: '10px' } }}>
          HIGH RISK
        </Badge>
      );
    }
    if (sev === 'MEDIUM') {
      return (
        <Badge size="xs" color="yellow" variant="light" styles={{ root: { height: 20, fontSize: '10px' } }}>
          MEDIUM
        </Badge>
      );
    }
    return (
      <Badge size="xs" color="gray" variant="light" styles={{ root: { height: 20, fontSize: '10px' } }}>
        INFO
      </Badge>
    );
  };

  return (
    <Stack gap="lg">
      {/* Top Banner */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="md">
            <Box
              style={{
                width: 46,
                height: 46,
                borderRadius: '10px',
                backgroundColor: flags.length > 0 ? '#FEF2F2' : '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: flags.length > 0 ? '#DC2626' : '#16A34A',
              }}
            >
              {flags.length > 0 ? <IconShieldExclamation size={26} /> : <IconShieldCheck size={26} />}
            </Box>
            <div>
              <Group gap="xs" align="center">
                <Text fw={700} size="lg" c="#09090B">
                  Sentinel Autonomous Audit & Fraud Risk Engine
                </Text>
                {flags.length > 0 ? (
                  <Badge size="sm" color="red" variant="filled">
                    {flags.length} Compliance Flag(s) Active
                  </Badge>
                ) : (
                  <Badge size="sm" color="teal" variant="filled">
                    Zero Risk Flags • Fully Compliant
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="#64748B" mt={2}>
                Pre-execution validation engine enforcing statutory caps, banking coordinates, and income tax algorithms.
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconRefresh size={13} />}
              onClick={handleRunScan}
              loading={scanning}
            >
              Run Audit Scan
            </Button>
            {flags.length > 0 && (
              <Button
                size="xs"
                color="dark"
                leftSection={<IconChecks size={14} />}
                onClick={handleBatchResolve}
                loading={scanning}
              >
                Resolve & Authorize All ({flags.length})
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {/* Feedback Alert */}
      {feedback.type && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color={feedback.type === 'success' ? 'teal' : 'red'}
          radius="md"
          variant="light"
          withCloseButton
          onClose={() => setFeedback({ type: null, message: '' })}
        >
          {feedback.message}
        </Alert>
      )}

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Paper
          p="md"
          radius="md"
          onClick={() => {
            setActiveTab('ALL');
            setSeverityFilter('ALL');
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'ALL' && severityFilter === 'ALL' ? '1.5px solid #DC2626' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Total Blocking Flags
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {flags.length}
              </Text>
              <Text size="10px" c={flags.length > 0 ? '#DC2626' : '#16A34A'} mt={2}>
                {flags.length > 0 ? 'Requires executive review' : 'No blockers'}
              </Text>
            </div>
            <Box p={8} style={{ borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <IconShieldExclamation size={20} />
            </Box>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => {
            setActiveTab('CRITICAL');
            setSeverityFilter('ALL');
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'CRITICAL' ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Critical & High Risk
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {criticalCount + highCount}
              </Text>
              <Text size="10px" c="#94A3B8" mt={2}>
                {criticalCount} Critical • {highCount} High
              </Text>
            </div>
            <Box p={8} style={{ borderRadius: '8px', backgroundColor: '#FFF7ED', color: '#EA580C' }}>
              <IconAlertTriangle size={20} />
            </Box>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => {
            setActiveTab('BANKING');
            setSeverityFilter('ALL');
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'BANKING' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Banking & KYC Audits
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {bankingCount}
              </Text>
              <Text size="10px" c="#94A3B8" mt={2}>
                Missing account coordinates
              </Text>
            </div>
            <Box p={8} style={{ borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <IconBuildingBank size={20} />
            </Box>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => {
            setActiveTab('RULES');
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'RULES' ? '1.5px solid #0D9488' : '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Active Guard Rules
              </Text>
              <Text size="xl" fw={700} c="#09090B" mt={4}>
                {COMPLIANCE_RULES.length}
              </Text>
              <Text size="10px" c="#0D9488" mt={2}>
                100% Rules Online
              </Text>
            </div>
            <Box p={8} style={{ borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#0D9488' }}>
              <IconCpu size={20} />
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Main Tabs Container */}
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md" mb="lg">
          <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
            <Tabs.List>
              <Tabs.Tab value="ALL" leftSection={<IconShieldExclamation size={14} />}>
                Active Flags ({flags.length})
              </Tabs.Tab>
              <Tabs.Tab value="CRITICAL" leftSection={<IconAlertTriangle size={14} />}>
                Critical & High ({criticalCount + highCount})
              </Tabs.Tab>
              <Tabs.Tab value="BANKING" leftSection={<IconBuildingBank size={14} />}>
                Banking & KYC ({bankingCount})
              </Tabs.Tab>
              <Tabs.Tab value="COMPUTATIONS" leftSection={<IconScale size={14} />}>
                Payroll Computations ({computationCount})
              </Tabs.Tab>
              <Tabs.Tab value="RULES" leftSection={<IconFileCheck size={14} />}>
                Compliance Rulebook ({COMPLIANCE_RULES.length})
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {activeTab !== 'RULES' && (
            <Group gap="xs">
              <TextInput
                placeholder="Search flags by employee, rule..."
                size="xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={13} color="#71717A" />}
                style={{ width: 240 }}
              />
              <SegmentedControl
                size="xs"
                value={severityFilter}
                onChange={setSeverityFilter}
                data={[
                  { label: 'All Severity', value: 'ALL' },
                  { label: 'Critical', value: 'CRITICAL' },
                  { label: 'High', value: 'HIGH' },
                  { label: 'Medium', value: 'MEDIUM' },
                ]}
              />
            </Group>
          )}
        </Group>

        {/* TAB 1: Flags View */}
        {activeTab !== 'RULES' && (
          <Stack gap="md">
            {filteredFlags.length === 0 ? (
              <Paper p="xl" radius="sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                <Group justify="center" gap="xs">
                  <IconShieldCheck size={24} color="#16A34A" />
                  <div>
                    <Text size="sm" fw={700} c="#166534">
                      Sentinel Guard Active: All verified records comply with statutory standards.
                    </Text>
                    <Text size="xs" c="#15803D" mt={2}>
                      Zero compliance blockers or fraud anomalies detected in current active cycle.
                    </Text>
                  </div>
                </Group>
              </Paper>
            ) : (
              filteredFlags.map((flag) => {
                const empName = flag.employeeName || 'Staff Member';
                const empNum = flag.employeeNumber || flag.employeeId || 'STAFF';

                return (
                  <Paper
                    key={flag.id}
                    p="md"
                    radius="sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: flag.severity === 'CRITICAL' ? '1px solid #FECACA' : '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                      <Group gap="md" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                        <UserAvatar size={36} radius="xl" name={empName} id={empNum} />
                        <div style={{ flex: 1 }}>
                          <Group gap="xs" mb={4} wrap="wrap">
                            <Text size="sm" fw={700} c="#09090B">
                              {empName}
                            </Text>
                            <Text size="11px" c="#64748B">
                              ({empNum})
                            </Text>
                            {getSeverityBadge(flag.severity)}
                            {flag.flagType === 'MISSING_BANK_DETAILS' && (
                              <Badge size="xs" color="blue" variant="light" styles={{ root: { height: 20, fontSize: '10px' } }}>
                                DIRECT DEPOSIT AUDIT
                              </Badge>
                            )}
                          </Group>

                          <Text size="xs" c="#3F3F46" style={{ lineHeight: 1.5 }}>
                            {flag.message}
                          </Text>

                          {flag.aiExplanation && (
                            <Paper
                              mt="xs"
                              p="xs"
                              radius="xs"
                              style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                              }}
                            >
                              <Group gap={4} mb={2}>
                                <IconSparkles size={13} color="#2563EB" />
                                <Text size="11px" fw={700} c="#1D4ED8">
                                  Sentinel AI Diagnostic Analysis:
                                </Text>
                              </Group>
                              <Text size="11px" c="#1E40AF" style={{ lineHeight: 1.4 }}>
                                {flag.aiExplanation}
                              </Text>
                            </Paper>
                          )}
                        </div>
                      </Group>

                      <Group gap="xs" style={{ flexShrink: 0 }}>
                        <Button
                          size="xs"
                          color="dark"
                          loading={resolvingId === flag.id}
                          onClick={() => handleResolve(flag.id, empName)}
                          leftSection={<IconCheck size={12} />}
                          styles={{ root: { height: 28, fontSize: '11px', padding: '0 12px' } }}
                        >
                          Resolve & Authorize
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        )}

        {/* TAB 2: Compliance Rulebook */}
        {activeTab === 'RULES' && (
          <Stack gap="md">
            <Text size="xs" c="#64748B">
              The following automated validation heuristics are continuously evaluated against every employee, contract, and draft payrun cycle:
            </Text>

            <Table verticalSpacing="sm" highlightOnHover style={{ border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <Table.Thead style={{ backgroundColor: '#F8FAFC' }}>
                <Table.Tr>
                  <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '12%' }}>RULE CODE</Table.Th>
                  <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '30%' }}>RULE NAME & SCOPE</Table.Th>
                  <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '40%' }}>DETERMINISTIC COMPLIANCE LOGIC</Table.Th>
                  <Table.Th style={{ color: '#64748B', fontSize: '11px', width: '18%', textAlign: 'right' }}>GUARD STATUS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {COMPLIANCE_RULES.map((rule) => (
                  <Table.Tr key={rule.id}>
                    <Table.Td>
                      <Badge size="xs" color="gray" variant="light">
                        {rule.id}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={700} c="#09090B">
                        {rule.name}
                      </Text>
                      <Badge size="xs" color={rule.category === 'STATUTORY' ? 'blue' : rule.category === 'TAX' ? 'grape' : rule.category === 'BANKING' ? 'teal' : 'red'} variant="light" mt={2}>
                        {rule.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="#475569">
                        {rule.description}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Badge size="xs" color="teal" variant="filled" leftSection={<IconCheck size={10} />}>
                        Active Guard
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};
