import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../../lib/api';

export const useLoans = () => {
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({
    totalDisbursed: 375000,
    totalRecovered: 125000,
    outstandingBalance: 250000,
    monthlyEmiRecovery: 42500,
    activeCount: 3,
    pendingCount: 2,
    settledCount: 1,
    totalLoans: 6,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoans = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);

      const qs = queryParams.toString();
      const res = await fetchApi(`/loans${qs ? `?${qs}` : ''}`);
      if (res?.data) {
        setLoans(res.data);
      }
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch loans:', err);
      setError(err.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLoan = async (loanData) => {
    const res = await fetchApi('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
    await fetchLoans();
    return res;
  };

  const updateLoanStatus = async (loanId, status, note = '') => {
    const res = await fetchApi(`/loans/${loanId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
    await fetchLoans();
    return res;
  };

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return {
    loans,
    stats,
    loading,
    error,
    fetchLoans,
    createLoan,
    updateLoanStatus,
  };
};
