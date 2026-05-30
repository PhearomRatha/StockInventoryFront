import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Select } from "../../components/UI";
import { reportApi } from "../../api";

function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState({});
  const [financialReport, setFinancialReport] = useState({});
  const [stockReport, setStockReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const [salesFilters, setSalesFilters] = useState({ period: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [financialFilters, setFinancialFilters] = useState({ period: 'monthly', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const fetchReports = async () => {
    setLoading(true);

    try {
      const salesRes = await reportApi.getSales(salesFilters);
      if (salesRes.success) setSalesReport(salesRes.data);

      const financialRes = await reportApi.getFinancial(financialFilters);
      if (financialRes.success) setFinancialReport(financialRes.data);

      const stockRes = await reportApi.getStock();
      if (stockRes.success) setStockReport(stockRes.data);
    } catch (error) {
      console.error(error);
    }

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
    { id: 'sales', label: t('reports.salesReport'), icon: CurrencyDollarIcon },
    { id: 'financial', label: t('reports.financialReport'), icon: ChartBarIcon },
    { id: 'stock', label: t('reports.stockReport'), icon: CubeIcon },
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ChartBarIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t("reports.title")}</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {t("reports.subtitle")}
            </p>
          </div>
        </div>
      </div>

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
                <div className="w-48">
                  <Select
                    value={salesFilters.period}
                    onChange={(val) => setSalesFilters({ ...salesFilters, period: val })}
                    options={[
                      { value: "daily", label: t("reports.daily") },
                      { value: "monthly", label: t("reports.monthly") },
                      { value: "yearly", label: t("reports.yearly") },
                    ]}
                  />
                </div>
                {salesFilters.period === 'monthly' && (
                  <>
                    <div className="w-48">
                      <Select
                        value={salesFilters.month}
                        onChange={(val) => setSalesFilters({ ...salesFilters, month: val })}
                        options={Array.from({ length: 12 }, (_, i) => ({
                          value: i + 1,
                          label: new Date(0, i).toLocaleString('default', { month: 'long' })
                        }))}
                      />
                    </div>
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
                  <p className="text-sm text-blue-600 font-medium">{t("reports.totalSales")}</p>
                  <p className="text-2xl font-bold text-blue-900">${Number(salesReport.total_sales || 0).toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">{t("reports.totalInvoices")}</p>
                  <p className="text-2xl font-bold text-green-900">{salesReport.total_invoices || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">{t("reports.itemsSold")}</p>
                  <p className="text-2xl font-bold text-purple-900">{salesReport.total_items_sold || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-orange-600 font-medium">{t("reports.bestProduct")}</p>
                  <p className="text-lg font-bold text-orange-900">{salesReport.best_selling_product || 'N/A'}</p>
                </div>
              </div>

              {salesReport.product_sales && salesReport.product_sales.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.bestSellingProduct")}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">{t("reports.product")}</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">{t("reports.quantitySold") || "Quantity Sold"}</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">{t("reports.revenue") || "Revenue"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesReport.product_sales.slice(0, 5).map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{product.product_name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{product.quantity_sold}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">${Number(product.total_revenue || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {financialReport.income_by_method && Object.keys(financialReport.income_by_method).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.incomeByMethod")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(financialReport.income_by_method).map(([method, amount]) => (
                          <div key={method} className="bg-green-50 p-4 rounded-xl">
                            <p className="text-sm text-green-600 font-medium capitalize">{method}</p>
                            <p className="text-xl font-bold text-green-900">${Number(amount || 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {financialReport.expense_by_method && Object.keys(financialReport.expense_by_method).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.expenseByMethod")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(financialReport.expense_by_method).map(([method, amount]) => (
                          <div key={method} className="bg-red-50 p-4 rounded-xl">
                            <p className="text-sm text-red-600 font-medium capitalize">{method}</p>
                            <p className="text-xl font-bold text-red-900">${Number(amount || 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {salesReport.top_customers && salesReport.top_customers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.topCustomers")}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">{t("reports.customer")}</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">{t("reports.totalSales")}</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">{t("reports.invoices") || "Invoices"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesReport.top_customers.slice(0, 5).map((customer, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{typeof customer.customer === 'object' ? customer.customer?.name || customer.customer?.id || 'Unknown' : customer.customer}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">${Number(customer.total_sales || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{customer.invoice_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {salesReport.sales_by_payment_method && salesReport.sales_by_payment_method.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.salesByMethod")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {salesReport.sales_by_payment_method.map((method, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600 font-medium capitalize">{method.payment_method}</p>
                        <p className="text-xl font-bold text-gray-900">{method.count} {t("reports.transactions")}</p>
                        <p className="text-sm text-gray-500">${Number(method.total || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div>
              <div className="flex gap-4 mb-6">
                <div className="w-48">
                  <Select
                    value={financialFilters.period}
                    onChange={(val) => setFinancialFilters({ ...financialFilters, period: val })}
                    options={[
                      { value: "today", label: t("reports.daily") },
                      { value: "monthly", label: t("reports.monthly") },
                      { value: "yearly", label: t("reports.yearly") },
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">{t("reports.totalIncome")}</p>
                  <p className="text-2xl font-bold text-green-900">${Number(financialReport.total_income || 0).toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{t("reports.totalExpense")}</p>
                  <p className="text-2xl font-bold text-red-900">${Number(financialReport.total_expense || 0).toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">{t("reports.netProfit")}</p>
                  <p className="text-2xl font-bold text-blue-900">${Number(financialReport.net_profit || 0).toFixed(2)}</p>
                </div>
              </div>

              {stockReport.low_stock_products && stockReport.low_stock_products.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.lowStockAlert")}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                        <tr>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.product")}</th>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.currentStock")}</th>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.stockValue")}</th>
                          <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[...stockReport.low_stock_products].sort((a, b) => a.current_stock - b.current_stock).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50/80 transition-colors duration-200">
                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">{item.product_name}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{item.current_stock}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">${Number(item.stock_value || 0).toFixed(2)}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stock' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">{t("reports.totalStockValue")}</p>
                  <p className="text-2xl font-bold text-blue-900">${Number(stockReport.total_stock_value || 0).toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">{t("stockIn.inStock") || "In Stock"}</p>
                  <p className="text-2xl font-bold text-green-900">{stockReport.total_in_stock || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-yellow-600 font-medium">{t("reports.lowStock")}</p>
                  <p className="text-2xl font-bold text-yellow-900">{stockReport.total_low_stock || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{t("reports.outOfStock")}</p>
                  <p className="text-2xl font-bold text-red-900">{stockReport.total_out_of_stock || 0}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.product")}</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.currentStock")}</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.stockValue")}</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.status")}</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("reports.details")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockReport.stock_details?.map((item, index) => (
                      <Fragment key={index}>
                        <tr className="hover:bg-gray-50/80 transition-colors duration-200">
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">{item.product_name}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{item.current_stock}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">${Number(item.stock_value || 0).toFixed(2)}</td>
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
                              title={t("reports.details")}
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
                                  <strong className="text-gray-900">{t("reports.stockIns")}:</strong> {item.stock_ins}
                                </div>
                                <div>
                                  <strong className="text-gray-900">{t("reports.stockOuts")}:</strong> {item.stock_outs}
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