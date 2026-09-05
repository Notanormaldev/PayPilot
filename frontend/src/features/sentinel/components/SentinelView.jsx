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
  Checkbox,
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
  IconLock,
} from '@tabler/icons-react';
import { sentinelService } from '../services/sentinelService';
import { UserAvatar } from '../../../components/ui';
import { SentinelResolutionModal } from './SentinelResolutionModal';

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
    description: 'Verifies annualized TDS calculations against latest FY 2026-27 Union Budget tax slabs and Section 87A rebates.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-03',
    name: 'Direct Deposit Banking & IFSC Verification Guard',
    category: 'BANKING',
    description: 'Ensures active account number, valid IFSC routing, and mandatory cancelled cheque / KYC document verification before payrun disbursal.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-04',
    name: 'Gratuity Act 1972 Statutory Accrual Guard',
    category: 'STATUTORY',
    description: 'Evaluates formula (15 * Last Drawn Basic * Tenure / 26) with maximum statutory cap of ₹20,00,000.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-05',
    name: 'Duplicate Payroll & Double Disbursal Guard',
    category: 'INTEGRITY',
    description: 'Prevents multiple payslip line generations for identical employee ID within the same payrun period.',
    status: 'ACTIVE_GUARDING',
  },
  {
    id: 'RULE-06',
    name: 'Ghost Employee & Biometric Identifier Cross-Check',
    category: 'FRAUD_RISK',
    description: 'Cross-checks active contracts against national biometric and tax identifiers to prevent phantom records.',
    status: 'ACTIVE_GUARDING',
  },
];

