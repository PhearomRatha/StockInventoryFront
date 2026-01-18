import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaUserSlash, FaEdit, FaCheck, FaTimes, FaClock } from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", status: 1, role_id: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch users
  const fetchUsers = async (page = 1, statusFilter = '', searchTerm = '') => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (statusFilter) params.append('status', statusFilter === 'active' ? 1 : statusFilter === 'pending' ? 0 : 2);
      if (searchTerm) params.append('search', searchTerm);
      const res = await axios.get(`${API_BASE}/users?${params.toString()}`, { headers });
      setUsers(res.data.data.data || []);
      setCurrentPage(res.data.data.current_page || 1);
      setTotalPages(res.data.data.last_page || 1);
      setTotalUsers(res.data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/roles`, { headers });
      setRoles(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers(1, filter, search);
    fetchRoles();
  }, []);

  // Update user info or status
  const updateUser = async (id, data) => {
    try {
      await axios.put(`${API_BASE}/users/${id}`, data, { headers });
      setEditingUser(null);
      fetchUsers();
      setMessage({ text: "User updated successfully", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to update user", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // Disable user (set status to inactive)
  const disableUser = async (id) => {
    if (!window.confirm("Are you sure to disable this user?")) return;
    try {
      await updateUser(id, { status: 2 });
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    setForm({ name: user.name, email: user.email, status: user.status, role_id: user.role?.id || "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      setForm((prev) => ({ ...prev, status: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    const filteredData = {};
    Object.keys(form).forEach(key => {
      if (form[key] !== "" && form[key] !== null) {
        filteredData[key] = form[key];
      } else if (key === 'role_id' && form[key] === "") {
        filteredData[key] = null;
      }
    });
    updateUser(editingUser, filteredData);
  };

  // Filtered users (now handled by backend)
  const filteredUsers = users;

  const getStatusText = (status) =>
    status == 1 ? "Active" :
    status == 0 ? "Pending" :
    status == 2 ? "Inactive" :
    "Unknown";
  const getStatusClass = (status) =>
    status == 1 ? "bg-green-100 text-green-800" :
    status == 0 ? "bg-yellow-100 text-yellow-800" :
    status == 2 ? "bg-red-100 text-red-800" :
    "bg-gray-100 text-gray-800";
  const getStatusIcon = (status) =>
    status == 1 ? <FaCheck className="inline mr-1" /> :
    status == 0 ? <FaClock className="inline mr-1" /> :
    status == 2 ? <FaTimes className="inline mr-1" /> : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">User Management</h1>

        {message.text && (
          <div
            className={`mb-6 text-center py-3 px-4 rounded-xl font-medium shadow-lg
              ${message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : ""}
              ${message.type === "error" ? "bg-red-100 text-red-700 border border-red-300" : ""}`}
          >
            {message.text}
          </div>
        )}

        {/* Filter & Search */}
        <div className="flex gap-4 mb-6">
          {["active", "pending", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); fetchUsers(1, f, search); }}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search by name"
            className="border rounded-lg px-3 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => { setSearch(searchQuery); fetchUsers(1, filter, searchQuery); }}
            className="px-4 py-2 bg-blue-600 text-white rounded ml-2"
          >
            Search
          </button>
        </div>

        {/* User Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div key={u.id} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between border border-gray-200">
              <div>
                <h2 className="text-lg font-semibold mb-1">{u.name}</h2>
                <p className="text-gray-600 mb-1">{u.email}</p>
                <p className="text-gray-600 mb-1">Role: {u.role?.name || "No role"}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(u.status)}`}>
                  {getStatusIcon(u.status)}{getStatusText(u.status)}
                </span>
              </div>
              <div className="mt-4 flex justify-end gap-2 text-gray-700">
                {u.status == 0 && (
                  <>
                    <button title="Approve" onClick={() => updateUser(u.id, { status: 1 })} className="hover:text-green-600">
                      <FaCheck />
                    </button>
                    <button title="Reject" onClick={() => updateUser(u.id, { status: 2 })} className="hover:text-red-600">
                      <FaTimes />
                    </button>
                  </>
                )}
                {u.status == 1 && (
                  <>
                    <button title="Edit" onClick={() => startEdit(u)} className="hover:text-blue-600">
                      <FaEdit />
                    </button>
                    <button title="Deactivate" onClick={() => updateUser(u.id, { status: 2 })} className="hover:text-yellow-600">
                      <FaUserSlash />
                    </button>
                    <button title="Disable" onClick={() => disableUser(u.id)} className="hover:text-red-600">
                      <FaTrash />
                    </button>
                  </>
                )}
                {u.status == 2 && (
                  <>
                    <button title="Reactivate" onClick={() => updateUser(u.id, { status: 1 })} className="hover:text-green-600">
                      <FaUserSlash />
                    </button>
                    <button title="Disable" onClick={() => disableUser(u.id)} className="hover:text-red-600">
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
      
      
            </div>
          ))}
        </div>
                {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * 8 + 1} to{" "}
                  {Math.min(currentPage * 8, filteredUsers.length)}{" "}
                  of {totalUsers} users
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchUsers(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => fetchUsers(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => fetchUsers(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleEditChange}
              placeholder="Name"
              className="w-full mb-3 p-2 border rounded-lg"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleEditChange}
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded-lg"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleEditChange}
              className="w-full mb-3 p-2 border rounded-lg"
            >
              <option value={0}>Pending</option>
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role_id"
              value={form.role_id}
              onChange={handleEditChange}
              className="w-full mb-3 p-2 border rounded-lg"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-3">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg bg-gray-400 text-white">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
