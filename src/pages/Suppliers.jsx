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
  FaExclamationCircle,
} from "react-icons/fa";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
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

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format.";

    if (form.phone && !/^(\+855\d{8,9}|0\d{8,9}|\d{9,10})$/.test(form.phone))
      newErrors.phone = "Invalid phone number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    setErrors({ ...errors, [e.target.name]: "" }); // remove error as user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingIndex !== null) {
      const supplierId = suppliers[editingIndex].id;

      axios
        .patch(`${API_BASE}/suppliers/${supplierId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchSuppliers();
          setEditingIndex(null);
          resetForm();
        })
        .catch((err) => console.error("Error updating supplier:", err));
    } else {
      axios
        .post(`${API_BASE}/suppliers`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          fetchSuppliers();
          resetForm();
        })
        .catch((err) => console.error("Error adding supplier:", err));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
    setErrors({});
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
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
            <FaUserTie className="text-blue-600" /> Supplier Management
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5 mb-8">

          {/* NAME */}
          <div>
            <label className="font-medium">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full border p-2 rounded-lg ${
                errors.name ? "border-red-500" : "focus:ring-blue-400"
              }`}
              placeholder="Supplier name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <FaExclamationCircle /> {errors.name}
              </p>
            )}
          </div>

          {/* COMPANY */}
          <div>
            <label className="font-medium">Company</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-blue-400"
              placeholder="Company name"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="font-medium">Phone</label>
            <div className={`flex items-center border p-2 rounded-lg ${
              errors.phone ? "border-red-500" : ""
            }`}>
              <FaPhoneAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="flex-1 outline-none"
                placeholder="0xx / +855"
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <FaExclamationCircle /> {errors.phone}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="font-medium">Email</label>
            <div className={`flex items-center border p-2 rounded-lg ${
              errors.email ? "border-red-500" : ""
            }`}>
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="flex-1 outline-none"
                placeholder="email@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <FaExclamationCircle /> {errors.email}
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="font-medium">Address</label>
            <div className="flex items-center border p-2 rounded-lg">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="flex-1 outline-none"
                placeholder="Address"
              />
            </div>
          </div>

          {/* NOTES */}
          <div className="md:col-span-2">
            <label className="font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-blue-400"
              placeholder="Important notes"
            ></textarea>
          </div>

          {/* BUTTONS */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-3">
            {editingIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              {editingIndex !== null ? <><FaSave /> Update</> : <><FaPlus /> Add</>}
            </button>
          </div>
        </form>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-2 mb-5">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="border p-2 rounded-lg w-full focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <FaBuilding className="text-blue-600" /> Suppliers List
        </h2>

        {sortedSuppliers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No suppliers found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  {["name", "company", "phone", "email", "address", "notes"].map((key) => (
                    <th
                      key={key}
                      className="p-3 text-left cursor-pointer hover:text-blue-600 select-none"
                      onClick={() => handleSort(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {sortConfig.key === key
                        ? sortConfig.direction === "asc"
                          ? " ▲"
                          : " ▼"
                        : ""}
                    </th>
                  ))}
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedSuppliers.map((s, i) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.company}</td>
                    <td className="p-3">{s.phone}</td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">{s.address}</td>
                    <td className="p-3">{s.notes}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>

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
