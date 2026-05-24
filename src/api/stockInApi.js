import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const stockInApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.STOCK_INS.INDEX, { params }),
  getOverview: () => api.get(ENDPOINTS.STOCK_INS.OVERVIEW),
  create: (data) => api.post(ENDPOINTS.STOCK_INS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.STOCK_INS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.STOCK_INS.DESTROY(id)),
  getTotal: () => api.get(ENDPOINTS.STOCK_INS.TOTAL),
};

export default stockInApi;
