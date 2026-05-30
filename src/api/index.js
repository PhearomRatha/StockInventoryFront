// Hybrid API Layer - routes to demo or real API based on user context
import realApi from './realApi';
import { CookieUtils } from './authApi';
import { isDemoMode } from './demo/authApi';
import { defaultDemoUser } from './demo/storage';
import { roleApi as realRoleApi } from './roleApi';

// Auth API imports
import { register, login, logout, getCurrentUser, updateProfile, changePassword, forgotPassword, resetPassword, verifyOtp, resendOtp } from './authApi';

// Auth API - uses demo auth for demo user login, real auth for others
// Demo credentials: demo@email.com / password123, admin@example.com / password123, etc.
export const authApi = {
  register: async (userData) => {
    const demoEmails = ['demo@email.com', 'admin@example.com', 'manager@example.com', 'staff@example.com', 'casher@example.com'];
    if (demoEmails.includes(userData.email)) {
      const demo = await import('./demo/authApi');
      return demo.authApi.register(userData);
    }
    return register(userData);
  },
  login: async (credentials) => {
    // Check if this is any demo user immediately (before waiting for API)
    const demoEmails = ['demo@email.com', 'admin@example.com', 'manager@example.com', 'staff@example.com', 'casher@example.com'];
    if (demoEmails.includes(credentials.email) && credentials.password === 'password123') {
      const demo = await import('./demo/authApi');
      return demo.authApi.login(credentials);
    }
    return login(credentials);
  },
  logout,
  getCurrentUser: async (...args) => {
    if (isDemoMode()) {
      const demo = await import('./demo/authApi');
      return demo.authApi.getCurrentUser(...args);
    }
    return getCurrentUser(...args);
  },
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp
};

// Role API - needs special handling for demo mode
export const roleApi = {
  getAll: async (params = {}) => {
    if (isDemoMode()) {
      const demo = await import('./demo/authApi');
      return { data: await demo.authApi.getRoles() };
    }
    return realRoleApi.getAll(params);
  },
  get: async (id) => {
    if (isDemoMode()) {
      const demo = await import('./demo/authApi');
      const roles = await demo.authApi.getRoles();
      const role = roles.data?.find(r => r.id == id);
      return { data: role || null };
    }
    return realRoleApi.get(id);
  },
  create: (...args) => realRoleApi.create(...args),
  update: (...args) => realRoleApi.update(...args),
  delete: (...args) => realRoleApi.delete(...args),
  getPublic: (...args) => realRoleApi.getPublic(...args)
};

// Create API functions that check demo mode at runtime
const createApi = (apiName) => {
  const methods = {};
  const methodNames = ['getAll', 'get', 'create', 'update', 'delete', 'getTotal', 'getStockStatus', 'getStock', 'getDashboard', 'getData', 'searchProducts', 'searchCustomers', 'checkout', 'verifyPayment', 'verify', 'getReceipt', 'getOverview', 'getFinancial', 'getSales', 'getActivityLogs', 'filter', 'resetPassword'];
  
  methodNames.forEach(method => {
    methods[method] = async (...args) => {
      if (isDemoMode()) {
        const demo = await import(`./demo/${apiName === 'productApi' ? 'productApi' : apiName === 'categoryApi' ? 'categoryApi' : apiName === 'supplierApi' ? 'supplierApi' : apiName === 'customerApi' ? 'customerApi' : apiName === 'salesApi' ? 'salesApi' : apiName === 'stockInApi' ? 'stockInApi' : apiName === 'stockOutApi' ? 'stockOutApi' : apiName === 'paymentApi' ? 'paymentApi' : apiName === 'reportApi' ? 'reportApi' : apiName === 'activityLogApi' ? 'activityLogApi' : apiName === 'inventoryApi' ? 'inventoryApi' : 'dashboardApi'}.js`);
        const api = demo.default || demo;
        if (api[method]) {
          return api[method](...args);
        }
      }
      const real = realApi[apiName];
      if (real && real[method]) {
        return real[method](...args);
      }
      return { success: false, data: null, message: 'API not found' };
    };
  });
  
  return methods;
};

export const productApi = createApi('productApi');
export const categoryApi = createApi('categoryApi');
export const supplierApi = createApi('supplierApi');
export const customerApi = createApi('customerApi');
export const salesApi = createApi('salesApi');
export const stockInApi = createApi('stockInApi');
export const stockOutApi = createApi('stockOutApi');
export const paymentApi = createApi('paymentApi');
export const reportApi = createApi('reportApi');
export const activityLogApi = createApi('activityLogApi');
export const inventoryApi = createApi('inventoryApi');
export const dashboardApi = createApi('dashboardApi');

export { CookieUtils, isDemoMode, defaultDemoUser };

// Default export
export default { productApi, categoryApi, supplierApi, customerApi, salesApi, stockInApi, stockOutApi, paymentApi, reportApi, activityLogApi, inventoryApi, dashboardApi };
