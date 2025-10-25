import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import StockInPage from "./pages/StockInPage";
import StockOutPage from "./pages/StockOutPage";
import Suppliers from "./pages/Suppliers";
 import CustomerCRMPage from "./pages/CustomerCRMPage";
 import UserManagement from "./pages/UserManagement";
 import Signup from "./pages/SignupPage";

function App() {
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
                <aside className="w-64 bg-white shadow-md fixed top-0 left-0 h-full z-20">
                  <Sidebar />
                </aside>
                <div className="flex-1 ml-64 flex flex-col">
                  <main className="flex-1 p-6 bg-gsray-50 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<ProductPage />} />
                                    <Route path="/stock-in" element={<StockInPage/>}/>
               <Route path="/stock-out" element={<StockOutPage/>}/>
               <Route path="/suppliers" element={<Suppliers/>}/>
              <Route path="/customer" element={<CustomerCRMPage/>}/>
              <Route path="/users" element={<UserManagement/>}/>  
                   
       

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
