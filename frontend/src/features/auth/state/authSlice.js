import { createSlice } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

const initialRole = authService.getCurrentRole();
const initialToken = authService.getToken();

const initialState = {
  currentRole: initialRole,
  token: initialToken,
  user: {
    name: 'Meera Krishnan',
    email: 'meera.krishnan@paypilot.internal',
    title: 'Chief People & Payroll Officer',
    organization: 'PayPilot Global Inc.',
  },
  isSignedIn: true, // Clerk or dev bypass
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.currentRole = action.payload;
      const { token } = authService.setRole(action.payload);
      state.token = token;
    },
    setSignedIn: (state, action) => {
      state.isSignedIn = action.payload;
    },
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setRole, setSignedIn, setUser } = authSlice.actions;
export default authSlice.reducer;
