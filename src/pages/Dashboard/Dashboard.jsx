import React, { useEffect, useState } from "react";
import {
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/dashboard/index`;

export default function Dashboard() {
  const [totals, setTotals] = useState({
    total_customers: 0,
    total_products: 0,
    total_suppliers: 0,
    total_sales: 0,
    stockin_this_month: 0,
    stockout_this_month: 0,
    percent_customers: 0,
    percent_products: 0,
    percent_suppliers: 0,
    percent_sales: 0,
    percent_stockin: 0,
    percent_stockout: 0,
  });

  const [monthComparison, setMonthComparison] = useState({
    revenue: { current: 0, last: 0, change: 0 },
    stock_in: { current: 0, last: 0, change: 0 },
    stock_out: { current: 0, last: 0, change: 0 },
    sales_count: { current: 0, last: 0, change: 0 },
    new_customers: { current: 0, last: 0, change: 0 },
    new_suppliers: { current: 0, last: 0, change: 0 },
    new_products: { current: 0, last: 0, change: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const fetchDashboardData = async () => {
      const cacheKey = 'dashboardData';
      const cacheTimeKey = 'dashboardDataTime';
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes

      // Clear old cache first to ensure fresh data
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheTimeKey);

      try {
        const res = await fetch(API_BASE, { headers, credentials: 'include' });
        const data = await res.json();

        // Access the data from the new API response structure
        const overview = data.data?.overview || {};

        const totalsData = {
          total_customers: overview.total_customers || 0,
          total_products: overview.total_products || 0,
          total_suppliers: overview.total_suppliers || 0,
          total_sales: overview.total_sales || 0,
          stockin_this_month: overview.total_stock_ins || 0,
          stockout_this_month: overview.total_stock_outs || 0,

          percent_customers: overview.customers_percentage_change || 0,
          percent_products: overview.products_percentage_change || 0,
          percent_suppliers: overview.suppliers_percentage_change || 0,
          percent_sales: overview.sales_percentage_change || 0,
          percent_stockin: overview.stock_ins_percentage_change || 0,
          percent_stockout: overview.stock_outs_percentage_change || 0,
        };

        setTotals(totalsData);

        // Cache the data
        const now = Date.now();
        localStorage.setItem(cacheKey, JSON.stringify(totalsData));
        localStorage.setItem(cacheTimeKey, now.toString());

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ---------------- CARD DATA ----------------
  const cardData = [
    {
      title: "Total Customers",
      total: totals.total_customers,
      percent: totals.percent_customers,
      icon: <ShoppingCartIcon className="w-6 h-6 text-white" />,
      bg: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Products",
      total: totals.total_products,
      percent: totals.percent_products,
      icon: <CreditCardIcon className="w-6 h-6 text-white" />,
      bg: "from-green-500 to-emerald-600",
    },
    {
      title: "Total Suppliers",
      total: totals.total_suppliers,
      percent: totals.percent_suppliers,
      icon: <TruckIcon className="w-6 h-6 text-white" />,
      bg: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Total Sales",
      total: totals.total_sales,
      percent: totals.percent_sales,
      icon: <ArrowTrendingUpIcon className="w-6 h-6 text-white" />,
      bg: "from-red-500 to-red-600",
    },
    {
      title: "Stock In",
      total: totals.stockin_this_month,
      percent: totals.percent_stockin,
      icon: <TruckIcon className="w-6 h-6 text-white" />,
      bg: "from-yellow-400 to-yellow-500",
    },
    {
      title: "Stock Out",
      total: totals.stockout_this_month,
      percent: totals.percent_stockout,
      icon: <ArrowTrendingUpIcon className="w-6 h-6 text-white" />,
      bg: "from-pink-400 to-pink-500",
    },
  ];

  // ---------------- MAIN UI ----------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.total}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon
                    className={`w-4 h-4 ${
                      card.percent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  />

                  <span
                    className={`text-sm font-medium ${
                      card.percent >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.percent}%
                  </span>

                  <span className="text-sm text-gray-500">
                    from last month
                  </span>
                </div>
              </div>

              <div
                className={`w-12 h-12 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
