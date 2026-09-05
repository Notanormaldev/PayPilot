import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFlags, resolveFlag } from '../state/sentinelSlice';

export const useSentinel = () => {
  const dispatch = useDispatch();
  const sentinel = useSelector((state) => state.sentinel);

  useEffect(() => {
    dispatch(fetchFlags());
  }, [dispatch]);

  const handleResolve = async (flagId, notes = 'Auto-verified by Chief Officer') => {
    await dispatch(resolveFlag({ flagId, resolutionNotes: notes }));
    dispatch(fetchFlags());
  };

  return {
    ...sentinel,
    fetchFlags: () => dispatch(fetchFlags()),
    resolveFlag: handleResolve,
  };
};
