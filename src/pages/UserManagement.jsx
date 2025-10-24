import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";

const API_BASE = "http://localhost:8000/api";
const token = localStorage.getItem("token");

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role_id: "",
    status: 1,
  });
  const [showInactive, setShowInactive] = useState(false); // toggle

  // Fetch users
  const fetchUsers = () => {
    axios
      .get(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUsers(res.data.data))
      .catch((err) => console.error(err));
  };

  // Fetch roles
  const fetchRoles = () => {
    axios
      .get(`${API_BASE}/roles`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRoles(res.data.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role_id) return;

    if (editingUser) {
      axios
        .put(`${API_BASE}/users/${editingUser.id}`, form, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          fetchUsers();
          setShowForm(false);
          setEditingUser(null);
          setForm({ name: "", email: "", role_id: "", status: 1 });
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post(`${API_BASE}/users`, form, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          fetchUsers();
          setShowForm(false);
          setForm({ name: "", email: "", role_id: "", status: 1 });
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      status: user.status,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    // Instead of deleting, we mark inactive
    axios
      .put(`${API_BASE}/users/${id}`, { status: 0 }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchUsers())
      .catch((err) => console.error(err));
  };

  // Filter users based on status
  const displayedUsers = users.filter(u => showInactive || u.status === 1);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
            />
            Show Inactive Users
          </label>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaSave /> {editingUser ? "Update" : "Add"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{roles.find((r) => r.id === u.role_id)?.name || "N/A"}</td>
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                        u.status === 1
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {u.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
