import { ensureDBInitialized, getCollection, addItem, updateItem, deleteItem, paginate, generateRandomDelay } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });
const errorResponse = (message = 'Network Error', status = 500) => ({ success: false, data: null, message, status });
export const customerApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('customers');
    return successResponse({ data: items, total: items.length });
  },
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('customers');
    const item = items.find(c => c.id == id);
    if (!item) return errorResponse('Customer not found', 404);
    return successResponse(item);
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse(addItem('customers', data), 'Customer created successfully');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const updated = updateItem('customers', id, data);
    if (!updated) return errorResponse('Customer not found', 404);
    return successResponse(updated, 'Customer updated successfully');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const success = deleteItem('customers', id);
    if (!success) return errorResponse('Customer not found', 404);
    return successResponse(null, 'Customer deleted successfully');
  }
};
export default customerApi;
