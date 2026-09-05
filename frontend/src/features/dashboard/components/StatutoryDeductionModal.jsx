import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Tabs,
  Paper,
  Grid,
  Table,
  Badge,
  Text,
  Group,
  Stack,
  TextInput,
  Select,
  Button,
  Pagination,
  Box,
  ThemeIcon,
  Alert,
  Loader,
  Center,
  Divider,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconShieldCheck,
  IconPercentage,
  IconDownload,
  IconSearch,
  IconInfoCircle,
  IconScale,
  IconFileSpreadsheet,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { fetchApi } from '../../../lib/api';

const PAGE_SIZE = 8;

export const StatutoryDeductionModal = ({ opened, onClose, initialTab = 'EPF', kpis }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (opened) {
      loadStatutoryData();
      setPage(1);
      setSearch('');
      setDeptFilter('ALL');
    }
  }, [opened]);

  const loadStatutoryData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/dashboard/statutory-deductions');
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load statutory deductions:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {
    epf: {
      total: kpis?.statutoryDeductions?.epf || 3973913,
      employeeShare: Math.round((kpis?.statutoryDeductions?.epf || 3973913) / 2),
      employerShare: Math.round((kpis?.statutoryDeductions?.epf || 3973913) / 2),
      wageBase: 33115942,
      eligibleCount: 301,
      act: "Employees' Provident Funds and Miscellaneous Provisions Act, 1952",
      rule: '12% Employee EPF + 12% Employer (3.67% EPF + 8.33% EPS capped at ₹15,000 + Admin)',
      frequency: 'Monthly (Challan Form ECR due by 15th)',
    },
    esi: {
      total: kpis?.statutoryDeductions?.esi || 91010,
      employeeShare: 17064,
      employerShare: 73946,
      wageBase: 2275250,
      eligibleCount: 38,
      act: "Employees' State Insurance Act, 1948",
      rule: '0.75% Employee + 3.25% Employer (Covered up to ₹21,000 gross monthly wage)',
      frequency: 'Monthly (ESIC Monthly Return due by 15th)',
    },
    tds: {
      total: kpis?.statutoryDeductions?.tds || 11589089,
      employeeShare: kpis?.statutoryDeductions?.tds || 11589089,
      employerShare: 0,
      wageBase: 45067000,
      eligibleCount: 295,
      act: 'Income Tax Act, 1961 - Section 192 (FY 2026-27 Union Budget)',
      rule: 'New Tax Regime (0-4L Nil, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, >24L 30% + 4% Cess)',
      frequency: 'Monthly deposit by 7th; Quarterly Form 24Q filing',
    },
  };

  const rawList = data?.breakdown || [];

  // Filter department options
  const departmentOptions = useMemo(() => {
    const set = new Set();
    rawList.forEach((emp) => {
      if (emp?.department) set.add(emp.department);
    });
    const sorted = Array.from(set).sort();
    return [{ value: 'ALL', label: 'All Departments' }, ...sorted.map((d) => ({ value: d, label: d }))];
  }, [rawList]);

  // Filtered employees list based on tab, search & department
  const filteredList = useMemo(() => {
    return rawList.filter((emp) => {
      if (deptFilter !== 'ALL' && emp.department !== deptFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = emp.name?.toLowerCase().includes(q);
        const matchesEmail = emp.workEmail?.toLowerCase().includes(q);
        const matchesDept = emp.department?.toLowerCase().includes(q);
        const matchesJob = emp.jobPosition?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept && !matchesJob) return false;
      }

      if (activeTab === 'ESI') {
        // Option to view all or only covered
        return true;
      }

      return true;
    });
  }, [rawList, search, deptFilter, activeTab]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, page]);

  // CSV Export handler
  const handleExportCsv = () => {
    let headers = [];
    let rows = [];

    if (activeTab === 'EPF') {
      headers = [
        'Employee ID',
        'Employee Name',
        'Department',
        'Gross Wage (INR)',
        'Basic Wage (INR)',
        'Employee EPF 12% (INR)',
        'Employer EPF 3.67% (INR)',
        'Employer EPS 8.33% (INR)',
        'Total EPF Deposit (INR)',
      ];
      rows = filteredList.map((e) => [
        `"${e.id}"`,
        `"${e.name}"`,
        `"${e.department}"`,
        e.grossWage,
        e.basicWage,
        e.epf?.employee || 0,
        e.epf?.employerEpf || 0,
        e.epf?.employerEps || 0,
        e.epf?.total || 0,
      ]);
    } else if (activeTab === 'ESI') {
      headers = [
        'Employee ID',
        'Employee Name',
        'Department',
        'Gross Wage (INR)',
        'ESI Covered',
        'Employee Share 0.75% (INR)',
        'Employer Share 3.25% (INR)',
        'Total ESIC Remittance (INR)',
      ];
      rows = filteredList.map((e) => [
        `"${e.id}"`,
        `"${e.name}"`,
        `"${e.department}"`,
        e.grossWage,
        e.esi?.isCovered ? 'YES' : 'NO',
        e.esi?.employee || 0,
        e.esi?.employer || 0,
        e.esi?.total || 0,
      ]);
    } else {
      headers = [
        'Employee ID',
        'Employee Name',
        'Department',
        'Monthly Gross (INR)',
        'Tax Regime',
        'Annual Taxable Income (INR)',
        'Monthly TDS Deducted (INR)',
        'Projected Annual Tax (INR)',
      ];
      rows = filteredList.map((e) => [
        `"${e.id}"`,
        `"${e.name}"`,
        `"${e.department}"`,
        e.grossWage,
        `"${e.tds?.regime || 'NEW'}"`,
        e.tds?.taxableAnnual || 0,
        e.tds?.monthlyTds || 0,
        e.tds?.annualTaxEstimate || 0,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PayPilot_${activeTab}_Statutory_Deductions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const curSummary = summary[activeTab?.toLowerCase()] || summary.epf;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon
            size="md"
            radius="md"
            color={activeTab === 'EPF' ? 'blue' : activeTab === 'ESI' ? 'teal' : 'violet'}
            variant="light"
          >
            {activeTab === 'EPF' && <IconBuildingBank size={18} />}
            {activeTab === 'ESI' && <IconShieldCheck size={18} />}
            {activeTab === 'TDS' && <IconPercentage size={18} />}
          </ThemeIcon>
          <div>
            <Text fw={800} size="md" c="#09090B">
              Statutory Deduction Audit & Breakdown
            </Text>
            <Text size="xs" c="#64748B">
              Government compliance rules, wage pool calculations, and employee-level challan registers
            </Text>
          </div>
        </Group>
      }
      size="90%"
      radius="md"
      styles={{
        header: { borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' },
        body: { paddingTop: '16px' },
      }}
    >
      <Tabs value={activeTab} onChange={(v) => { setActiveTab(v); setPage(1); }}>
        <Tabs.List mb="md">
          <Tabs.Tab
            value="EPF"
            leftSection={<IconBuildingBank size={16} />}
            rightSection={
              <Badge size="xs" color="blue" variant="light">
                ₹{(summary.epf.total).toLocaleString('en-IN')}
              </Badge>
            }
          >
            EPF (Provident Fund)
          </Tabs.Tab>

          <Tabs.Tab
            value="ESI"
            leftSection={<IconShieldCheck size={16} />}
            rightSection={
              <Badge size="xs" color="teal" variant="light">
                ₹{(summary.esi.total).toLocaleString('en-IN')}
              </Badge>
            }
          >
            ESI (State Insurance)
          </Tabs.Tab>

          <Tabs.Tab
            value="TDS"
            leftSection={<IconPercentage size={16} />}
            rightSection={
              <Badge size="xs" color="violet" variant="light">
                ₹{(summary.tds.total).toLocaleString('en-IN')}
              </Badge>
            }
          >
            TDS Deduction (Tax)
          </Tabs.Tab>
        </Tabs.List>

        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Loader size="md" color="dark" />
              <Text size="sm" c="#64748B">
                Computing statutory wage base and challans...
              </Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            {/* Regulatory Basis Card */}
            <Alert
              icon={<IconScale size={18} />}
              color={activeTab === 'EPF' ? 'blue' : activeTab === 'ESI' ? 'teal' : 'violet'}
              variant="light"
              radius="md"
              title={
                <Group justify="space-between" align="center" wrap="wrap">
                  <Text fw={700} size="sm">
                    {curSummary.act}
                  </Text>
                  <Badge size="xs" color="dark" variant="outline">
                    {curSummary.frequency}
                  </Badge>
                </Group>
              }
            >
              <Text size="xs" mt={4} c="#334155">
                <b>Formula / Law:</b> {curSummary.rule}
              </Text>
            </Alert>

            {/* High Level 4-Stat Grid */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#F8FAFC' }}>
                  <Text size="10px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                    TOTAL REMITTANCE
                  </Text>
                  <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{Number(curSummary.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text size="11px" c="#64748B" mt={2}>
                    Combined Govt Challan
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#F8FAFC' }}>
                  <Text size="10px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                    EMPLOYEE DEDUCTION
                  </Text>
                  <Text size="18px" fw={800} c="#2563EB" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{Number(curSummary.employeeShare).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text size="11px" c="#64748B" mt={2}>
                    Deducted from Salary
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#F8FAFC' }}>
                  <Text size="10px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                    EMPLOYER CONTRIBUTION
                  </Text>
                  <Text size="18px" fw={800} c="#059669" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{Number(curSummary.employerShare).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text size="11px" c="#64748B" mt={2}>
                    Company Match / Overhead
                  </Text>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Paper p="sm" radius="md" withBorder style={{ backgroundColor: '#F8FAFC' }}>
                  <Text size="10px" fw={700} c="#64748B" style={{ letterSpacing: '0.5px' }}>
                    ENROLLED WORKFORCE
                  </Text>
                  <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {curSummary.eligibleCount} Staff
                  </Text>
                  <Text size="11px" c="#64748B" mt={2}>
                    Wage Base: ₹{Number(curSummary.wageBase).toLocaleString('en-IN')}
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Filter & Search Bar */}
            <Paper p="xs" radius="md" withBorder style={{ backgroundColor: '#FFFFFF' }}>
              <Group justify="space-between" wrap="wrap" gap="sm">
                <Group gap="xs" style={{ flex: 1, minWidth: '280px' }}>
                  <TextInput
                    placeholder="Search by employee name, email or job title..."
                    leftSection={<IconSearch size={16} color="#94A3B8" />}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    size="xs"
                    radius="sm"
                    style={{ flex: 1 }}
                  />
                  <Select
                    placeholder="Department"
                    data={departmentOptions}
                    value={deptFilter}
                    onChange={(v) => { setDeptFilter(v || 'ALL'); setPage(1); }}
                    size="xs"
                    radius="sm"
                    style={{ width: '170px' }}
                  />
                </Group>

                <Group gap="xs">
                  <Badge size="sm" variant="outline" color="gray">
                    Showing {filteredList.length} records
                  </Badge>
                  <Button
                    size="xs"
                    color="dark"
                    variant="light"
                    leftSection={<IconDownload size={14} />}
                    onClick={handleExportCsv}
                  >
                    Export Challan (CSV)
                  </Button>
                </Group>
              </Group>
            </Paper>

            {/* Employee Breakdown Table */}
            <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
              <Table.ScrollContainer minWidth={750}>
                <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
                  <Table.Thead style={{ backgroundColor: '#F1F5F9' }}>
                    {activeTab === 'EPF' && (
                      <Table.Tr>
                        <Table.Th>Employee</Table.Th>
                        <Table.Th>Department</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Basic Wage</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Employee (12%)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Employer EPF (3.67%)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Employer EPS (8.33%)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Total EPF Challan</Table.Th>
                      </Table.Tr>
                    )}

                    {activeTab === 'ESI' && (
                      <Table.Tr>
                        <Table.Th>Employee</Table.Th>
                        <Table.Th>Department</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Gross Wage</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Coverage Status</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Employee (0.75%)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Employer (3.25%)</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Total ESIC Remittance</Table.Th>
                      </Table.Tr>
                    )}

                    {activeTab === 'TDS' && (
                      <Table.Tr>
                        <Table.Th>Employee</Table.Th>
                        <Table.Th>Department</Table.Th>
                        <Table.Th>Tax Regime</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Monthly Gross</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Annual Taxable</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Monthly TDS Deducted</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Annual Projected Tax</Table.Th>
                      </Table.Tr>
                    )}
                  </Table.Thead>

                  <Table.Tbody>
                    {paginatedList.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>
                          <Text size="sm" c="#64748B">
                            No employee records match your search or filter criteria.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      paginatedList.map((emp) => (
                        <Table.Tr key={emp.id}>
                          {/* Common Employee Info */}
                          <Table.Td>
                            <Text fw={700} size="xs" c="#09090B">
                              {emp.name}
                            </Text>
                            <Text size="10px" c="#64748B">
                              {emp.workEmail || emp.jobPosition}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <Badge size="xs" color="gray" variant="light">
                              {emp.department}
                            </Badge>
                          </Table.Td>

                          {/* EPF Rows */}
                          {activeTab === 'EPF' && (
                            <>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                                ₹{Number(emp.basicWage || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#2563EB', fontWeight: 600 }}>
                                ₹{Number(emp.epf?.employee || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                                ₹{Number(emp.epf?.employerEpf || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                                ₹{Number(emp.epf?.employerEps || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#09090B' }}>
                                ₹{Number(emp.epf?.total || 0).toLocaleString('en-IN')}
                              </Table.Td>
                            </>
                          )}

                          {/* ESI Rows */}
                          {activeTab === 'ESI' && (
                            <>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                                ₹{Number(emp.grossWage || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'center' }}>
                                {emp.esi?.isCovered ? (
                                  <Badge size="xs" color="teal" variant="light">
                                    Covered (≤ ₹21k)
                                  </Badge>
                                ) : (
                                  <Badge size="xs" color="gray" variant="outline">
                                    Exempt (&gt; ₹21k)
                                  </Badge>
                                )}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#2563EB', fontWeight: 600 }}>
                                ₹{Number(emp.esi?.employee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#059669' }}>
                                ₹{Number(emp.esi?.employer || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#09090B' }}>
                                ₹{Number(emp.esi?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Table.Td>
                            </>
                          )}

                          {/* TDS Rows */}
                          {activeTab === 'TDS' && (
                            <>
                              <Table.Td>
                                <Badge size="xs" color="dark" variant="light">
                                  {emp.tds?.regime || 'NEW'}
                                </Badge>
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                                ₹{Number(emp.grossWage || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                                ₹{Number(emp.tds?.taxableAnnual || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#DC2626' }}>
                                ₹{Number(emp.tds?.monthlyTds || 0).toLocaleString('en-IN')}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: '#64748B' }}>
                                ₹{Number(emp.tds?.annualTaxEstimate || 0).toLocaleString('en-IN')}
                              </Table.Td>
                            </>
                          )}
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="space-between" p="xs" style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <Text size="xs" c="#64748B">
                    Page <b>{page}</b> of <b>{totalPages}</b> ({filteredList.length} total staff)
                  </Text>
                  <Pagination total={totalPages} value={page} onChange={setPage} size="xs" radius="sm" color="dark" />
                </Group>
              )}
            </Paper>
          </Stack>
        )}
      </Tabs>
    </Modal>
  );
};

export default StatutoryDeductionModal;
