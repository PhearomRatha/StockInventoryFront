import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaUserSlash, FaEdit, FaCheck, FaTimes, FaClock } from "react-icons/fa";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", status: true, role_id: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, { headers });
      // The array of users is in res.data.data.data due to pagination
      setUsers(res.data.data.data);
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
    fetchUsers();
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

  // Remove user permanently
  const removeUser = async (id) => {
    if (!window.confirm("Are you sure to remove this user?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`, { headers });
      fetchUsers();
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
      setForm((prev) => ({ ...prev, status: value === "1" ? true : false }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Filter & search users
  const filteredUsers = users
    .filter((u) => {
      if (filter === "active") return u.status === true;
      if (filter === "inactive") return u.status === false;
      if (filter === "pending") return u.status == 0; // allow string or number
      return true;
    })
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const getStatusText = (status) => (status === true ? "Active" : status === false ? "Inactive" : status == 0 ? "Pending" : "Unknown");
  const getStatusClass = (status) =>
    status === true
      ? "bg-green-100 text-green-800"
      : status === false
      ? "bg-red-100 text-red-800"
      : status == 0
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";
  const getStatusIcon = (status) =>
    status === true ? <FaCheck className="inline mr-1" /> :
    status === false ? <FaTimes className="inline mr-1" /> :
    status == 0 ? <FaClock className="inline mr-1" /> : null;

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
              onClick={() => setFilter(f)}
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
            className="border rounded-lg px-3 py-2 ml-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                {u.status === 0 && (
                  <>
                    <button title="Approve" onClick={() => updateUser(u.id, { status: true })} className="hover:text-green-600">
                      <FaCheck />
                    </button>
                    <button title="Reject" onClick={() => updateUser(u.id, { status: false })} className="hover:text-red-600">
                      <FaTimes />
                    </button>
                  </>
                )}
                {u.status === true && (
                  <>
                    <button title="Edit" onClick={() => startEdit(u)} className="hover:text-blue-600">
                      <FaEdit />
                    </button>
                    <button title="Deactivate" onClick={() => updateUser(u.id, { status: false })} className="hover:text-yellow-600">
                      <FaUserSlash />
                    </button>
                    <button title="Remove" onClick={() => removeUser(u.id)} className="hover:text-red-600">
                      <FaTrash />
                    </button>
                  </>
                )}
                {u.status === false && (
                  <>
                    <button title="Reactivate" onClick={() => updateUser(u.id, { status: true })} className="hover:text-green-600">
                      <FaUserSlash />
                    </button>
                    <button title="Remove" onClick={() => removeUser(u.id)} className="hover:text-red-600">
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
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
              value={form.status ? 1 : 0}
              onChange={handleEditChange}
              className="w-full mb-3 p-2 border rounded-lg"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
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
              <button onClick={() => updateUser(editingUser, form)} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
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
