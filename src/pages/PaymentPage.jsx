import React, { useState, useEffect } from "react";
import axios from "axios";
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

// ✅ Base API
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("payment_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 8;

  // Fetch payments, sales, stockIns, dashboard
  const fetchPayments = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    axios
      .get(`${API_BASE}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.status === 200) setPayments(res.data.data);
      })
      .catch(() => setLoading(false));

    axios
      .get(`${API_BASE}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSales(res.data.data || []))
      .catch(console.error);

    axios
      .get(`${API_BASE}/stock-ins`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStockIns(res.data.data || []))
      .catch(console.error);

    axios
      .get(`${API_BASE}/payments/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentPayment({});
    setShowModal(true);
  };

  const openEditModal = (payment) => {
    setIsEdit(true);
    setCurrentPayment(payment);
    setShowModal(true);
  };

  const filteredPayments = payments
    .filter(
      (p) =>
        p.paid_to_from?.toLowerCase().includes(search.toLowerCase()) ||
        p.reference_id?.toString().includes(search.toLowerCase())
    )
    .filter((p) => selectedType === "All" || p.payment_type === selectedType)
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "payment_date") return multiplier * new Date(a.payment_date) - new Date(b.payment_date);
      if (sortBy === "amount") return multiplier * (a.amount - b.amount);
      return 0;
    });

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      axios
        .delete(`${API_BASE}/payments/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          fetchPayments();
        })
        .catch(console.error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : {};

    const payload = { ...currentPayment, recorded_by: user.id };

    const url = isEdit
      ? `${API_BASE}/payments/${currentPayment.id}`
      : `${API_BASE}/payments`;

    const method = isEdit ? 'patch' : 'post';

    axios[method](url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        fetchPayments();
        setShowModal(false);
      })
      .catch(console.error);
  };

  // Statistics
  const todayIncome = dashboard.today_income || 0;
  const todayExpense = dashboard.today_expense || 0;
  const netIncome = todayIncome - todayExpense;

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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Manage your payment records and track transactions
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-300 font-medium shadow-md"
        >
          <PlusIcon className="w-5 h-5" /> Add New Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Today's Income</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">${todayIncome.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Today's Expense</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">${todayExpense.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Net Income</p>
              <p className={`text-3xl font-bold mt-2 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netIncome.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-blue-600" />
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
              placeholder="Search payments by reference or paid to/from..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="relative">
              <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="payment_date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
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
                {["Reference", "Type", "Amount", "Method", "Paid To/From", "Date", "Status", "Actions"].map(
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
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {p.reference_type === 'sale' ? `Sale #${p.reference_id}` : `Purchase #${p.reference_id}`}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        p.payment_type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {p.payment_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">${p.amount}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                        <TagIcon className="w-3.5 h-3.5" />
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-500">{p.paid_to_from}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                          p.status
                        )}`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          p.status === 'paid' ? 'bg-emerald-500' :
                          p.status === 'pending' ? 'bg-rose-500' : 'bg-gray-500'
                        }`}></div>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CubeIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No payments found</p>
                      <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                      <button
                        onClick={openAddModal}
                        className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Add Your First Payment
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
            Showing {(currentPage - 1) * paymentsPerPage + 1} to{" "}
            {Math.min(currentPage * paymentsPerPage, filteredPayments.length)} of{" "}
            {filteredPayments.length} payments
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
                  {isEdit ? "Edit Payment" : "Add New Payment"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isEdit ? "Update payment details" : "Fill in the payment information"}
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
                      Reference Type *
                    </label>
                    <select
                      value={currentPayment.reference_type || ""}
                      onChange={(e) =>
                        setCurrentPayment({
                          ...currentPayment,
                          reference_type: e.target.value,
                          reference_id: "",
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="sale">Sale</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference ID *
                    </label>
                    <select
                      value={currentPayment.reference_id || ""}
                      onChange={(e) =>
                        setCurrentPayment({
                          ...currentPayment,
                          reference_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select reference</option>
                      {currentPayment.reference_type === 'sale' &&
                        sales.map((s) => (
                          <option key={s.id} value={s.id}>
                            Sale #{s.id} - {s.customer?.name || 'Unknown'}
                          </option>
                        ))}
                      {currentPayment.reference_type === 'purchase' &&
                        stockIns.map((si) => (
                          <option key={si.id} value={si.id}>
                            Purchase #{si.id} - {si.supplier?.name || 'Unknown'}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={currentPayment.amount || ""}
                        onChange={(e) =>
                          setCurrentPayment({ ...currentPayment, amount: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type *
                    </label>
                    <select
                      value={currentPayment.payment_type || ""}
                      onChange={(e) =>
                        setCurrentPayment({
                          ...currentPayment,
                          payment_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={currentPayment.payment_method || ""}
                      onChange={(e) =>
                        setCurrentPayment({
                          ...currentPayment,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="Bakong">Bakong</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid To/From *
                    </label>
                    <input
                      type="text"
                      value={currentPayment.paid_to_from || ""}
                      onChange={(e) =>
                        setCurrentPayment({
                          ...currentPayment,
                          paid_to_from: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Enter paid to/from"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={currentPayment.payment_date || ""}
                      onChange={(e) =>
                        setCurrentPayment({
                          ...currentPayment,
                          payment_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={currentPayment.status || "pending"}
                      onChange={(e) =>
                        setCurrentPayment({ ...currentPayment, status: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

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
                  {isEdit ? "Update Payment" : "Create Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;