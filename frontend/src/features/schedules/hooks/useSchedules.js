import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scheduleService.fetchSchedules();
      setSchedules(res.data || []);
    } catch (err) {
      console.error('Failed to load work schedules:', err);
      setError(err.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
  };
};

export default useSchedules;
