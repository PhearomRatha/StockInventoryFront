import { ensureDBInitialized, getCollection, updateItem, deleteItem, paginate, generateRandomDelay, saveDB, getDB } from './storage';
import demoData from './data.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });
const errorResponse = (message = 'Network Error', status = 500) => ({ success: false, data: null, message, status });

export const userApi = {
  getAll: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    
    // Get users from DB or fallback to demoData
    let items = getCollection('users');
    if (!items || items.length === 0) {
      // If DB doesn't have users, add them from demoData
      const db = getDB();
      db.users = demoData.users || [];
      saveDB(db);
      items = db.users;
    }
    
    const { page = 1, role, status, search } = params;
    
    if (search) {
      const searchLower = String(search).toLowerCase();
      items = items.filter(u => 
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (role && role !== 'all') {
      items = items.filter(u => u.role === role);
    }
    
    if (status && status !== 'all') {
      items = items.filter(u => u.status === status);
    }
    
    const result = paginate(items, page, 8);
    return successResponse({ 
      data: result.data, 
      total: result.total,
      current_page: result.page,
      last_page: result.last_page
    });
  },
  
  get: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    let items = getCollection('users');
    if (!items || items.length === 0) {
      const db = getDB();
      db.users = demoData.users || [];
      saveDB(db);
      items = db.users;
    }
    const item = items.find(u => u.id == id);
    if (!item) return errorResponse('User not found', 404);
    const { password, ...userWithoutPassword } = item;
    return successResponse(userWithoutPassword);
  },
  
  create: async (data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const db = getDB();
    let users = db.users || [];
    if (users.length === 0) {
      users = demoData.users || [];
    }
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) : 0;
    const now = new Date().toISOString();
    const newUser = {
      id: maxId + 1,
      name: data.name,
      email: data.email,
      role: data.role || 'Staff',
      status: data.status || 'ACTIVE',
      password: data.password,
      created_at: now
    };
    users.push(newUser);
    db.users = users;
    saveDB(db);
    const { password, ...userWithoutPassword } = newUser;
    return successResponse(userWithoutPassword, 'User created successfully');
  },
  
  update: async (id, data) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    let items = updateItem('users', id, data);
    if (!items) {
      // Try to update in the fallback data
      const db = getDB();
      db.users = demoData.users || [];
      saveDB(db);
      items = updateItem('users', id, data);
    }
    if (!items) return errorResponse('User not found', 404);
    const { password, ...userWithoutPassword } = items;
    return successResponse(userWithoutPassword, 'User updated successfully');
  },
  
  delete: async (id) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    let success = deleteItem('users', id);
    if (!success) {
      // Initialize users and try again
      const db = getDB();
      db.users = demoData.users || [];
      saveDB(db);
      success = deleteItem('users', id);
    }
    if (!success) return errorResponse('User not found', 404);
    return successResponse(null, 'User deleted successfully');
  },
  
  resetPassword: async (userId, newPassword) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    let items = getCollection('users');
    if (!items || items.length === 0) {
      const db = getDB();
      db.users = demoData.users || [];
      saveDB(db);
      items = db.users;
    }
    const index = items.findIndex(u => u.id == userId);
    if (index === -1) return errorResponse('User not found', 404);
    items[index].password = newPassword;
    const db = getDB();
    db.users = items;
    saveDB(db);
    return successResponse(null, 'Password reset successfully');
  }
};

export default userApi;