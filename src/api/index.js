import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

const API_BASE = ENDPOINTS;

const getResponseData = (response) => {
  if (response.data?.data !== undefined) {
    return response.data.data;
  }
  return response.data;
};

const getResponse = async (promise) => {
  try {
    const response = await promise;
    return {
      success: true,
      data: getResponseData(response),
      message: response.data?.message || '',
      status: response.status,
    };
  } catch (error) {
    const errorData = error.response?.data || {};
    return {
      success: false,
      data: null,
      message: errorData.message || errorData.error || 'An error occurred',
      errors: errorData.errors || null,
      status: error.response?.status || 500,
    };
  }
};

export const productApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.PRODUCTS.INDEX, { params })),
  get: (id) => getResponse(api.get(ENDPOINTS.PRODUCTS.SHOW(id))),
  create: (data) => getResponse(api.post(ENDPOINTS.PRODUCTS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.PRODUCTS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.PRODUCTS.DESTROY(id))),
  getTotal: () => getResponse(api.get(ENDPOINTS.PRODUCTS.TOTAL)),
  getStockStatus: () => getResponse(api.get(ENDPOINTS.PRODUCTS.STOCK_STATUS)),
};

export const categoryApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.CATEGORIES.INDEX, { params })),
  get: (id) => getResponse(api.get(ENDPOINTS.CATEGORIES.SHOW(id))),
  create: (data) => getResponse(api.post(ENDPOINTS.CATEGORIES.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.CATEGORIES.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.CATEGORIES.DESTROY(id))),
};

export const supplierApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.SUPPLIERS.INDEX, { params })),
  create: (data) => getResponse(api.post(ENDPOINTS.SUPPLIERS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.SUPPLIERS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.SUPPLIERS.DESTROY(id))),
};

export const customerApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.CUSTOMERS.INDEX, { params })),
  get: (id) => getResponse(api.get(ENDPOINTS.CUSTOMERS.SHOW(id))),
  create: (data) => getResponse(api.post(ENDPOINTS.CUSTOMERS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.CUSTOMERS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.CUSTOMERS.DESTROY(id))),
};

export const stockInApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.STOCK_INS.INDEX, { params })),
  getOverview: () => getResponse(api.get(ENDPOINTS.STOCK_INS.OVERVIEW)),
  create: (data) => getResponse(api.post(ENDPOINTS.STOCK_INS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.STOCK_INS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.STOCK_INS.DESTROY(id))),
  getTotal: () => getResponse(api.get(ENDPOINTS.STOCK_INS.TOTAL)),
};

export const stockOutApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.STOCK_OUTS.INDEX, { params })),
  get: (id) => getResponse(api.get(ENDPOINTS.STOCK_OUTS.SHOW(id))),
  create: (data) => getResponse(api.post(ENDPOINTS.STOCK_OUTS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.STOCK_OUTS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.STOCK_OUTS.DESTROY(id))),
  getDashboard: () => getResponse(api.get(ENDPOINTS.STOCK_OUTS.DASHBOARD)),
  getReceipt: (id) => getResponse(api.get(ENDPOINTS.STOCK_OUTS.RECEIPT(id))),
};

export const salesApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.SALES.INDEX, { params })),
  create: (data) => getResponse(api.post(ENDPOINTS.SALES.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.SALES.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.SALES.DESTROY(id))),
  getDashboard: () => getResponse(api.get(ENDPOINTS.SALES.DASHBOARD)),
  checkout: (data) => getResponse(api.post(ENDPOINTS.SALES.CHECKOUT, data)),
  verifyPayment: (data) => getResponse(api.post(ENDPOINTS.SALES.VERIFY_PAYMENT, data)),
  getData: () => getResponse(api.get(ENDPOINTS.SALES.DATA)),
  searchProducts: (query) => getResponse(api.get(ENDPOINTS.SALES.SEARCH_PRODUCTS, { params: { search: query } })),
  searchCustomers: (query) => getResponse(api.get(ENDPOINTS.SALES.SEARCH_CUSTOMERS, { params: { search: query } })),
};

export const paymentApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.PAYMENTS.INDEX, { params })),
  create: (data) => getResponse(api.post(ENDPOINTS.PAYMENTS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.PAYMENTS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.PAYMENTS.DESTROY(id))),
  getDashboard: () => getResponse(api.get(ENDPOINTS.PAYMENTS.DASHBOARD)),
  checkout: (data) => getResponse(api.post(ENDPOINTS.PAYMENTS.CHECKOUT, data)),
  verify: (data) => getResponse(api.post(ENDPOINTS.PAYMENTS.VERIFY, data)),
};

export const reportApi = {
  getSales: (params = {}) => getResponse(api.get(ENDPOINTS.REPORTS.SALES, { params })),
  getFinancial: (params = {}) => getResponse(api.get(ENDPOINTS.REPORTS.FINANCIAL, { params })),
  getStock: (params = {}) => getResponse(api.get(ENDPOINTS.REPORTS.STOCK, { params })),
  getActivityLogs: (params = {}) => getResponse(api.get(ENDPOINTS.REPORTS.ACTIVITY_LOGS, { params })),
};

export const activityLogApi = {
  getAll: (params = {}) => getResponse(api.get(ENDPOINTS.ACTIVITY_LOGS.INDEX, { params })),
  filter: (params = {}) => getResponse(api.get(ENDPOINTS.ACTIVITY_LOGS.FILTER, { params })),
  create: (data) => getResponse(api.post(ENDPOINTS.ACTIVITY_LOGS.STORE, data)),
  update: (id, data) => getResponse(api.patch(ENDPOINTS.ACTIVITY_LOGS.UPDATE(id), data)),
  delete: (id) => getResponse(api.delete(ENDPOINTS.ACTIVITY_LOGS.DESTROY(id))),
};

export const dashboardApi = {
  getOverview: () => getResponse(api.get(ENDPOINTS.DASHBOARD.INDEX)),
};

export default {
  productApi,
  categoryApi,
  supplierApi,
  customerApi,
  stockInApi,
  stockOutApi,
  salesApi,
  paymentApi,
  reportApi,
  activityLogApi,
  dashboardApi,
};
