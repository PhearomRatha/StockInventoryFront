import { demoUser, getDB, generateRandomDelay, reinitializeDB, saveDB } from './storage';
import demoData from './data.json';

const DEMO_USERS = {
  'demo@email.com': { role: 'Admin', token: 'demo-token-999' },
  'admin@example.com': { role: 'Admin', token: 'demo-token-1', name: 'Penly Admin' },
  'manager@example.com': { role: 'Manager', token: 'demo-token-2', name: 'Sreytin Manager' },
  'staff@example.com': { role: 'Staff', token: 'demo-token-3', name: 'Ratha Staff' },
  'casher@example.com': { role: 'Casher', token: 'demo-token-4', name: 'Vannak Casher' }
};

const DEMO_PASSWORD = 'password123';

const getAdminPermissions = () => [
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
  'profile.edit', 'RESET_USER_PASSWORD'
];

const getManagerPermissions = () => [
  'products.view', 'products.create', 'products.update', 'products.delete',
  'categories.view', 'categories.create', 'categories.update', 'categories.delete',
  'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
  'customers.view', 'customers.create', 'customers.update', 'customers.delete',
  'stock-ins.view', 'stock-ins.create', 'stock-ins.update', 'stock-ins.delete',
  'stock-outs.view', 'stock-outs.create', 'stock-outs.update', 'stock-outs.delete',
  'sales.view', 'sales.create', 'sales.update', 'sales.delete',
  'payments.view', 'payments.create', 'payments.update', 'payments.delete',
  'reports.view',
  'activity-logs.view',
  'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
  'users.view', 'users.create', 'users.update', 'users.delete', 'CREATE_USERS'
];

const getStaffPermissions = () => [
  'products.view',
  'stock-ins.view',
  'stock-outs.view',
  'sales.view', 'sales.create',
  'inventory.view',
  'customers.view'
];

const getCasherPermissions = () => [
  'sales.view', 'sales.create',
  'products.view'
];

const getUserPermissions = (role) => {
  switch (role) {
    case 'Admin': return getAdminPermissions();
    case 'Manager': return getManagerPermissions();
    case 'Staff': return getStaffPermissions();
    case 'Casher': return getCasherPermissions();
    default: return [];
  }
};

export const isDemoMode = () => {
  try {
    const token = localStorage.getItem('token');
    if (token && token.includes('demo-token')) {
      return true;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.is_demo === true && DEMO_USERS[user?.email]) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (credentials) => {
    await delay(generateRandomDelay());
    
    const demoConfig = DEMO_USERS[credentials.email];
    if (demoConfig && credentials.password === DEMO_PASSWORD) {
      reinitializeDB();
      const roleId = demoConfig.role === 'Admin' ? 1 : demoConfig.role === 'Manager' ? 2 : demoConfig.role === 'Staff' ? 3 : 4;
      const user = {
        id: demoConfig.token === 'demo-token-999' ? 999 : 
            demoConfig.token === 'demo-token-1' ? 1 :
            demoConfig.token === 'demo-token-2' ? 2 :
            demoConfig.token === 'demo-token-3' ? 3 : 4,
        name: demoConfig.name || (demoConfig.role === 'Admin' ? 'Penly Admin' :
              demoConfig.role === 'Manager' ? 'Sreytin Manager' :
              demoConfig.role === 'Staff' ? 'Ratha Staff' : 'Vannak Casher'),
        email: credentials.email,
        role: demoConfig.role,
        role_id: roleId,
        is_demo: true,
        permissions: getUserPermissions(demoConfig.role)
      };
      return { data: { user, token: demoConfig.token }, status: 200 };
    }
    
    throw { message: 'Invalid credentials', status: 401 };
  },
  
  register: async (userData) => {
    await delay(generateRandomDelay());
    const db = getDB();
    let users = db.users || [...demoData.users];
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) : 0;
    
    const now = new Date().toISOString();
    const pendingUser = {
      id: maxId + 1,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'Staff',
      role_id: 3,
      status: 'PENDING',
      created_at: now,
      is_demo: true
    };
    users.push(pendingUser);
    db.users = users;
    saveDB(db);
    
    return { data: { user: { ...pendingUser, password: undefined }, message: 'Registration successful! Your account is pending admin approval.' }, status: 200 };
  },
  
  logout: async () => {
    await delay(generateRandomDelay());
    return { data: null, message: 'Logged out successfully', status: 200 };
  },
  
  getCurrentUser: async () => {
    await delay(generateRandomDelay());
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.is_demo && DEMO_USERS[user.email]) {
        return { data: user, status: 200 };
      }
    }
    const db = getDB();
    return { data: db.user || demoUser, status: 200 };
  },
  
  getRoles: async () => {
    await delay(generateRandomDelay());
    const storedUser = localStorage.getItem('user');
    let permissions = demoUser.permissions;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.is_demo) {
        permissions = getUserPermissions(user.role);
      }
    }
    return { data: [
      { id: 1, name: 'Admin', permissions: getAdminPermissions() },
      { id: 2, name: 'Manager', permissions: getManagerPermissions() },
      { id: 3, name: 'Staff', permissions: getStaffPermissions() },
      { id: 4, name: 'Casher', permissions: getCasherPermissions() }
    ], status: 200 };
  },
  
  changePassword: async (data) => {
    await delay(generateRandomDelay());
    return { data: null, message: 'Password changed successfully', status: 200 };
  },
  
  forgotPassword: async (email) => {
    await delay(generateRandomDelay());
    return { data: null, message: 'Reset link sent to your email', status: 200 };
  },
  
  resetPassword: async (data) => {
    await delay(generateRandomDelay());
    return { data: null, message: 'Password reset successfully', status: 200 };
  },
  
  updateProfile: async (data) => {
    await delay(generateRandomDelay());
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : demoUser;
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    const db = getDB();
    db.user = updatedUser;
    const { saveDB } = await import('./storage');
    saveDB(db);
    return { data: updatedUser, message: 'Profile updated successfully', status: 200 };
  }
};

export default authApi;
