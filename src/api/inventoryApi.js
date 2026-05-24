import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const inventoryApi = {
  getTransactions: (params = {}) => api.get(ENDPOINTS.INVENTORY.TRANSACTIONS, { params }),
  getTransaction: (id) => api.get(ENDPOINTS.INVENTORY.TRANSACTION(id)),
  getOverview: () => api.get(ENDPOINTS.INVENTORY.OVERVIEW),
  getAdjustments: (params = {}) => api.get(ENDPOINTS.INVENTORY.ADJUSTMENTS, { params }),
  getAdjustment: (id) => api.get(ENDPOINTS.INVENTORY.ADJUSTMENT(id)),
  createAdjustment: (data) => api.post(ENDPOINTS.INVENTORY.ADJUSTMENTS, data),
  getTransfers: (params = {}) => api.get(ENDPOINTS.INVENTORY.TRANSFERS, { params }),
  getTransfer: (id) => api.get(ENDPOINTS.INVENTORY.TRANSFER(id)),
  createTransfer: (data) => api.post(ENDPOINTS.INVENTORY.TRANSFERS, data),
  approveTransfer: (id) => api.post(ENDPOINTS.INVENTORY.TRANSFER_APPROVE(id)),
  rejectTransfer: (id) => api.post(ENDPOINTS.INVENTORY.TRANSFER_REJECT(id)),
  completeTransfer: (id) => api.post(ENDPOINTS.INVENTORY.TRANSFER_COMPLETE(id)),
};

export default inventoryApi;
