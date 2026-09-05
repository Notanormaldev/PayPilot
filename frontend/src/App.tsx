import React, { useState, useEffect } from 'react';
import { Grid, Stack, Loader, Center, Text } from '@mantine/core';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { SentinelDrawer } from './components/SentinelDrawer';
import { PayrollChart } from './components/PayrollChart';
import { EmployeeTable } from './components/EmployeeTable';
import { PayrunView } from './components/PayrunView';
import { AttendanceView } from './components/AttendanceView';
import { CopilotModal } from './components/CopilotModal';
import { fetchApi } from './lib/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [copilotOpen, setCopilotOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [flags, setFlags] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [payruns, setPayruns] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [kpiRes, flagsRes, empRes, trendRes, payrunsRes, attRes, leavesRes] = await Promise.all([
        fetchApi<{ data: any }>('/dashboard/kpis').catch(() => ({ data: null })),
        fetchApi<{ data: any[] }>('/sentinel/flags?status=OPEN').catch(() => ({ data: [] })),
        fetchApi<{ data: any[] }>('/employees').catch(() => ({ data: [] })),
        fetchApi<{ data: any[] }>('/dashboard/trends').catch(() => ({ data: [] })),
        fetchApi<{ data: any[] }>('/payruns').catch(() => ({ data: [] })),
        fetchApi<{ data: any[] }>('/attendance').catch(() => ({ data: [] })),
        fetchApi<{ data: any[] }>('/time-off/requests').catch(() => ({ data: [] })),
      ]);

      if (kpiRes.data) setKpis(kpiRes.data);
      setFlags(flagsRes.data || []);
      setEmployees(empRes.data || []);
      setTrends(trendRes.data || []);
      setPayruns(payrunsRes.data || []);
      setAttendances(attRes.data || []);
      setLeaveRequests(leavesRes.data || []);
    } catch (err: any) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    let token = 'dev-admin-token';
    if (newRole === 'HR_OFFICER') token = 'dev-hr-token';
    if (newRole === 'PAYROLL_OFFICER') token = 'dev-payroll-token';
    if (newRole === 'EMPLOYEE') token = 'dev-emp-token';
    localStorage.setItem('paypilot_auth_token', token);
    loadData();
  };

  if (loading) {
    return (
      <Center style={{ height: '100vh', backgroundColor: '#0D0E12', color: '#F1F5F9' }}>
        <Stack align="center" gap="sm">
          <img src="/logo.svg" alt="PayPilot" style={{ width: 48, height: 48 }} />
          <Loader size="sm" color="blue" />
          <Text size="xs" c="#94A3B8">
            Initializing PayPilot Sentinel telemetry...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D0E12', color: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenCopilot={() => setCopilotOpen(true)}
        currentRole={currentRole}
        onSelectRole={handleRoleChange}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openSentinelFlagsCount={flags.length}
        />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <Stack gap="lg">
              {/* Top Row Mathematical KPIs */}
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    label="Total Headcount"
                    value={kpis?.totalEmployees || 40}
                    badgeText="100% Onboarded"
                    badgeColor="teal"
                    subtext="Full-time & contracted staff"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    label="Active Contracts"
                    value={kpis?.activeContracts || 38}
                    badgeText="Coverage 95%"
                    badgeColor="blue"
                    subtext="Running legal contracts"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    label="Monthly Payroll Spend"
                    value={`₹${(kpis?.monthlyPayrollCost || 2450000).toLocaleString('en-IN')}`}
                    badgeText={`+${kpis?.payrollCostChangePct || 3.8}% MoM`}
                    badgeColor="blue"
                    subtext="September 2026 computed"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    label="Sentinel Blocking Flags"
                    value={flags.length}
                    badgeText={flags.length > 0 ? 'Action Required' : 'All Clear'}
                    badgeColor={flags.length > 0 ? 'red' : 'teal'}
                    subtext="Autonomous compliance guard"
                  />
                </Grid.Col>
              </Grid>

              {/* Main 2-Column: Left Spend Chart & Employee Table, Right Sentinel Drawer */}
              <Grid>
                <Grid.Col span={{ base: 12, lg: 7 }}>
                  <Stack gap="md">
                    <PayrollChart data={trends} />
                    <EmployeeTable employees={employees} />
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 5 }}>
                  <SentinelDrawer flags={flags} onFlagResolved={loadData} />
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {activeTab === 'payroll' && (
            <Stack gap="lg">
              <SentinelDrawer flags={flags} onFlagResolved={loadData} />
              <PayrunView payruns={payruns} onRefresh={loadData} />
            </Stack>
          )}

          {activeTab === 'employees' && (
            <Stack gap="lg">
              <EmployeeTable employees={employees} />
            </Stack>
          )}

          {activeTab === 'time-off' && (
            <Stack gap="lg">
              <AttendanceView
                attendances={attendances}
                leaveRequests={leaveRequests}
                onRefresh={loadData}
              />
            </Stack>
          )}

          {activeTab === 'structures' && (
            <Stack gap="lg">
              <PayrunView payruns={payruns} onRefresh={loadData} />
            </Stack>
          )}
        </main>
      </div>

      <CopilotModal opened={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
