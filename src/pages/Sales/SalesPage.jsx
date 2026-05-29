// … your imports stay exactly the same
import React, { useState, useEffect } from "react";
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
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

import { salesApi, customerApi, productApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSale, setCurrentSale] = useState({});
  const [cart, setCart] = useState([]);

  const [searchingProducts, setSearchingProducts] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  const [paymentError, setPaymentError] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [qrCode, setQrCode] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [currentMd5, setCurrentMd5] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 1,
    discount_percent: 0,
    maxQuantity: 1,
  });

  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [searchedCustomers, setSearchedCustomers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 8;
  const [cashierView, setCashierView] = useState(false);
  const [cashierProductSearch, setCashierProductSearch] = useState("");

  // Search products when modal opens
  useEffect(() => {
    if (showModal && !isEdit) {
      searchProducts("");
      searchCustomers("");
    }
  }, [showModal, isEdit]);

  // Debounced cashier product search
  useEffect(() => {
    if (!cashierView || showModal) return;
    const timer = setTimeout(() => {
      searchProducts(cashierProductSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [cashierProductSearch, cashierView]);

  // Debounced customer search for cashier view
  useEffect(() => {
    if (!cashierView || showModal) return;
    const timer = setTimeout(() => {
      searchCustomers(customerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, cashierView]);

  // Debounced product search (for modal)
  useEffect(() => {
    if (!showModal || isEdit) return;
    const timer = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, showModal, isEdit]);

  // Debounced customer search (for modal)
  useEffect(() => {
    if (!showModal || isEdit) return;
    const timer = setTimeout(() => {
searchCustomers(customerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, showModal, isEdit]);

  // Debounced search for sales list filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Search products API call
  const searchProducts = async (search) => {
    setSearchingProducts(true);
    try {
      const result = await salesApi.searchProducts(search);
      if (result.success) {
        const data = Array.isArray(result.data?.data || result.data) 
          ? result.data?.data || result.data 
          : [];
        setSearchedProducts(data);
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setSearchedProducts([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  // Search customers API call
  const searchCustomers = async (search) => {
    setSearchingCustomers(true);
    try {
      const result = await salesApi.searchCustomers(search);
      if (result.success) {
        const data = Array.isArray(result.data?.data || result.data) 
          ? result.data?.data || result.data 
          : [];
        setSearchedCustomers(data);
      }
    } catch (err) {
      console.error('Error searching customers:', err);
      setSearchedCustomers([]);
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy)
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentSale({ payment_method: "Cash", sold_by: Number(user?.id) });
    setCart([]);
    setErrors({});
    setProductSearch("");
    setCustomerSearch("");
    setSearchedProducts([]);
    setSearchedCustomers([]);
    setShowModal(true);
  };

  const openCashierCheckout = () => {
    setIsEdit(false);
    setCurrentSale(prev => ({ ...prev, sold_by: Number(user?.id) }));
    setCustomerSearch("");
    searchCustomers("");
    setShowModal(true);
  };

  const openEditModal = (sale) => {
    setIsEdit(true);
    setCurrentSale({
      ...sale,
      customer_id: sale.customer?.id || "",
      sold_by: Number(sale.soldBy?.id || sale.sold_by) || "",
    });
    // Load cart items as numbers
    const loadedCart = (sale.items || []).map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      discount_percent: Number(item.discount_percent || 0),
      price: Number(item.price),
      name: item.product?.name || "",
    }));
    setCart(loadedCart);
    setErrors({});
    // Load products and customers for edit mode
    searchProducts("");
    searchCustomers("");
    setCustomerSearch(typeof sale.customer === 'object' && sale.customer?.name ? sale.customer.name : (sale.customer || ''));
    setShowModal(true);
  };

  const addToCart = () => {
    const newErrors = {};
    if (!newItem.product_id) newErrors.product = "Please select a product";
    if (newItem.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (newItem.discount_percent < 0 || newItem.discount_percent > 100) newErrors.discount = "Discount must be between 0 and 100";

    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...errors, ...newErrors });
      return;
    }

    const product = searchedProducts.find((p) => p.id === Number(newItem.product_id));
    if (!product) return;

    if (newItem.quantity > product.stock_quantity) {
      setErrors({ ...errors, quantity: `Cannot add more than available stock (${product.stock_quantity})` });
      return;
    }

    const item = {
      product_id: Number(newItem.product_id),
      quantity: Number(newItem.quantity),
      discount_percent: Number(newItem.discount_percent || 0),
      price: Number(product.price),
      name: product.name,
    };

    setCart([...cart, item]);
    setErrors({ ...errors, cart: "", product: "", quantity: "", discount: "" });
    setNewItem({
      product_id: "",
      quantity: 1,
      discount_percent: 0,
      maxQuantity: 1,
    });
  };

  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

  const calculateTotal = () =>
    cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = itemTotal * (item.discount_percent / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent multiple submissions

    // Custom validation
    const newErrors = {};
    if (!isEdit) {
      if (cart.length === 0) newErrors.cart = "Please add items to the cart";
      if (!currentSale.customer_id) newErrors.customer = "Please select a customer";
      // Validate cart items
      let cartError = "";
      for (let item of cart) {
        if (item.quantity <= 0) {
          cartError = "Quantity must be greater than 0";
          break;
        }
        if (item.discount_percent < 0 || item.discount_percent > 100) {
          cartError = "Discount percent must be between 0 and 100";
          break;
        }
      }
      if (cartError) newErrors.cart = cartError;
      if (!currentSale.payment_method) newErrors.payment_method = "Please select a payment method";
    } else {
      if (!currentSale.customer_id) newErrors.customer = "Please select a customer";
      if (!currentSale.total_amount || Number(currentSale.total_amount) <= 0) newErrors.total_amount = "Please enter a valid total amount";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    const payload = {
      customer_id: currentSale.customer_id ? Number(currentSale.customer_id) : null,
      sold_by: Number(currentSale.sold_by),
      items: cart.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        discount_percent: Number(item.discount_percent),
      })),
      payment_method: currentSale.payment_method,
    };

    if (!isEdit && currentSale.payment_method === "Bakong")
      setGeneratingQR(true);

    const request = isEdit
      ? salesApi.update(currentSale.id, { ...currentSale, ...payload })
      : salesApi.checkout(payload);

    request
      .then((res) => {
        setSubmitting(false);
        if (!isEdit && currentSale.payment_method === "Bakong") {
          setGeneratingQR(false);
          if (res.qr_string) {
            setQrCode(res.qr_string);
            setCurrentSaleId(res.sale.id);
            setCurrentMd5(res.md5);
          } else {
            // Generate fake QR for demo/error handling
            const fakeQr = `bakong://payment?amount=${calculateTotal().toFixed(2)}&ref=fake-${Date.now()}`;
            setQrCode(fakeQr);
            setCurrentSaleId(null);
            setCurrentMd5(fakeQr);
          }
        } else {
          clearCache();
          fetchSales(true);
          setShowModal(false);
        }
      })
      .catch((err) => {
        setSubmitting(false);
        setGeneratingQR(false);
        // Generate fake QR on error for demo purposes
        const fakeQr = `bakong://payment?amount=${calculateTotal().toFixed(2)}&ref=error-${Date.now()}`;
        setQrCode(fakeQr);
        setCurrentSaleId(null);
        setCurrentMd5(fakeQr);
        console.error(err);
      });
  };

  // inside SalesPage component

  const verifyPayment = () => {
    if (!currentSaleId || !currentMd5) {
      setPaymentError("Cannot verify: sale ID or payment reference missing");
      return;
    }

    setVerifying(true);
    setPaymentError(null);
    setSuccessMessage(null);

    salesApi.verifyPayment({
      sale_id: currentSaleId,
      payment_reference: currentMd5,
    })
      .then((res) => {
        if (res.state === 'paid' || (res.status && res.bakong && res.bakong.data && res.bakong.data.acknowledgedDateMs)) {
          setSuccessMessage("Payment verified successfully!");
          setShowSuccessModal(true);
          console.log("Verify Payment Success:", res);
          setShowModal(false);
        } else if (res.state === 'pending' || (res.bakong && res.bakong.responseCode === 1)) {
          setPaymentError("Payment not yet scanned. Please wait and try again later.");
          console.warn("Verify Payment Pending:", res);
        } else {
          setPaymentError(res.message || "Payment verification failed.");
          console.warn("Verify Payment Failed:", res);
        }

        setQrCode(null);
        setCurrentSaleId(null);
        setCurrentMd5(null);

        clearCache();
        fetchSales(true);
      })
      .catch((err) => {
        let serverMessage = "Unknown error";

        if (err.response && err.response.data) {
          serverMessage =
            err.response.data.message ||
            JSON.stringify(err.response.data);
        } else if (err.message) {
          serverMessage = err.message;
        }

        setPaymentError(serverMessage);
        console.error("Full Axios error:", err);
      })
      .finally(() => setVerifying(false));
  };





  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    salesApi.delete(id)
      .then(() => {
        clearCache();
        fetchSales(true);
      })
      .catch(console.error);
  };

  // Statistics - only paid sales
  const paidSales = sales.filter((s) => s.payment_status === "paid");
  const totalSales = paidSales.length;
  const totalRevenue = paidSales.reduce(
    (sum, s) => sum + parseFloat(s.total_amount || 0),
    0
  );
  const averageSale =
    paidSales.length > 0 ? (totalRevenue / paidSales.length).toFixed(2) : 0;

  // Filter and sort sales
  const filteredSales = sales
    .filter((s) => {
                    const matchesSearch =
        debouncedSearch === "" ||
        (typeof s.customer === 'object' ? s.customer?.name : s.customer)?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.items?.some((item) =>
          (typeof item.product === 'object' ? item.product?.name : item.product)?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
                    const matchesCustomer =
        selectedCustomer === "All" || (typeof s.customer === 'object' ? s.customer?.name : s.customer) === selectedCustomer;
      return matchesSearch && matchesCustomer;
    })
    .sort((a, b) => {
      if (sortBy === "created_at") {
        return sortOrder === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "total_amount") {
        return sortOrder === "asc"
          ? parseFloat(a.total_amount) - parseFloat(b.total_amount)
          : parseFloat(b.total_amount) - parseFloat(a.total_amount);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * salesPerPage,
    currentPage * salesPerPage
  );

// Cashier View - Product cards and cart
  const CashierView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Grid */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Select Products</h2>
          </div>
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={cashierProductSearch}
              onChange={(e) => setCashierProductSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {searchedProducts.length > 0 ? searchedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  if (p.stock_quantity > 0) {
                    const existingItem = cart.find(item => item.product_id === p.id);
                    if (existingItem) {
                      setCart(cart.map(item => 
                        item.product_id === p.id 
                          ? { ...item, quantity: item.quantity + 1 } 
                          : item
                      ));
                    } else {
                      setCart([...cart, {
                        product_id: p.id,
                        quantity: 1,
                        discount_percent: 0,
                        price: Number(p.price),
                        name: p.name,
                      }]);
                    }
                  }
                }}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  p.stock_quantity === 0 ? "opacity-50 cursor-not-allowed" : "hover:border-indigo-300"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                    <CubeIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">${p.price}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    Stock: {p.stock_quantity}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-3 py-12 text-center">
                <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Search for products to add to cart</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cart (<span className="text-indigo-600">{cart.length}</span>)</h2>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add products to start a sale</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
                      {item.discount_percent > 0 && (
                        <p className="text-xs text-green-600">{item.discount_percent}% discount</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">${calculateTotal().toFixed(2)}</span>
                </div>

                <div className="mb-4">
                  <select
                    value={currentSale.payment_method || "Cash"}
                    onChange={(e) => setCurrentSale({ ...currentSale, payment_method: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 mb-3"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bakong">Bakong</option>
                  </select>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {customerSearch && (
                    <div className="mt-2 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                      {searchedCustomers.length > 0 ? (
                        searchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCurrentSale({ ...currentSale, customer_id: c.id });
                              setCustomerSearch(c.name);
                              setErrors({ ...errors, customer: "" });
                            }}
                            className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                              currentSale.customer_id === c.id ? "bg-indigo-50" : ""
                            }`}
                          >
                            {c.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">No customers found</div>
                      )}
                    </div>
                  )}
                  {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
                </div>

                <button
                  onClick={openCashierCheckout}
                  disabled={cart.length === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Proceed to Payment
                </button>
              </div>
            </>
          )}
</div>
          </div>
        </div>
      </>}

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
                  {isEdit
                    ? "Update sale details"
                    : "Fill in the sale information"}
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
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                      {searchingCustomers && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        </div>
                      )}
                    </div>
                    {customerSearch && (
                      <div className="mt-2 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                        {searchedCustomers.length > 0 ? (
                          searchedCustomers.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setCurrentSale({ ...currentSale, customer_id: c.id });
                                setCustomerSearch(c.name);
                                setErrors({ ...errors, customer: "" });
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                                currentSale.customer_id === c.id ? "bg-indigo-50" : ""
                              }`}
                            >
                              {c.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-sm">No customers found</div>
                        )}
                      </div>
                    )}
                    {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
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
                          onChange={(e) => {
                            setCurrentSale({
                              ...currentSale,
                              total_amount: e.target.value,
                            });
                            setErrors({ ...errors, total_amount: "" });
                          }}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="0.00"
                        />
                        {errors.total_amount && <p className="text-red-500 text-sm mt-1">{errors.total_amount}</p>}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column */}
                <div className="space-y-5">{/* Removed payment fields */}</div>
              </div>

              {!isEdit && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Add Items to Cart
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                        {searchingProducts && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                          </div>
                        )}
                      </div>
                      {productSearch && (
                        <div className="mt-2 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                          {searchedProducts.length > 0 ? (
                            searchedProducts.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  if (p.stock_quantity > 0) {
                                    setNewItem({
                                      ...newItem,
                                      product_id: p.id,
                                      quantity: 1,
                                      maxQuantity: p.stock_quantity,
                                    });
                                    setProductSearch(p.name);
                                    setErrors({ ...errors, product: "" });
                                  }
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                                  p.stock_quantity === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                {p.name} - ${p.price} (Stock: {p.stock_quantity})
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">No products found</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value > (newItem.maxQuantity || 1))
                            value = newItem.maxQuantity;
                          if (value < 1) value = 1;
                          setNewItem({ ...newItem, quantity: value });
                          setErrors({ ...errors, quantity: "" });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                      {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.discount_percent}
                        onChange={(e) => {
                          setNewItem({
                            ...newItem,
                            discount_percent: e.target.value,
                          });
                          setErrors({ ...errors, discount: "" });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                      {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addToCart}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                      >
                        Add to Cart
                      </button>
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
                            const discountAmount =
                              itemTotal * (item.discount_percent / 100);
                            const subtotal = itemTotal - discountAmount;
                            return (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>${item.price}</td>
                                <td>{item.discount_percent}%</td>
                                <td>${subtotal.toFixed(2)}</td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(index)}
                                    className="text-red-600"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="4" className="text-right font-medium">
                              Total:
                            </td>
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
                    value={currentSale.payment_method}
                    onChange={(e) => {
                      setCurrentSale({ ...currentSale, payment_method: e.target.value });
                      setErrors({ ...errors, payment_method: "" });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bakong">Bakong</option>
                  </select>
                  {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}

                  </div>
                </div>
              )}

              {errors.cart && <p className="text-red-500 text-sm mt-4">{errors.cart}</p>}

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
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : (isEdit ? "Update Sale" : "Create Sale")}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Generating QR Code
                </h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we generate your payment QR code...
                </p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Payment QR Code
                </h2>
                <p className="text-gray-600 mb-6">
                  Scan this QR code to complete the payment
                </p>
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
                    {verifying ? "Verifying..." : "Verify Payment"}
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
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h2>
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
  );
}

export default SalesPage;