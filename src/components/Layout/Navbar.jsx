import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  BellIcon, 
  ChatBubbleOvalLeftIcon, 
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="flex items-center justify-end bg-white shadow-sm border-b border-gray-200 px-6 py-4">


      {/* Icons and Profile */}
      <div className="flex items-center gap-6">
        {/* Cart with Badge */}
   

        {/* Notifications with Badge */}
        <div className="relative">
          <BellIcon className="w-6 h-6 text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors duration-200" />
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            7
          </span>
        </div>

 

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">BC</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">Ploy</p>
                <p className="text-xs text-gray-500">Admini</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">MOKA</p>
                <p className="text-sm text-gray-500">moka@gmail.com</p>
              </div>
              
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <UserCircleIcon className="w-4 h-4 mr-3" />
                Profile Settings
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <ShoppingCartIcon className="w-4 h-4 mr-3" />
                Order History
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <BellIcon className="w-4 h-4 mr-3" />
                Notification Settings
              </a>
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <a href="#" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;