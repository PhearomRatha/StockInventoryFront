import { ensureDBInitialized, getCollection, generateRandomDelay } from './storage';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });

export const reportApi = { 
  getSales: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const sales = getCollection('sales');
    const products = getCollection('products');
    const productSales = {};
    const customers = getCollection('customers');
    const customerSales = {};
    const paymentMethodStats = {};

    sales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          const product = products.find(p => p.id == item.product_id);
          const productName = product?.name || 'Unknown';
          const itemRevenue = (item.price * item.quantity) * (1 - (item.discount_percent || 0) / 100);
          if (!productSales[productName]) {
            productSales[productName] = { quantity: 0, revenue: 0 };
          }
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += itemRevenue;
        });
      }
      if (!customerSales[sale.customer_id]) {
        customerSales[sale.customer_id] = { total: 0, count: 0 };
      }
      customerSales[sale.customer_id].total += sale.total_amount || 0;
      customerSales[sale.customer_id].count += 1;

      if (!paymentMethodStats[sale.payment_method]) {
        paymentMethodStats[sale.payment_method] = { count: 0, total: 0 };
      }
      paymentMethodStats[sale.payment_method].count += 1;
      paymentMethodStats[sale.payment_method].total += sale.total_amount || 0;
    });

    const productSalesArray = Object.entries(productSales)
      .map(([name, stats]) => ({ product_name: name, quantity_sold: stats.quantity, total_revenue: stats.revenue }))
      .sort((a, b) => b.quantity_sold - a.quantity_sold);

    const topCustomers = Object.entries(customerSales)
      .map(([id, stats]) => ({
        customer: customers.find(c => c.id == id) || { id, name: 'Unknown' },
        total_sales: stats.total,
        invoice_count: stats.count
      }))
      .sort((a, b) => b.total_sales - a.total_sales);

    const salesByPaymentMethod = Object.entries(paymentMethodStats)
      .map(([method, stats]) => ({ payment_method: method, count: stats.count, total: stats.total }));

    return successResponse({
      data: sales,
      total: sales.length,
      revenue: sales.reduce((s, i) => s + (i.total_amount || 0), 0),
      from: params.from,
      to: params.to,
      total_sales: sales.reduce((s, i) => s + (i.total_amount || 0), 0),
      total_invoices: sales.length,
      total_items_sold: sales.reduce((s, sale) => s + (sale.items || []).reduce((t, i) => t + (i.quantity || 0), 0), 0),
      best_selling_product: productSalesArray[0]?.product_name || 'N/A',
      product_sales: productSalesArray,
      top_customers: topCustomers,
      sales_by_payment_method: salesByPaymentMethod
    });
  },
  getFinancial: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const sales = getCollection('sales');
    const incomeByMethod = {};

    sales.forEach(sale => {
      const method = sale.payment_method || 'Unknown';
      incomeByMethod[method] = (incomeByMethod[method] || 0) + (sale.total_amount || 0);
    });

    const totalIncome = sales.reduce((s, i) => s + (i.total_amount || 0), 0);
    const expenses = 12500;
    const totalExpense = 0;

    return successResponse({
      total_income: totalIncome,
      total_expense: totalExpense,
      net_profit: totalIncome - totalExpense - expenses,
      income_by_method: incomeByMethod,
      expense_by_method: {}
    });
  },
  getStock: async (params = {}) => { 
    await delay(generateRandomDelay());
    ensureDBInitialized();
    const products = getCollection('products');
    const stockIns = getCollection('stock_ins');
    const stockOuts = getCollection('stock_outs');
    const stockDetails = products.map(p => {
      const stockValue = (p.price || p.cost || 0) * (p.stock_quantity || 0);
      const stockQty = p.stock_quantity || 0;
      let message = 'In Stock';
      if (stockQty === 0) message = 'Out-of-Stock';
      else if (stockQty <= 5) message = 'Very Low Stock';
      else if (stockQty <= 10) message = 'Low Stock';
      return {
        product_id: p.id,
        product_name: p.name,
        current_stock: stockQty,
        stock_value: stockValue,
        message,
        stock_ins: stockIns.filter(s => s.product_id == p.id).length,
        stock_outs: stockOuts.filter(s => s.product_id == p.id).length
      };
    }).sort((a, b) => a.current_stock - b.current_stock);
    const lowStockProducts = [...stockDetails].filter(p => p.current_stock <= 10 && p.current_stock > 0);

    return successResponse({
      products: products.length,
      low_stock: products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length,
      out_of_stock: products.filter(p => p.stock_quantity === 0).length,
      total_stock_value: products.reduce((s, p) => s + (p.price || p.cost || 0) * (p.stock_quantity || 0), 0),
      total_in_stock: products.filter(p => p.stock_quantity > 10).length,
      total_low_stock: products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length,
      total_out_of_stock: products.filter(p => p.stock_quantity === 0).length,
      stock_details: stockDetails,
      low_stock_products: lowStockProducts
    }); 
  },
  getActivityLogs: async (params = {}) => {
    await delay(generateRandomDelay());
    ensureDBInitialized();
    return successResponse({ data: getCollection('activity_logs'), total: getCollection('activity_logs').length });
  }
};
export default reportApi;
