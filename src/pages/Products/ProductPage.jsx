import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  CubeTransparentIcon,
  TagIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Reusable UI components
import {
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
} from "../../components/UI";

// Skeleton loader
import { SkeletonPage } from "../../components/Skeleton";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// Simplified validation
const validateProduct = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = "Product name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Product name must be at least 2 characters";
  }

  if (!formData.category_id) {
    errors.category_id = "Please select a category";
  }

  if (!formData.supplier_id) {
    errors.supplier_id = "Please select a supplier";
  }

  if (!formData.cost && formData.cost !== "0") {
    errors.cost = "Cost is required";
  } else if (parseFloat(formData.cost) < 0) {
    errors.cost = "Cost cannot be negative";
  }

  if (!formData.stock_quantity && formData.stock_quantity !== "0") {
    errors.stock_quantity = "Stock quantity is required";
  } else if (parseInt(formData.stock_quantity) < 0) {
    errors.stock_quantity = "Stock cannot be negative";
  }

  return errors;
};

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
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    cost: "",
    stock_quantity: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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
    if (product.stock_quantity <= 10) return "low stock";
    return "in stock";
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({
      name: "",
      category_id: "",
      supplier_id: "",
      cost: "",
      stock_quantity: "",
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEdit(true);
    setFormData({
      id: product.id,
      name: product.name,
      category_id: product.category_id || "",
      supplier_id: product.supplier_id || "",
      cost: product.cost || "",
      stock_quantity: product.stock_quantity || "",
      image: product.image || null,
    });
    setImagePreview(product.image || null);
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });

    // Validate single field
    const fieldErrors = validateProduct({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: fieldErrors[field] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "image") allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = validateProduct(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("token");
    const payload = new FormData();

    // Only append required fields
    payload.append("name", formData.name);
    payload.append("category_id", formData.category_id);
    payload.append("supplier_id", formData.supplier_id);
    payload.append("cost", formData.cost);
    payload.append("stock_quantity", formData.stock_quantity);

    if (formData.image) {
      payload.append("image", formData.image);
    }

    const url = isEdit
      ? `${API_BASE}/products/${formData.id}`
      : `${API_BASE}/products`;

    const method = isEdit ? "patch" : "post";

    axios[method](url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => {
        fetchProducts();
        setShowModal(false);
      })
      .catch((error) => {
        console.error(error);
        if (error.response?.data?.message) {
          setErrors({ submit: error.response.data.message });
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Filtered products
  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
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

  // Statistics
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, p) => sum + parseInt(p.stock_quantity || 0),
    0
  );
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= 10
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
            {p.stock_quantity <= 10 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="text-sm text-gray-500 mt-1">{p.sku || "N/A"}</p>
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
      key: "cost",
      label: "Cost",
      render: (p) => (
        <div className="font-medium text-gray-900">${p.cost || "0"}</div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (p) => (
        <div className="font-medium text-gray-900">${p.price || "0"}</div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (p) => (
        <div className="font-semibold text-gray-900">{p.stock_quantity}</div>
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

  // Loading State
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
      {/* Header */}
      <PageHeader
        title="Products"
        subtitle="Manage your inventory, track stock levels, and analyze product performance"
        icon={CubeTransparentIcon}
        action={
          <AddButton onClick={openAddModal} text="Add New Product" icon={PlusIcon} />
        }
      />

      {/* Stats Cards */}
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

      {/* Table */}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={productsPerPage}
        totalItems={filteredProducts.length}
      />

      {/* Simplified Modal Form */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEdit ? "Edit Product" : "Add New Product"}
          size="lg"
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => setTouched({ ...touched, name: true })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition ${
                  errors.name && touched.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
                placeholder="Enter product name"
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category & Supplier Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    handleFieldChange("category_id", e.target.value)
                  }
                  onBlur={() => setTouched({ ...touched, category_id: true })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition appearance-none bg-white ${
                    errors.category_id && touched.category_id
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && touched.category_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) =>
                    handleFieldChange("supplier_id", e.target.value)
                  }
                  onBlur={() => setTouched({ ...touched, supplier_id: true })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition appearance-none bg-white ${
                    errors.supplier_id && touched.supplier_id
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id && touched.supplier_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.supplier_id}
                  </p>
                )}
              </div>
            </div>

            {/* Cost & Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleFieldChange("cost", e.target.value)}
                    onBlur={() => setTouched({ ...touched, cost: true })}
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition ${
                      errors.cost && touched.cost
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.cost && touched.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    handleFieldChange("stock_quantity", e.target.value)
                  }
                  onBlur={() =>
                    setTouched({ ...touched, stock_quantity: true })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition ${
                    errors.stock_quantity && touched.stock_quantity
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  placeholder="0"
                />
                {errors.stock_quantity && touched.stock_quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stock_quantity}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-6">
                    <PhotoIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload image</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    <label className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                      Choose File
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Backend Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Note */}
            <p className="text-xs text-gray-500">
              * SKU, barcode, price, and reorder level will be auto-generated.
            </p>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ProductPage;
