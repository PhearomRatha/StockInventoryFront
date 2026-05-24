import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const userApi = {
  getAll: (params = {}) => api.get(ENDPOINTS.ADMIN.USERS, { params }),
  get: (id) => api.get(ENDPOINTS.ADMIN.GET_USER(id)),
  create: (data) => api.post(ENDPOINTS.ADMIN.CREATE_USER, data),
  update: (id, data) => api.patch(ENDPOINTS.ADMIN.UPDATE_USER(id), data),
  delete: (id) => api.delete(ENDPOINTS.ADMIN.DELETE_USER(id)),
  toggleStatus: (id) => api.post(ENDPOINTS.ADMIN.TOGGLE_STATUS(id), { user_id: id }),
  resetPassword: (userId, newPassword) => api.post(ENDPOINTS.ADMIN.RESET_PASSWORD, { user_id: userId, new_password: newPassword }),
};

export default userApi;
