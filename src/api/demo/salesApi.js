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

export const salesApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('sales');
    return successResponse({ data: items, total: items.length, current_page: 1, last_page: 1 });
  },
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const newItem = addItem('sales', data);
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        updateProductStock(item.product_id, -Number(item.quantity));
      });
    }
    return successResponse(newItem, 'Sale created successfully');
  },
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const oldItem = getCollection('sales').find(s => s.id == id);
    const updated = updateItem('sales', id, data);
    if (!updated) return errorResponse('Sale not found', 404);
    if (oldItem && data.items && Array.isArray(data.items)) {
      const oldItems = oldItem.items || [];
      oldItems.forEach(item => updateProductStock(item.product_id, Number(item.quantity)));
      data.items.forEach(item => updateProductStock(item.product_id, -Number(item.quantity)));
    }
    return successResponse(updated, 'Sale updated successfully');
  },
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const sale = getCollection('sales').find(s => s.id == id);
    const success = deleteItem('sales', id);
    if (success && sale && sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        updateProductStock(item.product_id, Number(item.quantity));
      });
    }
    if (!success) return errorResponse('Sale not found', 404);
    return successResponse(null, 'Sale deleted successfully');
  },
  getDashboard: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('sales');
    return successResponse({
      total_sales: items.length,
      total_revenue: items.reduce((s, i) => s + (i.total_amount || 0), 0),
      recent_transactions: items.slice(-5)
    });
  },
  getData: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse({ products: getCollection('products'), customers: getCollection('customers') });
  },
  searchProducts: async (query) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('products').filter(p => p?.name?.toLowerCase?.().includes(query?.toLowerCase() || ''));
    return successResponse({ data: items });
  },
  searchCustomers: async (query) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const items = getCollection('customers').filter(c => c?.name?.toLowerCase?.().includes(query?.toLowerCase() || ''));
    return successResponse({ data: items });
  },
  checkout: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const now = new Date().toISOString();
    const sales = getCollection('sales');
    const maxId = sales.length > 0 ? Math.max(...sales.map(s => s.id || 0)) : 0;
    const invoiceNumber = `INV-${String(maxId + 1).padStart(5, '0')}`;
    const totalAmount = (data.items || []).reduce((sum, item) => {
      const product = getCollection('products').find(p => p.id == item.product_id);
      const price = product ? product.price : 0;
      return sum + price * Number(item.quantity) - (price * Number(item.quantity) * (Number(item.discount_percent) / 100));
    }, 0);
    const newItem = addItem('sales', { 
      ...data, 
      invoice_number: invoiceNumber, 
      created_at: now,
      total_amount: totalAmount,
      payment_status: 'paid'
    });
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        updateProductStock(item.product_id, -Number(item.quantity));
      });
    }
    return successResponse({ 
      ...newItem, 
      invoice_number: invoiceNumber, 
      qr_string: data.payment_method === 'Bakong' ? `00020101021115311974011600520446BONG1000231208129140010ratha@bkrt5204599953031165802KH5914RA THA Phearom6010Phnom Penh63043AD8` : null, 
      md5: data.payment_method === 'Bakong' ? `1EDZ9iEBbsjqscJv8` : null, 
      sale: { id: newItem.id }
    });
  },
  verifyPayment: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    // If demo sale ID (starts with "demo-"), get the last created sale
    if (data.sale_id?.toString().startsWith("demo-")) {
      const sales = getCollection('sales');
      const lastSale = sales[sales.length - 1];
      if (lastSale) {
        updateItem('sales', lastSale.id, { payment_status: 'paid' });
        return successResponse({ state: 'paid', acknowledgedDateMs: Date.now() });
      }
    }
    const sales = getCollection('sales');
    const sale = sales.find(s => s.id == data.sale_id);
    if (sale) {
      updateItem('sales', sale.id, { payment_status: 'paid' });
      return successResponse({ state: 'paid', acknowledgedDateMs: Date.now() });
    }
    return errorResponse('Sale not found', 404);
  }
};
export default salesApi;
