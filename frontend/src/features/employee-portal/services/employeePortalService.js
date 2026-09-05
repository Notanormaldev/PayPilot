/**
 * Employee Portal Service
 * Handles all API calls for the employee self-service portal.
 * Add fetch/axios calls here for payslips, attendance, time-off, etc.
 */

import api from '../../../lib/axios'; // adjust path if needed

export const employeePortalService = {
  /** Fetch all payslips for the logged-in employee */
  getMyPayslips: () => api.get('/employee/payslips'),

  /** Fetch attendance records */
  getMyAttendance: (month, year) =>
    api.get('/employee/attendance', { params: { month, year } }),

  /** Fetch time-off / leave requests */
  getMyTimeOff: () => api.get('/employee/time-off'),

  /** Submit a new time-off request */
  requestTimeOff: (payload) => api.post('/employee/time-off', payload),

  /** Fetch employee profile */
  getMyProfile: () => api.get('/employee/profile'),

  /** Fetch contract details */
  getMyContract: () => api.get('/employee/contract'),

  /** Fetch tax summary */
  getMyTaxSummary: (year) => api.get('/employee/tax-summary', { params: { year } }),

  /** Fetch notifications */
  getNotifications: () => api.get('/employee/notifications'),
};
