import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
const SignupPage = lazy(() => import("../pages/Auth/SignupPage"));
const SalesPage = lazy(() => import("../pages/Sales/SalesPage"));
const PaymentPage = lazy(() => import("../pages/Payments/PaymentPage"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h2>
          <p className="text-gray-500 mb-4">Please log in to access this page.</p>
          <a href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
};

// Auth Route Component (redirect if already logged in)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return children;
};

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/activity-logs" 
          element={
            <ProtectedRoute>
              <ActivityLogPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stock-in" 
          element={
            <ProtectedRoute>
              <StockInPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stock-out" 
          element={
            <ProtectedRoute>
              <StockOutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suppliers" 
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute>
              <CustomerCRMPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
