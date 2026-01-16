import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import StockInPage from "./pages/StockInPage";
import StockOutPage from "./pages/StockOutPage";
import Suppliers from "./pages/Suppliers";
 import CustomerCRMPage from "./pages/CustomerCRMPage";
 import UserManagement from "./pages/UserManagement";
 import Signup from "./pages/SignupPage";
 import SalesPage from "./pages/SalesPage";
 import PaymentPage from "./pages/PaymentPage";
import { Bars3Icon } from "@heroicons/react/24/outline";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
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
                {sidebarOpen && (
                  <div
                    className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  ></div>
                )}

                <aside className={`w-64 bg-white shadow-md fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </aside>

                <div className="flex-1 lg:ml-64 flex flex-col">
                  {/* Mobile header */}
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

                  <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
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
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
