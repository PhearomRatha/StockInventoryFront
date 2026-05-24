import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const transferApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.INVENTORY.TRANSFERS, { params }),
  get: (id) => api.get(ENDPOINTS.INVENTORY.TRANSFER(id)),
  create: (data) => api.post(ENDPOINTS.INVENTORY.TRANSFERS, data),
  approve: (id) => api.post(ENDPOINTS.INVENTORY.TRANSFER_APPROVE(id)),
  reject: (id) => api.post(ENDPOINTS.INVENTORY.TRANSFER_REJECT(id)),
  complete: (id) => api.post(ENDPOINTS.INVENTORY.TRANSFER_COMPLETE(id)),
};

export default transferApi;
