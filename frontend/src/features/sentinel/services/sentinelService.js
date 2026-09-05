import { fetchApi } from '../../../lib/api';

export const sentinelService = {
  fetchFlags: async (status = 'OPEN') => {
    return await fetchApi(`/sentinel/flags?status=${status}`);
  },

  resolveFlag: async (flagId, resolutionNotes) => {
    return await fetchApi(`/sentinel/flags/${flagId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  },
};
