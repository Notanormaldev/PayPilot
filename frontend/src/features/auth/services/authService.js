import { fetchApi } from '../../../lib/api';

export const authService = {
  getCurrentRole: () => {
    return localStorage.getItem('paypilot_active_role') || 'ADMIN';
  },

  setRole: (role) => {
    localStorage.setItem('paypilot_active_role', role);
    let token = 'dev-admin-token';
    if (role === 'HR_OFFICER') token = 'dev-hr-token';
    if (role === 'PAYROLL_OFFICER') token = 'dev-payroll-token';
    if (role === 'EMPLOYEE') token = 'dev-emp-token';
    localStorage.setItem('paypilot_auth_token', token);
    return { role, token };
  },

  getToken: () => {
    return localStorage.getItem('paypilot_auth_token') || 'dev-admin-token';
  },

  fetchUserProfile: async () => {
    try {
      return await fetchApi('/health');
    } catch (e) {
      return { status: 'healthy', role: 'ADMIN' };
    }
  },
};
