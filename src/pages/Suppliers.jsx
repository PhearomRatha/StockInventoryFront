import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaSearch,
} from "react-icons/fa";

const API_BASE = "http://localhost:8000/api";
const token = localStorage.getItem("token");

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  const fetchSuppliers = () => {
    axios
      .get(`${API_BASE}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.data) setSuppliers(res.data.data);
      })
      .catch((err) => console.error("Error fetching suppliers:", err));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Supplier name is required");
      return;
    }

    if (editingIndex !== null) {
      const supplierId = suppliers[editingIndex].id;
      axios
        .post(`${API_BASE}/suppliers/${supplierId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchSuppliers();
          setEditingIndex(null);
          setForm({
            name: "",
            company: "",
            phone: "",
            email: "",
            address: "",
            notes: "",
          });
        })
        .catch((err) => console.error("Error updating supplier:", err));
    } else {
      axios
        .post(`${API_BASE}/suppliers`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchSuppliers();
          setForm({
            name: "",
            company: "",
            phone: "",
            email: "",
            address: "",
            notes: "",
          });
        })
        .catch((err) => console.error("Error adding supplier:", err));
    }
  };

  const handleEdit = (index) => {
    setForm(suppliers[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const supplierId = suppliers[index].id;
    if (window.confirm("Are you sure to delete this supplier?")) {
      axios
        .delete(`${API_BASE}/suppliers/${supplierId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => fetchSuppliers())
        .catch((err) => console.error("Error deleting supplier:", err));
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSuppliers = [...suppliers]
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUserTie className="text-blue-600" /> Supplier Management
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              placeholder="Supplier name"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Phone</label>
            <div className="flex items-center border rounded-lg p-2">
              <FaPhoneAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+855 123456789"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <div className="flex items-center border rounded-lg p-2">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Address</label>
            <div className="flex items-center border rounded-lg p-2">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Important notes"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            {editingIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null);
                  setForm({
                    name: "",
                    company: "",
                    phone: "",
                    email: "",
                    address: "",
                    notes: "",
                  });
                }}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {editingIndex !== null ? (
                <>
                  <FaSave /> Update
                </>
              ) : (
                <>
                  <FaPlus /> Add
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search */}
        <div className="flex items-center mb-4 gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Supplier List */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <FaBuilding className="text-blue-600" /> Suppliers
        </h2>

        {sortedSuppliers.length === 0 ? (
          <p className="text-gray-500 text-center">No suppliers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                {["name", "company", "phone", "email", "address", "notes"].map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="p-2 text-left cursor-pointer select-none hover:text-blue-600"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
                <th className="p-2 text-left">Actions</th>
              </thead>
              <tbody>
                {sortedSuppliers.map((s, i) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.company}</td>
                    <td className="p-2">{s.phone}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.address}</td>
                    <td className="p-2">{s.notes}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      {editingIndex === i && (
                        <button
                          onClick={handleSubmit}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1"
                        >
                          <FaSave /> Update
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(i)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Suppliers;
