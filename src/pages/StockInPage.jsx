import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

function StockInPage() {
  const [formData, setFormData] = useState({
    supplier_id: "",
    product_id: "",
    quantity: "",
    unit_cost: "",
    date: new Date().toISOString().split("T")[0],
    received_by: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stockInHistory, setStockInHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const API_BASE = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchUsers();
    fetchStockIns();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 200) setSuppliers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 200) setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 200) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockIns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stock-ins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 200) setStockInHistory(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.supplier_id ||
      !formData.product_id ||
      !formData.quantity ||
      !formData.unit_cost ||
      !formData.received_by
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      supplier_id: formData.supplier_id,
      product_id: formData.product_id,
      quantity: parseInt(formData.quantity),
      unit_cost: parseFloat(formData.unit_cost),
      date: formData.date,
      received_by: formData.received_by,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/stock-ins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 201) {
        alert("✅ Stock In recorded successfully!");
        setFormData({
          supplier_id: "",
          product_id: "",
          quantity: "",
          unit_cost: "",
          date: new Date().toISOString().split("T")[0],
          received_by: "",
        });
        fetchStockIns();
        fetchProducts();
      } else {
        console.error(data);
        alert("❌ Failed to record Stock In.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHistory = stockInHistory
    .filter((r) => {
      const productName = (r.product_name || "").toLowerCase();
      const supplierName = (r.supplier_name || "").toLowerCase();
      const matchesSearch =
        productName.includes(searchTerm.toLowerCase()) ||
        supplierName.includes(searchTerm.toLowerCase());
      const matchesSupplier =
        selectedSupplier === "All" || r.supplier_name === selectedSupplier;
      const matchesDate = !selectedDate || r.received_date === selectedDate;
      return matchesSearch && matchesSupplier && matchesDate;
    })
    .sort((a, b) => new Date(a.received_date) - new Date(b.received_date)); // ASC

  const totalValue = filteredHistory.reduce(
    (sum, r) => sum + Number(r.quantity || 0) * Number(r.unit_cost || 0),
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock In Management</h1>
        <p className="text-gray-600">Log new stock arrivals and update inventory automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock In Form (Smaller) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">New Stock In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="Quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($) *</label>
              <input
                type="number"
                name="unit_cost"
                value={formData.unit_cost}
                onChange={handleInputChange}
                step="0.01"
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By *</label>
              <select
                name="received_by"
                value={formData.received_by}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-br from-green-500 to-emerald-600 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Record Stock In
            </button>
          </form>
        </div>

        {/* Stock In History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Stock In History</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product or supplier..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-gray-500">Stock In ID</th>
                  <th className="py-2 px-3 text-left text-gray-500">Product</th>
                  <th className="py-2 px-3 text-left text-gray-500">Supplier</th>
                  <th className="py-2 px-3 text-left text-gray-500">Quantity</th>
                  <th className="py-2 px-3 text-left text-gray-500">Unit Cost</th>
                  <th className="py-2 px-3 text-left text-gray-500">Received By</th>
                  <th className="py-2 px-3 text-left text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-blue-600 font-mono">{r.stock_in_code || r.id}</td>
                    <td className="py-2 px-3">{r.product_name || r.product}</td>
                    <td className="py-2 px-3">{r.supplier_name || r.supplier}</td>
                    <td className="py-2 px-3">{r.quantity}</td>
                    <td className="py-2 px-3">${Number(r.unit_cost || 0).toFixed(2)}</td>
                    <td className="py-2 px-3">{r.received_by_name || r.received_by}</td>
                    <td className="py-2 px-3">{r.received_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-right font-bold text-gray-700">
            Total Stock Value: ${totalValue.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockInPage;
