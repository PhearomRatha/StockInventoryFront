import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import api from '../../plugin/axios';
import { useAuth } from '../../context/AuthContext';

 const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: localStorage.getItem('signupEmail') || '',
    password: localStorage.getItem('signupPassword') || ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Clear the stored values after setting
  useEffect(() => {
    if (localStorage.getItem('signupEmail')) {
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupPassword');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage({ text: '', type: '' });
  setLoading(true);

  try {
    await axios.get('/sanctum/csrf-cookie')
    const res = await api.post(`${API_BASE}/login`, formData);

    if (res.data.status === 200) {
      const user = res.data.data.user;
      const token = res.data.data.token;

      if (user.status == 0) {
        setMessage({
          text: "Your account is not approved yet. Please wait for admin approval.",
          type: "warning"
        });
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      login(user);

      setMessage({ text: "Login successful! loading....", type: "success" });
      setLoading(false);

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      setMessage({ text: res.data.message || "Login failed", type: "error" });
      setLoading(false);
    }

  } catch (err) {
    console.error("Login error:", err);

    // Handle CORS / network issues
    if (!err.response) {
      setMessage({
        text: "Cannot reach backend. Check CORS, HTTPS, or network.",
        type: "error"
      });
    } else {
      setMessage({
        text: err.response?.data?.message || "Something went wrong.",
        type: "error"
      });
    }

    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

      
          {message.text && (
            <div
              className={`mb-6 text-center py-3 px-4 rounded-xl font-medium 
                ${message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : ""}
                ${message.type === "error" ? "bg-red-100 text-red-700 border border-red-300" : ""}
                ${message.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" : ""}`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-300 rounded-xl"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="h-12 bg-blue-300 rounded-xl"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : <FaEye className="text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:text-blue-500 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
