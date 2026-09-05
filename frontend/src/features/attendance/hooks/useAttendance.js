import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAttendanceData, approveLeave, punchAttendance } from '../state/attendanceSlice';
import { Button } from '@mantine/core';

export const useAttendance = () => {
  const dispatch = useDispatch();
  const attendance = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchAttendanceData());
  }, [dispatch]);

  const handleApprove = async (requestId) => {
    await dispatch(approveLeave(requestId));
    dispatch(fetchAttendanceData());
  };

  const handlePunch = async (employeeId, type) => {
    await dispatch(punchAttendance({ employeeId, type }));
    dispatch(fetchAttendanceData());
    Button
  };

  return {
    ...attendance,
    fetchAttendanceData: () => dispatch(fetchAttendanceData()),
    approveLeave: handleApprove,
    punchAttendance: handlePunch,
  };
};
