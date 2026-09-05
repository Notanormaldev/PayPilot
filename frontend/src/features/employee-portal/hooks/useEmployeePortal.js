/**
 * useEmployeePortal Hook
 * Centralizes data fetching + state updates for the employee self-service portal.
 * Import this in view components instead of calling services directly.
 */

import { useCallback } from 'react';
import { employeePortalService } from '../services/employeePortalService';
import { useEmployeePortalStore } from '../state/employeePortalSlice';

export const useEmployeePortal = () => {
  const {
    payslips, setPayslips,
    attendance, setAttendance,
    timeOffRequests, setTimeOffRequests,
    notifications, setNotifications,
    loading, setLoading,
    error, setError,
  } = useEmployeePortalStore();

  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeePortalService.getMyPayslips();
      setPayslips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async (month, year) => {
    setLoading(true);
    try {
      const { data } = await employeePortalService.getMyAttendance(month, year);
      setAttendance(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeOff = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeePortalService.getMyTimeOff();
      setTimeOffRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await employeePortalService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return {
    payslips, attendance, timeOffRequests, notifications,
    loading, error,
    fetchPayslips, fetchAttendance, fetchTimeOff, fetchNotifications,
  };
};
