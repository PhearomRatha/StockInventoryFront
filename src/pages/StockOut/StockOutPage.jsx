import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  ShoppingCartIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

function StockOutPage() {
  const [form, setForm] = useState({
    customer_id: "",
    product_id: "",
    quantity: 1,
    unit_price: "",
    total_amount: "",
    sold_date: new Date().toISOString().slice(0, 10),
    sold_by: "",
    remarks: "",
  });

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    customers: true,
    users: true,
    stockOuts: true,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const token = localStorage.getItem("token");
  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

  // Fetch all data at once
  useEffect(() => {
    setLoading({ products: true, customers: true, users: true, stockOuts: true });
    fetch(`${API_BASE}/stock-outs/stock-out-dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setCustomers(data.customers || []);
        setUsers(data.users || []);
        setStockOuts(data.stockOuts || []);
      })
      .catch(err => {
        console.error("Load error:", err);
        setModalMessage("Failed to load initial data.");
        setShowErrorModal(true);
      })
      .finally(() => setLoading({ products: false, customers: false, users: false, stockOuts: false }));
  }, [token]);

  // Form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "product_id") {
      const selectedProduct = products.find((p) => p.id === Number(value));
      updatedForm.unit_price = selectedProduct ? selectedProduct.price : "";
    }

    const qty = Number(updatedForm.quantity);
    const price = Number(updatedForm.unit_price);
    updatedForm.total_amount = !isNaN(qty * price) ? (qty * price).toFixed(2) : "";

    setForm(updatedForm);
  };

  // Submit stock-out
  const handleSubmit = async () => {
    if (!form.customer_id || !form.product_id || !form.unit_price || !form.sold_by) {
      setModalMessage("Please fill all required fields!");
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/stock-outs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.ok) {
        setModalMessage("Stock out recorded successfully!");
        setShowSuccessModal(true);
        setStockOuts([...stockOuts, result]);
        setForm({
          customer_id: "",
          product_id: "",
          quantity: 1,
          unit_price: "",
          total_amount: "",
          sold_date: new Date().toISOString().slice(0, 10),
          sold_by: "",
          remarks: "",
        });
      } else {
        setModalMessage(result.message || "Failed to record stock out");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error(error);
      setModalMessage("Error submitting stock out. Check backend.");
      setShowErrorModal(true);
    }
  };

  // Delete stock-out
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`${API_BASE}/stock-outs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setStockOuts(stockOuts.filter((s) => s.id !== id));
        setModalMessage("Stock out record deleted successfully!");
        setShowSuccessModal(true);
      } else {
        setModalMessage("Failed to delete stock out record");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error(err);
      setModalMessage("Error deleting record.");
      setShowErrorModal(true);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCartIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Stock Out</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Record inventory reductions and track stock movements
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">New Stock Out</h2>
          </div>

          <form className="space-y-4">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
              {loading.customers ? <p>Loading...</p> :
                <select name="customer_id" value={form.customer_id} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl">
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              }
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              {loading.products ? <p>Loading...</p> :
                <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl">
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>)}
                </select>
              }
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" />
            </div>

            {/* Unit Price & Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
              <input type="number" name="unit_price" value={form.unit_price} readOnly className="w-full px-4 py-3 border rounded-xl bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <input type="number" name="total_amount" value={form.total_amount} readOnly className="w-full px-4 py-3 border rounded-xl bg-gray-100" />
            </div>

            {/* Sold By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sold By *</label>
              {loading.users ? <p>Loading...</p> :
                <select name="sold_by" value={form.sold_by} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              }
            </div>

            {/* Date & Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" name="sold_date" value={form.sold_date} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <input type="text" name="remarks" value={form.remarks} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl" />
            </div>

            <button type="button" onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl">
              Record Stock Out
            </button>
          </form>
        </div>

        {/* Stock Out History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Stock Out History</h2>
          </div>

          {loading.stockOuts ? <p>Loading...</p> :
            stockOuts.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4" />
                <p>No stock out records yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Customer","Product","Qty","Unit Price","Total","Date","Sold By","Remarks","Actions"].map(h => (
                        <th key={h} className="py-4 px-6 text-left text-xs font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockOuts.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">{s.customer_name}</td>
                        <td className="py-4 px-6">{s.product_name}</td>
                        <td className="py-4 px-6 font-semibold">{s.quantity}</td>
                        <td className="py-4 px-6 font-semibold">${s.unit_price}</td>
                        <td className="py-4 px-6 font-semibold">${s.total_amount}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{new Date(s.sold_date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-gray-600">{s.sold_by}</td>
                        <td className="py-4 px-6 text-gray-600">{s.remarks || '-'}</td>
                        <td className="py-4 px-6">
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <TrashIcon className="w-5 h-5"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>

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

export default StockOutPage;
