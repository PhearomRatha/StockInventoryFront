import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, hasAnyRole, ROLES } from "../../context/AuthContext";
import { ElMessage } from "../../utils/message";

/**
 * ProtectedRoute - Protects routes based on authentication and role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (optional)
 * @param {string} props.requiredPermission - Permission required to access this route (optional)
 * @param {boolean} props.requireAuth - Whether to require authentication (default: true)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requiredPermission,
  requireAuth = true 
}) => {
  const { isAuthenticated, loading, user, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If not requiring auth and not authenticated, render children
  if (!requireAuth && !isAuthenticated) {
    return children;
  }

  // Check if user has allowed role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(user?.role, allowedRoles)) {
      // Show access denied message
      ElMessage.error("You don't have permission to access this page.");
      
      // Redirect to dashboard or home based on user role
      return <Navigate to="/" replace />;
    }
  }

  // Check if user has required permission
  if (requiredPermission) {
    if (!hasPermission(user, requiredPermission)) {
      // Show access denied message
      ElMessage.error("You don't have permission to access this page.");
      
      // Redirect to dashboard
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

/**
 * GuestRoute - Redirects to dashboard if already authenticated
 * Used for login, signup, etc.
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * AdminRoute - Only allows Admin access
 */
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      children={children} 
      allowedRoles={[ROLES.ADMIN]} 
    />
  );
};

/**
 * ManagerRoute - Allows Admin and Manager access
 */
export const ManagerRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      children={children} 
      allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} 
    />
  );
};

/**
 * StaffRoute - Allows all authenticated users (Admin, Manager, Staff)
 */
export const StaffRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      children={children} 
      allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]} 
    />
  );
};

/**
 * UserManagementRoute - Protected route for user management pages
 * Admin: full access
 * Manager: can only access to manage Staff
 * Staff: no access
 */
export const UserManagementRoute = ({ children }) => {
  const { user, canManageUser } = useAuth();

  return (
    <ProtectedRoute 
      children={children} 
      allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} 
    />
  );
};

/**
 * ReportsRoute - Protected route for reports
 * Admin and Manager only
 */
export const ReportsRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      children={children} 
      allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} 
      requiredPermission="VIEW_REPORTS"
    />
  );
};

/**
 * ActivityLogsRoute - Protected route for activity logs
 * Admin and Manager only
 */
export const ActivityLogsRoute = ({ children }) => {
  return (
    <ProtectedRoute 
      children={children} 
      allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} 
      requiredPermission="VIEW_ACTIVITY_LOGS"
    />
  );
};

export default ProtectedRoute;
