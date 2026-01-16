import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

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

  const token = localStorage.getItem("token");

  // 🔥 Load everything in one call
  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/stock-ins/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 200) {
        setSuppliers(data.suppliers);
        setProducts(data.products);
        setUsers(data.users);
        setStockInHistory(data.stock_history);
      } else {
        console.error("Failed to load stock overview");
      }
    } catch (err) {
      console.error("Load overview error:", err);
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
    const { supplier_id, product_id, quantity, unit_cost, date, received_by } = formData;
    if (!supplier_id || !product_id || !quantity || !unit_cost || !received_by) {
      setModalMessage("Please fill all required fields.");
      setShowErrorModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock-ins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplier_id,
          product_id,
          quantity: Number(quantity),
          unit_cost: Number(unit_cost),
          date,
          received_by,
        }),
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
        loadOverview(); // reload everything in one call
      } else {
        setModalMessage("Failed to record Stock In.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error(err);
      setModalMessage("An error occurred while recording Stock In.");
      setShowErrorModal(true);
    }
  };

  // 🔥 Filtered stock-in history
  const filteredHistory = stockInHistory
    .filter((r) => {
      const matchesSearch =
        r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSupplier = selectedSupplier === "All" || r.supplier_name === selectedSupplier;
      const matchesDate = !selectedDate || r.received_date === selectedDate;
      return matchesSearch && matchesSupplier && matchesDate;
    })
    .sort((a, b) => new Date(b.received_date) - new Date(a.received_date));

  const totalValue = filteredHistory.reduce(
    (sum, r) => sum + Number(r.quantity) * Number(r.unit_cost),
    0
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <PlusIcon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock In</h1>
          <p className="text-gray-600 mt-1 text-sm">Log new stock arrivals and update inventory automatically</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">New Stock In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} required className="w-full border rounded-xl px-3 py-2">
              <option value="">Select Supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select name="product_id" value={formData.product_id} onChange={handleInputChange} required className="w-full border rounded-xl px-3 py-2">
              <option value="">Select Product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
            </select>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" placeholder="Quantity" className="w-full border rounded-xl px-3 py-2" required />
            <input type="number" name="unit_cost" value={formData.unit_cost} onChange={handleInputChange} step="0.01" placeholder="Unit Cost" className="w-full border rounded-xl px-3 py-2" required />
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border rounded-xl px-3 py-2" required />
            <select name="received_by" value={formData.received_by} onChange={handleInputChange} required className="w-full border rounded-xl px-3 py-2">
              <option value="">Select User</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-medium">Record Stock In</button>
          </form>
        </div>

        {/* Stock-In History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Stock In History</h2>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="flex-1 border rounded-xl px-3 py-2" />
            <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="border rounded-xl px-3 py-2">
              <option value="All">All Suppliers</option>
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded-xl px-3 py-2" />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["ID", "Product", "Supplier", "Qty", "Unit Cost", "Received By", "Date"].map(h => (
                    <th key={h} className="border px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length ? filteredHistory.map((r) => (
                  <tr key={r.id}>
                    <td className="border px-3 py-2">{r.stock_in_code}</td>
                    <td className="border px-3 py-2">{r.product_name}</td>
                    <td className="border px-3 py-2">{r.supplier_name}</td>
                    <td className="border px-3 py-2">{r.quantity}</td>
                    <td className="border px-3 py-2">${Number(r.unit_cost).toFixed(2)}</td>

                    <td className="border px-3 py-2">{r.received_by_name}</td>
                    <td className="border px-3 py-2">{new Date(r.received_date).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="text-center py-10">No records found</td></tr>
                )}
              </tbody>
            </table>
          )}

          <div className="mt-4 text-right font-bold">Total Stock Value: ${totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl">
            <p className="mb-4">{modalMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="bg-green-600 text-white px-4 py-2 rounded">OK</button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl">
            <p className="mb-4">{modalMessage}</p>
            <button onClick={() => setShowErrorModal(false)} className="bg-red-600 text-white px-4 py-2 rounded">OK</button>
          </div>
        </div>
      )}
      {/* Success Modal */}
            {showSuccessModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Success!</h2>
                  <p className="text-gray-600 mb-6">{modalMessage}</p>
                  <button onClick={() => setShowSuccessModal(false)} className="w-full px-6 py-3 bg-green-600 text-white rounded-xl">Continue</button>
                </div>
              </div>
            )}
      
            {/* Error Modal */}
            {showErrorModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XMarkIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Error!</h2>
                  <p className="text-gray-600 mb-6">{modalMessage}</p>
                  <button onClick={() => setShowErrorModal(false)} className="w-full px-6 py-3 bg-red-600 text-white rounded-xl">Close</button>
                </div>
              </div>
            )}
    </div>
  );
}

export default StockInPage;
