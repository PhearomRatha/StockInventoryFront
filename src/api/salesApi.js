import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const salesApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.SALES.INDEX, { params }),
  create: (data) => api.post(ENDPOINTS.SALES.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.SALES.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.SALES.DESTROY(id)),
  getDashboard: () => api.get(ENDPOINTS.SALES.DASHBOARD),
  checkout: (data) => api.post(ENDPOINTS.SALES.CHECKOUT, data),
  verifyPayment: (data) => api.post(ENDPOINTS.SALES.VERIFY_PAYMENT, data),
  getData: () => api.get(ENDPOINTS.SALES.DATA),
  searchProducts: (query) => api.get(ENDPOINTS.SALES.SEARCH_PRODUCTS, { params: { search: query } }),
  searchCustomers: (query) => api.get(ENDPOINTS.SALES.SEARCH_CUSTOMERS, { params: { search: query } }),
};

export default salesApi;
