import { fetchApi } from '../../../lib/api';

export const attendanceService = {
  fetchAttendance: async () => {
    return await fetchApi('/attendance');
  },

  recordPunch: async (employeeId, type) => {
    return await fetchApi('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify({ employeeId, type }),
    });
  },

  fetchLeaveRequests: async () => {
    return await fetchApi('/time-off/requests');
  },

  approveLeave: async (requestId) => {
    return await fetchApi(`/time-off/requests/${requestId}/approve`, {
      method: 'POST',
    });
  },
};
