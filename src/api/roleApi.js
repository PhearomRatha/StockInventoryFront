import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const roleApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.ROLES.INDEX, { params }),
  get: (id) => api.get(ENDPOINTS.ROLES.SHOW(id)),
  create: (data) => api.post(ENDPOINTS.ROLES.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.ROLES.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.ROLES.DESTROY(id)),
  getPublic: () => api.get(ENDPOINTS.PUBLIC.ROLES),
};

export default roleApi;
