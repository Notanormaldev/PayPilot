import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setRole, setUser, setSignedIn, loginSuccess, logoutUser } from '../state/authSlice';
import { authService } from '../services/authService';

export const useAuthUser = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(logoutUser());
    };

    window.addEventListener('paypilot_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('paypilot_auth_expired', handleAuthExpired);
  }, [dispatch]);

  const changeRole = (newRole) => {
    dispatch(setRole(newRole));
  };

  const login = async (email, password, role) => {
    const data = await authService.login(email, password, role);
    dispatch(loginSuccess(data));
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (!data.pendingVerification && data.accessToken) {
      dispatch(loginSuccess(data));
    }
    return data;
  };

  const verifyOtp = async (email, otpCode) => {
    const data = await authService.verifyOtp(email, otpCode);
    if (data.accessToken) {
      dispatch(loginSuccess(data));
    }
    return data;
  };

  const resendOtp = async (email) => {
    const data = await authService.resendOtp(email);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    dispatch(logoutUser());
  };

  return {
    ...authState,
    changeRole,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
  };
};

