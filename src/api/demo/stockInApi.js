import { ensureDBInitialized, getCollection, addItem, updateItem, deleteItem, getDB, saveDB, generateRandomDelay } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });
const errorResponse = (message = 'Network Error', status = 500) => ({ success: false, data: null, message, status });

const updateProductStock = (productId, quantityChange) => {
  const db = getDB();
  const products = db['products'] || [];
  const productIndex = products.findIndex(p => p.id == productId);
  if (productIndex !== -1) {
    products[productIndex].stock_quantity = Math.max(0, (products[productIndex].stock_quantity || 0) + quantityChange);
    saveDB(db);
  }
};

export const stockInApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('stock_ins');
    return successResponse({ data: items, total: items.length, current_page: 1, last_page: 1 });
  },
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('stock_ins');
    const item = items.find(s => s.id == id);
    if (!item) return errorResponse('Stock in not found', 404);
    return successResponse(item);
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const products = getCollection('products');
    const suppliers = getCollection('suppliers');
    const now = new Date();
    // If date is provided without time, add random time to it
    let dateWithTime = data.date;
    if (data.date && !data.date.includes('T')) {
      const randomDate = new Date(data.date);
      randomDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      dateWithTime = randomDate.toISOString();
    } else {
      dateWithTime = now.toISOString();
    }
    const product = products.find(p => p.id == data.product_id);
    const supplier = suppliers.find(s => s.id == data.supplier_id);
    const newItem = addItem('stock_ins', {
      ...data,
      product_name: product?.name,
      supplier_name: supplier?.name,
      cost: product?.cost,
      total_amount: (Number(product?.cost || 0)) * Number(data.quantity),
      received_date: dateWithTime,
      date: dateWithTime,
      created_at: now.toISOString()
    });
    updateProductStock(data.product_id, Number(data.quantity));
    return successResponse(newItem, 'Stock in created');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const oldItem = getCollection('stock_ins').find(s => s.id == id);
    const updated = updateItem('stock_ins', id, data);
    if (!updated) return errorResponse('Stock in not found', 404);
    if (oldItem && oldItem.product_id) {
      updateProductStock(oldItem.product_id, -Number(oldItem.quantity));
      updateProductStock(data.product_id, Number(data.quantity));
    }
    return successResponse(updated, 'Stock in updated');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const item = getCollection('stock_ins').find(s => s.id == id);
    const success = deleteItem('stock_ins', id);
    if (success && item && item.product_id) {
      updateProductStock(item.product_id, -Number(item.quantity || item.qty));
    }
    if (!success) return errorResponse('Stock in not found', 404);
    return successResponse(null, 'Stock in deleted');
  },
  getTotal: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse(getCollection('stock_ins').reduce((s, i) => s + (i.quantity || 0), 0));
  },
  getOverview: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const allStockIns = getCollection('stock_ins');
    const allProducts = getCollection('products');
    const allSuppliers = getCollection('suppliers');
    const stock_history = allStockIns.map(item => ({
      ...item,
      product_name: item.product?.name || allProducts.find(p => p.id == item.product_id)?.name,
      supplier_name: item.supplier?.name || allSuppliers.find(s => s.id == item.supplier_id)?.name,
      received_by_name: item.received_by_name || 'Demo User',
      received_date: item.received_date || item.created_at
    }));
    return successResponse({ 
      suppliers: allSuppliers,
      products: allProducts,
      users: [],
      stock_history
    });
  }
};
export default stockInApi;
