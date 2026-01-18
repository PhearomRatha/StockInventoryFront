import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import {
  ChartBarIcon,
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
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Filters
  const [salesFilters, setSalesFilters] = useState({ period: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [financialFilters, setFinancialFilters] = useState({ period: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

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

    setLoading(false);
  };

  const toggleRowExpansion = (productId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    fetchReports();
  }, [salesFilters, financialFilters]);

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: CurrencyDollarIcon },
    { id: 'financial', label: 'Financial Report', icon: ChartBarIcon },
    { id: 'stock', label: 'Stock Report', icon: CubeIcon },
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Total Stock Value</p>
                  <p className="text-2xl font-bold text-blue-900">${stockReport.total_stock_value || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">In Stock</p>
                  <p className="text-2xl font-bold text-green-900">{stockReport.total_in_stock || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-900">{stockReport.total_low_stock || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-900">{stockReport.total_out_of_stock || 0}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Stock</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock Value</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockReport.stock_details?.map((item, index) => (
                      <Fragment key={index}>
                        <tr className="hover:bg-gray-50/80 transition-colors duration-200">
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">{item.product_name}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{item.current_stock}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">${item.stock_value}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              item.message?.trim() === 'Out-of-Stock' ? 'bg-red-50 text-red-700' :
                              item.message?.trim() === 'Very Low Stock' ? 'bg-orange-50 text-orange-700' :
                              item.message?.trim() === 'Low Stock' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {item.message}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleRowExpansion(item.product_id)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Toggle Details"
                            >
                              {expandedRows.has(item.product_id) ? '▼' : '▶'}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(item.product_id) && (
                          <tr className="bg-gray-50/50">
                            <td colSpan="5" className="py-4 px-6">
                              <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                                <div>
                                  <strong className="text-gray-900">Stock Ins:</strong> {item.stock_ins}
                                </div>
                                <div>
                                  <strong className="text-gray-900">Stock Outs:</strong> {item.stock_outs}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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