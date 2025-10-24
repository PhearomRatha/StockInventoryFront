import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaShoppingCart } from "react-icons/fa";

function StockOutPage() {
  const [invoiceId] = useState(`INV-${Date.now()}`);
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

  const token = localStorage.getItem("token");
  const API_BASE = "http://localhost:8000/api";

  // ---------------- Fetch Products ----------------
  useEffect(() => {
    fetch(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, products: false })));
  }, [token]);

  // ---------------- Fetch Customers ----------------
  useEffect(() => {
    fetch(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, customers: false })));
  }, [token]);

  // ---------------- Fetch Users ----------------
  useEffect(() => {
    fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, users: false })));
  }, [token]);

  // ---------------- Fetch Stock Outs ----------------
  useEffect(() => {
    fetch(`${API_BASE}/stock-outs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setStockOuts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, stockOuts: false })));
  }, [token]);

  // ---------------- Handle Form Changes ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto-fill unit_price when product changes
    if (name === "product_id") {
      const selectedProduct = products.find((p) => p.id === Number(value));
      if (selectedProduct) {
        updatedForm.unit_price = selectedProduct.price;
      } else {
        updatedForm.unit_price = "";
      }
    }

    // Recalculate total
    const qty = Number(updatedForm.quantity);
    const price = Number(updatedForm.unit_price);
    updatedForm.total_amount = !isNaN(qty * price) ? (qty * price).toFixed(2) : "";

    setForm(updatedForm);
  };

  // ---------------- Submit Stock Out ----------------
  const handleSubmit = async () => {
    if (!form.customer_id || !form.product_id || !form.unit_price || !form.sold_by) {
      return alert("Please fill all required fields!");
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
        alert("Stock out recorded successfully!");
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
        alert(result.message || "Failed to record stock out");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting stock out. Check CORS or backend.");
    }
  };

  // ---------------- Delete Stock Out ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`${API_BASE}/stock-outs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setStockOuts(stockOuts.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete stock out record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      {/* Form */}
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-10">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" /> Stock Out Form
          </h1>
          <p className="text-sm text-gray-500">Invoice ID: {invoiceId}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Customer */}
          <div>
            <label className="block font-medium mb-1">Customer</label>
            {loading.customers ? <p>Loading customers...</p> : (
              <select name="customer_id" value={form.customer_id} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400">
                <option value="">Select Customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Product */}
          <div>
            <label className="block font-medium mb-1">Product</label>
            {loading.products ? <p>Loading products...</p> : (
              <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400">
                <option value="">Select Product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>)}
              </select>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-medium mb-1">Quantity</label>
            <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Unit Price (auto-filled) */}
          <div>
            <label className="block font-medium mb-1">Unit Price</label>
            <input type="number" min="0" name="unit_price" value={form.unit_price} readOnly className="w-full border rounded-lg p-2 bg-gray-100" />
          </div>

          {/* Total */}
          <div>
            <label className="block font-medium mb-1">Total</label>
            <input type="number" name="total_amount" value={form.total_amount} readOnly className="w-full border rounded-lg p-2 bg-gray-100" />
          </div>

          {/* Sold By */}
          <div>
            <label className="block font-medium mb-1">Sold By</label>
            {loading.users ? <p>Loading users...</p> : (
              <select name="sold_by" value={form.sold_by} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400">
                <option value="">Select User</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input type="date" name="sold_date" value={form.sold_date} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-medium mb-1">Remarks</label>
            <input type="text" name="remarks" value={form.remarks} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaPlus /> Record Stock Out
          </button>
        </div>
      </div>

      {/* Stock Out History */}
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2"> Stock Out History</h2>
        {loading.stockOuts ? <p>Loading stock out records...</p> : stockOuts.length === 0 ? (
          <p className="text-gray-500 text-center">No stock out records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 text-left">Customer</th>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-center">Unit Price</th>
                  <th className="p-2 text-center">Total</th>
                  <th className="p-2 text-center">Date</th>
                  <th className="p-2 text-center">Sold By</th>
                  <th className="p-2 text-center">Remarks</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {stockOuts.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50 transition duration-150">
                    <td className="p-2">{s.customer_name}</td>
                    <td className="p-2">{s.product_name}</td>
                    <td className="p-2 text-center">{s.quantity}</td>
                    <td className="p-2 text-center">${s.unit_price}</td>
                    <td className="p-2 text-center">${s.total_amount}</td>
                    <td className="p-2 text-center">{s.sold_date}</td>
                    <td className="p-2 text-center">{s.sold_by}</td>
                    <td className="p-2 text-center">{s.remarks}</td>
                    <td className="p-2 text-center">
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
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

export default StockOutPage;
