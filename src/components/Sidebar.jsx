import React from "react";
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
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ onClose }) {
  const location = useLocation();
  const userData = localStorage.getItem("user");
  const user = userData && userData !== "undefined" ? JSON.parse(userData) : null;
  const role = user?.role?.name; // "Admin", "Manager", "Staff"

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Menu items with roles - ordered by user priority
  const menuItems = [
    { path: "/", label: "Dashboard", icon: FiHome, roles: ["Admin","Manager","Staff"] },
    { path: "/sales", label: "Sales", icon: FiDollarSign, roles: ["Admin","Manager","Staff"] },
    { path: "/products", label: "Product Management", icon: FiBox, roles: ["Admin","Manager","Staff"] },
    { path: "/stock-in", label: "Stock In", icon: FiDownload, roles: ["Admin","Manager","Staff"] },
    { path: "/stock-out", label: "Stock Out", icon: FiUpload, roles: ["Admin","Manager","Staff"] },
    { path: "/categories", label: "Categories", icon: FiTag, roles: ["Admin","Manager"] },
    { path: "/suppliers", label: "Supplier Management", icon: FiTruck, roles: ["Admin","Manager"] },
    { path: "/customer", label: "Customers", icon: FiUsers, roles: ["Admin","Manager","Staff"] },
    { path: "/payments", label: "Payments", icon: FiDollarSign, roles: ["Admin","Manager"] },
    { path: "/reports", label: "Reports", icon: FiBarChart2, roles: ["Admin","Manager"] },
    { path: "/activity-logs", label: "Activity Logs", icon: FiFileText, roles: ["Admin","Manager"] },
    { path: "/users", label: "User Management", icon: FiUsers, roles: ["Admin"] },
  ];

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
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx="true">{`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {menuItems.map((item) =>
          item.roles.includes(role) && (
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
              <FiChevronRight
                size={16}
                className={`text-gray-400 transition-transform duration-300 ${
                  isActive(item.path) ? "text-blue-300" : "group-hover:text-white"
                }`}
              />
            </Link>
          )
        )}
      </nav>

      {/* Footer with Logout */}
      <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col items-center gap-3">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
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
