import { fetchApi } from '../../../lib/api';

export const sentinelService = {
  fetchFlags: async (status = 'OPEN') => {
    return await fetchApi(`/sentinel/flags?status=${status}`);
  },

  validateIfsc: async (ifsc) => {
    return await fetchApi(`/sentinel/validate-ifsc?ifsc=${encodeURIComponent(ifsc)}`);
  },

  resolveFlag: async (flagId, dataOrNotes) => {
    const payload = typeof dataOrNotes === 'string'
      ? { resolutionNotes: dataOrNotes, officerConfirmation: true }
      : { ...dataOrNotes };

    return await fetchApi(`/sentinel/flags/${flagId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyAndResolveFlag: async (flagId, payload) => {
    return await fetchApi(`/sentinel/flags/${flagId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
