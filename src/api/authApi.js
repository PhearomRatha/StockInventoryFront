import api from '../plugin/axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/auth`;

// Cookie helper functions
const CookieUtils = {
  set(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },
  
  get(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  remove(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

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
    const response = await api.get(`${API_BASE}/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

// Export cookie utilities
export { CookieUtils };

export default {
  register,
  login,
  logout,
  verifyOtp,
  resendOtp,
  checkUserStatus,
  getCurrentUser,
  CookieUtils
};
