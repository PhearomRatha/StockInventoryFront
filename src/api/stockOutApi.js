import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const stockOutApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.STOCK_OUTS.INDEX, { params }),
  get: (id) => api.get(ENDPOINTS.STOCK_OUTS.SHOW(id)),
  create: (data) => api.post(ENDPOINTS.STOCK_OUTS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.STOCK_OUTS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.STOCK_OUTS.DESTROY(id)),
  getDashboard: () => api.get(ENDPOINTS.STOCK_OUTS.DASHBOARD),
  getReceipt: (id) => api.get(ENDPOINTS.STOCK_OUTS.RECEIPT(id)),
};

export default stockOutApi;
