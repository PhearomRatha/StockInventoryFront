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

// Permission definitions using module/action structure
// Each module contains actions with boolean values or role-specific rules
export const MODULE_PERMISSIONS = {
  // User Management
  users: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    },
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: 'staff', // Can only edit Staff
      [ROLES.STAFF]: false
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: 'staff', // Can only delete Staff
      [ROLES.STAFF]: false
    },
    resetPassword: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    }
  },
  
  // Reports & Logs
  reports: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    }
  },
  activity_logs: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    }
  },
  
  // Categories & Suppliers
  categories: {
    manage: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    }
  },
  suppliers: {
    manage: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    }
  },
  
  // Products
  products: {
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: false
    },
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Profile
  profile: {
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    changePassword: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Roles (Admin only)
  roles: {
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: false,
      [ROLES.STAFF]: false
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: false,
      [ROLES.STAFF]: false
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: false,
      [ROLES.STAFF]: false
    },
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: false,
      [ROLES.STAFF]: false
    },
    managePermissions: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: false,
      [ROLES.STAFF]: false
    }
  },
  
  // Dashboard
  dashboard: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Sales
  sales: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Payments
  payments: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Customers
  customers: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Stock In
  stock_ins: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  },
  
  // Stock Out
  stock_outs: {
    view: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    create: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    edit: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    },
    delete: {
      [ROLES.ADMIN]: true,
      [ROLES.MANAGER]: true,
      [ROLES.STAFF]: true
    }
  }
};

export const PERMISSIONS = MODULE_PERMISSIONS;

// ==================== Permission Helper Functions ====================

export const hasPermission = (user, moduleOrPerm, action) => {
  if (!user || !moduleOrPerm) return false;

  // Support hasPermission(user, 'products.view') single string
  if (!action && typeof moduleOrPerm === 'string' && moduleOrPerm.includes('.')) {
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(moduleOrPerm);
    }
    // fallback parse
    const [m, a] = moduleOrPerm.split('.');
    return hasPermission(user, m, a);
  }

  const module = moduleOrPerm;
  if (!action) return false;

  // Prefer backend-provided permissions
  if (Array.isArray(user.permissions)) {
    const permKey = `${module}.${action}`;
    if (user.permissions.includes(permKey)) {
      return true;
    }
  }

  // Fallback hardcoded
  if (!MODULE_PERMISSIONS[module] || !MODULE_PERMISSIONS[module][action]) return false;

  const role = user.role;
  const permissionConfig = MODULE_PERMISSIONS[module][action];

  if (typeof permissionConfig[role] === 'boolean') {
    return permissionConfig[role];
  }

  if (permissionConfig[role] === 'staff') {
    return role === ROLES.MANAGER;
  }

  return false;
};

export const hasLegacyPermission = (user, permission) => {
  const permissionMap = {
    VIEW_USERS: ['users', 'view'],
    CREATE_USERS: ['users', 'create'],
    EDIT_USERS: ['users', 'edit'],
    DELETE_USERS: ['users', 'delete'],
    RESET_USER_PASSWORD: ['users', 'resetPassword'],
    VIEW_REPORTS: ['reports', 'view'],
    VIEW_ACTIVITY_LOGS: ['activity_logs', 'view'],
    MANAGE_CATEGORIES: ['categories', 'manage'],
    MANAGE_SUPPLIERS: ['suppliers', 'manage'],
    CREATE_PRODUCTS: ['products', 'create'],
    EDIT_PRODUCTS: ['products', 'edit'],
    DELETE_PRODUCTS: ['products', 'delete'],
    VIEW_ALL_PRODUCTS: ['products', 'view'],
    EDIT_OWN_PROFILE: ['profile', 'edit'],
    CHANGE_OWN_PASSWORD: ['profile', 'changePassword']
  };

  const mapping = permissionMap[permission];
  if (!mapping) return false;

  return hasPermission(user, mapping[0], mapping[1]);
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
          const userData = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
          const normalizedUser = normalizeUser(userData);
          setUser(normalizedUser);
          // also persist normalized version so old bad data is cleaned
          CookieUtils.set(USER_NAME, JSON.stringify(normalizedUser), 7);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setToken(storedToken);
          setIsAuthenticated(true);

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      }
      setLoading(false);
    };

    initAuth();
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
