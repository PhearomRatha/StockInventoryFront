import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaUserSlash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", status: 1, role_id: "" });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, { headers });
      setUsers(res.data.data);
    } catch (err) { console.error(err); }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/roles`, { headers });
      setRoles(res.data.data);
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); alert("Failed to update user"); }
  };

  // Remove user permanently
  const removeUser = async (id) => {
    if (!window.confirm("Are you sure to remove this user?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`, { headers });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const startEdit = (user) => {
    setEditingUser(user.id);
    setForm({ name: user.name, email: user.email, status: user.status, role_id: user.role_id });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "status" || name === "role_id" ? parseInt(value) : value }));
  };

  const filteredUsers = users
    .filter(u => {
      if (filter === "active") return u.status === 1;
      if (filter === "pending") return u.status === 0;
      if (filter === "inactive") return u.status === 2;
      return true;
    })
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  const getStatusText = (status) => status === 0 ? "Pending" : status === 1 ? "Active" : "Inactive";
  const getStatusClass = (status) => status === 1 ? "bg-green-100 text-green-800" : status === 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>

        {/* Filter & Search */}
        <div className="flex gap-4 mb-6">
          {["active","pending","inactive"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold ${filter===f ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search by name"
            className="border rounded-lg px-3 py-2 ml-auto"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* User Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">{u.name}</h2>
                <p className="text-gray-600 mb-1">{u.email}</p>
                <p className="text-gray-600 mb-1">Role: {roles.find(r => r.id === u.role_id)?.name || u.role_id}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(u.status)}`}>
                  {getStatusText(u.status)}
                </span>
              </div>

              <div className="mt-4 flex justify-end gap-2 text-gray-700">
                {u.status === 0 && (
                  <>
                    <button title="Approve" onClick={() => updateUser(u.id, { status: 1 })} className="hover:text-green-600"><FaCheck /></button>
                    <button title="Reject" onClick={() => updateUser(u.id, { status: 2 })} className="hover:text-red-600"><FaTimes /></button>
                  </>
                )}
                {u.status === 1 && (
                  <>
                    <button title="Edit" onClick={() => startEdit(u)} className="hover:text-blue-600"><FaEdit /></button>
                    <button title="Deactivate" onClick={() => updateUser(u.id, { status: 2 })} className="hover:text-yellow-600"><FaUserSlash /></button>
                    <button title="Remove" onClick={() => removeUser(u.id)} className="hover:text-red-600"><FaTrash /></button>
                  </>
                )}
                {u.status === 2 && (
                  <>
                    <button title="Reactivate" onClick={() => updateUser(u.id, { status: 1 })} className="hover:text-green-600"><FaUserSlash /></button>
                    <button title="Remove" onClick={() => removeUser(u.id)} className="hover:text-red-600"><FaTrash /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <input type="text" name="name" value={form.name} onChange={handleEditChange} placeholder="Name" className="w-full mb-3 p-2 border rounded-lg" />
            <input type="email" name="email" value={form.email} onChange={handleEditChange} placeholder="Email" className="w-full mb-3 p-2 border rounded-lg" />
            
            <select name="role_id" value={form.role_id} onChange={handleEditChange} className="w-full mb-3 p-2 border rounded-lg">
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <select name="status" value={form.status} onChange={handleEditChange} className="w-full mb-3 p-2 border rounded-lg">
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
            </select>

            <div className="flex justify-end gap-3 mt-3">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg bg-gray-400 text-white">Cancel</button>
              <button onClick={() => updateUser(editingUser, form)} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
