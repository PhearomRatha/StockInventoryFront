import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const categoryApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.CATEGORIES.INDEX, { params }),
  get: (id) => api.get(ENDPOINTS.CATEGORIES.SHOW(id)),
  create: (data) => api.post(ENDPOINTS.CATEGORIES.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.CATEGORIES.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.CATEGORIES.DESTROY(id)),
};

export default categoryApi;
