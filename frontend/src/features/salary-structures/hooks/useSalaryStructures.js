import { useState, useEffect, useCallback } from 'react';
import { salaryStructureService } from '../services/salaryStructureService';

export const useSalaryStructures = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStructures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await salaryStructureService.fetchStructures();
      setStructures(res.data || []);
    } catch (err) {
      console.error('Failed to load salary structures:', err);
      setError(err.message || 'Failed to fetch salary structures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  return {
    structures,
    loading,
    error,
    fetchStructures,
  };
};

export default useSalaryStructures;
