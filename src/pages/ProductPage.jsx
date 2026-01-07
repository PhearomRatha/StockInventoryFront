import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// ✅ ONE BASE API URL
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

function ProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // LOGIN CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to login first!");
      navigate("/login");
    }
  }, [navigate]);

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
        if (res.data.status === 200) {
          setProducts(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    axios
      .get(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error(err));

    axios
      .get(`${API_BASE}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSuppliers(res.data.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentProduct({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEdit(true);
    setCurrentProduct(product);
    setShowModal(true);
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
      if (sortBy === "name") return multiplier * a.name.localeCompare(b.name);
      if (sortBy === "price") return multiplier * (a.price - b.price);
      if (sortBy === "stock_quantity")
        return multiplier * (a.stock_quantity - b.stock_quantity);
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
          alert("Product deleted successfully!");
          fetchProducts();
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to delete product");
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();

    if (isEdit) {
      formData.append("name", currentProduct.name);
      formData.append("price", currentProduct.price);
      formData.append("reorder_level", currentProduct.reorder_level);
      formData.append("cost", currentProduct.cost || 0);
      if (currentProduct.image) formData.append("image", currentProduct.image);

      axios
        .post(
          `${API_BASE}/products/${currentProduct.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(() => {
          alert("Product updated successfully!");
          fetchProducts();
          setShowModal(false);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to update product");
        });
    } else {
      for (let key in currentProduct) {
        if (currentProduct[key] !== null) {
          formData.append(key, currentProduct[key]);
        }
      }

      axios
        .post(`${API_BASE}/products`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          alert("Product added successfully!");
          fetchProducts();
          setShowModal(false);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to add product");
        });
    }
  };



  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading products...</p>
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <CubeIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your inventory products and stock levels
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full lg:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              placeholder="Search products by name or SKU..."
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                {["All", ...categories.map((c) => c.name)].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock_quantity">Sort by Quantity</option>
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Image</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supplier</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className="py-4 px-6">
                      <img
                        src={product.image || "https://via.placeholder.com/50"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{product.category}</td>
                    <td className="py-4 px-6 text-gray-600">{product.supplier}</td>
                    <td className="py-4 px-6 text-green-600 font-bold">${product.price}</td>
                    <td className="py-4 px-6">{product.stock_quantity}</td>
                    <td className="py-4 px-6">
  <span
    className={`inline-flex items-center px-6 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(
      product.status
    )}`}
  >
    {product.status}
  </span>
</td>

                    <td className="py-4 px-6 flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <p className="text-gray-500 text-lg font-medium">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="px-3 py-1 border rounded" disabled={currentPage === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-indigo-600 text-white" : ""}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="px-3 py-1 border rounded" disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
            <h2 className="text-2xl font-bold mb-4">{isEdit ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={currentProduct.name || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={currentProduct.price || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Cost"
                value={currentProduct.cost || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, cost: e.target.value })}
                className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Reorder Level"
                value={currentProduct.reorder_level || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, reorder_level: e.target.value })}
                className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.files[0] })}
                className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {!isEdit && (
                <>
                  <select
                    value={currentProduct.category_id || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category_id: e.target.value })}
                    required
                    className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={currentProduct.supplier_id || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, supplier_id: e.target.value })}
                    required
                    className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="SKU"
                    value={currentProduct.sku || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                    className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Barcode"
                    value={currentProduct.barcode || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, barcode: e.target.value })}
                    className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={currentProduct.description || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={currentProduct.stock_quantity || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock_quantity: e.target.value })}
                    className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all">{isEdit ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
