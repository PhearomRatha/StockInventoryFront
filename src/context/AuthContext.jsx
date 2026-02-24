import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../plugin/axios';
import { logout as apiLogout, CookieUtils } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_NAME = 'auth_token';
const USER_NAME = 'auth_user';

// Role hierarchy and permissions
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff'
};

// Role hierarchy level (higher number = more privileges)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.STAFF]: 1
};

// Check if user has specific role
export const hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Check if user has any of the specified roles
export const hasAnyRole = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles || !Array.isArray(allowedRoles)) return false;
  return allowedRoles.includes(userRole);
};

// Permission definitions for each role
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  CREATE_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  EDIT_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: 'staff', // Can only edit Staff
    [ROLES.STAFF]: false
  },
  DELETE_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: 'staff', // Can only delete Staff
    [ROLES.STAFF]: false
  },
  RESET_USER_PASSWORD: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },

  // Reports & Logs
  VIEW_REPORTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  VIEW_ACTIVITY_LOGS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },

  // Categories & Suppliers
  MANAGE_CATEGORIES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  MANAGE_SUPPLIERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },

  // Products
  CREATE_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  EDIT_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  DELETE_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false
  },
  VIEW_ALL_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true
  },

  // Profile
  EDIT_OWN_PROFILE: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true
  },
  CHANGE_OWN_PASSWORD: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true
  }
};

// Check if user has a specific permission
export const hasPermission = (user, permission) => {
  if (!user || !permission || !PERMISSIONS[permission]) return false;
  
  const role = user.role;
  const permissionConfig = PERMISSIONS[permission];
  
  if (typeof permissionConfig[role] === 'boolean') {
    return permissionConfig[role];
  }
  
  // For permissions like EDIT_USERS where Manager can only edit Staff
  if (permissionConfig[role] === 'staff') {
    return role === ROLES.MANAGER;
  }
  
  return false;
};

// Check if user can perform action on target user
export const canManageUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  const currentRole = currentUser.role;
  const targetRole = targetUser.role;
  
  // Admin can manage everyone
  if (currentRole === ROLES.ADMIN) return true;
  
  // Manager can only manage Staff
  if (currentRole === ROLES.MANAGER && targetRole === ROLES.STAFF) return true;
  
  // Staff cannot manage anyone
  return false;
};

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

  // Get dashboard path based on user role
  const getDashboardPath = useCallback(() => {
    if (!user?.role) return '/';
    
    switch (user.role) {
      case ROLES.ADMIN:
      case ROLES.MANAGER:
      case ROLES.STAFF:
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
    canManageUser,
    ROLES,
    ROLE_HIERARCHY,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
