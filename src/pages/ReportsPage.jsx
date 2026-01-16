import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  CubeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// ✅ Base API
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState({});
  const [financialReport, setFinancialReport] = useState({});
  const [stockReport, setStockReport] = useState({});
  const [activityReport, setActivityReport] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [salesFilters, setSalesFilters] = useState({ period: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [financialFilters, setFinancialFilters] = useState({ period: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [activityFilters, setActivityFilters] = useState({});

  const fetchReports = () => {
    setLoading(true);

    // Sales Report
    axios.get(`${API_BASE}/reports/sales`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: salesFilters
    }).then(res => setSalesReport(res.data)).catch(console.error);

    // Financial Report
    axios.get(`${API_BASE}/reports/financial`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: financialFilters
    }).then(res => setFinancialReport(res.data)).catch(console.error);

    // Stock Report
    axios.get(`${API_BASE}/reports/stock`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setStockReport(res.data)).catch(console.error);

    // Activity Report
    axios.get(`${API_BASE}/reports/activity-logs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: activityFilters
    }).then(res => setActivityReport(res.data)).catch(console.error);

    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [salesFilters, financialFilters, activityFilters]);

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: CurrencyDollarIcon },
    { id: 'financial', label: 'Financial Report', icon: ChartBarIcon },
    { id: 'stock', label: 'Stock Report', icon: CubeIcon },
    { id: 'activity', label: 'Activity Logs', icon: DocumentTextIcon },
  ];

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-300 rounded"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white rounded-2xl shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ChartBarIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Comprehensive reports for sales, finance, stock, and activity monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'sales' && (
            <div>
              <div className="flex gap-4 mb-6">
                <select
                  value={salesFilters.period}
                  onChange={(e) => setSalesFilters({ ...salesFilters, period: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {salesFilters.period === 'monthly' && (
                  <>
                    <select
                      value={salesFilters.month}
                      onChange={(e) => setSalesFilters({ ...salesFilters, month: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-xl"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={salesFilters.year}
                      onChange={(e) => setSalesFilters({ ...salesFilters, year: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-xl"
                    />
                  </>
                )}
                {salesFilters.period === 'yearly' && (
                  <input
                    type="number"
                    value={salesFilters.year}
                    onChange={(e) => setSalesFilters({ ...salesFilters, year: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-xl"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-900">${salesReport.total_sales || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Total Invoices</p>
                  <p className="text-2xl font-bold text-green-900">{salesReport.total_invoices || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">Items Sold</p>
                  <p className="text-2xl font-bold text-purple-900">{salesReport.total_items_sold || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-orange-600 font-medium">Best Product</p>
                  <p className="text-lg font-bold text-orange-900">{salesReport.best_selling_product || 'N/A'}</p>
                </div>
              </div>
              {/* Add more details like top customers, payment methods */}
            </div>
          )}

          {activeTab === 'financial' && (
            <div>
              <div className="flex gap-4 mb-6">
                <select
                  value={financialFilters.period}
                  onChange={(e) => setFinancialFilters({ ...financialFilters, period: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="today">Today</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {/* Similar period filters */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">${financialReport.total_income || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">Total Expense</p>
                  <p className="text-2xl font-bold text-red-900">${financialReport.total_expense || 0}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-900">${financialReport.net_profit || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Total Stock Value</p>
                  <p className="text-2xl font-bold text-blue-900">${stockReport.total_stock_value || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">Low Stock Products</p>
                  <p className="text-2xl font-bold text-red-900">{stockReport.low_stock_products?.length || 0}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-xl">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-left">Current Stock</th>
                      <th className="p-3 text-left">Stock Value</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockReport.stock_details?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.product_name}</td>
                        <td className="p-3">{item.current_stock}</td>
                        <td className="p-3">${item.stock_value}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded ${item.low_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {item.low_stock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <div className="flex gap-4 mb-6">
                <input
                  type="date"
                  value={activityFilters.date || ''}
                  onChange={(e) => setActivityFilters({ ...activityFilters, date: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-xl"
                />
                <select
                  value={activityFilters.action || ''}
                  onChange={(e) => setActivityFilters({ ...activityFilters, action: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-blue-600 font-medium">Total Logs</p>
                <p className="text-2xl font-bold text-blue-900">{activityReport.total_logs || 0}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-xl">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Action</th>
                      <th className="p-3 text-left">Module</th>
                      <th className="p-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityReport.logs?.map((log, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{log.user?.name || 'Unknown'}</td>
                        <td className="p-3">{log.action}</td>
                        <td className="p-3">{log.module}</td>
                        <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;