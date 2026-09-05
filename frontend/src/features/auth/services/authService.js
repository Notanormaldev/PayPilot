import { fetchApi } from '../../../lib/api';

export const authService = {
  getCurrentRole: () => {
    return localStorage.getItem('paypilot_active_role') || 'ADMIN';
  },

  setRole: (role) => {
    localStorage.setItem('paypilot_active_role', role);
    let token = localStorage.getItem('paypilot_auth_token');
    if (!token || token.startsWith('dev-')) {
      if (role === 'HR_MANAGER' || role === 'HR_OFFICER') token = 'dev-hr-token';
      else if (role === 'HR_PAYROLL_MANAGER' || role === 'PAYROLL_OFFICER') token = 'dev-payroll-token';
      else if (role === 'EMPLOYEE') token = 'dev-emp-token';
      else token = 'dev-admin-token';
      localStorage.setItem('paypilot_auth_token', token);
    }
    return { role, token };
  },

  getToken: () => {
    return localStorage.getItem('paypilot_auth_token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('paypilot_refresh_token');
  },

  login: async (email, password, role) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (res.accessToken) {
      localStorage.setItem('paypilot_auth_token', res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('paypilot_refresh_token', res.refreshToken);
      }
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
      if (res.refreshToken) {
        localStorage.setItem('paypilot_refresh_token', res.refreshToken);
      }
      localStorage.setItem('paypilot_active_role', res.user?.role || data.role || 'EMPLOYEE');
    }
    return res;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('paypilot_refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem('paypilot_auth_token');
      localStorage.removeItem('paypilot_refresh_token');
      throw new Error('Refresh token expired');
    }

    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('paypilot_auth_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('paypilot_refresh_token', data.refreshToken);
      }
    }
    return data;
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      localStorage.removeItem('paypilot_auth_token');
      localStorage.removeItem('paypilot_refresh_token');
      localStorage.removeItem('paypilot_active_role');
    }
  },

  fetchUserProfile: async () => {
    try {
      const data = await fetchApi('/auth/me');
      return data.user;
    } catch (e) {
      return {
        role: localStorage.getItem('paypilot_active_role') || 'ADMIN',
        name: 'Meera Krishnan',
        email: 'meera.krishnan@paypilot.internal',
      };
    }
  },
};

