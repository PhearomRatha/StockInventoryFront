import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const token = localStorage.getItem("token");

function StockInPage() {
  const [formData, setFormData] = useState({
    supplier_id: "",
    product_id: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
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


  // 🔥 Load everything in one call
  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
  const token = localStorage.getItem("token");

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
    const { supplier_id, product_id, quantity, date, notes } = formData;
    if (!supplier_id || !product_id || !quantity) {
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
          date,
          notes,
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
          date: new Date().toISOString().split("T")[0],
          notes: "",
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
    (sum, r) => sum + Number(r.quantity) * Number(r.cost || 0),
    0
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TruckIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Stock In</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Record inventory additions and track stock arrivals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">New Stock In</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
              <select name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl">
                <option value="">Select Supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              <select name="product_id" value={formData.product_id} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl">
                <option value="">Select Product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" className="w-full px-4 py-3 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" rows="3"></textarea>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl">Record Stock In</button>
          </form>
        </div>

        {/* Stock-In History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Stock In History</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="flex-1 px-4 py-3 border rounded-xl" />
            <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="px-4 py-3 border rounded-xl">
              <option value="All">All Suppliers</option>
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-3 border rounded-xl" />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <TruckIcon className="w-16 h-16 mx-auto mb-4" />
              <p>No stock in records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Product","Supplier","Qty","Unit Cost","Received By","Date"].map(h => (
                      <th key={h} className="py-4 px-6 text-left text-xs font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">{r.product_name}</td>
                      <td className="py-4 px-6">{r.supplier_name}</td>
                      <td className="py-4 px-6 font-semibold">{r.quantity}</td>
                      <td className="py-4 px-6 font-semibold">${Number(r.cost || 0).toFixed(2)}</td>
                      <td className="py-4 px-6 text-gray-600">{r.received_by_name}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{new Date(r.received_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 py-4 px-6 bg-gray-50 rounded-lg text-right font-semibold text-gray-900">Total Stock Value: ${totalValue.toFixed(2)}</div>
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
