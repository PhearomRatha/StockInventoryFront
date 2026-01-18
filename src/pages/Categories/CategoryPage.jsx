import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

// ✅ Base API
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 8;

  // Fetch categories
  const fetchCategories = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    axios
      .get(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.status === 200) setCategories(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentCategory({});
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setIsEdit(true);
    setCurrentCategory(category);
    setShowModal(true);
  };

  const filteredCategories = categories
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name") return multiplier * a.name.localeCompare(b.name);
      if (sortBy === "created_at") return multiplier * new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      axios
        .delete(`${API_BASE}/categories/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          fetchCategories();
        })
        .catch(console.error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = isEdit
      ? `${API_BASE}/categories/${currentCategory.id}`
      : `${API_BASE}/categories`;

    const method = isEdit ? 'patch' : 'post';

    axios[method](url, currentCategory, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        fetchCategories();
        setShowModal(false);
      })
      .catch(console.error);
  };

  // Statistics
  const totalCategories = categories.length;

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
            <TagIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Manage your product categories and organize your inventory
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:shadow-lg transition-all duration-300 font-medium shadow-md"
        >
          <PlusIcon className="w-5 h-5" /> Add New Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Categories</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-emerald-600" />
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
              placeholder="Search categories by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="created_at">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <tr>
                {["Name", "Description", "Actions"].map(
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
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <TagIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600">{c.description || "No description"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <TagIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No categories found</p>
                      <p className="text-gray-400 mt-1">Try adjusting your search</p>
                      <button
                        onClick={openAddModal}
                        className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Add Your First Category
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
            Showing {(currentPage - 1) * categoriesPerPage + 1} to{" "}
            {Math.min(currentPage * categoriesPerPage, filteredCategories.length)} of{" "}
            {filteredCategories.length} categories
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEdit ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isEdit ? "Update category details" : "Fill in the category information"}
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
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={currentCategory.name || ""}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter category name"
                    required
                    minLength="1"
                    maxLength="255"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentCategory.description || ""}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter category description..."
                  />
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
                  {isEdit ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;