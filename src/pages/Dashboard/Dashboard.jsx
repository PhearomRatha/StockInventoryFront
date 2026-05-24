import React, { useEffect, useState, useCallback } from "react";
import {
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

import { dashboardApi } from "../../api";

const CACHE_KEY = 'dashboard_data';
const CACHE_TIME_KEY = 'dashboard_data_time';
const CACHE_EXPIRY = 5 * 60 * 1000;

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    if (cached && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_EXPIRY) return JSON.parse(cached);
    }
  } catch (e) { console.error('Cache read error:', e); }
  return null;
};

const setCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch (e) { console.error('Cache write error:', e); }
};

const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
};

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [totals, setTotals] = useState({
    total_customers: 0, total_products: 0, total_suppliers: 0, total_sales: 0,
    stockin_this_month: 0, stockout_this_month: 0,
    percent_customers: 0, percent_products: 0, percent_suppliers: 0,
    percent_sales: 0, percent_stockin: 0, percent_stockout: 0,
  });

  const [chartData, setChartData] = useState({
    sales_overview: [], stock_movement: [], customer_growth: [], category_distribution: [],
  });

  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    const cached = getCache();
    if (cached) {
      setTotals(cached.totals || {});
      setChartData(cached.chartData || { sales_overview: [], stock_movement: [], customer_growth: [], category_distribution: [] });
      setRecentSales(cached.recentSales || []);
      setTopProducts(cached.topProducts || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dashboardApi.getOverview();
      // getResponse wraps response with {success, data, message}
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard');
      }
      const payload = result.data || {};

      if (payload && typeof payload === 'object') {
        console.log('Dashboard FOUND. Keys:', Object.keys(payload));
        console.log('sales_overview len:', (payload.sales_overview || []).length);
        console.log('stock_movement len:', (payload.stock_movement || []).length);
        console.log('customer_growth len:', (payload.customer_growth || []).length);
        console.log('category_distribution len:', (payload.category_distribution || []).length);

        const overview = payload.overview || {};

        const totalsData = {
          total_customers: overview.total_customers || 0,
          total_products: overview.total_products || 0,
          total_suppliers: overview.total_suppliers || 0,
          total_sales: overview.total_revenue || 0,
          stockin_this_month: overview.total_stock_ins || 0,
          stockout_this_month: overview.total_stock_outs || 0,
          percent_customers: overview.customers_percentage_change || 0,
          percent_products: overview.products_percentage_change || 0,
          percent_suppliers: overview.suppliers_percentage_change || 0,
          percent_sales: overview.sales_percentage_change || 0,
          percent_stockin: overview.stock_ins_percentage_change || 0,
          percent_stockout: overview.stock_outs_percentage_change || 0,
        };

        const chartDataParsed = {
          sales_overview: payload.sales_overview || [],
          stock_movement: payload.stock_movement || [],
          customer_growth: payload.customer_growth || [],
          category_distribution: payload.category_distribution || [],
        };

        const dataToCache = {
          totals: totalsData,
          chartData: chartDataParsed,
          recentSales: payload.recent_sales || [],
          topProducts: payload.top_products || [],
        };

        setTotals(totalsData);
        setChartData(chartDataParsed);
        setRecentSales(dataToCache.recentSales);
        setTopProducts(dataToCache.topProducts);
        setCache(dataToCache);
      } else {
        console.warn('Dashboard unexpected format:', payload);
        setError('Failed to load dashboard data. Please try again.');
      }
    } catch (ex) {
      console.error('Dashboard fetch error:', ex);
      const msg = ex?.response?.data?.message || ex?.message || 'Failed to load dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const cardData = [
    { title: "Total Customers", total: totals.total_customers, percent: totals.percent_customers, icon: <ShoppingCartIcon className="w-6 h-6 text-white" />, bg: "from-blue-500 to-blue-600" },
    { title: "Total Products", total: totals.total_products, percent: totals.percent_products, icon: <CreditCardIcon className="w-6 h-6 text-white" />, bg: "from-green-500 to-emerald-600" },
    { title: "Total Suppliers", total: totals.total_suppliers, percent: totals.percent_suppliers, icon: <TruckIcon className="w-6 h-6 text-white" />, bg: "from-indigo-500 to-indigo-600" },
    { title: "Total Sales", total: totals.total_sales, percent: totals.percent_sales, icon: <CurrencyDollarIcon className="w-6 h-6 text-white" />, bg: "from-red-500 to-red-600" },
    { title: "Stock In", total: totals.stockin_this_month, percent: totals.percent_stockin, icon: <TruckIcon className="w-6 h-6 text-white" />, bg: "from-yellow-400 to-yellow-500" },
    { title: "Stock Out", total: totals.stockout_this_month, percent: totals.percent_stockout, icon: <ArrowTrendingUpIcon className="w-6 h-6 text-white" />, bg: "from-pink-400 to-pink-500" },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-3xl font-semibold mb-8 text-gray-800">Dashboard Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="flex justify-between items-center">
                <div className="space-y-3"><div className="h-4 w-24 bg-gray-200 rounded"></div><div className="h-8 w-16 bg-gray-200 rounded"></div><div className="h-4 w-32 bg-gray-200 rounded"></div></div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-3xl font-semibold mb-8 text-gray-800">Dashboard Overview</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Dashboard Overview</h1>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {cardData.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.title.includes("Sales") ? `$${Number(card.total).toLocaleString()}` : Number(card.total).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon className={`w-4 h-4 ${card.percent >= 0 ? "text-green-500" : "text-red-500"}`} />
                  <span className={`text-sm font-medium ${card.percent >= 0 ? "text-green-600" : "text-red-600"}`}>{Number(card.percent).toFixed(1)}%</span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

        {/* 1. Sales Overview - Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" /> Sales Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.sales_overview}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Customer Growth - Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5" /> Customer Growth
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.customer_growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="new_customers" name="New Customers" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Stock In vs Stock Out - Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" /> Stock In vs Stock Out
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.stock_movement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="stock_in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stock_out" name="Stock Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Product Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CubeIcon className="w-5 h-5" /> Product Distribution by Category
          </h2>
          {chartData.category_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.category_distribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {chartData.category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No product distribution data available</div>
          )}
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5" /> Recent Sales
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Invoice</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Customer</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Total</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">#{sale.invoice_number || sale.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{sale.customer?.name || 'Unknown Customer'}</td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">${Number(sale.total || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${sale.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {sale.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(sale.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}