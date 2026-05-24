import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const productApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.PRODUCTS.INDEX, { params }),
  get: (id) => api.get(ENDPOINTS.PRODUCTS.SHOW(id)),
  create: (data) => api.post(ENDPOINTS.PRODUCTS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.PRODUCTS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.PRODUCTS.DESTROY(id)),
  getTotal: () => api.get(ENDPOINTS.PRODUCTS.TOTAL),
  getStockStatus: () => api.get(ENDPOINTS.PRODUCTS.STOCK_STATUS),
};

export default productApi;
