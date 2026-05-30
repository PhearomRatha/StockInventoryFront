// API Router - decides between demo and real API based on user context
import { isDemoMode } from './demo/authApi';
import { ensureDBInitialized } from './demo/storage';
import realApi from './realApi';
import demoApi from './demo';

const createRouter = () => {
  // Ensure DB is initialized before any API calls
  ensureDBInitialized();
  
  const isDemo = isDemoMode();
  return {
    productApi: isDemo ? demoApi.productApi : realApi.productApi,
    categoryApi: isDemo ? demoApi.categoryApi : realApi.categoryApi,
    supplierApi: isDemo ? demoApi.supplierApi : realApi.supplierApi,
    customerApi: isDemo ? demoApi.customerApi : realApi.customerApi,
    salesApi: isDemo ? demoApi.salesApi : realApi.salesApi,
    stockInApi: isDemo ? demoApi.stockInApi : realApi.stockInApi,
    stockOutApi: isDemo ? demoApi.stockOutApi : realApi.stockOutApi,
    paymentApi: isDemo ? demoApi.paymentApi : realApi.paymentApi,
    reportApi: isDemo ? demoApi.reportApi : realApi.reportApi,
    activityLogApi: isDemo ? demoApi.activityLogApi : realApi.activityLogApi,
    inventoryApi: isDemo ? demoApi.inventoryApi : realApi.inventoryApi,
    dashboardApi: isDemo ? demoApi.dashboardApi : realApi.dashboardApi
  };
};

// Reactive API router - checks demo mode on each call
const apiRouter = new Proxy(createRouter(), {
  get(target, prop) {
    const routers = createRouter();
    return routers[prop];
  }
});

export default apiRouter;
