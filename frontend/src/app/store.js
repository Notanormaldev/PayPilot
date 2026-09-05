import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/authSlice';
import dashboardReducer from '../features/dashboard/state/dashboardSlice';
import payrollReducer from '../features/payroll/state/payrollSlice';
import sentinelReducer from '../features/sentinel/state/sentinelSlice';
import employeesReducer from '../features/employees/state/employeesSlice';
import attendanceReducer from '../features/attendance/state/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    payroll: payrollReducer,
    sentinel: sentinelReducer,
    employees: employeesReducer,
    attendance: attendanceReducer,
  },
});

export default store;
