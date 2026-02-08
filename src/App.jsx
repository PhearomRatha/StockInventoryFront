import React, { useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "./context/AuthContext";

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
  const { isAuthenticated } = useAuth();
  
  // Hide sidebar on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && !isAuthPage && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      {!isAuthPage && (
        <aside className={`w-64 bg-white shadow-md fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
      )}

      <div className={`flex-1 ${isAuthPage ? '' : 'lg:ml-64'} flex flex-col`}>
        {/* Mobile header */}
        {!isAuthPage && (
          <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Inventory System</h1>
            <div className="w-10"></div>
          </div>
        )}
        
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default App;
