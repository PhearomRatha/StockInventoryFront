import demoData from './data.json';

const DB_KEY = 'demo-db';

export const defaultDemoUser = {
  id: 999,
  name: 'Demo User',
  email: 'demo@email.com',
  role: 'Admin',
  is_demo: true,
  permissions: [
    'products.view', 'products.create', 'products.update', 'products.delete',
    'categories.view', 'categories.create', 'categories.update', 'categories.delete',
    'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'stock-ins.view', 'stock-ins.create', 'stock-ins.update', 'stock-ins.delete',
    'stock-outs.view', 'stock-outs.create', 'stock-outs.update', 'stock-outs.delete',
    'sales.view', 'sales.create', 'sales.update', 'sales.delete',
    'payments.view', 'payments.create', 'payments.update', 'payments.delete',
    'reports.view', 'reports.create', 'reports.update', 'reports.delete',
    'activity-logs.view', 'activity-logs.create', 'activity-logs.update', 'activity-logs.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'users.view', 'users.create', 'users.update', 'users.delete',
    'profile.edit'
  ]
};

export const demoUser = defaultDemoUser;

export const reinitializeDB = () => {
  localStorage.removeItem(DB_KEY);
  return initializeDemoDB();
};

export const ensureDBInitialized = () => {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
      return initializeDemoDB();
    }
    try {
      const data = JSON.parse(existing);
      // If products is empty or categories missing color (old data), reinitialize
      const needsReinit = (!data.products || data.products.length === 0) ||
        !data.categories?.some(cat => cat.color) ||
        !data.payments || data.payments.length === 0 ||
        !data.activity_logs?.some(log => log.record_id !== undefined) ||
        !data.users || data.users.length === 0;
      if (needsReinit) {
        return initializeDemoDB();
      }
      return data;
    } catch (e) {
      return initializeDemoDB();
    }
  };

export const initializeDemoDB = () => {
   const now = new Date();
   const currentYear = now.getFullYear();
   const currentMonth = now.getMonth();
   
   const monthsAgo = (m) => {
     const d = new Date(currentYear, currentMonth - m, 1);
     return d;
   };
   
   const categories = demoData.categories;
   const suppliers = demoData.suppliers.map((s, i) => ({ 
     ...s, 
     created_at: monthsAgo(2 - (i % 3)).toISOString()
   }));
   const customers = demoData.customers.map((c, i) => ({ 
     ...c, 
     created_at: monthsAgo(0).toISOString()
   }));
   const products = demoData.products.map((p, i) => ({ 
     ...p, 
     created_at: monthsAgo(0).toISOString()
   }));
   const sales = demoData.sales.map((s, i) => ({ 
     ...s, 
     created_at: monthsAgo(0).toISOString()
   }));
   const stockIns = demoData.stock_ins.map((s, i) => ({ 
     ...s, 
     created_at: monthsAgo(0).toISOString()
   }));
 const stockOuts = demoData.stock_outs.map((s, i) => ({ 
     ...s, 
     created_at: monthsAgo(0).toISOString()
   }));
   
    const payments = demoData.payments.map((p, i) => ({ 
      ...p, 
      payment_date: now.toISOString().split('T')[0]
    }));
    
    const activity_logs = demoData.activity_logs.map((a, i) => ({ 
      ...a, 
      created_at: new Date(now.getTime() - (demoData.activity_logs.length - i) * 60000).toISOString()
    }));
    
    // Add older data for comparison (distributed across previous months)
   const oldCustomers = Array.from({ length: 8 }, (_, i) => ({
     id: 100 + i,
     name: `Customer ${i + 1}`,
     email: `cust${i + 1}@example.com`,
     phone: `+1-555-${1000 + i}`,
     address: "City",
     created_at: monthsAgo(1).toISOString()
   }));
   
   const oldProducts = Array.from({ length: 5 }, (_, i) => ({
     id: 100 + i,
     name: `Product ${i + 1}`,
     description: "Product desc",
     price: 50 + i * 20,
     cost: 30 + i * 10,
     stock_quantity: 5 + i * 2,
     category_id: (i % 3) + 1,
     category: { id: (i % 3) + 1, name: ["Electronics", "Clothing", "Furniture"][i % 3] },
     sku: `NEW-${i + 1}`,
     barcode: `NEW${i + 1}`,
     created_at: monthsAgo(1).toISOString()
   }));
   
   const oldStockIns = Array.from({ length: 6 }, (_, i) => ({
     id: 100 + i,
     product_id: (i % 10) + 1,
     quantity: 15 + i * 3,
     supplier_id: (i % 5) + 1,
     supplier: { id: (i % 5) + 1, name: ["Apple Inc", "Samsung Ltd", "Nike Supplies", "IKEA Wholesale", "Amazon Business"][i % 5] },
     created_at: monthsAgo(1).toISOString()
   }));
   
   const oldStockOuts = Array.from({ length: 6 }, (_, i) => ({
     id: 100 + i,
     product_id: (i % 10) + 1,
     quantity: 3 + i,
     customer_id: 100 + i,
     customer: { id: 100 + i, name: `Customer ${i + 1}` },
     created_at: monthsAgo(1).toISOString()
   }));
   
const initialData = {
      products: [...products, ...oldProducts],
      categories,
      suppliers,
      customers: [...customers, ...oldCustomers],
      sales,
      stock_ins: [...stockIns, ...oldStockIns],
      stock_outs: [...stockOuts, ...oldStockOuts],
      inventory: [],
      payments,
      activity_logs,
      users: demoData.users || [],
      dashboard: null,
      user: defaultDemoUser
    };
   localStorage.setItem(DB_KEY, JSON.stringify(initialData));
   return initialData;
 };

export const getDB = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initializeDemoDB();
  } catch (e) {
    return initializeDemoDB();
  }
};

export const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const clearDB = () => {
  localStorage.removeItem(DB_KEY);
};

export const getCollection = (collection) => {
  const db = getDB();
  return db[collection] || [];
};

export const addItem = (collection, item) => {
  const db = getDB();
  const existing = db[collection] || [];
  const maxId = existing.length > 0 ? Math.max(...existing.map(i => i.id || 0)) : 0;
  const now = new Date().toISOString();
  const newItem = { ...item, id: item.id || maxId + 1, created_at: item.created_at || now };
  existing.push(newItem);
  db[collection] = existing;
  saveDB(db);
  return newItem;
};

export const updateItem = (collection, id, updates) => {
  const db = getDB();
  const items = db[collection] || [];
  const index = items.findIndex(item => item.id == id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    db[collection] = items;
    saveDB(db);
    return items[index];
  }
  return null;
};

export const deleteItem = (collection, id) => {
  const db = getDB();
  const items = db[collection] || [];
  const index = items.findIndex(item => item.id == id);
  if (index !== -1) {
    items.splice(index, 1);
    db[collection] = items;
    saveDB(db);
    return true;
  }
  return false;
};

export const paginate = (items, page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc') => {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
  
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = sorted.slice(start, start + limit);
  
  return {
    data: paginated,
    total,
    page,
    last_page: totalPages,
    per_page: limit
  };
};

export const generateRandomDelay = () => {
  return Math.floor(Math.random() * 600) + 200;
};

export const simulateFailure = () => {
  // Disable simulated failures - they cause inconsistent behavior
  return false;
};

export const filterItems = (items, filters = {}) => {
  return items.filter(item => {
    if (!item) return false;
    return Object.entries(filters).every(([key, value]) => {
      if (!value && value !== 0) return true;
      const itemValue = item[key];
      if (typeof value === 'string' && itemValue != null) {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      return itemValue == value;
    });
  });
};
