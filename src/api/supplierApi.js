import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const supplierApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.SUPPLIERS.INDEX, { params }),
  create: (data) => api.post(ENDPOINTS.SUPPLIERS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.SUPPLIERS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.SUPPLIERS.DESTROY(id)),
};

export default supplierApi;
