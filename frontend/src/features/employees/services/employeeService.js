import { fetchApi } from '../../../lib/api';

export const employeeService = {
  fetchEmployees: async () => {
    return await fetchApi('/employees');
  },

  fetchEmployeeById: async (id) => {
    return await fetchApi(`/employees/${id}`);
  },
};
