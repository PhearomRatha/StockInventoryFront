import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const warehouseApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.INVENTORY.WAREHOUSES, { params }),
  get: (id) => api.get(ENDPOINTS.INVENTORY.WAREHOUSE(id)),
  create: (data) => api.post(ENDPOINTS.INVENTORY.WAREHOUSES, data),
  update: (id, data) => api.patch(ENDPOINTS.INVENTORY.WAREHOUSE(id), data),
  delete: (id) => api.delete(ENDPOINTS.INVENTORY.WAREHOUSE(id)),
  getStock: (id, params) => api.get(ENDPOINTS.INVENTORY.WAREHOUSE_STOCK(id), { params }),
};

export default warehouseApi;
