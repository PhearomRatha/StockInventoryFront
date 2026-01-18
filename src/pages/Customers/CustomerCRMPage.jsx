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
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const method = editingId ? "PATCH" : "POST";
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
    setCurrentPage(1); // Reset to first page on sort change
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
    const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatName = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      const first = parts[0];
      const last = parts.slice(1).join(' ');
      return `${last}, ${first}`;
    }
    return name;
  };

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
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Customer List</h2>
        </div>

        {customers.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No customers yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                  <tr>
                    <th onClick={() => handleSort("id")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      ID {renderSortIcon("id")}
                    </th>
                    <th onClick={() => handleSort("name")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      Name {renderSortIcon("name")}
                    </th>
                    <th onClick={() => handleSort("email")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      Email {renderSortIcon("email")}
                    </th>
                    <th onClick={() => handleSort("phone")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      Phone {renderSortIcon("phone")}
                    </th>
                    <th onClick={() => handleSort("address")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      Address {renderSortIcon("address")}
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Preferences</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors duration-200">
                      <td className="py-4 px-6 text-sm text-gray-900">{c.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">{formatName(c.name)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.phone}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.address}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.preferences}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.notes}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(c)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Edit">
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" title="Delete">
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerCrmPage;
