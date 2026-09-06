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
import { EmployeesView } from './features/employees/components/EmployeesView';
import { PayrunView } from './features/payroll/components/PayrunView';
import { SentinelView, SentinelSummaryCard } from './features/sentinel';
import { AttendanceView } from './features/attendance/components/AttendanceView';
import { ApprovalsView } from './features/approvals';
import { WorkSchedulesView } from './features/schedules';
import { SalaryStructuresView } from './features/salary-structures';
import { LandingPage } from './features/landing/LandingPage';

// Employee Self-Service Portal Views (Core Facilities & ESS Hub)
import { EmployeeDashboardView } from './features/employee-portal/components/EmployeeDashboardView';
import { MyProfileView } from './features/employee-portal/components/MyProfileView';
import { MyAttendanceView } from './features/employee-portal/components/MyAttendanceView';
import { MyTimeOffView } from './features/employee-portal/components/MyTimeOffView';
import { MyContractView } from './features/employee-portal/components/MyContractView';
import { MyPayslipsView } from './features/employee-portal/components/MyPayslipsView';
import { MyTaxSummaryView } from './features/employee-portal/components/MyTaxSummaryView';
import { NotificationsView } from './features/employee-portal/components/NotificationsView';
import { SettingsView } from './features/settings';
import { TaxCalculatorView } from './features/taxes';
import { ReportsView } from './features/reports';
import { PageLoader } from './components/ui';

const TAB_DESCRIPTIONS = {
  dashboard: 'Executive Dashboard & Overview',
  employees: 'Employee Directory & Records',
  schedules: 'Working Schedules & Shifts',
  'salary-structures': 'Salary Structures & Rule Formulas',
  payroll: 'Payrun Engine & Disbursement',
  'time-off': 'Attendance & Leave Approvals',
  approvals: 'Admin Approvals Hub',
  sentinel: 'Sentinel AI Compliance & Fraud Engine',
  taxes: 'Statutory Tax Calculator & TDS Breakdown',
  reports: 'Statutory Payroll Analytics & Reports',
  settings: 'System & Organization Settings',
  'my-profile': 'Employee Profile & Contact Info',
  'my-attendance': 'Shift Attendance & Overtime Tracker',
  'my-time-off': 'Leave Balances & Time-Off Requests',
  'my-contract': 'Contract Terms & CTC Structure',
  'my-payslips': 'Digital Payslips & Salary Breakdown',
  'my-taxes': 'Tax Estimator & Regime Declarations',
  notifications: 'Compliance & System Notifications',
};

export const App = () => {
  const { user, isSignedIn, currentRole } = useAuthUser();
  const isEmployee = currentRole === 'EMPLOYEE';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [viewLanding, setViewLanding] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { kpis, trends, refreshDashboard } = useDashboard();
  const { payruns, fetchPayruns } = usePayroll();
  const { flags, fetchFlags } = useSentinel();
  const { employees, fetchEmployees } = useEmployees();
  const { attendances, leaveRequests, fetchAttendanceData } = useAttendance();

  const employeeTabs = ['dashboard', 'my-profile', 'my-attendance', 'my-time-off', 'my-contract', 'my-payslips', 'my-taxes', 'notifications', 'settings'];
  const adminRoleNavPermissions = {
    ADMIN: ['dashboard', 'employees', 'schedules', 'salary-structures', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
    HR_PAYROLL_MANAGER: ['dashboard', 'employees', 'schedules', 'salary-structures', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
    HR_PAYROLL_USER: ['dashboard', 'employees', 'schedules', 'salary-structures', 'payroll', 'time-off', 'approvals', 'sentinel', 'taxes', 'reports', 'settings'],
    HR_MANAGER: ['dashboard', 'employees', 'schedules', 'time-off', 'approvals', 'reports', 'settings'],
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(newTab);
    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  };

  // Adjust default activeTab when user switches persona or logs in
  useEffect(() => {
    if (isSignedIn) {
      if (isEmployee && !employeeTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      } else if (!isEmployee && employeeTabs.includes(activeTab) && activeTab !== 'dashboard' && activeTab !== 'settings') {
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
        onNavigateTab={handleTabChange}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        sidebarCollapsed={sidebarCollapsed}
        currentRole={currentRole}
        employees={employees}
        payruns={payruns}
        flags={flags}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          openSentinelFlagsCount={flags?.length || 0}
          collapsed={sidebarCollapsed}
        />

        <main style={{ flex: 1, padding: '24px', maxWidth: '1480px', margin: '0 auto', width: '100%', position: 'relative' }}>
          {isTabLoading ? (
            <PageLoader
              message={`Loading ${TAB_DESCRIPTIONS[activeTab] || 'Workspace'}...`}
              subtitle="Synchronizing Real-Time Payroll & Compliance State"
            />
          ) : isEmployee ? (
            <>
              {activeTab === 'dashboard' && <EmployeeDashboardView onNavigate={handleTabChange} />}
              {activeTab === 'my-profile' && <MyProfileView />}
              {activeTab === 'my-attendance' && <MyAttendanceView />}
              {activeTab === 'my-time-off' && <MyTimeOffView />}
              {activeTab === 'my-contract' && <MyContractView />}
              {activeTab === 'my-payslips' && <MyPayslipsView />}
              {activeTab === 'my-taxes' && <MyTaxSummaryView />}
              {activeTab === 'notifications' && <NotificationsView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          ) : (
            /* ADMIN / HR / PAYROLL VIEWS */
            <>
              {activeTab === 'dashboard' && (
                <Stack gap="lg">
                  <WelcomeBanner
                    userName={user?.name || 'Meera Krishnan'}
                    kpis={kpis}
                    onRunPayroll={() => handleTabChange('payroll')}
                  />
                  <DeductionSummary kpis={kpis} employeesCount={kpis?.totalEmployees || 301} />
                  <ToDoTasks />
                  <PayrollCostChart data={trends} />
                  <SentinelSummaryCard flags={flags} onOpenSentinel={() => handleTabChange('sentinel')} />
                  <EmployeeTable employees={employees} onRefresh={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'employees' && (
                <Stack gap="lg">
                  <EmployeesView employees={employees} onRefresh={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'schedules' && (
                <Stack gap="lg">
                  <WorkSchedulesView onRefresh={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'salary-structures' && (
                <Stack gap="lg">
                  <SalaryStructuresView onRefresh={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'payroll' && (
                <Stack gap="lg">
                  <PayrunView payruns={payruns} onRefresh={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'time-off' && (
                <Stack gap="lg">
                  <AttendanceView
                    attendances={attendances}
                    leaveRequests={leaveRequests}
                    employees={employees}
                    onRefresh={handleRefreshAll}
                  />
                </Stack>
              )}

              {activeTab === 'approvals' && (
                <Stack gap="lg">
                  <ApprovalsView onRefresh={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'sentinel' && (
                <Stack gap="lg">
                  <SentinelView flags={flags} onFlagResolved={handleRefreshAll} />
                </Stack>
              )}

              {activeTab === 'taxes' && (
                <Stack gap="lg">
                  <TaxCalculatorView />
                </Stack>
              )}

              {activeTab === 'reports' && (
                <Stack gap="lg">
                  <ReportsView />
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
