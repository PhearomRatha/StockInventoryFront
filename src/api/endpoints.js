/**
 * Centralized API Endpoints Configuration
 * Based on backend routes from routes/api.php
 */

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export const ENDPOINTS = {
  // =====================
  // AUTH ROUTES
  // =====================
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    GOOGLE_LOGIN: `${API_BASE}/auth/google`,
    LINK_GOOGLE: `${API_BASE}/auth/link-google`,
    LOGOUT: `${API_BASE}/auth/logout`,
    LOGOUT_ALL: `${API_BASE}/auth/logout-all`,
    ME: `${API_BASE}/auth/me`,
    VERIFY_EMAIL: (token) => `${API_BASE}/auth/verify-email/${token}`,
    RESEND_VERIFICATION: `${API_BASE}/auth/resend-verification`,
    CHECK_VERIFICATION_STATUS: `${API_BASE}/auth/check-verification-status`,
    CHECK_EMAIL: `${API_BASE}/auth/check-email`,
    REFRESH: `${API_BASE}/auth/refresh`,
    PROFILE: `${API_BASE}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
    SET_PASSWORD: `${API_BASE}/auth/set-password`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },

  // =====================
  // ADMIN ROUTES (Admin, Manager)
  // =====================
  ADMIN: {
    PENDING_REQUESTS: `${API_BASE}/admin/pending-requests`,
    APPROVE_USER: `${API_BASE}/admin/approve-user`,
    REJECT_USER: `${API_BASE}/admin/reject-user`,
    USERS: `${API_BASE}/users`,
    USERS_LIST: `${API_BASE}/users`,
    GET_USER: (id) => `${API_BASE}/users/${id}`,
    CREATE_USER: `${API_BASE}/users`,
    UPDATE_USER: (id) => `${API_BASE}/users/${id}`,
    DELETE_USER: (id) => `${API_BASE}/users/${id}`,
    TOGGLE_STATUS: (id) => `${API_BASE}/users/${id}/toggle-status`,
    STATS: `${API_BASE}/admin/stats`,
    RESET_PASSWORD: `${API_BASE}/admin/reset-password`,
  },

  // =====================
  // DASHBOARD ROUTES
  // =====================
  DASHBOARD: {
    INDEX: `${API_BASE}/dashboard/index`,
  },

  // =====================
  // ROLES ROUTES (Admin Only)
  // =====================
  ROLES: {
    INDEX: `${API_BASE}/roles`,
    STORE: `${API_BASE}/roles`,
    UPDATE: (id) => `${API_BASE}/roles/${id}`,
    DESTROY: (id) => `${API_BASE}/roles/${id}`,
  },

  // =====================
  // PRODUCTS ROUTES
  // =====================
  PRODUCTS: {
    INDEX: `${API_BASE}/products`,
    SHOW: (id) => `${API_BASE}/products/${id}`,
    STORE: `${API_BASE}/products`,
    UPDATE: (id) => `${API_BASE}/products/${id}`,
    DESTROY: (id) => `${API_BASE}/products/${id}`,
    TOTAL: `${API_BASE}/products/total`,
    STOCK_STATUS: `${API_BASE}/products/stock-status`,
  },

  // =====================
  // CATEGORIES ROUTES
  // =====================
  CATEGORIES: {
    INDEX: `${API_BASE}/categories`,
    SHOW: (id) => `${API_BASE}/categories/${id}`,
    STORE: `${API_BASE}/categories`,
    UPDATE: (id) => `${API_BASE}/categories/${id}`,
    DESTROY: (id) => `${API_BASE}/categories/${id}`,
  },

  // =====================
  // SUPPLIERS ROUTES
  // =====================
  SUPPLIERS: {
    INDEX: `${API_BASE}/suppliers`,
    STORE: `${API_BASE}/suppliers`,
    UPDATE: (id) => `${API_BASE}/suppliers/${id}`,
    DESTROY: (id) => `${API_BASE}/suppliers/${id}`,
  },

  // =====================
  // CUSTOMERS ROUTES
  // =====================
  CUSTOMERS: {
    INDEX: `${API_BASE}/customers`,
    SHOW: (id) => `${API_BASE}/customers/${id}`,
    STORE: `${API_BASE}/customers`,
    UPDATE: (id) => `${API_BASE}/customers/${id}`,
    DESTROY: (id) => `${API_BASE}/customers/${id}`,
  },

  // =====================
  // STOCK INS ROUTES
  // =====================
  STOCK_INS: {
    INDEX: `${API_BASE}/stock-ins`,
    OVERVIEW: `${API_BASE}/stock-ins/overview`,
    STORE: `${API_BASE}/stock-ins`,
    UPDATE: (id) => `${API_BASE}/stock-ins/${id}`,
    DESTROY: (id) => `${API_BASE}/stock-ins/${id}`,
    TOTAL: `${API_BASE}/stock-ins/totalStockIn`,
  },

  // =====================
  // STOCK OUTS ROUTES
  // =====================
  STOCK_OUTS: {
    INDEX: `${API_BASE}/stock-outs`,
    STORE: `${API_BASE}/stock-outs`,
    UPDATE: (id) => `${API_BASE}/stock-outs/${id}`,
    SHOW: (id) => `${API_BASE}/stock-outs/${id}`,
    DASHBOARD: `${API_BASE}/stock-outs/stock-out-dashboard`,
    RECEIPT: (id) => `${API_BASE}/stock-outs/${id}/receipt`,
  },

  // =====================
  // SALES ROUTES
  // =====================
  SALES: {
    INDEX: `${API_BASE}/sales`,
    STORE: `${API_BASE}/sales`,
    UPDATE: (id) => `${API_BASE}/sales/${id}`,
    DESTROY: (id) => `${API_BASE}/sales/${id}`,
    DASHBOARD: `${API_BASE}/sales/dashboard`,
    CHECKOUT: `${API_BASE}/sales/checkout`,
    VERIFY_PAYMENT: `${API_BASE}/sales/verify-payment`,
    DATA: `${API_BASE}/sales/data`,
  },

  // =====================
  // PAYMENTS ROUTES
  // =====================
  PAYMENTS: {
    INDEX: `${API_BASE}/payments`,
    STORE: `${API_BASE}/payments`,
    UPDATE: (id) => `${API_BASE}/payments/${id}`,
    DESTROY: (id) => `${API_BASE}/payments/${id}`,
    DASHBOARD: `${API_BASE}/payments/dashboard`,
    CHECKOUT: `${API_BASE}/payments/checkout`,
    VERIFY: `${API_BASE}/payments/verify`,
  },

  // =====================
  // REPORTS ROUTES (Admin, Manager Only)
  // =====================
  REPORTS: {
    SALES: `${API_BASE}/reports/sales`,
    FINANCIAL: `${API_BASE}/reports/financial`,
    STOCK: `${API_BASE}/reports/stock`,
    ACTIVITY_LOGS: `${API_BASE}/reports/activity-logs`,
  },

  // =====================
  // ACTIVITY LOGS ROUTES (Admin, Manager)
  // =====================
  ACTIVITY_LOGS: {
    INDEX: `${API_BASE}/activity-logs`,
    FILTER: `${API_BASE}/activity-logs/filter`,
    STORE: `${API_BASE}/activity-logs`,
    UPDATE: (id) => `${API_BASE}/activity-logs/${id}`,
    DESTROY: (id) => `${API_BASE}/activity-logs/${id}`,
  },

  // =====================
  // PUBLIC ROUTES
  // =====================
  PUBLIC: {
    ROLES: `${API_BASE}/roles`,
  },
};

export default ENDPOINTS;
