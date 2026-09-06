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

  correctAttendance: async (attendanceId, payload) => {
    return await fetchApi(`/attendance/${attendanceId}/correct`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  createManualAttendance: async (payload) => {
    return await fetchApi('/attendance/manual-entry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  fetchTimeOffTypes: async () => {
    return await fetchApi('/time-off/types');
  },

  createTimeOffType: async (payload) => {
    return await fetchApi('/time-off/types', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateTimeOffType: async (id, payload) => {
    return await fetchApi(`/time-off/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteTimeOffType: async (id) => {
    return await fetchApi(`/time-off/types/${id}`, {
      method: 'DELETE',
    });
  },
};

