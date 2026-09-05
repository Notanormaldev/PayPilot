import { fetchApi } from '../../../lib/api';

export const dashboardService = {
  fetchKpis: async () => {
    return await fetchApi('/dashboard/kpis');
  },

  fetchTrends: async () => {
    return await fetchApi('/dashboard/trends');
  },

  askCopilot: async (question) => {
    return await fetchApi('/dashboard/copilot', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },
};
