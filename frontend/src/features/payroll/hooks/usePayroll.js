import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPayruns, computePayrun } from '../state/payrollSlice';

export const usePayroll = () => {
  const dispatch = useDispatch();
  const payroll = useSelector((state) => state.payroll);

  useEffect(() => {
    dispatch(fetchPayruns());
  }, [dispatch]);

  const runCompute = async (payrunId) => {
    await dispatch(computePayrun(payrunId));
    dispatch(fetchPayruns());
  };

  return {
    ...payroll,
    fetchPayruns: () => dispatch(fetchPayruns()),
    computePayrun: runCompute,
  };
};
