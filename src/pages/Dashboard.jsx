import React, { useEffect, useState } from "react";
import {
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";

// ✅ Base API URL
const API_BASE = `${import.meta.env.VITE_API_URL}/api/dashboard`;

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 🔹 Dashboard endpoints
    const endpoints = [
      "total-customers",
      "total-products",
      "total-suppliers",
      "total-sales",
      "total-stockin",
      "total-stockout",
    ];

    const fetchDashboardData = async () => {
      try {
        // 🔹 Fetch all endpoints in parallel
        const requests = endpoints.map((endpoint) =>
          fetch(`${API_BASE}/${endpoint}`, { headers }).then((res) => res.json())
        );

        const [
          customers,
          products,
          suppliers,
          sales,
          stockin,
          stockout,
        ] = await Promise.all(requests);

        // 🔹 Set totals in state
        setTotals({
          total_customers: customers.total_this_month || 0,
          total_products: products.total_this_month || 0,
          total_suppliers: suppliers.total_this_month || 0,
          total_sales: sales.total_this_month || 0,
          stockin_this_month: stockin.total_this_month || 0,
          stockout_this_month: stockout.total_this_month || 0,

          percent_customers: customers.percent_change || 0,
          percent_products: products.percent_change || 0,
          percent_suppliers: suppliers.percent_change || 0,
          percent_sales: sales.percent_change || 0,
          percent_stockin: stockin.percent_change || 0,
          percent_stockout: stockout.percent_change || 0,
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-gray-600 text-lg font-medium">
        ចាំតិចបេះដូងអូន❤️
      </div>
    );

  // 🔹 Dashboard cards
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.total}</p>

                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon
                    className={`w-4 h-4 ${
                      card.percent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      card.percent >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {card.percent >= 0 ? `+${card.percent}%` : `${card.percent}%`}
                  </span>
                  <span className="text-sm text-gray-500">from last month</span>
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
