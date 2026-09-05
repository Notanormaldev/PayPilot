import { useSelector, useDispatch } from 'react-redux';
import { setRole, setUser, setSignedIn } from '../state/authSlice';
import { authService } from '../services/authService';

export const useAuthUser = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const changeRole = (newRole) => {
    dispatch(setRole(newRole));
  };

  const logout = () => {
    authService.logout();
    dispatch(setSignedIn(false));
  };

  return {
    ...authState,
    changeRole,
    logout,
  };
};
