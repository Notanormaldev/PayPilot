import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData, setSelectedMonth } from '../state/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const refreshDashboard = () => {
    dispatch(fetchDashboardData());
  };

  const changeMonth = (month) => {
    dispatch(setSelectedMonth(month));
  };

  return {
    ...dashboard,
    refreshDashboard,
    changeMonth,
  };
};
