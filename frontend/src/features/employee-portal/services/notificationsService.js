import { fetchApi } from '../../../lib/api';

export const notificationsService = {
  fetchNotifications: async () => {
    return await fetchApi('/notifications');
  },

  markRead: async (id) => {
    return await fetchApi('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  markAllRead: async () => {
    return await fetchApi('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ all: true }),
    });
  },
};
