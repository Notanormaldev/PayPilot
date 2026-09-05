import { fetchApi } from '../../../lib/api';

export const authService = {
  getCurrentRole: () => {
    return localStorage.getItem('paypilot_active_role') || 'ADMIN';
  },

  setRole: (role) => {
    localStorage.setItem('paypilot_active_role', role);
    let token = 'dev-admin-token';
    if (role === 'HR_MANAGER' || role === 'HR_OFFICER') token = 'dev-hr-token';
    if (role === 'HR_PAYROLL_MANAGER' || role === 'PAYROLL_OFFICER') token = 'dev-payroll-token';
    if (role === 'EMPLOYEE') token = 'dev-emp-token';
    localStorage.setItem('paypilot_auth_token', token);
    return { role, token };
  },

  getToken: () => {
    return localStorage.getItem('paypilot_auth_token') || 'dev-admin-token';
  },

  login: async (email, password, role) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (res.accessToken) {
      localStorage.setItem('paypilot_auth_token', res.accessToken);
      if (res.refreshToken) localStorage.setItem('paypilot_refresh_token', res.refreshToken);
      localStorage.setItem('paypilot_active_role', res.user?.role || role || 'ADMIN');
    }
    return res;
  },

  register: async (data) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.accessToken) {
      localStorage.setItem('paypilot_auth_token', res.accessToken);
      if (res.refreshToken) localStorage.setItem('paypilot_refresh_token', res.refreshToken);
      localStorage.setItem('paypilot_active_role', res.user?.role || data.role || 'EMPLOYEE');
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('paypilot_auth_token');
    localStorage.removeItem('paypilot_refresh_token');
  },

  fetchUserProfile: async () => {
    try {
      return await fetchApi('/auth/me');
    } catch (e) {
      return { user: { role: 'ADMIN', name: 'Meera Krishnan' } };
    }
  },
};
