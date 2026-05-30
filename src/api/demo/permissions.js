// Role/Permission Engine for Demo Mode
import { getDB } from './storage';

export const PERMISSION_MODULES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUPPLIERS: 'suppliers',
  CUSTOMERS: 'customers',
  SALES: 'sales',
  STOCK_IN: 'stock-ins',
  STOCK_OUT: 'stock-outs',
  PAYMENTS: 'payments',
  REPORTS: 'reports',
  ACTIVITY_LOGS: 'activity-logs',
  INVENTORY: 'inventory',
  USERS: 'users',
  PROFILE: 'profile'
};

export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const checkPermission = (user, module, action) => {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  if (!Array.isArray(user.permissions)) return false;
  const permKey = `${module}.${action}`;
  return user.permissions.includes(permKey);
};

export const hasRole = (user, role) => {
  return user?.role === role;
};

export const getPermissions = (user) => {
  if (!user) return [];
  return user.permissions || [];
};

export const getUserRoles = () => {
  return [
    { id: 1, name: 'Admin', permissions: Object.values(PERMISSION_MODULES).flatMap(m => Object.values(PERMISSION_ACTIONS).map(a => `${m}.${a}`)) },
    { id: 2, name: 'Manager', permissions: ['products.view', 'products.create', 'products.update', 'sales.view', 'sales.create'] },
    { id: 3, name: 'Staff', permissions: ['products.view'] },
    { id: 4, name: 'Casher', permissions: ['sales.view', 'sales.create', 'payments.view', 'payments.create'] }
  ];
};
