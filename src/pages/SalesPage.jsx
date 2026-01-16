// … your imports stay exactly the same
import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  TagIcon,
  BuildingStorefrontIcon,
  CubeTransparentIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSale, setCurrentSale] = useState({});
  const [cart, setCart] = useState([]);
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, discount_percent: 0, maxQuantity: 1 });
  const [qrCode, setQrCode] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [currentMd5, setCurrentMd5] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 8;

  const fetchSales = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    axios.get(`${API_BASE}/sales`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data.status === 200) setSales(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    axios.get(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCustomers(res.data.data || []))
      .catch(console.error);

    axios.get(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data.data || []))
      .catch(console.error);

    axios.get(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProducts(res.data.data || []))
      .catch(console.error);
  };

  useEffect(() => { fetchSales(); }, []);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(newSortBy); setSortOrder("asc"); }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentSale({ payment_method: 'Cash' });
    setCart([]);
    setShowModal(true);
  };

  const openEditModal = (sale) => {
    setIsEdit(true);
    setCurrentSale({
      ...sale,
      customer_id: sale.customer?.id || '',
      sold_by: sale.soldBy?.id || ''
    });
    // Load cart items as numbers
    const loadedCart = (sale.items || []).map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      discount_percent: Number(item.discount_percent || 0),
      price: Number(item.price),
      name: item.product?.name || ''
    }));
    setCart(loadedCart);
    setShowModal(true);
  };

  const addToCart = () => {
    if (!newItem.product_id) {
      alert("Please select a product");
      return;
    }

    const product = products.find(p => p.id === Number(newItem.product_id));
    if (!product) return;

    if (newItem.quantity > product.stock_quantity) {
      alert(`Cannot add more than available stock (${product.stock_quantity})`);
      return;
    }

    const item = {
      product_id: Number(newItem.product_id),
      quantity: Number(newItem.quantity),
      discount_percent: Number(newItem.discount_percent || 0),
      price: Number(product.price),
      name: product.name
    };

    setCart([...cart, item]);
    setNewItem({ product_id: '', quantity: 1, discount_percent: 0, maxQuantity: 1 });
  };

  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

  const calculateTotal = () => cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const discountAmount = itemTotal * (item.discount_percent / 100);
    return sum + (itemTotal - discountAmount);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    let payload, url, method;

    if (isEdit) {
      payload = { ...currentSale };
      url = `${API_BASE}/sales/${currentSale.id}`;
      method = 'patch';
    } else {
      if (cart.length === 0) { alert('Please add items to the cart'); return; }

      payload = {
        customer_id: Number(currentSale.customer_id),
        items: cart.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          discount_percent: Number(item.discount_percent)
        })),
        sold_by: Number(currentSale.sold_by),
        payment_method: currentSale.payment_method
      };

      url = `${API_BASE}/sales/checkout`;
      method = 'post';
    }

    if (!isEdit && currentSale.payment_method === 'Bakong') setGeneratingQR(true);

    axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!isEdit && currentSale.payment_method === 'Bakong') {
          setGeneratingQR(false);
          if (res.data.qr_string) {
            setQrCode(res.data.qr_string);
            setCurrentSaleId(res.data.sale.id);
            setCurrentMd5(res.data.md5);
          }
        } else { fetchSales(); setShowModal(false); }
      })
      .catch(err => { setGeneratingQR(false); console.error(err); });
  };

  const verifyPayment = () => {
    if (!currentSaleId || !currentMd5) return;
    setVerifying(true);
    axios.post(`${API_BASE}/sales/verify-payment`, { sale_id: currentSaleId, md5: currentMd5 },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(res => {
        if (res.data.status) {
          setSuccessMessage('Payment verified successfully!');
          setShowSuccessModal(true);
        } else {
          alert(`Payment failed: ${res.data.message}`);
        }
        setQrCode(null); setCurrentSaleId(null); setCurrentMd5(null); fetchSales();
      })
      .catch(() => alert('Verification failed'))
      .finally(() => setVerifying(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    axios.delete(`${API_BASE}/sales/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(() => fetchSales())
      .catch(console.error);
  };

  // Statistics - only paid sales
  const paidSales = sales.filter(s => s.payment_status === 'paid');
  const totalSales = paidSales.length;
  const totalRevenue = paidSales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const averageSale = paidSales.length > 0 ? (totalRevenue / paidSales.length).toFixed(2) : 0;

  // Filter and sort sales
  const filteredSales = sales
    .filter(s => {
      const matchesSearch = search === '' ||
        s.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.items?.some(item => item.product?.name?.toLowerCase().includes(search.toLowerCase()));
      const matchesCustomer = selectedCustomer === 'All' || s.customer?.name === selectedCustomer;
      return matchesSearch && matchesCustomer;
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return sortOrder === 'asc' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'total_amount') {
        return sortOrder === 'asc' ? parseFloat(a.total_amount) - parseFloat(b.total_amount) : parseFloat(b.total_amount) - parseFloat(a.total_amount);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * salesPerPage, currentPage * salesPerPage);

  // 🔹 Skeleton Loader
  if (loading)
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-300 rounded"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white rounded-2xl shadow-sm"></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="h-10 w-48 bg-gray-300 rounded mb-6"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CubeTransparentIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sales</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Manage your sales records and track revenue
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-300 font-medium shadow-md"
        >
          <PlusIcon className="w-5 h-5" /> Add New Sale
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalSales}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Sale</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">${averageSale}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative w-full lg:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales by product or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="created_at">Sort by Date</option>
                <option value="total_amount">Sort by Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <tr>
                {["Invoice", "Customer", "Total Amount", "Payment Status", "Payment Method", "Sold By", "Date", "Actions"].map(
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
              {paginatedSales.length > 0 ? (
                paginatedSales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{s.invoice_number}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                        <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                        {s.customer?.name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">${s.total_amount}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${s.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {s.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        <TagIcon className="w-3.5 h-3.5" />
                        {s.payment_method || (s.status === 'paid' ? 'Bakong' : '')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-500">{s.sold_by}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CubeIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No sales found</p>
                      <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                      <button
                        onClick={openAddModal}
                        className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Add Your First Sale
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * salesPerPage + 1} to{" "}
            {Math.min(currentPage * salesPerPage, filteredSales.length)} of{" "}
            {filteredSales.length} sales
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEdit ? "Edit Sale" : "Add New Sale"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isEdit ? "Update sale details" : "Fill in the sale information"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer *
                    </label>
                    <select
                      value={currentSale.customer_id || ""}
                      onChange={(e) =>
                        setCurrentSale({
                          ...currentSale,
                          customer_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isEdit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        value={currentSale.invoice_number || ""}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100"
                      />
                    </div>
                  )}

                  {isEdit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount *
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={currentSale.total_amount || ""}
                          onChange={(e) =>
                            setCurrentSale({ ...currentSale, total_amount: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sold By *
                    </label>
                    <select
                      value={currentSale.sold_by || ""}
                      onChange={(e) =>
                        setCurrentSale({
                          ...currentSale,
                          sold_by: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Removed payment fields */}
                </div>
              </div>

              {!isEdit && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add Items to Cart</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <select
                        value={newItem.product_id}
                        onChange={(e) => {
                          const selected = products.find(p => p.id == e.target.value);
                          setNewItem({
                            ...newItem,
                            product_id: Number(e.target.value),
                            quantity: 1,
                            maxQuantity: selected?.stock_quantity || 1
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={p.stock_quantity === 0}
                            style={{ color: p.stock_quantity === 0 ? 'red' : 'black' }}
                          >
                            {p.name} {p.stock_quantity === 0 ? '(Out of Stock)' : `(Available: ${p.stock_quantity})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={newItem.maxQuantity || 1}  // prevent exceeding stock
                        value={newItem.quantity}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value > (newItem.maxQuantity || 1)) value = newItem.maxQuantity;
                          if (value < 1) value = 1;
                          setNewItem({ ...newItem, quantity: value });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={newItem.discount_percent}
                        onChange={(e) => setNewItem({ ...newItem, discount_percent: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addToCart}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                      >Add to Cart</button>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium mb-2">Cart Items</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left">Product</th>
                            <th className="text-left">Qty</th>
                            <th className="text-left">Price</th>
                            <th className="text-left">Discount %</th>
                            <th className="text-left">Subtotal</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => {
                            const itemTotal = item.price * item.quantity;
                            const discountAmount = itemTotal * (item.discount_percent / 100);
                            const subtotal = itemTotal - discountAmount;
                            return (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>${item.price}</td>
                                <td>{item.discount_percent}%</td>
                                <td>${subtotal.toFixed(2)}</td>
                                <td><button type="button" onClick={() => removeFromCart(index)} className="text-red-600">Remove</button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="4" className="text-right font-medium">Total:</td>
                            <td>${calculateTotal().toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={currentSale.payment_method || 'Cash'}
                      onChange={(e) =>
                        setCurrentSale({
                          ...currentSale,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                    <option value="Cash">Cash</option>
                    <option value="Bakong">Bakong</option>
                  </select>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 shadow-md"
                >
                  {isEdit ? "Update Sale" : "Create Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {generatingQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating QR Code</h2>
                <p className="text-gray-600 mb-6">Please wait while we generate your payment QR code...</p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {qrCode && !generatingQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment QR Code</h2>
                <p className="text-gray-600 mb-6">Scan this QR code to complete the payment</p>
                <QRCodeCanvas
                  value={qrCode}
                  size={260}
                  level="M"
                  includeMargin
                  className="mx-auto mb-6"
                />
                <div className="flex gap-4">
                  <button
                    onClick={verifyPayment}
                    disabled={verifying}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50"
                  >
                    {verifying ? 'Verifying...' : 'Verify Payment'}
                  </button>
                  <button
                    onClick={() => setQrCode(null)}
                    className="px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">{successMessage}</p>
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
    </div>
  );
}

export default SalesPage;