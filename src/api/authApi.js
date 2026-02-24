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

// Login user with email/password
export const login = async (credentials) => {
  try {
    const response = await api.post(`${API_BASE}/login`, credentials);
    
    // Handle different response formats
    let user = null;
    let token = null;

    // Format 1: { status: 200, data: { user, token } }
    if (response.data.status === 200 && response.data.data) {
      user = response.data.data.user;
      token = response.data.data.token;
    }
    // Format 2: { user, token } (direct)
    else if (response.data.user && response.data.token) {
      user = response.data.user;
      token = response.data.token;
    }
    // Format 3: { success: true, data: { user, token } }
    else if (response.data.success === true && response.data.data) {
      user = response.data.data.user;
      token = response.data.data.token;
    }
    // Format 4: Check for direct token in various locations
    else if (response.data.token || response.data.access_token) {
      token = response.data.token || response.data.access_token;
      user = response.data.user || response.data.data?.user;
    }

    if (token) {
      return { data: { user, token }, status: 200 };
    }
    
    throw response.data || { message: 'Login failed' };
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Login with Google OAuth
export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await api.post(`${API_BASE}/google-login`, { token: googleToken });
    
    // Handle different response formats (same as login)
    let user = null;
    let token = null;

    // Format 1: { status: 200, data: { user, token } }
    if (response.data.status === 200 && response.data.data) {
      user = response.data.data.user;
      token = response.data.data.token;
    }
    // Format 2: { user, token } (direct)
    else if (response.data.user && response.data.token) {
      user = response.data.user;
      token = response.data.token;
    }
    // Format 3: { success: true, data: { user, token } }
    else if (response.data.success === true && response.data.data) {
      user = response.data.data.user;
      token = response.data.data.token;
    }
    // Format 4: Check for direct token in various locations
    else if (response.data.token || response.data.access_token) {
      token = response.data.token || response.data.access_token;
      user = response.data.user || response.data.data?.user;
    }

    if (token) {
      return { data: { user, token }, status: 200 };
    }
    
    throw response.data || { message: 'Google login failed' };
  } catch (error) {
    throw error.response?.data || { message: 'Google login failed' };
  }
};

// Link Google account to existing user
export const linkGoogleAccount = async (googleToken) => {
  try {
    const response = await api.post(`${API_BASE}/link-google`, { token: googleToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to link Google account' };
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

// Verify email with token (from email link)
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`${API_BASE}/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Email verification failed' };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post(`${API_BASE}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend verification email' };
  }
};

// Check email verification status
export const checkVerificationStatus = async (email) => {
  try {
    const response = await api.post(`${API_BASE}/check-verification-status`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check verification status' };
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

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put(`${API_BASE}/profile`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put(`${API_BASE}/change-password`, passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

// Set password for Google users (enable email/password login)
export const setPassword = async (passwordData) => {
  try {
    const response = await api.post(`${API_BASE}/set-password`, passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to set password' };
  }
};

// Forgot password - send reset link
export const forgotPassword = async (email) => {
  try {
    const response = await api.post(`${API_BASE}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send password reset link' };
  }
};

// Reset password with token
export const resetPassword = async (token, password, password_confirmation) => {
  try {
    const response = await api.post(`${API_BASE}/reset-password`, {
      token,
      password,
      password_confirmation
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
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

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const response = await api.post(`${API_BASE}/check-email`, { email });
    return response.data;
  } catch (error) {
    return { exists: false };
  }
};

// Export cookie utilities
export { CookieUtils };

export default {
  register,
  login,
  loginWithGoogle,
  linkGoogleAccount,
  logout,
  verifyEmail,
  resendVerificationEmail,
  checkVerificationStatus,
  getCurrentUser,
  updateProfile,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  checkEmailExists,
  CookieUtils
};
