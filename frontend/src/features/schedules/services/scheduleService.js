import { fetchApi } from '../../../lib/api';

export const scheduleService = {
  fetchSchedules: async () => {
    return await fetchApi('/schedules');
  },

  fetchScheduleById: async (id) => {
    return await fetchApi(`/schedules/${id}`);
  },

  createSchedule: async (data) => {
    return await fetchApi('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSchedule: async (id, data) => {
    return await fetchApi(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteSchedule: async (id) => {
    return await fetchApi(`/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  assignEmployees: async (id, payload) => {
    return await fetchApi(`/schedules/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default scheduleService;
