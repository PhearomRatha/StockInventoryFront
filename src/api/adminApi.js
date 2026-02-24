import api from '../plugin/axios';
import ENDPOINTS from '../api/endpoints';

const API_BASE = ENDPOINTS.ADMIN.USERS;

// Get auth headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Get all users (Admin sees all, Manager sees Staff only)
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${ENDPOINTS.ADMIN.USERS}?${queryParams}` : ENDPOINTS.ADMIN.USERS;
    const response = await api.get(url, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

// Get users list (simplified for dropdowns)
export const getUsersList = async () => {
  try {
    const response = await api.get(ENDPOINTS.ADMIN.USERS_LIST, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users list' };
  }
};

// Get single user
export const getUser = async (id) => {
  try {
    const response = await api.get(ENDPOINTS.ADMIN.GET_USER(id), { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

// Create new user (Admin can create any role, Manager can only create Staff)
export const createUser = async (userData) => {
  try {
    const response = await api.post(ENDPOINTS.ADMIN.CREATE_USER, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create user' };
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(ENDPOINTS.ADMIN.UPDATE_USER(id), userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(ENDPOINTS.ADMIN.DELETE_USER(id), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

// Reset user password (Admin/Manager can reset any user password)
export const resetUserPassword = async (id, newPassword) => {
  try {
    const response = await api.post(
      ENDPOINTS.ADMIN.RESET_USER_PASSWORD(id),
      { password: newPassword },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset user password' };
  }
};

// Toggle user status (active/inactive)
export const toggleUserStatus = async (id, status) => {
  try {
    const response = await api.post(
      ENDPOINTS.ADMIN.TOGGLE_STATUS,
      { user_id: id, status },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle user status' };
  }
};

// Approve pending user
export const approveUser = async (id) => {
  try {
    const response = await api.post(
      ENDPOINTS.ADMIN.APPROVE_USER,
      { user_id: id },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve user' };
  }
};

// Reject pending user
export const rejectUser = async (id, reason = '') => {
  try {
    const response = await api.post(
      ENDPOINTS.ADMIN.REJECT_USER,
      { user_id: id, reason },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject user' };
  }
};

// Get pending requests
export const getPendingRequests = async () => {
  try {
    const response = await api.get(ENDPOINTS.ADMIN.PENDING_REQUESTS, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch pending requests' };
  }
};

// Get admin stats
export const getAdminStats = async () => {
  try {
    const response = await api.get(ENDPOINTS.ADMIN.STATS, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin stats' };
  }
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
