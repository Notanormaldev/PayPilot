import { createSlice } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

const initialToken = authService.getToken();
const initialRole = authService.getCurrentRole();

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('paypilot_user_profile');
    if (stored) return JSON.parse(stored);
  } catch (e) {}

  return {
    name: 'Meera Krishnan',
    email: 'meera.krishnan@paypilot.internal',
    title: 'Chief People & Payroll Officer',
    organization: 'PayPilot Global Inc.',
    department: 'Executive Management',
    role: initialRole || 'ADMIN',
  };
};

const initialState = {
  currentRole: initialRole,
  token: initialToken,
  refreshToken: authService.getRefreshToken(),
  user: getInitialUser(),
  isSignedIn: !!initialToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.isSignedIn = true;
      state.token = accessToken;
      state.refreshToken = refreshToken;
      if (user) {
        state.user = { ...state.user, ...user };
        state.currentRole = user.role || state.currentRole;
        try {
          localStorage.setItem('paypilot_user_profile', JSON.stringify(state.user));
          localStorage.setItem('paypilot_active_role', state.currentRole);
        } catch (e) {}
      }
    },
    logoutUser: (state) => {
      state.isSignedIn = false;
      state.token = null;
      state.refreshToken = null;
      try {
        localStorage.removeItem('paypilot_user_profile');
      } catch (e) {}
      authService.logout();
    },
    setRole: (state, action) => {
      state.currentRole = action.payload;
      const { token } = authService.setRole(action.payload);
      state.token = token;
      state.user = {
        ...state.user,
        role: action.payload,
      };
      try {
        localStorage.setItem('paypilot_user_profile', JSON.stringify(state.user));
      } catch (e) {}
    },
    setSignedIn: (state, action) => {
      state.isSignedIn = action.payload;
    },
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (action.payload?.role) {
        state.currentRole = action.payload.role;
      }
      try {
        localStorage.setItem('paypilot_user_profile', JSON.stringify(state.user));
      } catch (e) {}
    },
    tokenRefreshed: (state, action) => {
      state.token = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
});

export const { loginSuccess, logoutUser, setRole, setSignedIn, setUser, tokenRefreshed } = authSlice.actions;
export default authSlice.reducer;

