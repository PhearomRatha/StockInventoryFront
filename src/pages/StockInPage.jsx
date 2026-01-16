import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

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
      setModalMessage("Please fill all required fields.");
      setShowErrorModal(true);
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
        setModalMessage("Stock In recorded successfully!");
        setShowSuccessModal(true);
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
        setModalMessage("Failed to record Stock In.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error(err);
      setModalMessage("An error occurred while recording Stock In.");
      setShowErrorModal(true);
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
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <PlusIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Stock In</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Log new stock arrivals and update inventory automatically
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock In Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-white"
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
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium shadow-md"
            >
              Record Stock In
            </button>
          </form>
        </div>

        {/* Stock In History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

          {loading && (
            <div className="overflow-x-auto">
              <div className="animate-pulse">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                    <tr>
                      {["Stock In ID", "Product", "Supplier", "Quantity", "Unit Cost", "Received By", "Date"].map(
                        (h) => (
                          <th
                            key={h}
                            className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="py-4 px-6">
                            <div className="h-4 bg-gray-200 rounded"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                  <tr>
                    {["Stock In ID", "Product", "Supplier", "Quantity", "Unit Cost", "Received By", "Date"].map(
                      (h) => (
                        <th
                          key={h}
                          className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-gray-50/80 transition-colors duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{r.stock_in_code || r.id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{r.product_name || r.product}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{r.supplier_name || r.supplier}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{r.quantity}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">${Number(r.unit_cost || 0).toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">{r.received_by_name || r.received_by}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-500">{new Date(r.received_date).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ClockIcon className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No stock in records found</p>
                          <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-right font-bold text-gray-700">
            Total Stock Value: ${totalValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XMarkIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error!</h2>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockInPage;
