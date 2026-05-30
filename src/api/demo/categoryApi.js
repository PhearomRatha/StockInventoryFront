import { ensureDBInitialized, getCollection, addItem, updateItem, deleteItem, generateRandomDelay, simulateFailure } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });
const errorResponse = (message = 'Network Error', status = 500) => ({ success: false, data: null, message, status });
export const categoryApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('categories');
    return successResponse({ data: items, total: items.length });
  },
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('categories');
    const item = items.find(c => c.id == id);
    if (!item) return errorResponse('Category not found', 404);
    return successResponse(item);
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const newItem = addItem('categories', data);
    return successResponse(newItem, 'Category created successfully');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const updated = updateItem('categories', id, data);
    if (!updated) return errorResponse('Category not found', 404);
    return successResponse(updated, 'Category updated successfully');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const success = deleteItem('categories', id);
    if (!success) return errorResponse('Category not found', 404);
    return successResponse(null, 'Category deleted successfully');
  }
};
export default categoryApi;
