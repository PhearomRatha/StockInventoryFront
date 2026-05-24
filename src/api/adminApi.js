import api from '../plugin/axios';
import ENDPOINTS from '../api/endpoints';

export const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${ENDPOINTS.ADMIN.USERS}?${queryParams}` : ENDPOINTS.ADMIN.USERS;
  const response = await api.get(url);
  return response.data;
};

export const getUsersList = async () => {
  const response = await api.get(ENDPOINTS.ADMIN.USERS_LIST);
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(ENDPOINTS.ADMIN.GET_USER(id));
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post(ENDPOINTS.ADMIN.CREATE_USER, userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(ENDPOINTS.ADMIN.UPDATE_USER(id), userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(ENDPOINTS.ADMIN.DELETE_USER(id));
  return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
  const response = await api.post(ENDPOINTS.ADMIN.RESET_PASSWORD, {
    user_id: userId,
    new_password: newPassword,
  });
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.post(ENDPOINTS.ADMIN.TOGGLE_STATUS(id), { user_id: id });
  return response.data;
};

export const approveUser = async (id) => {
  const response = await api.post(ENDPOINTS.ADMIN.APPROVE_USER, { user_id: id });
  return response.data;
};

export const rejectUser = async (id, reason = '') => {
  const response = await api.post(ENDPOINTS.ADMIN.REJECT_USER, { user_id: id, reason });
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await api.get(ENDPOINTS.ADMIN.PENDING_REQUESTS);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get(ENDPOINTS.ADMIN.STATS);
  return response.data;
};

export default {
  getUsers,
  getUsersList,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  approveUser,
  rejectUser,
  getPendingRequests,
  getAdminStats,
};