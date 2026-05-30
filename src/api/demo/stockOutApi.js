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

export const stockOutApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('stock_outs');
    return successResponse({ data: items, total: items.length, current_page: 1, last_page: 1 });
  },
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('stock_outs');
    const item = items.find(s => s.id == id);
    if (!item) return errorResponse('Stock out not found', 404);
    return successResponse(item);
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const products = getCollection('products');
    const customers = getCollection('customers');
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
    const maxId = getCollection('stock_outs').length > 0 ? Math.max(...getCollection('stock_outs').map(s => s.id || 0)) : 0;
    const product = products.find(p => p.id == data.product_id);
    const customer = customers.find(c => c.id == data.customer_id);
    const totalAmount = (Number(product?.price || 0)) * Number(data.quantity);
    const newItem = addItem('stock_outs', {
      ...data,
      product_name: product?.name,
      customer_name: customer?.name,
      unit_price: product?.price,
      total_amount: totalAmount,
      sold_date: dateWithTime,
      date: dateWithTime,
      created_at: now.toISOString()
    });
    updateProductStock(data.product_id, -Number(data.quantity));
    return successResponse(newItem, 'Stock out created');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const oldItem = getCollection('stock_outs').find(s => s.id == id);
    const updated = updateItem('stock_outs', id, data);
    if (!updated) return errorResponse('Stock out not found', 404);
    if (oldItem && oldItem.product_id) {
      updateProductStock(oldItem.product_id, Number(oldItem.quantity));
      updateProductStock(data.product_id, -Number(data.quantity));
    }
    return successResponse(updated, 'Stock out updated');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const item = getCollection('stock_outs').find(s => s.id == id);
    const success = deleteItem('stock_outs', id);
    if (success && item && item.product_id) {
      updateProductStock(item.product_id, Number(item.quantity || item.qty));
    }
    if (!success) return errorResponse('Stock out not found', 404);
    return successResponse(null, 'Stock out deleted');
  },
  getDashboard: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('stock_outs');
    const products = getCollection('products');
    const customers = getCollection('customers');
    const stock_outs = items.map(item => ({
      ...item,
      customer_name: item.customer?.name || customers.find(c => c.id == item.customer_id)?.name,
      product_name: item.product?.name || products.find(p => p.id == item.product_id)?.name,
      unit_price: item.unit_price || products.find(p => p.id == item.product_id)?.price,
      date: item.sold_date || item.date || item.created_at
    }));
    return successResponse({ 
      products: products.map(p => ({ ...p, stock_quantity: p.stock_quantity || 0 })),
      customers,
      stock_outs,
      users: []
    });
  },
  getReceipt: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('stock_outs');
    const item = items.find(s => s.id == id);
    if (!item) return errorResponse('Stock out not found', 404);
    return successResponse(item);
  }
};
export default stockOutApi;
