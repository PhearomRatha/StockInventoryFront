import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

function CustomerCrmPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferences: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const token = localStorage.getItem("token");
  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

  // ---------------- Fetch Customers ----------------
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  // ---------------- Handle Form Change ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Add / Edit Customer ----------------
  const handleSubmit = async () => {
    if (!form.name) return alert("Name is required!");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE}/customers/${editingId}`
        : `${API_BASE}/customers`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (response.ok) {
        await fetchCustomers();
        setForm({
          name: "",
          email: "",
          phone: "",
          address: "",
          preferences: "",
          notes: "",
        });
        setEditingId(null);
      } else {
        alert(result.message || "Failed to save customer");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving customer.");
    }
  };

  // ---------------- Delete Customer ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`${API_BASE}/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCustomers(customers.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete customer");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- Edit Customer ----------------
  const handleEdit = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      preferences: customer.preferences || "",
      notes: customer.notes || "",
    });
    setEditingId(customer.id);
  };

  // ---------------- Sorting ----------------
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
    const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="inline ml-1 text-blue-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 relative">

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-3"></div>
            <p className="text-blue-700 font-semibold">Loading customers...</p>
          </div>
        </div>
      )}

      {/* Customer Form */}
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-10">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <FaPlus className="text-blue-600" /> {editingId ? "Edit Customer" : "Add Customer"}
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input type="text" name="name" placeholder="Name *" value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="preferences" placeholder="Preferences" value={form.preferences} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> {editingId ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Customer List</h2>

        {customers.length === 0 && !loading ? (
          <p className="text-gray-500 text-center">No customers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th onClick={() => handleSort("name")} className="p-2 text-left cursor-pointer select-none hover:text-blue-600">
                    Name {renderSortIcon("name")}
                  </th>
                  <th onClick={() => handleSort("email")} className="p-2 text-left cursor-pointer select-none hover:text-blue-600">
                    Email {renderSortIcon("email")}
                  </th>
                  <th onClick={() => handleSort("phone")} className="p-2 text-left cursor-pointer select-none hover:text-blue-600">
                    Phone {renderSortIcon("phone")}
                  </th>
                  <th onClick={() => handleSort("address")} className="p-2 text-left cursor-pointer select-none hover:text-blue-600">
                    Address {renderSortIcon("address")}
                  </th>
                  <th className="p-2 text-left">Preferences</th>
                  <th className="p-2 text-left">Notes</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {sortedCustomers.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition duration-150">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">{c.email}</td>
                    <td className="p-2">{c.phone}</td>
                    <td className="p-2">{c.address}</td>
                    <td className="p-2">{c.preferences}</td>
                    <td className="p-2">{c.notes}</td>
                    <td className="p-2 text-center flex justify-center gap-2">
                      <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">
                        <FaTrash />
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

export default CustomerCrmPage;
