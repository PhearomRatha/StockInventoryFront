import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import axios from "axios";

const API_BASE =`${import.meta.env.VITE_API_URL}/api`;

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ text: "Please fill in all fields", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "Registering...", type: "info" });

    try {
      const res = await axios.post(`${API_BASE}/signup`, { ...formData, status: 0 });
      if (res.data.status === 201) {
        setMessage({ text: "Signup successful! Waiting for admin approval.", type: "success" });
        setLoading(false);
        // Store email and password for pre-filling login
        localStorage.setItem("signupEmail", formData.email);
        localStorage.setItem("signupPassword", formData.password);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage({ text: "Signup failed", type: "error" });
        setLoading(false);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage({ text: err.response?.data?.message || "Something went wrong.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Fill in your details to sign up</p>
          </div>

          {message.text && (
            <div
              className={`mb-6 text-center py-3 px-4 rounded-xl font-medium
                ${message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : ""}
                ${message.type === "error" ? "bg-red-100 text-red-700 border border-red-300" : ""}
                ${message.type === "info" ? "bg-blue-100 text-blue-700 border border-blue-300" : ""}`}
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
              <div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="h-12 bg-blue-300 rounded-xl"></div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Sign Up
            </button>
          </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
