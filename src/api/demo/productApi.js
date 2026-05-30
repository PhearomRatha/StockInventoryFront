// Demo Product API
import { ensureDBInitialized, getCollection, addItem, updateItem, deleteItem, paginate, filterItems, generateRandomDelay } from './storage';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Return in same format as real API after axios unwraps: { success: true, data: { data: [...], total: N }, ... }
const successResponse = (data, message = 'Success') => ({ success: true, data, message: message || 'Success', status: 200 });
const errorResponse = (message = 'Network Error', status = 500) => ({ success: false, data: null, message, status });

export const productApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    let items = getCollection('products');
    // Ensure items is always an array
    if (!Array.isArray(items)) items = [];
    if (params.search) {
      items = filterItems(items, { name: params.search });
    }
    const result = paginate(items, params.page, params.per_page || 10);
    // Return data directly so axios interceptor unwraps it: response.data = { data: [...], total: N }
    return successResponse({ data: result.data, total: result.total });
  },
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('products');
    const item = items.find(p => p.id == id);
    if (!item) return errorResponse('Product not found', 404);
    return successResponse(item);
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    
    // Handle FormData from ProductPage
    const product = data instanceof FormData ? {
      name: data.get('name'),
      category_id: data.get('category_id') ? Number(data.get('category_id')) : null,
      supplier_id: data.get('supplier_id') ? Number(data.get('supplier_id')) : null,
      cost: data.get('cost') ? Number(data.get('cost')) : 0,
      stock_quantity: data.get('stock_quantity') ? Number(data.get('stock_quantity')) : 0,
      image: data.get('image') ? URL.createObjectURL(data.get('image')) : null,
    } : data;
    
    const categories = getCollection('categories');
    const suppliers = getCollection('suppliers');
    const now = new Date().toISOString();
    
    const newProduct = {
      ...product,
      category: categories.find(c => c.id == product.category_id),
      supplier: suppliers.find(s => s.id == product.supplier_id),
      price: product.cost * 1.5,
      sku: `SKU-${String(product.category_id || 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      barcode: `BAR-${Date.now()}`,
      created_at: now,
    };
    
    const newItem = addItem('products', newProduct);
    return successResponse(newItem, 'Product created successfully');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    
    // Handle FormData from ProductPage
    const updates = data instanceof FormData ? {
      name: data.get('name'),
      category_id: data.get('category_id') ? Number(data.get('category_id')) : null,
      supplier_id: data.get('supplier_id') ? Number(data.get('supplier_id')) : null,
      cost: data.get('cost') ? Number(data.get('cost')) : 0,
      stock_quantity: data.get('stock_quantity') ? Number(data.get('stock_quantity')) : 0,
      image: data.get('image') ? URL.createObjectURL(data.get('image')) : null,
    } : data;
    
    const categories = getCollection('categories');
    const suppliers = getCollection('suppliers');
    const updated = updateItem('products', id, {
      ...updates,
      category: categories.find(c => c.id == updates.category_id),
      supplier: suppliers.find(s => s.id == updates.supplier_id),
    });
    if (!updated) return errorResponse('Product not found', 404);
    return successResponse(updated, 'Product updated successfully');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const success = deleteItem('products', id);
    if (!success) return errorResponse('Product not found', 404);
    return successResponse(null, 'Product deleted successfully');
  },
  getTotal: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse(getCollection('products').length);
  },
  getStockStatus: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('products');
    return successResponse({ in_stock: items.filter(p => p.stock_quantity > 10).length, low_stock: items.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length, out_of_stock: items.filter(p => p.stock_quantity === 0).length });
  }
};

export default productApi;
