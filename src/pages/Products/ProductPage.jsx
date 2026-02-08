import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  CubeTransparentIcon,
  TagIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Reusable UI components
import {
  SkeletonPage,
  PageHeader,
  TotalProductsCard,
  TotalStockCard,
  LowStockCard,
  AvgPriceCard,
  SearchInput,
  FilterDropdown,
  DataTable,
  Pagination,
  Modal,
  ModalFooter,
  ActionButtons,
  AddButton,
} from "../components/UI";

// ✅ Base API
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Fetch products, categories, suppliers
  const fetchProducts = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    axios
      .get(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.status === 200) setProducts(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    axios
      .get(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.data || []))
      .catch(console.error);

    axios
      .get(`${API_BASE}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSuppliers(res.data.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
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
    switch ((status || "").toLowerCase()) {
      case "in stock":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "low stock":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "out of stock":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getStatusDotColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "in stock") return "bg-emerald-500";
    if (statusLower === "low stock") return "bg-yellow-500";
    if (statusLower === "out of stock") return "bg-rose-500";
    return "bg-gray-500";
  };

  const getProductStatus = (product) => {
    if (product.stock_quantity === 0) return "out of stock";
    if (product.stock_quantity <= (product.reorder_level || 10))
      return "low stock";
    return "in stock";
  };

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentProduct({});
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEdit(true);
    setCurrentProduct(product);
    setImagePreview(product.image || null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentProduct({ ...currentProduct, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (p) => selectedCategory === "All" || p.category === selectedCategory
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name")
        return multiplier * a.name.localeCompare(b.name);
      if (sortBy === "price") return multiplier * (a.price - b.price);
      if (sortBy === "stock_quantity")
        return multiplier * (a.stock_quantity - b.stock_quantity);
      if (sortBy === "id") return multiplier * (a.id - b.id);
      if (sortBy === "created_at")
        return (
          multiplier * (new Date(a.created_at) - new Date(b.created_at))
        );
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`${API_BASE}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(() => {
          fetchProducts();
        })
        .catch(console.error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();

    for (let key in currentProduct) {
      if (currentProduct[key] !== null && currentProduct[key] !== undefined) {
        formData.append(key, currentProduct[key]);
      }
    }

    const url = isEdit
      ? `${API_BASE}/products/${currentProduct.id}`
      : `${API_BASE}/products`;

    const method = isEdit ? "patch" : "post";

    axios[method](url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => {
        fetchProducts();
        setShowModal(false);
        setSubmitting(false);
      })
      .catch((error) => {
        console.error(error);
        setSubmitting(false);
      });
  };

  // Statistics
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, p) => sum + parseInt(p.stock_quantity || 0),
    0
  );
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= (p.reorder_level || 10)
  ).length;
  const averagePrice =
    products.length > 0
      ? (
          products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) /
          products.length
        ).toFixed(2)
      : 0;

  // Table columns configuration
  const tableColumns = [
    {
      key: "product",
      label: "Product",
      render: (p) => (
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                p.image ||
                "https://via.placeholder.com/150x150/4f46e5/ffffff?text=No+Image"
              }
              alt={p.name}
              className="w-14 h-14 object-cover rounded-lg border border-gray-200"
            />
            {p.stock_quantity <= (p.reorder_level || 10) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="text-sm text-gray-500 mt-1">{p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
          <TagIcon className="w-3.5 h-3.5" />
          {p.category}
        </span>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
          <BuildingStorefrontIcon className="w-3.5 h-3.5" />
          {p.supplier}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (p) => (
        <div>
          <div className="font-bold text-gray-900">${p.price}</div>
          {p.cost && (
            <div className="text-sm text-gray-500">Cost: ${p.cost}</div>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (p) => (
        <div>
          <div className="font-semibold text-gray-900">{p.stock_quantity}</div>
          {p.reorder_level && (
            <div className="text-sm text-gray-500">
              Reorder at {p.reorder_level}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p) => {
        const status = getProductStatus(p);
        return (
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
              status
            )}`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(status)}`}
            ></div>
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <ActionButtons
          onEdit={() => openEditModal(p)}
          onDelete={() => handleDelete(p.id)}
        />
      ),
    },
  ];

  // 🔹 Loading State using reusable Skeleton component
  if (loading) {
    return (
      <SkeletonPage
        showHeader={true}
        showStats={true}
        showControls={true}
        showTable={true}
        statsCount={4}
        tableRows={5}
        tableColumns={7}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header using reusable PageHeader */}
      <PageHeader
        title="Products"
        subtitle="Manage your inventory, track stock levels, and analyze product performance"
        icon={CubeTransparentIcon}
        action={
          <AddButton onClick={openAddModal} text="Add New Product" icon={PlusIcon} />
        }
      />

      {/* Stats Cards using reusable StatsCard components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <TotalProductsCard value={totalProducts} />
        <TotalStockCard value={totalStock} />
        <LowStockCard value={lowStockProducts} />
        <AvgPriceCard value={averagePrice} />
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products by name or SKU..."
            className="lg:w-96"
          />

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <FilterDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: "All", label: "All Categories" },
                ...categories.map((c) => ({ value: c.name, label: c.name })),
              ]}
              icon={(props) => (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  {...props}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
              )}
            />

            <FilterDropdown
              value={sortBy}
              onChange={handleSort}
              options={[
                { value: "id", label: "Sort by ID" },
                { value: "created_at", label: "Sort by Date" },
                { value: "name", label: "Sort by Name" },
                { value: "price", label: "Sort by Price" },
                { value: "stock_quantity", label: "Sort by Stock" },
              ]}
              icon={(props) => (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  {...props}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m-4.5 0L7.5 21"
                  />
                </svg>
              )}
            />
          </div>
        </div>
      </div>

      {/* Table using reusable DataTable */}
      <DataTable
        columns={tableColumns}
        data={paginatedProducts}
        emptyMessage="No products found"
        emptyAction={
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Add Your First Product
          </button>
        }
        minWidth="1200px"
      />

      {/* Pagination using reusable Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={productsPerPage}
        totalItems={filteredProducts.length}
      />

      {/* Modal using reusable Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEdit ? "Edit Product" : "Add New Product"}
          size="xl"
          footer={
            <ModalFooter
              onCancel={() => setShowModal(false)}
              onSubmit={handleSubmit}
              cancelText="Cancel"
              submitText={isEdit ? "Update Product" : "Create Product"}
              submitting={submitting}
            />
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={currentProduct.name || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={currentProduct.sku || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        sku: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentProduct.price || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentProduct.cost || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        cost: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={currentProduct.category_id || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <select
                    value={currentProduct.supplier_id || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        supplier_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                    required
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-lg mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setCurrentProduct({
                              ...currentProduct,
                              image: null,
                            });
                          }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          PNG, JPG up to 5MB
                        </p>
                        <label className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.stock_quantity || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.reorder_level || ""}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        reorder_level: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={currentProduct.description || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value,
                  })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter product description..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ProductPage;
