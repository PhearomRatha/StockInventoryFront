/**
 * Admin API Module
 * Handles all admin-specific API endpoints
 */

import api from '../plugin/axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/admin`;

// =====================
// PENDING USER REQUESTS
// =====================

// Get all pending user requests
export const getPendingRequests = async () => {
  try {
    const response = await api.get(`${API_BASE}/pending-requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch pending requests' };
  }
};

// Approve a user request
export const approveUser = async (userId) => {
  try {
    const response = await api.post(`${API_BASE}/approve-user`, { user_id: userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve user' };
  }
};

// Reject a user request
export const rejectUser = async (userId) => {
  try {
    const response = await api.post(`${API_BASE}/reject-user`, { user_id: userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject user' };
  }
};

// =====================
// USER MANAGEMENT
// =====================

// Get all users (with pagination and search)
export const getAllUsers = async (page = 1, search = '') => {
  try {
    const params = new URLSearchParams({ page, ...(search && { search }) });
    const response = await api.get(`${API_BASE}/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

// Get admin statistics
export const getStats = async () => {
  try {
    const response = await api.get(`${API_BASE}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch stats' };
  }
};

// Toggle user status (active/inactive)
export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.post(`${API_BASE}/toggle-status`, { user_id: userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle user status' };
  }
};

// Update user information
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`${API_BASE}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

// =====================
// EXPORTS
// =====================

export default {
  getPendingRequests,
  approveUser,
  rejectUser,
  getAllUsers,
  getStats,
  toggleUserStatus,
  updateUser,
};
