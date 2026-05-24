import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const activityLogApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.ACTIVITY_LOGS.INDEX, { params }),
  filter: (params = {}) => api.get(ENDPOINTS.ACTIVITY_LOGS.FILTER, { params }),
  create: (data) => api.post(ENDPOINTS.ACTIVITY_LOGS.STORE, data),
  update: (id, data) => api.patch(ENDPOINTS.ACTIVITY_LOGS.UPDATE(id), data),
  delete: (id) => api.delete(ENDPOINTS.ACTIVITY_LOGS.DESTROY(id)),
};

export default activityLogApi;
