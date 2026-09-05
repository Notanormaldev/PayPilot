import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployees, selectEmployee } from '../state/employeesSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  return {
    ...employees,
    fetchEmployees: () => dispatch(fetchEmployees()),
    selectEmployee: (emp) => dispatch(selectEmployee(emp)),
  };
};
