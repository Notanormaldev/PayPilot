import React, { useState } from 'react';
import { Grid, Stack, Loader, Center, Text } from '@mantine/core';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CopilotModal } from './components/CopilotModal';

// Feature Components
import { useAuthUser } from './features/auth/hooks/useAuthUser';
import { useDashboard } from './features/dashboard/hooks/useDashboard';
import { usePayroll } from './features/payroll/hooks/usePayroll';
import { useSentinel } from './features/sentinel/hooks/useSentinel';
import { useEmployees } from './features/employees/hooks/useEmployees';
import { useAttendance } from './features/attendance/hooks/useAttendance';

import { WelcomeBanner } from './features/dashboard/components/WelcomeBanner';
import { DeductionSummary } from './features/dashboard/components/DeductionSummary';
import { PayrollCostChart } from './features/dashboard/components/PayrollCostChart';
import { ToDoTasks } from './features/dashboard/components/ToDoTasks';
import { SelfServicePortal } from './features/dashboard/components/SelfServicePortal';
import { EmployeeTable } from './features/employees/components/EmployeeTable';
import { PayrunView } from './features/payroll/components/PayrunView';
import { SentinelDrawer } from './features/sentinel/components/SentinelDrawer';
import { AttendanceView } from './features/attendance/components/AttendanceView';
import { LandingPage } from './features/landing/LandingPage';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [viewLanding, setViewLanding] = useState(false);

  const { user, isSignedIn } = useAuthUser();
  const { kpis, trends, loading: dashboardLoading, refreshDashboard } = useDashboard();
  const { payruns, fetchPayruns } = usePayroll();
  const { flags, fetchFlags } = useSentinel();
  const { employees, fetchEmployees } = useEmployees();
  const { attendances, leaveRequests, fetchAttendanceData } = useAttendance();

  const handleRefreshAll = () => {
    refreshDashboard();
    fetchPayruns();
    fetchFlags();
    fetchEmployees();
    fetchAttendanceData();
    setViewLanding(false);
  };

  if (!isSignedIn || viewLanding) {
    return <LandingPage onAuthSuccess={handleRefreshAll} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#09090B',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header
        onOpenCopilot={() => setCopilotOpen(true)}
        onViewLanding={() => setViewLanding(true)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openSentinelFlagsCount={flags.length}
        />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1480px', margin: '0 auto', width: '100%' }}>
          {activeTab === 'dashboard' && (
            <Grid gutter="lg">
              {/* Main Center Content (8 Cols) */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Stack gap="lg">
                  <WelcomeBanner
                    userName={user.name}
                    kpis={kpis}
                    onRunPayroll={() => setActiveTab('payroll')}
                  />

                  <DeductionSummary kpis={kpis} employeesCount={kpis?.totalEmployees || 1308} />

                  <PayrollCostChart data={trends} />

                  <SentinelDrawer flags={flags} onFlagResolved={handleRefreshAll} />

                  <EmployeeTable employees={employees} />
                </Stack>
              </Grid.Col>

              {/* Right Widget Column (4 Cols) */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="lg">
                  <ToDoTasks />

                  <SelfServicePortal />
                </Stack>
              </Grid.Col>
            </Grid>
          )}

          {activeTab === 'employees' && (
            <Stack gap="lg">
              <EmployeeTable employees={employees} />
            </Stack>
          )}

          {activeTab === 'payroll' && (
            <Stack gap="lg">
              <SentinelDrawer flags={flags} onFlagResolved={handleRefreshAll} />
              <PayrunView payruns={payruns} onRefresh={handleRefreshAll} />
            </Stack>
          )}

          {activeTab === 'time-off' && (
            <Stack gap="lg">
              <AttendanceView
                attendances={attendances}
                leaveRequests={leaveRequests}
                onRefresh={handleRefreshAll}
              />
            </Stack>
          )}

          {activeTab === 'approvals' && (
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <ToDoTasks />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <AttendanceView
                  attendances={attendances}
                  leaveRequests={leaveRequests}
                  onRefresh={handleRefreshAll}
                />
              </Grid.Col>
            </Grid>
          )}

          {activeTab === 'sentinel' && (
            <Stack gap="lg">
              <SentinelDrawer flags={flags} onFlagResolved={handleRefreshAll} />
            </Stack>
          )}

          {activeTab === 'taxes' && (
            <Stack gap="lg">
              <DeductionSummary kpis={kpis} />
              <PayrunView payruns={payruns} onRefresh={handleRefreshAll} />
            </Stack>
          )}

          {activeTab === 'reports' && (
            <Stack gap="lg">
              <PayrollCostChart data={trends} />
            </Stack>
          )}
        </main>
      </div>

      <CopilotModal opened={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
