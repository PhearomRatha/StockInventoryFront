import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiBox,
  FiUpload,
  FiDownload,
  FiTruck,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiTag,
  FiFileText,
  FiLogOut,
  FiX,
  FiChevronRight,
  FiUser,
  FiSettings,
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { getStockReport } from "../../api/reportsApi";
import { useAuth, hasAnyRole, ROLES } from "../../context/AuthContext";

function Sidebar({ onClose }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const role = user?.role; // "Admin", "Manager", "Staff"
  const [lowStockAlert, setLowStockAlert] = useState(0);

  useEffect(() => {
    const fetchStockAlert = async () => {
      const cacheKey = 'stock_alert_cache';
      const cacheTimeKey = 'stock_alert_time';
      const now = Date.now();
      const cacheTime = localStorage.getItem(cacheTimeKey);
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData && cacheTime && (now - cacheTime < 5 * 60 * 1000)) {
        setLowStockAlert(parseInt(cachedData));
        return;
      }

      try {
        const data = await getStockReport();
        const totalLow = (data.total_low_stock || 0) + (data.total_out_of_stock || 0);
        setLowStockAlert(totalLow);
        localStorage.setItem(cacheKey, totalLow.toString());
        localStorage.setItem(cacheTimeKey, now.toString());
      } catch (err) {
        console.error("Error fetching stock alert:", err);
      }
    };
    fetchStockAlert();
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Menu items configuration based on requirements
  const menuItems = [
    // Common items for all users
    {
      path: "/",
      label: "Dashboard",
      icon: FiHome,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      priority: 1
    },
    {
      path: "/sales",
      label: "Sales",
      icon: FiDollarSign,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      priority: 2
    },
    {
      path: "/products",
      label: "Products",
      icon: FiBox,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      permission: 'VIEW_ALL_PRODUCTS',
      priority: 3
    },
    {
      path: "/stock-in",
      label: "Stock In",
      icon: FiDownload,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      priority: 4
    },
    {
      path: "/stock-out",
      label: "Stock Out",
      icon: FiUpload,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      priority: 5
    },
    {
      path: "/payments",
      label: "Payments",
      icon: FiDollarSign,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      priority: 6
    },
    
    // Admin and Manager only
    {
      path: "/categories",
      label: "Categories",
      icon: FiTag,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      permission: 'MANAGE_CATEGORIES',
      priority: 7
    },
    {
      path: "/suppliers",
      label: "Suppliers",
      icon: FiTruck,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      permission: 'MANAGE_SUPPLIERS',
      priority: 8
    },
    {
      path: "/customer",
      label: "Customers",
      icon: FiUsers,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
      priority: 9
    },
    
    // Reports and Activity Logs - Admin and Manager
    {
      path: "/reports",
      label: "Reports",
      icon: FiBarChart2,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      permission: 'VIEW_REPORTS',
      priority: 10
    },
    {
      path: "/activity-logs",
      label: "Activity Logs",
      icon: FiFileText,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      permission: 'VIEW_ACTIVITY_LOGS',
      priority: 11
    },
    
    // User Management - Admin only
    {
      path: "/users",
      label: "User Management",
      icon: FiUsers,
      roles: [ROLES.ADMIN],
      permission: 'VIEW_USERS',
      priority: 12
    },
  ];

  // Filter menu items based on user role
  const { hasPermission } = useAuth();
  
  const getVisibleMenuItems = () => {
    return menuItems.filter(item => {
      // Check if user's role is in the allowed roles
      if (!item.roles.includes(role)) return false;
      
      // Check if user has required permission
      if (item.permission) {
        return hasPermission(user, item.permission);
      }
      
      return true;
    });
  };

  // Sort by priority
  const visibleMenuItems = getVisibleMenuItems().sort((a, b) => a.priority - b.priority);

  return (
    <div className="w-64 h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col p-6 shadow-xl border-r border-slate-700">
      {/* Header */}
      <div className="mb-6 pt-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center justify-center gap-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiBox className="text-white" size={24} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Inventory
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>

        {/* User Role Badge */}
        <div className="mt-4 flex justify-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            role === ROLES.ADMIN 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : role === ROLES.MANAGER
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {role || 'User'}
          </span>
        </div>

        {/* Stock Alert */}
        {lowStockAlert > 0 && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm font-medium">
                {lowStockAlert} item{lowStockAlert > 1 ? 's' : ''} need attention
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx="true">{`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {visibleMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
              isActive(item.path)
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg"
                : "hover:bg-slate-700/50 hover:border hover:border-slate-600"
            }`}
          >
            <div
              className={`p-2 rounded-lg transition-all duration-300 ${
                isActive(item.path) ? "bg-blue-500 shadow-md" : "bg-slate-700 group-hover:bg-blue-500"
              }`}
            >
              <item.icon size={18} className="text-white" />
            </div>
            <span className="font-medium flex-1">{item.label}</span>
            {((item.path === '/reports' || item.path === '/products') && lowStockAlert > 0) && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {lowStockAlert}
              </span>
            )}
            <FiChevronRight
              size={16}
              className={`text-gray-400 transition-transform duration-300 ${
                isActive(item.path) ? "text-blue-300" : "group-hover:text-white"
              }`}
            />
          </Link>
        ))}
      </nav>

      {/* Footer with Profile and Logout */}
      <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col items-center gap-3">
        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 w-full justify-center bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
        >
          <FiUser size={18} /> View Profile
        </Link>
        
        {/* Logout Button */}
        <button
          onClick={async () => {
            await logout();
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition w-full justify-center"
        >
          <FiLogOut size={18} /> Logout
        </button>
        <div className="text-center text-slate-400 text-sm">
          <p>Inventory System</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
