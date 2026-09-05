/**
 * Employee Portal State Slice
 * Manages UI state, loading flags, and cached data for the employee portal.
 * Extend with Zustand / Redux Toolkit / React Context as per project convention.
 */

import { create } from 'zustand';

export const useEmployeePortalStore = create((set) => ({
  // Active tab/section
  activeSection: 'payslips',
  setActiveSection: (section) => set({ activeSection: section }),

  // Payslips
  payslips: [],
  setPayslips: (payslips) => set({ payslips }),

  // Attendance
  attendance: [],
  setAttendance: (attendance) => set({ attendance }),

  // Time Off
  timeOffRequests: [],
  setTimeOffRequests: (requests) => set({ timeOffRequests: requests }),

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),

  // Loading / error states
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
