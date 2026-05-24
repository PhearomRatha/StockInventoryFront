import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const customerApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.CUSTOMERS.INDEX, { params }),
  get: (id) => api.get(ENDPOINTS.CUSTOMERS.SHOW(id)),
  create: (data) => api.post(ENDPOINTS.CUSTOMERS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.CUSTOMERS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.CUSTOMERS.DESTROY(id)),
};

export default customerApi;
