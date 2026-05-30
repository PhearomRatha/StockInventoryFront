import { ensureDBInitialized, getCollection, addItem, updateItem, deleteItem, generateRandomDelay } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });
const errorResponse = (message = 'Network Error', status = 500) => ({ success: false, data: null, message, status });
export const supplierApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('suppliers');
    return successResponse({ data: items, total: items.length });
  },
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('suppliers');
    const item = items.find(s => s.id == id);
    if (!item) return errorResponse('Supplier not found', 404);
    return successResponse(item);
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse(addItem('suppliers', data), 'Supplier created successfully');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const updated = updateItem('suppliers', id, data);
    if (!updated) return errorResponse('Supplier not found', 404);
    return successResponse(updated, 'Supplier updated successfully');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    deleteItem('suppliers', id);
    return successResponse(null, 'Supplier deleted successfully');
  }
};
export default supplierApi;