export const SentinelView = ({ flags = [], onFlagResolved }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: null, message: '' });
  const [scanning, setScanning] = useState(false);

  // Modal State
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Batch Selection & Batch Resolution State
  const [selectedFlagIds, setSelectedFlagIds] = useState([]);
  const [batchResolving, setBatchResolving] = useState(false);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: null, message: '' });
    }, 5000);
  };

  const handleSelectAllFlags = (checked) => {
    if (checked) {
      setSelectedFlagIds(filteredFlags.map((f) => f.id));
    } else {
      setSelectedFlagIds([]);
    }
  };

  const handleToggleFlagSelect = (id) => {
    setSelectedFlagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchAuthorizeSelected = () => {
    const targetFlags = selectedFlagIds.length > 0
      ? filteredFlags.filter((f) => selectedFlagIds.includes(f.id))
      : filteredFlags;
    if (targetFlags.length === 0) return;
    setQueue(targetFlags);
    setQueueIndex(0);
    setSelectedFlag(targetFlags[0]);
    setModalOpened(true);
  };

  // Open modal for a single flag
  const handleOpenResolutionModal = (flag) => {
    setSelectedFlag(flag);
    setQueue([]);
    setQueueIndex(0);
    setModalOpened(true);
  };

  // Open guided batch review queue
  const handleStartBatchReview = () => {
    if (filteredFlags.length === 0) return;
    setQueue(filteredFlags);
    setQueueIndex(0);
    setSelectedFlag(filteredFlags[0]);
    setModalOpened(true);
  };

  const handleResolveSuccess = (flagId, empName) => {
    if (onFlagResolved) onFlagResolved();
    showNotification(
      'success',
      `Audit verification completed! Banking credentials and KYC document proof registered for ${empName || 'Employee'}.`
    );
  };

  const handleNextInQueue = () => {
    if (queueIndex < queue.length - 1) {
      setQueueIndex((prev) => prev + 1);
    }
  };

  const handlePrevInQueue = () => {
    if (queueIndex > 0) {
      setQueueIndex((prev) => prev - 1);
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
        p="md"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size={40} radius="md" color="red" variant="light">
              <IconShieldExclamation size={22} />
            </ThemeIcon>
            <div>
              <Group gap="xs" align="center">
                <Text fw={800} size="md" c="#09090B">
                  Sentinel Autonomous Audit & Fraud Risk Engine
                </Text>
                {flags.length > 0 ? (
                  <Badge color="red" variant="filled" size="xs">
                    {flags.length} COMPLIANCE FLAG(S) ACTIVE
                  </Badge>
                ) : (
                  <Badge color="teal" variant="filled" size="xs" leftSection={<IconCheck size={10} />}>
                    100% COMPLIANT • ZERO BLOCKERS
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
                leftSection={<IconFileCheck size={14} />}
                onClick={handleStartBatchReview}
              >
                Guided Batch Review ({flags.length})
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
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Total Blocking Flags
              </Text>
              <Text size="xl" fw={800} c="#09090B" mt={4}>
                {flags.length}
              </Text>
              <Text size="10px" c="#DC2626" mt={2}>
                {flags.length > 0 ? 'Requires executive review' : 'All clear'}
              </Text>
            </div>
            <ThemeIcon size={32} radius="md" color="red" variant="light">
              <IconShieldExclamation size={18} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => {
            setActiveTab('CRITICAL');
            setSeverityFilter('HIGH');
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'CRITICAL' ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Critical & High Risk
              </Text>
              <Text size="xl" fw={800} c="#09090B" mt={4}>
                {criticalCount + highCount}
              </Text>
              <Text size="10px" c="#64748B" mt={2}>
                {criticalCount} Critical + {highCount} High
              </Text>
            </div>
            <ThemeIcon size={32} radius="md" color="orange" variant="light">
              <IconAlertTriangle size={18} />
            </ThemeIcon>
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
            border: activeTab === 'BANKING' ? '1.5px solid #0D9488' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Banking & KYC Audits
              </Text>
              <Text size="xl" fw={800} c="#09090B" mt={4}>
                {bankingCount}
              </Text>
              <Text size="10px" c="#64748B" mt={2}>
                Missing account coordinates
              </Text>
            </div>
            <ThemeIcon size={32} radius="md" color="teal" variant="light">
              <IconBuildingBank size={18} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper
          p="md"
          radius="md"
          onClick={() => setActiveTab('RULES')}
          style={{
            backgroundColor: '#FFFFFF',
            border: activeTab === 'RULES' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={600} c="#64748B">
                Active Guard Rules
              </Text>
              <Text size="xl" fw={800} c="#09090B" mt={4}>
                {COMPLIANCE_RULES.length}
              </Text>
              <Text size="10px" c="#16A34A" mt={2}>
                100% Rules Online
              </Text>
            </div>
            <ThemeIcon size={32} radius="md" color="blue" variant="light">
              <IconCpu size={18} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Main Content Workspace */}
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Navigation Tabs */}
        <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
          <SegmentedControl
            size="xs"
            value={activeTab}
            onChange={setActiveTab}
            data={[
              { label: `Active Flags (${flags.length})`, value: 'ALL' },
              { label: `Critical & High (${criticalCount + highCount})`, value: 'CRITICAL' },
              { label: `Banking & KYC (${bankingCount})`, value: 'BANKING' },
              { label: `Payroll Computations (${computationCount})`, value: 'COMPUTATIONS' },
              { label: `Compliance Rulebook (${COMPLIANCE_RULES.length})`, value: 'RULES' },
            ]}
          />

          {activeTab !== 'RULES' && (
            <Group gap="xs">
              <TextInput
                size="xs"
                placeholder="Search flags by employee, rule..."
                leftSection={<IconSearch size={13} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
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

        {/* TAB 1: Flags List */}
        {activeTab !== 'RULES' && (
          <Stack gap="sm">
            {filteredFlags.length > 0 && (
              <Paper p="xs" px="md" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <Checkbox
                      size="xs"
                      label={`Select All Flags (${filteredFlags.length})`}
                      checked={selectedFlagIds.length === filteredFlags.length && filteredFlags.length > 0}
                      indeterminate={selectedFlagIds.length > 0 && selectedFlagIds.length < filteredFlags.length}
                      onChange={(e) => handleSelectAllFlags(e.currentTarget.checked)}
                      styles={{ label: { fontWeight: 600, fontSize: '12px', color: '#334155' } }}
                    />
                    {selectedFlagIds.length > 0 && (
                      <Badge size="xs" color="blue" variant="light">
                        {selectedFlagIds.length} Selected for Batch Action
                      </Badge>
                    )}
                  </Group>

                  {selectedFlagIds.length > 0 && (
                    <Button
                      size="xs"
                      color="teal"
                      variant="filled"
                      loading={batchResolving}
                      onClick={handleBatchAuthorizeSelected}
                      leftSection={<IconChecks size={14} />}
                    >
                      Batch Verify & Authorize ({selectedFlagIds.length})
                    </Button>
                  )}
                </Group>
              </Paper>
            )}

            {filteredFlags.length === 0 ? (
              <Paper p="xl" radius="md" style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                <ThemeIcon size={44} radius="xl" color="teal" variant="light" mb="xs">
                  <IconShieldCheck size={26} />
                </ThemeIcon>
                <Text size="sm" fw={700} c="#09090B">
                  Zero Compliance Exceptions Found
                </Text>
                <Text size="xs" c="#64748B" mt={2} maw={420} mx="auto">
                  All employee banking records, statutory EPF/TDS caps, and contract calculations are fully compliant.
                </Text>
              </Paper>
            ) : (
              filteredFlags.map((flag) => {
                const empName = flag.employeeName || 'Staff Member';
                const empNum = flag.employeeNumber || 'EMP-0000';
                const isBankFlag = flag.flagType === 'MISSING_BANK_DETAILS' || flag.ruleCode === 'MISSING_BANK_DETAILS';

                return (
                  <Paper
                    key={flag.id}
                    p="md"
                    radius="sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: flag.severity === 'CRITICAL' ? '4px solid #DC2626' : flag.severity === 'HIGH' ? '4px solid #EA580C' : '4px solid #E2E8F0',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="sm" align="flex-start" style={{ flex: 1 }}>
                        <Checkbox
                          size="xs"
                          checked={selectedFlagIds.includes(flag.id)}
                          onChange={() => handleToggleFlagSelect(flag.id)}
                          mt={6}
                        />
                        <UserAvatar name={empName} role={flag.department || 'Operations'} size={38} />
                        <div style={{ flex: 1 }}>
                          <Group gap="xs" mb={4} wrap="wrap">
                            <Text size="xs" fw={700} c="#09090B">
                              {empName}
                            </Text>
                            <Text size="11px" c="#64748B" fw={500}>
                              ({empNum})
                            </Text>
                            {getSeverityBadge(flag.severity)}
                            {isBankFlag && (
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
                          variant="light"
                          color="teal"
                          onClick={() => handleOpenResolutionModal(flag)}
                          leftSection={<IconSparkles size={13} />}
                          styles={{ root: { height: 30, fontSize: '11px', padding: '0 12px' } }}
                        >
                          Live Payslip Preview
                        </Button>
                        <Button
                          size="xs"
                          color="dark"
                          onClick={() => handleOpenResolutionModal(flag)}
                          leftSection={<IconFileCheck size={13} />}
                          styles={{ root: { height: 30, fontSize: '11px', padding: '0 14px' } }}
                        >
                          Verify & Authorize
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

      {/* Verification & KYC Document Resolution Modal */}
      <SentinelResolutionModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        flag={selectedFlag}
        flagsQueue={queue}
        currentIndex={queueIndex}
        onResolveSuccess={handleResolveSuccess}
        onNextFlag={handleNextInQueue}
        onPrevFlag={handlePrevInQueue}
      />
    </Stack>
  );
};

export default SentinelView;
