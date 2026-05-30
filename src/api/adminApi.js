import api from '../plugin/axios';
import ENDPOINTS from '../api/endpoints';
import { isDemoMode } from './demo/authApi';

export const getUsers = async (params = {}) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.getAll(params);
  }
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${ENDPOINTS.ADMIN.USERS}?${queryParams}` : ENDPOINTS.ADMIN.USERS;
  const response = await api.get(url);
  return response.data;
};

export const getUsersList = async () => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    const res = await demo.userApi.getAll();
    return { data: res.data || [] };
  }
  const response = await api.get(ENDPOINTS.ADMIN.USERS_LIST);
  return response.data;
};

export const getUser = async (id) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.get(id);
  }
  const response = await api.get(ENDPOINTS.ADMIN.GET_USER(id));
  return response.data;
};

export const createUser = async (userData) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.create(userData);
  }
  const response = await api.post(ENDPOINTS.ADMIN.CREATE_USER, userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.update(id, userData);
  }
  const response = await api.patch(ENDPOINTS.ADMIN.UPDATE_USER(id), userData);
  return response.data;
};

export const deleteUser = async (id) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.delete(id);
  }
  const response = await api.delete(ENDPOINTS.ADMIN.DELETE_USER(id));
  return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.resetPassword(userId, newPassword);
  }
  const response = await api.post(ENDPOINTS.ADMIN.RESET_PASSWORD, {
    user_id: userId,
    new_password: newPassword,
  });
  return response.data;
};

export const toggleUserStatus = async (id) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    const user = await demo.userApi.get(id);
    if (user.success) {
      const newStatus = user.data.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return demo.userApi.update(id, { status: newStatus });
    }
    return user;
  }
  const response = await api.post(ENDPOINTS.ADMIN.TOGGLE_STATUS(id), { user_id: id });
  return response.data;
};

export const approveUser = async (id) => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.update(id, { status: 'ACTIVE' });
  }
  const response = await api.post(ENDPOINTS.ADMIN.APPROVE_USER, { user_id: id });
  return response.data;
};

export const rejectUser = async (id, reason = '') => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    return demo.userApi.update(id, { status: 'INACTIVE' });
  }
  const response = await api.post(ENDPOINTS.ADMIN.REJECT_USER, { user_id: id, reason });
  return response.data;
};

export const getPendingRequests = async () => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    const res = await demo.userApi.getAll({ status: 'PENDING' });
    return { data: res.data || [] };
  }
  const response = await api.get(ENDPOINTS.ADMIN.PENDING_REQUESTS);
  return response.data;
};

export const getAdminStats = async () => {
  if (isDemoMode()) {
    const demo = await import('./demo/userApi');
    const usersRes = await demo.userApi.getAll();
    return { data: { total_users: usersRes.data?.total || 0 } };
  }
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