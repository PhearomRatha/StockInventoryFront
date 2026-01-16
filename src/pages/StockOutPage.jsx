import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
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

  // Fetch data
  useEffect(() => {
    fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, products: false })));

    fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, customers: false })));

    fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, users: false })));

    fetch(`${API_BASE}/stock-outs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setStockOuts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, stockOuts: false })));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "product_id") {
      const selectedProduct = products.find((p) => p.id === Number(value));
      if (selectedProduct) {
        updatedForm.unit_price = selectedProduct.price;
      } else {
        updatedForm.unit_price = "";
      }
    }

    const qty = Number(updatedForm.quantity);
    const price = Number(updatedForm.unit_price);
    updatedForm.total_amount = !isNaN(qty * price) ? (qty * price).toFixed(2) : "";

    setForm(updatedForm);
  };

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
      setModalMessage("Error submitting stock out. Check CORS or backend.");
      setShowErrorModal(true);
    }
  };

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
              {loading.customers ? <p>Loading customers...</p> : (
                <select name="customer_id" value={form.customer_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white" required>
                  <option value="">Select Customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              {loading.products ? <p>Loading products...</p> : (
                <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white" required>
                  <option value="">Select Product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
              <input type="number" min="0" name="unit_price" value={form.unit_price} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <input type="number" name="total_amount" value={form.total_amount} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sold By *</label>
              {loading.users ? <p>Loading users...</p> : (
                <select name="sold_by" value={form.sold_by} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white" required>
                  <option value="">Select User</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" name="sold_date" value={form.sold_date} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <input type="text" name="remarks" value={form.remarks} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
            </div>

            <button type="button" onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium shadow-md">
              Record Stock Out
            </button>
          </form>
        </div>

        {/* Stock Out History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Stock Out History</h2>
          </div>

          {loading.stockOuts ? <p>Loading stock out records...</p> : stockOuts.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg font-medium">No stock out records yet.</p>
              <p className="text-gray-400 mt-1">Add your first stock out record</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                  <tr>
                    {["Customer", "Product", "Qty", "Unit Price", "Total", "Date", "Sold By", "Remarks", "Actions"].map(
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
                  {stockOuts.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50/80 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="text-gray-900">{s.customer_name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900">{s.product_name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{s.quantity}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">${s.unit_price}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">${s.total_amount}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-500">{new Date(s.sold_date).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600">{s.sold_by}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600">{s.remarks || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

export default StockOutPage;
