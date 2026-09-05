import { fetchApi } from '../../../lib/api';

export const payrollService = {
  fetchPayruns: async () => {
    return await fetchApi('/payruns');
  },

  computePayrun: async (payrunId) => {
    return await fetchApi(`/payruns/${payrunId}/compute`, { method: 'POST' });
  },

  validatePayrun: async (payrunId, options = {}) => {
    return await fetchApi(`/payruns/${payrunId}/validate`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  fetchPayslips: async (payrunId) => {
    return await fetchApi(`/payruns/${payrunId}/payslips`);
  },

  exportPdf: (payrunId) => {
    return `http://localhost:4000/api/payruns/${payrunId}/export-pdf`;
  },
};
