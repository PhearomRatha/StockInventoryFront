import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Bars3Icon } from "@heroicons/react/24/outline";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ActivityLogPage = lazy(() => import("./pages/ActivityLogPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const StockInPage = lazy(() => import("./pages/StockInPage"));
const StockOutPage = lazy(() => import("./pages/StockOutPage"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const CustomerCRMPage = lazy(() => import("./pages/CustomerCRMPage"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Signup = lazy(() => import("./pages/SignupPage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const hideSidebar = location.pathname === '/payments';

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-100">
              {/* Mobile sidebar overlay */}
              {sidebarOpen && !hideSidebar && (
                <div
                  className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                ></div>
              )}

              {!hideSidebar && (
                <aside className={`w-64 bg-white shadow-md fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </aside>
              )}

              <div className={`flex-1 ${hideSidebar ? '' : 'lg:ml-64'} flex flex-col`}>
                {/* Mobile header */}
                {!hideSidebar && (
                  <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Bars3Icon className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Inventory System</h1>
                    <div className="w-10"></div> {/* Spacer */}
                  </div>
                )}
<main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
  <Suspense fallback={<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/activity-logs" element={<ActivityLogPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/stock-in" element={<StockInPage/>}/>
      <Route path="/stock-out" element={<StockOutPage/>}/>
      <Route path="/suppliers" element={<Suppliers/>}/>
      <Route path="/customer" element={<CustomerCRMPage/>}/>
      <Route path="/users" element={<UserManagement/>}/>
      <Route path="/sales" element={<SalesPage/>}/>
      <Route path="/payments" element={<PaymentPage/>}/>
    </Routes>
  </Suspense>
</main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
