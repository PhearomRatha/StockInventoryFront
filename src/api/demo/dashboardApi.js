import { ensureDBInitialized, getCollection, generateRandomDelay } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const dashboardApi = {
  getOverview: async () => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const products = getCollection('products');
    const sales = getCollection('sales');
    const customers = getCollection('customers');
    const suppliers = getCollection('suppliers');
    const stockIns = getCollection('stock_ins') || [];
    const stockOuts = getCollection('stock_outs') || [];
    const categories = getCollection('categories') || [];

    const salesMonthly = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0 }));
    sales.forEach(s => {
      const monthIdx = new Date(s.created_at).getMonth();
      salesMonthly[monthIdx].revenue += s.total_amount || 0;
    });

    const customersMonthly = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, new_customers: 0 }));
    customers.forEach(c => {
      const monthIdx = new Date(c.created_at).getMonth();
      customersMonthly[monthIdx].new_customers += 1;
    });

    const currentMonth = new Date().getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const customersCountThis = customers.filter(c => new Date(c.created_at).getMonth() === currentMonth).length;
    const customersCountLast = customers.filter(c => new Date(c.created_at).getMonth() === prevMonth).length;
    const customersChange = customersCountLast > 0 
      ? ((customersCountThis - customersCountLast) / customersCountLast * 100).toFixed(1)
      : '0.0';

    const productsCountThis = products.filter(p => new Date(p.created_at).getMonth() === currentMonth).length;
    const productsCountLast = products.filter(p => new Date(p.created_at).getMonth() === prevMonth).length;
    const productsChange = productsCountLast > 0 
      ? ((productsCountThis - productsCountLast) / productsCountLast * 100).toFixed(1)
      : '0.0';

    const suppliersCountThis = suppliers.filter(s => new Date(s.created_at).getMonth() === currentMonth).length;
    const suppliersCountLast = suppliers.filter(s => new Date(s.created_at).getMonth() === prevMonth).length;
    const suppliersChange = suppliersCountLast > 0 
      ? ((suppliersCountThis - suppliersCountLast) / suppliersCountLast * 100).toFixed(1)
      : '0.0';
    
    const salesCountThis = sales.filter(s => new Date(s.created_at).getMonth() === currentMonth).length;
    const salesCountLast = sales.filter(s => new Date(s.created_at).getMonth() === prevMonth).length;
    const salesChange = salesCountLast > 0 
      ? ((salesCountThis - salesCountLast) / salesCountLast * 100).toFixed(1)
      : '0.0';

    const stockInCountThis = stockIns.filter(s => new Date(s.created_at).getMonth() === currentMonth).length;
    const stockInCountLast = stockIns.filter(s => new Date(s.created_at).getMonth() === prevMonth).length;
    const stockInChange = stockInCountLast > 0 
      ? ((stockInCountThis - stockInCountLast) / stockInCountLast * 100).toFixed(1)
      : '0.0';

    const stockOutCountThis = stockOuts.filter(s => new Date(s.created_at).getMonth() === currentMonth).length;
    const stockOutCountLast = stockOuts.filter(s => new Date(s.created_at).getMonth() === prevMonth).length;
    const stockOutChange = stockOutCountLast > 0 
      ? ((stockOutCountThis - stockOutCountLast) / stockOutCountLast * 100).toFixed(1)
      : '0.0';

    const totalProductValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock_quantity || 0)), 0);
    const categoryDistribution = categories.map(cat => {
      const catProducts = products.filter(p => p.category_id === cat.id || (p.category && p.category.id === cat.id));
      const catValue = catProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock_quantity || 0)), 0);
      const percentage = totalProductValue > 0 ? ((catValue / totalProductValue) * 100) : 0;
      return {
        id: cat.id,
        name: cat.name,
        value: catValue,
        percentage,
        count: catProducts.length,
        color: cat.color || PIE_COLORS[cat.id % 8]
      };
    });

    const totalStockIns = stockIns.reduce((s, i) => s + (i.quantity || 0), 0);
    const totalStockOuts = stockOuts.reduce((s, i) => s + (i.quantity || 0), 0);
    const stockInChangePercent = totalStockIns > 0 ? ((totalStockIns - totalStockIns * 0.7) / (totalStockIns * 0.7) * 100).toFixed(1) : 0;
    const stockOutChangePercent = totalStockOuts > 0 ? ((totalStockOuts - totalStockOuts * 0.5) / (totalStockOuts * 0.5) * 100).toFixed(1) : 0;

    return successResponse({
      overview: {
        total_customers: customers.length,
        total_products: products.length,
        total_suppliers: suppliers.length,
        total_revenue: sales.reduce((s, i) => s + (i.total_amount || 0), 0),
        total_sales: sales.length,
        total_stock_ins: totalStockIns,
        total_stock_outs: totalStockOuts,
        sales_change: salesChange,
        stock_in_change: stockInChange,
        stock_out_change: stockOutChange,
        customers_percentage_change: customersChange,
        products_percentage_change: productsChange,
        suppliers_percentage_change: suppliersChange
      },
      sales_overview: salesMonthly,
      customer_growth: customersMonthly,
      stock_movement: [
        { month: 'This Month', stock_in: totalStockIns, stock_out: totalStockOuts },
        { month: 'Last Month', stock_in: Math.floor(totalStockIns * 0.7), stock_out: Math.floor(totalStockOuts * 0.5) }
      ],
      stock_movement_change: {
        stock_in_percent: stockInChangePercent,
        stock_out_percent: stockOutChangePercent
      },
      category_distribution: categoryDistribution.filter(c => c.percentage > 0).map(c => ({
        category: c.name,
        count: c.count,
        percentage: c.percentage,
        color: c.color
      })),
      recent_sales: sales.slice(-5).map(s => ({
        ...s,
        total: s.total_amount
      })),
      top_products: products.slice(0, 5)
    });
  }
};
export default dashboardApi;
