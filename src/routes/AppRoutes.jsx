import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ProductPage = lazy(() => import("../pages/Products/ProductPage"));
const CategoryPage = lazy(() => import("../pages/Categories/CategoryPage"));
const ActivityLogPage = lazy(() => import("../pages/ActivityLogs/ActivityLogPage"));
const ReportsPage = lazy(() => import("../pages/Reports/ReportsPage"));
const LoginPage = lazy(() => import("../pages/Auth/Login"));
const StockInPage = lazy(() => import("../pages/StockIn/StockInPage"));
const StockOutPage = lazy(() => import("../pages/StockOut/StockOutPage"));
const Suppliers = lazy(() => import("../pages/Suppliers/Suppliers"));
const CustomerCRMPage = lazy(() => import("../pages/Customers/CustomerCRMPage"));
const UserManagement = lazy(() => import("../pages/Users/UserManagement"));
const Signup = lazy(() => import("../pages/Auth/SignupPage"));
const SalesPage = lazy(() => import("../pages/Sales/SalesPage"));
const PaymentPage = lazy(() => import("../pages/Payments/PaymentPage"));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/activity-logs" element={<ActivityLogPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/stock-in" element={<StockInPage />} />
        <Route path="/stock-out" element={<StockOutPage />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customer" element={<CustomerCRMPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/payments" element={<PaymentPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;