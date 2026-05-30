# Hybrid Demo System Integration Guide

## Files Created

### 1. Core API Router
- `src/api/apiRouter.js` - Main decision layer that routes to demo or real API
- `src/api/realApi.js` - Wrapper for Laravel backend API (existing APIs preserved)
- `src/api/index.js` - Updated to use apiRouter instead of direct axios calls

### 2. Demo API Layer
- `src/api/demo/storage.js` - LocalStorage-based database engine
- `src/api/demo/authApi.js` - Demo authentication with isDemoMode() function
- `src/api/demo/productApi.js` - Demo product CRUD operations
- `src/api/demo/categoryApi.js` - Demo category CRUD operations
- `src/api/demo/supplierApi.js` - Demo supplier CRUD operations
- `src/api/demo/customerApi.js` - Demo customer CRUD operations
- `src/api/demo/salesApi.js` - Demo sales operations
- `src/api/demo/stockInApi.js` - Demo stock-ins operations
- `src/api/demo/stockOutApi.js` - Demo stock-outs operations
- `src/api/demo/paymentApi.js` - Demo payments operations
- `src/api/demo/reportApi.js` - Demo reports operations
- `src/api/demo/activityLogApi.js` - Demo activity logs operations
- `src/api/demo/inventoryApi.js` - Demo inventory operations
- `src/api/demo/dashboardApi.js` - Demo dashboard overview
- `src/api/demo/index.js` - Demo API entry point
- `src/api/demo/permissions.js` - Role/permission engine

## Authentication Flow

Demo mode activates ONLY when:
- Email: `demo@email.com`
- Password: `demo123$`

The `isDemoMode()` function checks localStorage for user with `is_demo: true`.

## User Login Integration

To integrate with Login.jsx, replace the login handler at line 210:

```javascript
// Instead of: api.post(`${API_BASE}/login`, loginForm)
// Use this for demo detection:
import { authApi } from '../../api';

const handleLoginSubmit = async (e) => {
  // ...validation...
  try {
    const response = await authApi.login(loginForm);
    // Response format matches Laravel: { user, token, status, success }
    if (response.user && response.token) {
      // Store user with is_demo flag for demo users
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      // ...rest of login logic
    }
  } catch (err) {
    // ...error handling
  }
};
```

## API Response Format

All demo APIs return Laravel-compatible format:
```javascript
{
  success: true,
  data: {...},
  message: "Success",
  status: 200
}
```

Error format:
```javascript
{
  success: false,
  data: null,
  message: "Error message",
  status: 500
}
```

## Features Included

1. **Safe Fallback**: Demo mode only activates for demo credentials
2. **No UI Changes Required**: Existing API signatures unchanged
3. **Full Offline**: All data stored in localStorage
4. **Random Delays**: 200-800ms simulated network latency
5. **5% Failure Rate**: Random failures to test error handling
6. **Pagination Support**: page, per_page, sortBy, sortOrder
7. **Filter Support**: name, category, search filters
8. **Image Handling**: Stores images as base64/blob URLs locally

## Usage

Import APIs as usual - they will automatically route to demo or real:
```javascript
import { productApi, categoryApi, salesApi } from '../../api';
// Works for both demo and real users transparently
```

To check demo mode:
```javascript
import { isDemoMode, defaultDemoUser } from '../../api';
if (isDemoMode()) {
  // Demo-specific logic
}
```

## Permission System

The demo user has Admin role with all permissions:
- products.view/create/update/delete
- categories.view/create/update/delete  
- suppliers.view/create/update/delete
- sales.view/create/update/delete
- payments.view/create/update/delete
- reports.view/create/update/delete
- inventory.view/create/update/delete

Use `checkPermission(user, module, action)` to verify permissions.
