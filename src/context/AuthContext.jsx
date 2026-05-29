import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../plugin/axios';
import { logout as apiLogout, CookieUtils } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_NAME = 'auth_token';
const USER_NAME = 'auth_user';

// Role constants
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  CASHER: 'Casher'
};

// Role hierarchy level (higher number = more privileges)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: -1,
  [ROLES.MANAGER]: 2,
  [ROLES.STAFF]: 3,
  [ROLES.CASHER]: 4
};

// Legacy permission mapping for backward compatibility
// Maps legacy permission names (e.g., VIEW_USERS) to module.action format
// Based on backend Permission::MODULES and Permission::ACTIONS
// For pages that require multiple permissions, we check the primary permission (view)
const PERMISSION_MAP = {
  VIEW_USERS: 'users.view',
  CREATE_USERS: 'users.create',
  EDIT_USERS: 'users.update',
  DELETE_USERS: 'users.delete',
  RESET_USER_PASSWORD: 'users.update',
  VIEW_REPORTS: 'reports.view',
  VIEW_ACTIVITY_LOGS: 'activity-logs.view',
  MANAGE_CATEGORIES: 'categories.view',
  MANAGE_SUPPLIERS: 'suppliers.view',
  CREATE_PRODUCTS: 'products.create',
  EDIT_PRODUCTS: 'products.update',
  DELETE_PRODUCTS: 'products.delete',
  VIEW_ALL_PRODUCTS: 'products.view',
  EDIT_OWN_PROFILE: 'profile.edit',
  CHANGE_OWN_PASSWORD: 'profile.edit'
};

// ==================== Permission Helper Functions ====================

export const hasPermission = (user, moduleOrPerm, action) => {
  if (!user || !moduleOrPerm) return false;

  // Support hasPermission(user, 'products.view') single string
  if (!action && typeof moduleOrPerm === 'string' && moduleOrPerm.includes('.')) {
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(moduleOrPerm);
    }
    return false;
  }

  const module = moduleOrPerm;
  if (!action) return false;

  // Check backend-provided permissions (array of "module.action" strings)
  if (Array.isArray(user.permissions)) {
    const permKey = `${module}.${action}`;
    return user.permissions.includes(permKey);
  }

  return false;
};

export const hasLegacyPermission = (user, permission) => {
  const moduleAction = PERMISSION_MAP[permission];
  if (!moduleAction) return false;
  return hasPermission(user, moduleAction);
};

export const canManageUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  const currentRole = currentUser.role;
  const targetRole = targetUser.role;

  // Admin can manage everyone
  if (currentRole === ROLES.ADMIN) return true;

  // Manager can manage staff
  if (currentRole === ROLES.MANAGER && targetRole === ROLES.STAFF) return true;

  return false;
};

const getRoleName = (role) => {
  if (!role) return null;
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role.name) return role.name;
  return null;
};

export const hasRole = (userOrRole, role) => {
  const roleName = getRoleName(typeof userOrRole === 'object' && userOrRole !== null && 'role' in userOrRole ? userOrRole.role : userOrRole);
  return Boolean(roleName && role && roleName === role);
};

export const hasAnyRole = (userOrRole, roles) => {
  if (!userOrRole || !Array.isArray(roles)) return false;
  const roleName = getRoleName(typeof userOrRole === 'object' && userOrRole !== null && 'role' in userOrRole ? userOrRole.role : userOrRole);
  return roles.includes(roleName);
};

/**
 * Normalize user data so that `role` is always a string (e.g. "Admin")
 * even if backend sends {id, name, ...} relation object (from /me or old responses).
 */
const normalizeUser = (userData) => {
  if (!userData) return userData;
  let role = userData.role;
  if (role && typeof role === 'object' && role.name) {
    role = role.name;
  }
  return { ...userData, role };
};

// ==================== AuthProvider Component ====================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from cookies/localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = CookieUtils.get(TOKEN_NAME) || localStorage.getItem('token');
        const storedUser = CookieUtils.get(USER_NAME) || localStorage.getItem('user');

        if (storedToken && storedUser) {
          let userData;
          try {
            userData = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
          } catch (e) {
            console.warn('Failed to parse stored user data:', e);
            clearAuth();
            setLoading(false);
            return;
          }
          
          const normalizedUser = normalizeUser(userData);
          setUser(normalizedUser);
          CookieUtils.set(USER_NAME, JSON.stringify(normalizedUser), 7);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setToken(storedToken);
          setIsAuthenticated(true);

          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for token expiration events from axios interceptor
    const handleTokenExpired = () => {
      clearAuth();
    };
    window.addEventListener('auth:tokenExpired', handleTokenExpired);
    return () => window.removeEventListener('auth:tokenExpired', handleTokenExpired);
  }, []);

  // Login function - stores token in both cookie and fallback localStorage
  const login = useCallback(async (userData, authToken) => {
    try {
      const tokenValue = authToken || userData.token;
      const normalizedUser = normalizeUser(userData);
      
      setUser(normalizedUser);
      setToken(tokenValue);
      setIsAuthenticated(true);

      // Store in cookies (primary)
      CookieUtils.set(TOKEN_NAME, tokenValue, 7);
      CookieUtils.set(USER_NAME, JSON.stringify(normalizedUser), 7);
      
      // Also store in localStorage as fallback
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

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
    const merged = { ...user, ...updates };
    const normalized = normalizeUser(merged);
    setUser(normalized);
    CookieUtils.set(USER_NAME, JSON.stringify(normalized), 7);
    localStorage.setItem('user', JSON.stringify(normalized));
  }, [user]);

  // Get dashboard path based on user role
  const getDashboardPath = useCallback(() => {
    if (!user?.role) return '/';
    
    switch (user.role) {
      case ROLES.ADMIN:
      case ROLES.MANAGER:
      case ROLES.STAFF:
      case ROLES.CASHER:
        return '/';
      default:
        return '/';
    }
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === ROLES.ADMIN;
  }, [user]);

  // Check if user is manager
  const isManager = useCallback(() => {
    return user?.role === ROLES.MANAGER;
  }, [user]);

  // Check if user is staff
  const isStaff = useCallback(() => {
    return user?.role === ROLES.STAFF;
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    clearAuth,
    getDashboardPath,
    isAdmin,
    isManager,
    isStaff,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasLegacyPermission,
    canManageUser,
    ROLES,
    ROLE_HIERARCHY
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;