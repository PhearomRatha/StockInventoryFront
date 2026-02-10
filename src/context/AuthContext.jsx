import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../plugin/axios';
import { logout as apiLogout, CookieUtils } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_NAME = 'auth_token';
const USER_NAME = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = CookieUtils.get(TOKEN_NAME);
      const storedUser = CookieUtils.get(USER_NAME);

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Auth initialization error:', error);
          clearAuth();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function - stores token in both cookie and fallback localStorage
  const login = useCallback(async (userData, authToken) => {
    try {
      const tokenValue = authToken || userData.token;
      
      setUser(userData);
      setToken(tokenValue);
      setIsAuthenticated(true);

      // Store in cookies (primary)
      CookieUtils.set(TOKEN_NAME, tokenValue, 7);
      CookieUtils.set(USER_NAME, JSON.stringify(userData), 7);
      
      // Also store in localStorage as fallback
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;

      return { success: true };
    } catch (error) {
      console.error('Login error in context:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Attempt to revoke token on backend
      await apiLogout();
    } catch (err) {
      console.error('Backend logout failed:', err);
    } finally {
      clearAuth();
    }
  }, []);

  // Clear authentication data
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Remove from cookies
    CookieUtils.remove(TOKEN_NAME);
    CookieUtils.remove(USER_NAME);
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
  };

  // Update user data (e.g., after profile update)
  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    CookieUtils.set(USER_NAME, JSON.stringify(updatedUser), 7);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
