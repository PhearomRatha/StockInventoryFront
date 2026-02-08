import api from '../plugin/axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// Register new user
export const register = async (userData) => {
  try {
    const response = await api.post(`${API_BASE}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post(`${API_BASE}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api.post(`${API_BASE}/logout`);
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post(`${API_BASE}/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'OTP verification failed' };
  }
};

// Resend OTP
export const resendOtp = async (email) => {
  try {
    const response = await api.post(`${API_BASE}/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};

// Check user status (for approval tracking)
export const checkUserStatus = async (email) => {
  try {
    const response = await api.post(`${API_BASE}/check-status`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check status' };
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.get(`${API_BASE}/user`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

export default {
  register,
  login,
  logout,
  verifyOtp,
  resendOtp,
  checkUserStatus,
  getCurrentUser
};
