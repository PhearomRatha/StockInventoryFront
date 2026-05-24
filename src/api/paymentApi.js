import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const paymentApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.PAYMENTS.INDEX, { params }),
  create: (data) => api.post(ENDPOINTS.PAYMENTS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.PAYMENTS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.PAYMENTS.DESTROY(id)),
  getDashboard: () => api.get(ENDPOINTS.PAYMENTS.DASHBOARD),
  checkout: (data) => api.post(ENDPOINTS.PAYMENTS.CHECKOUT, data),
  verify: (data) => api.post(ENDPOINTS.PAYMENTS.VERIFY, data),
};

export default paymentApi;
