import { useSelector, useDispatch } from 'react-redux';
import { setRole, setUser } from '../state/authSlice';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';

export const useAuthUser = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  // Safe Clerk hook integration
  let clerkUser = null;
  let clerk = null;
  try {
    clerkUser = useUser()?.user;
    clerk = useClerk();
  } catch (e) {
    // Graceful fallback if ClerkProvider is in guest dev mode
  }

  useEffect(() => {
    if (clerkUser) {
      dispatch(
        setUser({
          name: clerkUser.fullName || clerkUser.firstName || 'Meera Krishnan',
          email: clerkUser.primaryEmailAddress?.emailAddress || 'executive@paypilot.internal',
        })
      );
    }
  }, [clerkUser, dispatch]);

  const changeRole = (newRole) => {
    dispatch(setRole(newRole));
  };

  return {
    ...authState,
    clerkUser,
    clerk,
    changeRole,
  };
};
