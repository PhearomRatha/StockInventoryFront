import { ensureDBInitialized, getCollection, generateRandomDelay } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });
export const inventoryApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('inventory');
    return successResponse({ data: items, total: items.length, current_page: 1, last_page: 1 });
  },
  getTransactions: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse({ data: [] });
  },
  getOverview: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse({ total_value: getCollection('products').reduce((s, i) => s + ((i.cost || 0) * (i.stock_quantity || 0)), 0) });
  }
};
export default inventoryApi;
