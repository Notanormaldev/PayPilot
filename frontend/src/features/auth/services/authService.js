import { fetchApi } from '../../../lib/api';

const PERSONA_CONFIGS = {
  ADMIN: {
    name: 'Meera Krishnan',
    email: 'meera.krishnan@paypilot.internal',
    title: 'Chief People & Payroll Officer',
    department: 'Executive Management',
    role: 'ADMIN',
  },
  HR_MANAGER: {
    name: 'Tanvi Kapoor',
    email: 'tanvi.kapoor@paypilot.internal',
    title: 'HR Manager',
    department: 'HR & People',
    role: 'HR_MANAGER',
  },
  HR_PAYROLL_USER: {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@paypilot.internal',
    title: 'Payroll Operations Specialist',
    department: 'HR & Payroll',
    role: 'HR_PAYROLL_USER',
  },
  HR_PAYROLL_MANAGER: {
    name: 'Neha Gupta',
    email: 'neha.gupta@paypilot.internal',
    title: 'Senior Payroll Specialist',
    department: 'HR & People',
    role: 'HR_PAYROLL_MANAGER',
  },
  EMPLOYEE: {
    name: 'Kartik Kumar',
    email: 'kartik.kumar@paypilot.internal',
    title: 'Product Manager',
    department: 'Product & Technology',
    role: 'EMPLOYEE',
  },
};

export const authService = {
  getCurrentRole: () => {
    return localStorage.getItem('paypilot_active_role') || 'ADMIN';
  },

  setRole: (role) => {
    localStorage.setItem('paypilot_active_role', role);
    let token = localStorage.getItem('paypilot_auth_token');
    if (!token || token.startsWith('dev-')) {
      if (role === 'HR_MANAGER' || role === 'HR_OFFICER') token = 'dev-hr-token';
      else if (role === 'HR_PAYROLL_USER') token = 'dev-payroll-user-token';
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
      if (res.user) {
        localStorage.setItem('paypilot_user_profile', JSON.stringify(res.user));
      }
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
      if (res.user) {
        localStorage.setItem('paypilot_user_profile', JSON.stringify(res.user));
      }
    }
    return res;
  },

  verifyOtp: async (email, otpCode) => {
    const res = await fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });

    if (res.accessToken) {
      localStorage.setItem('paypilot_auth_token', res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('paypilot_refresh_token', res.refreshToken);
      }
      localStorage.setItem('paypilot_active_role', res.user?.role || 'EMPLOYEE');
    }
    return res;
  },

  resendOtp: async (email) => {
    const res = await fetchApi('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
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

  checkAdminExists: async () => {
    try {
      const res = await fetchApi('/auth/admin-exists');
      return res?.adminExists ?? true;
    } catch (e) {
      return true; // fail safe: prevent creating rogue admin
    }
  },

  getPendingUsers: async () => {
    try {
      const res = await fetchApi('/auth/pending-users');
      return res?.users || res?.data || (Array.isArray(res) ? res : []);
    } catch (e) {
      console.warn('Failed to fetch pending users:', e.message);
      return [];
    }
  },

  approveUser: async (id, notes = '') => {
    return fetchApi(`/auth/approve-user/${id}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  rejectUser: async (id, notes = '') => {
    return fetchApi(`/auth/reject-user/${id}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
};

