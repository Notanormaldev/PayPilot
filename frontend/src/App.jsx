import React, { useState, useEffect } from 'react';
import { Grid, Stack } from '@mantine/core';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CopilotModal } from './components/layout/CopilotModal';

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

// Employee Self-Service Portal Views (7 Core Facilities)
import { MyProfileView } from './features/employee-portal/components/MyProfileView';
import { MyAttendanceView } from './features/employee-portal/components/MyAttendanceView';
import { MyTimeOffView } from './features/employee-portal/components/MyTimeOffView';
import { MyContractView } from './features/employee-portal/components/MyContractView';
import { MyPayslipsView } from './features/employee-portal/components/MyPayslipsView';
import { MyTaxSummaryView } from './features/employee-portal/components/MyTaxSummaryView';
import { NotificationsView } from './features/employee-portal/components/NotificationsView';
import { SettingsView } from './features/settings';
import { LoansView } from './features/loans';

export const App = () => {
  const { user, isSignedIn, currentRole } = useAuthUser();
  const isEmployee = currentRole === 'EMPLOYEE';
  const [activeTab, setActiveTab] = useState(isEmployee ? 'my-profile' : 'dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [viewLanding, setViewLanding] = useState(false);

  const { kpis, trends, refreshDashboard } = useDashboard();
  const { payruns, fetchPayruns } = usePayroll();
  const { flags, fetchFlags } = useSentinel();
  const { employees, fetchEmployees } = useEmployees();
  const { attendances, leaveRequests, fetchAttendanceData } = useAttendance();

  const employeeTabs = ['my-profile', 'my-attendance', 'my-time-off', 'my-contract', 'my-payslips', 'my-taxes', 'loans', 'notifications', 'settings'];
  const adminRoleNavPermissions = {
    ADMIN: ['dashboard', 'employees', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'loans', 'reports', 'settings'],
    HR_MANAGER: ['dashboard', 'employees', 'time-off', 'approvals', 'loans', 'reports', 'settings'],
    HR_PAYROLL_MANAGER: ['dashboard', 'payroll', 'time-off', 'sentinel', 'taxes', 'loans', 'reports', 'settings'],
  };

  // Adjust default activeTab when user switches persona or logs in
  useEffect(() => {
    if (isSignedIn) {
      if (isEmployee && !employeeTabs.includes(activeTab)) {
        setActiveTab('my-profile');
      } else if (!isEmployee && employeeTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, isSignedIn]);

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
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openSentinelFlagsCount={flags.length}
        />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1480px', margin: '0 auto', width: '100%' }}>
          {/* EMPLOYEE PORTAL VIEWS */}
          {isEmployee ? (
            <>
              {activeTab === 'my-profile' && <MyProfileView />}
              {activeTab === 'my-attendance' && <MyAttendanceView />}
              {activeTab === 'my-time-off' && <MyTimeOffView />}
              {activeTab === 'my-contract' && <MyContractView />}
              {activeTab === 'my-payslips' && <MyPayslipsView />}
              {activeTab === 'my-taxes' && <MyTaxSummaryView />}
              {activeTab === 'loans' && <LoansView />}
              {activeTab === 'notifications' && <NotificationsView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          ) : (
            /* ADMIN / HR / PAYROLL VIEWS */
            <>
              {activeTab === 'dashboard' && (
                <Grid gutter="lg">
                  <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="lg">
                      <WelcomeBanner
                        userName={user?.name || 'Meera Krishnan'}
                        kpis={kpis}
                        onRunPayroll={() => setActiveTab('payroll')}
                      />
                      <DeductionSummary kpis={kpis} employeesCount={kpis?.totalEmployees || 1308} />
                      <PayrollCostChart data={trends} />
                      <SentinelDrawer flags={flags} onFlagResolved={handleRefreshAll} />
                      <EmployeeTable employees={employees} />
                    </Stack>
                  </Grid.Col>

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

              {activeTab === 'loans' && (
                <Stack gap="lg">
                  <LoansView />
                </Stack>
              )}

              {activeTab === 'reports' && (
                <Stack gap="lg">
                  <PayrollCostChart data={trends} />
                </Stack>
              )}

              {activeTab === 'settings' && (
                <Stack gap="lg">
                  <SettingsView />
                </Stack>
              )}
            </>
          )}
        </main>
      </div>

      <CopilotModal opened={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
};
