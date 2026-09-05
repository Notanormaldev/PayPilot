import { fetchApi } from '../../../lib/api';

export const salaryStructureService = {
  fetchStructures: async () => {
    return await fetchApi('/salary-structures');
  },

  fetchStructureById: async (id) => {
    return await fetchApi(`/salary-structures/${id}`);
  },

  createStructure: async (data) => {
    return await fetchApi('/salary-structures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStructure: async (id, data) => {
    return await fetchApi(`/salary-structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStructure: async (id) => {
    return await fetchApi(`/salary-structures/${id}`, {
      method: 'DELETE',
    });
  },

  simulateStructure: async (payload) => {
    return await fetchApi('/salary-structures/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default salaryStructureService;
