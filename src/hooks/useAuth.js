import { useContext } from 'react';
import AuthContext, { 
  hasRole, 
  hasAnyRole, 
  hasPermission, 
  canManageUser,
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS
} from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook to check if current user has specific role
 */
export const useHasRole = (requiredRole) => {
  const { user } = useAuth();
  return hasRole(user?.role, requiredRole);
};

/**
 * Hook to check if current user has any of the specified roles
 */
export const useHasAnyRole = (allowedRoles) => {
  const { user } = useAuth();
  return hasAnyRole(user?.role, allowedRoles);
};

/**
 * Hook to check if current user has specific permission
 */
export const useHasPermission = (permission) => {
  const { user } = useAuth();
  return hasPermission(user, permission);
};

/**
 * Hook to check if current user can manage a specific user
 */
export const useCanManageUser = (targetUser) => {
  const { user } = useAuth();
  return canManageUser(user, targetUser);
};

/**
 * Hook for role-based redirect logic
 */
export const useRoleRedirect = () => {
  const { user } = useAuth();
  
  const getDashboardPath = () => {
    if (!user?.role) return '/';
    
    switch (user.role) {
      case ROLES.ADMIN:
      case ROLES.MANAGER:
      case ROLES.STAFF:
        return '/';
      default:
        return '/';
    }
  };
  
  return { getDashboardPath };
};

/**
 * Hook for conditional rendering based on user role
 */
export const useRoleGate = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const isStaff = user?.role === ROLES.STAFF;
  
  return {
    isAdmin,
    isManager,
    isStaff,
    isSuperAdmin: user?.role === ROLES.ADMIN,
    role: user?.role
  };
};

export default useAuth;
