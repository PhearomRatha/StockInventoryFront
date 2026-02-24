import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute, { GuestRoute, AdminRoute, ManagerRoute, StaffRoute } from "../components/Layout/ProtectedRoute";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ProductPage = lazy(() => import("../pages/Products/ProductPage"));
const CategoryPage = lazy(() => import("../pages/Categories/CategoryPage"));
const ActivityLogPage = lazy(() => import("../pages/ActivityLogs/ActivityLogPage"));
const ReportsPage = lazy(() => import("../pages/Reports/ReportsPage"));
const LoginPage = lazy(() => import("../pages/Auth/Login"));
const SignupPage = lazy(() => import("../pages/Auth/SignupPage"));
const StockInPage = lazy(() => import("../pages/StockIn/StockInPage"));
const StockOutPage = lazy(() => import("../pages/StockOut/StockOutPage"));
const Suppliers = lazy(() => import("../pages/Suppliers/Suppliers"));
const CustomerCRMPage = lazy(() => import("../pages/Customers/CustomerCRMPage"));
const UserManagement = lazy(() => import("../pages/Users/UserManagement"));
const SalesPage = lazy(() => import("../pages/Sales/SalesPage"));
const PaymentPage = lazy(() => import("../pages/Payments/PaymentPage"));
const ProfilePage = lazy(() => import("../pages/Users/ProfilePage"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();
  const userRole = user?.role;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* =====================
            GUEST ROUTES
            (Accessible only when NOT logged in)
            ===================== */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />

        {/* =====================
            PROTECTED ROUTES
            (Require authentication)
            ===================== */}
        
        {/* Dashboard - All authenticated users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Sales - All authenticated users */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />

        {/* Products - All authenticated users (view) */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          }
        />

        {/* Stock In - All authenticated users */}
        <Route
          path="/stock-in"
          element={
            <ProtectedRoute>
              <StockInPage />
            </ProtectedRoute>
          }
        />

        {/* Stock Out - All authenticated users */}
        <Route
          path="/stock-out"
          element={
            <ProtectedRoute>
              <StockOutPage />
            </ProtectedRoute>
          }
        />

        {/* Payments - All authenticated users */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Profile - All authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Categories - Admin and Manager only */}
        <Route
          path="/categories"
          element={
            <ManagerRoute>
              <CategoryPage />
            </ManagerRoute>
          }
        />

        {/* Suppliers - Admin and Manager only */}
        <Route
          path="/suppliers"
          element={
            <ManagerRoute>
              <Suppliers />
            </ManagerRoute>
          }
        />

        {/* Customers - All authenticated users */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <CustomerCRMPage />
            </ProtectedRoute>
          }
        />

        {/* Reports - Admin and Manager only */}
        <Route
          path="/reports"
          element={
            <ManagerRoute>
              <ReportsPage />
            </ManagerRoute>
          }
        />

        {/* Activity Logs - Admin and Manager only */}
        <Route
          path="/activity-logs"
          element={
            <ManagerRoute>
              <ActivityLogPage />
            </ManagerRoute>
          }
        />

        {/* User Management - Admin only */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />

        {/* =====================
            CATCH ALL ROUTE
            ===================== */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
