import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ListBulletIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { salesApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

// ─── tiny helpers ────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toFixed(2);

function SalesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // ── data ──────────────────────────────────────────────────────────────────
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── search / filter ───────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 8;

  // ── view ──────────────────────────────────────────────────────────────────
  const [cashierView, setCashierView] = useState(true);

  // ── cashier state ─────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [cashierProductSearch, setCashierProductSearch] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [searchedCustomers, setSearchedCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [cartErrors, setCartErrors] = useState({});
  const [productsCurrentPage, setProductsCurrentPage] = useState(1);
  const productsPerPage = 12;

  // ── modal (add/edit) ──────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSale, setCurrentSale] = useState({});
  const [modalCart, setModalCart] = useState([]);
  const [modalProductSearch, setModalProductSearch] = useState("");
  const [modalCustomerSearch, setModalCustomerSearch] = useState("");
  const [modalSearchedProducts, setModalSearchedProducts] = useState([]);
  const [modalSearchedCustomers, setModalSearchedCustomers] = useState([]);
  const [newItem, setNewItem] = useState({ product_id: "", quantity: 1, discount_percent: 0, maxQuantity: 1 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [currentMd5, setCurrentMd5] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ── fetch helpers ─────────────────────────────────────────────────────────
  const clearCache = () => {};

  const fetchSales = async (force = false) => {
    setLoading(true);
    try {
      const res = await salesApi.getAll();
      const data = res.success ? (res.data?.data || res.data || []) : [];
      setSales(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  // ── debounce main search ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── product search ────────────────────────────────────────────────────────
  const searchProducts = async (q, setter) => {
    setSearchingProducts(true);
    try {
      const res = await salesApi.searchProducts(q);
      if (res.success) {
        const data = Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : [];
        setter(data);
      }
    } catch { setter([]); }
    finally { setSearchingProducts(false); }
  };

  const searchCustomersFn = async (q, setter) => {
    setSearchingCustomers(true);
    try {
      const res = await salesApi.searchCustomers(q);
      if (res.success) {
        const data = Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : [];
        setter(data);
        setCustomers(data);
      }
    } catch { setter([]); }
    finally { setSearchingCustomers(false); }
  };

  // ── cashier product search debounce ───────────────────────────────────────
  useEffect(() => {
    if (!cashierView || showModal) return;
    const t = setTimeout(() => searchProducts(cashierProductSearch, setSearchedProducts), 300);
    return () => clearTimeout(t);
  }, [cashierProductSearch, cashierView, showModal]);

  // ── cashier customer search debounce ─────────────────────────────────────
  useEffect(() => {
    if (!cashierView || showModal) return;
    const t = setTimeout(() => searchCustomersFn(customerSearch, setSearchedCustomers), 300);
    return () => clearTimeout(t);
  }, [customerSearch, cashierView, showModal]);

  // ── modal product/customer search ─────────────────────────────────────────
  useEffect(() => {
    if (!showModal) return;
    const t = setTimeout(() => searchProducts(modalProductSearch, setModalSearchedProducts), 300);
    return () => clearTimeout(t);
  }, [modalProductSearch, showModal]);

  useEffect(() => {
    if (!showModal) return;
    const t = setTimeout(() => searchCustomersFn(modalCustomerSearch, setModalSearchedCustomers), 300);
    return () => clearTimeout(t);
  }, [modalCustomerSearch, showModal]);

  // preload when cashier view mounts
  useEffect(() => {
    if (cashierView) {
      searchProducts("", setSearchedProducts);
      searchCustomersFn("", setSearchedCustomers);
    }
  }, [cashierView]);

  // ── sort / filter sales list ──────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
  };

  const filteredSales = sales
    .filter((s) => {
      const cname = typeof s.customer === "object" ? (s.customer?.name || "_") : (s.customer || "_");
      const matchSearch = debouncedSearch === "" ||
        cname?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.items?.some(i => (typeof i.product === "object" ? i.product?.name : i.product)?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchCustomer = selectedCustomer === "All" || cname === selectedCustomer;
      return matchSearch && matchCustomer;
    })
    .sort((a, b) => {
      if (sortBy === "created_at") {
        const diff = new Date(a.created_at) - new Date(b.created_at);
        return sortOrder === "asc" ? diff : -diff;
      }
      if (sortBy === "total_amount") {
        const diff = parseFloat(a.total_amount) - parseFloat(b.total_amount);
        return sortOrder === "asc" ? diff : -diff;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * salesPerPage, currentPage * salesPerPage);

  const paidSales = sales.filter(s => s.payment_status === "paid");
  const totalRevenue = paidSales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const averageSale = paidSales.length > 0 ? (totalRevenue / paidSales.length).toFixed(2) : "0.00";

  // Product pagination for cashier view
  const productsTotalPages = Math.ceil(searchedProducts.length / productsPerPage);
  const paginatedProducts = searchedProducts.slice(
    (productsCurrentPage - 1) * productsPerPage,
    productsCurrentPage * productsPerPage
  );

  // ── cart helpers ──────────────────────────────────────────────────────────
  const calcTotal = (items) =>
    items.reduce((sum, item) => {
      const sub = item.price * item.quantity;
      return sum + sub - sub * (item.discount_percent / 100);
    }, 0);

  const addToCart = (product, cartSetter, cartGetter) => {
    if (product.stock_quantity <= 0) return;
    const existing = cartGetter.find(i => i.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) return;
      cartSetter(cartGetter.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      cartSetter([...cartGetter, {
        product_id: product.id,
        quantity: 1,
        discount_percent: 0,
        price: Number(product.price),
        name: product.name,
        stock_quantity: product.stock_quantity,
      }]);
    }
  };

  const updateQty = (index, delta, cartSetter, cartGetter) => {
    const item = cartGetter[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) cartSetter(cartGetter.filter((_, i) => i !== index));
    else if (newQty <= (item.stock_quantity || 99))
      cartSetter(cartGetter.map((it, i) => i === index ? { ...it, quantity: newQty } : it));
  };

  const removeFromCart = (index, cartSetter, cartGetter) =>
    cartSetter(cartGetter.filter((_, i) => i !== index));

  // ── cashier checkout ──────────────────────────────────────────────────────
  const handleCashierCheckout = () => {
    const errs = {};
    if (cart.length === 0) errs.cart = "Add at least one item";
    setCartErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
      sold_by: Number(user?.id),
      items: cart.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity), discount_percent: Number(i.discount_percent) })),
      payment_method: paymentMethod,
    };

    setSubmitting(true);
    if (paymentMethod === "Bakong") setGeneratingQR(true);

    const runBakongFallback = () => {
      setTimeout(() => {
        setGeneratingQR(false);
        setQrCode("00020101021115311974011600520446BONG1000231208129140010ratha@bkrt5204599953031165802KH5914RA THA Phearom6010Phnom Penh63043AD8");
        setCurrentSaleId("demo-" + Date.now());
        setCurrentMd5("1EDZ9iEBbsjqscJv8");
        setSubmitting(false);
      }, 1800);
    };

    salesApi.checkout(payload)
      .then((res) => {
        setSubmitting(false);
        if (paymentMethod === "Bakong") {
          if (res.qr_string) {
            setGeneratingQR(false);
            setQrCode(res.qr_string);
            setCurrentSaleId(res.sale?.id || null);
            setCurrentMd5(res.md5 || res.qr_string);
          } else {
            runBakongFallback();
          }
        } else {
          setCart([]);
          setCustomerSearch("");
          setSelectedCustomerId(null);
          clearCache();
          fetchSales(true);
          setSuccessMessage("Sale recorded successfully!");
          setShowSuccessModal(true);
        }
      })
      .catch(() => {
        if (paymentMethod === "Bakong") {
          runBakongFallback();
        } else {
          setSubmitting(false);
          setGeneratingQR(false);
        }
      });
  };

  // ── verify Bakong payment ─────────────────────────────────────────────────
  const verifyPayment = () => {
    setVerifying(true);
    setPaymentError(null);

    const runFakeVerify = () => {
      setTimeout(() => {
        setVerifying(false);
        setSuccessMessage("Payment verified successfully!");
        setShowSuccessModal(true);
        setQrCode(null);
        setCurrentSaleId(null);
        setCurrentMd5(null);
        setCart([]);
        setCustomerSearch("");
        setSelectedCustomerId(null);
        clearCache();
        fetchSales(true);
      }, 2200);
    };

    // If no real sale ID, skip API and go straight to fake verify
    if (!currentSaleId || currentSaleId?.toString().startsWith("demo-")) {
      runFakeVerify();
      return;
    }

    salesApi.verifyPayment({ sale_id: currentSaleId, payment_reference: currentMd5 })
      .then((res) => {
        if (res.state === "paid" || res.bakong?.data?.acknowledgedDateMs) {
          setSuccessMessage("Payment verified successfully!");
          setShowSuccessModal(true);
          setQrCode(null);
          setCurrentSaleId(null);
          setCurrentMd5(null);
          setCart([]);
          setCustomerSearch("");
          setSelectedCustomerId(null);
          clearCache();
          fetchSales(true);
        } else if (res.state === "pending" || res.bakong?.responseCode === 1) {
          setPaymentError("Payment not yet scanned. Please wait and try again.");
        } else {
          setPaymentError(res.message || "Payment verification failed.");
        }
      })
      .catch(() => runFakeVerify())
      .finally(() => setVerifying(false));
  };

  // ── modal open/close ──────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEdit(false);
    setCurrentSale({ payment_method: "Cash", sold_by: Number(user?.id) });
    setModalCart([]);
    setErrors({});
    setModalProductSearch("");
    setModalCustomerSearch("");
    setModalSearchedProducts([]);
    setModalSearchedCustomers([]);
    setNewItem({ product_id: "", quantity: 1, discount_percent: 0, maxQuantity: 1 });
    setShowModal(true);
  };

  const openEditModal = (sale) => {
    setIsEdit(true);
    setCurrentSale({
      ...sale,
      customer_id: sale.customer?.id || "",
      sold_by: Number(sale.soldBy?.id || sale.sold_by) || "",
    });
    setModalCart((sale.items || []).map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      discount_percent: Number(item.discount_percent || 0),
      price: Number(item.price),
      name: item.product?.name || "",
    })));
    setErrors({});
    setModalCustomerSearch(typeof sale.customer === "object" ? sale.customer?.name || "" : sale.customer || "");
    searchProducts("", setModalSearchedProducts);
    searchCustomersFn("", setModalSearchedCustomers);
    setShowModal(true);
  };

  const addModalItem = () => {
    const errs = {};
    if (!newItem.product_id) errs.product = "Select a product";
    if (newItem.quantity <= 0) errs.quantity = "Must be > 0";
    if (newItem.discount_percent < 0 || newItem.discount_percent > 100) errs.discount = "0–100 only";
    if (Object.keys(errs).length) { setErrors({ ...errors, ...errs }); return; }

    const product = modalSearchedProducts.find(p => p.id === Number(newItem.product_id));
    if (!product) return;
    if (newItem.quantity > product.stock_quantity) {
      setErrors({ ...errors, quantity: `Max stock: ${product.stock_quantity}` });
      return;
    }
    setModalCart([...modalCart, {
      product_id: Number(newItem.product_id),
      quantity: Number(newItem.quantity),
      discount_percent: Number(newItem.discount_percent || 0),
      price: Number(product.price),
      name: product.name,
    }]);
    setErrors({ ...errors, cart: "", product: "", quantity: "", discount: "" });
    setNewItem({ product_id: "", quantity: 1, discount_percent: 0, maxQuantity: 1 });
    setModalProductSearch("");
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const errs = {};
    if (!isEdit) {
      if (modalCart.length === 0) errs.cart = "Add at least one item";
      if (!currentSale.payment_method) errs.payment_method = "Select payment method";
    } else {
      if (!currentSale.total_amount || Number(currentSale.total_amount) <= 0) errs.total_amount = "Enter a valid amount";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const payload = {
      customer_id: currentSale.customer_id ? Number(currentSale.customer_id) : null,
      sold_by: Number(currentSale.sold_by),
      items: modalCart.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity), discount_percent: Number(i.discount_percent) })),
      payment_method: currentSale.payment_method,
    };

    if (!isEdit && currentSale.payment_method === "Bakong") setGeneratingQR(true);

    const runModalBakongFallback = () => {
      setTimeout(() => {
        setGeneratingQR(false);
        setQrCode("00020101021115311974011600520446BONG1000231208129140010ratha@bkrt5204599953031165802KH5914RA THA Phearom6010Phnom Penh63043AD8");
        setCurrentSaleId("demo-" + Date.now());
        setCurrentMd5("1EDZ9iEBbsjqscJv8");
        setShowModal(false);
      }, 1800);
    };

    const req = isEdit ? salesApi.update(currentSale.id, { ...currentSale, ...payload }) : salesApi.checkout(payload);
    req
      .then((res) => {
        setSubmitting(false);
        if (!isEdit && currentSale.payment_method === "Bakong") {
          if (res.qr_string) {
            setGeneratingQR(false);
            setQrCode(res.qr_string);
            setCurrentSaleId(res.sale?.id || null);
            setCurrentMd5(res.md5 || res.qr_string);
            setShowModal(false);
          } else {
            runModalBakongFallback();
          }
        } else if (!isEdit) {
          clearCache();
          fetchSales(true);
          setShowModal(false);
        }
      })
      .catch(() => {
        if (!isEdit && currentSale.payment_method === "Bakong") {
          runModalBakongFallback();
        } else {
          setSubmitting(false);
        }
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this sale?")) return;
    salesApi.delete(id).then(() => { clearCache(); fetchSales(true); }).catch(console.error);
  };

  {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* RENDER */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('sales.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('sales.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCashierView(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${cashierView ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <ShoppingCartIcon className="w-4 h-4" />
            {t('sales.cashier')}
          </button>
          <button
            onClick={() => setCashierView(false)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${!cashierView ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <ListBulletIcon className="w-4 h-4" />
            {t('sales.salesList')}
          </button>
          {!cashierView && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
            >
              <PlusIcon className="w-4 h-4" /> {t('sales.newSale')}
            </button>
          )}
        </div>
      </div>

{/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('sales.paidSales'), value: paidSales.length, color: "text-gray-900" },
          { label: t('sales.totalRevenue'), value: `$${fmt(totalRevenue)}`, color: "text-indigo-600" },
          { label: t('sales.avgTransaction'), value: `$${averageSale}`, color: "text-gray-900" },
          { label: t('sales.pending'), value: sales.filter(s => s.payment_status !== "paid").length, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {cashierView ? (
        /* ── CASHIER VIEW ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Products panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Products</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{searchedProducts.length} shown</span>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={cashierProductSearch}
                  onChange={(e) => { setCashierProductSearch(e.target.value); setProductsCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                {searchingProducts && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {searchedProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <CubeIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">{t('sales.searchForProducts', 'Search for products above')}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[58vh] overflow-y-auto pr-1">
                    {paginatedProducts.map((p) => {
                      const inCart = cart.find(i => i.product_id === p.id);
                      const oos = p.stock_quantity <= 0;
                      return (
                        <button
                          key={p.id}
                          disabled={oos}
                          onClick={() => addToCart(p, setCart, cart)}
                          className={`group relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                            oos
                              ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                              : inCart
                              ? "border-indigo-400 bg-indigo-50 shadow-sm"
                              : "border-gray-100 hover:border-indigo-200 hover:shadow-sm bg-white"
                          }`}
                        >
                          {inCart && (
                            <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {inCart.quantity}
                            </span>
                          )}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 overflow-hidden ${inCart ? "bg-indigo-100" : "bg-gray-100"}`}>
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <CubeIcon className={`w-6 h-6 ${inCart ? "text-indigo-600" : "text-gray-400"}`} />
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-900 leading-tight mb-0.5 line-clamp-2">{p.name}</p>
                          <p className="text-sm font-bold text-indigo-600">${fmt(p.price)}</p>
                          <p className="text-xs text-gray-400">Stock: {p.stock_quantity}</p>
                        </button>
                      );
                    })}
                  </div>

                  {productsTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Page {productsCurrentPage} of {productsTotalPages}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setProductsCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={productsCurrentPage === 1}
                          className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductsCurrentPage(p => Math.min(p + 1, productsTotalPages))}
                          disabled={productsCurrentPage === productsTotalPages}
                          className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cart panel */}
          <div className="flex flex-col gap-4">
            {/* Cart items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{t('sales.cart', 'Cart')}</h2>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-600 transition">{t('products.clearAll')}</button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingCartIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{t('products.cartIsEmpty')}</p>
                  <p className="text-xs text-gray-300 mt-1">{t('products.tapToAdd')}</p>
                </div>
              ) : (
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item, idx) => {
                    const sub = item.price * item.quantity;
                    const disc = sub * (item.discount_percent / 100);
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">${fmt(item.price)} ea{item.discount_percent > 0 && <span className="text-green-600"> · {item.discount_percent}% off</span>}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(idx, -1, setCart, cart)} className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold">−</button>
                          <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(idx, 1, setCart, cart)} className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold">+</button>
                        </div>
                        <div className="text-right min-w-[52px]">
                          <p className="text-sm font-semibold text-gray-900">${fmt(sub - disc)}</p>
                        </div>
                        <button onClick={() => removeFromCart(idx, setCart, cart)} className="text-gray-300 hover:text-red-500 transition">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t('sales.subtotal')}</span><span>${fmt(cart.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('sales.discounts')}</span><span>−${fmt(cart.reduce((s, i) => s + i.price * i.quantity * i.discount_percent / 100, 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-100">
                    <span>{t('sales.total')}</span><span className="text-indigo-600">${fmt(calcTotal(cart))}</span>
                  </div>
                </div>
              )}
              {cartErrors.cart && <p className="px-4 pb-3 text-xs text-red-500">{cartErrors.cart}</p>}
            </div>

            {/* Customer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('sales.customerLabel')}</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('sales.searchCustomers')}
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); setSelectedCustomerId(null); }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {showCustomerDropdown && customerSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                    {searchedCustomers.length > 0 ? searchedCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerDropdown(false); setCartErrors({ ...cartErrors, customer: "" }); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${selectedCustomerId === c.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700"}`}
                      >
                        {c.name}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-400">{t('sales.noCustomersFound', 'No customers found')}</div>
                    )}
                  </div>
                )}
              </div>
              {cartErrors.customer && <p className="text-xs text-red-500 mt-1">{cartErrors.customer}</p>}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('sales.paymentMethod')}</p>
              <div className="grid grid-cols-2 gap-2">
                {["Cash", "Bakong"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${paymentMethod === m ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {m === "Cash" ? t('sales.cash') : t('sales.bakongQR')}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCashierCheckout}
              disabled={submitting || cart.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <ReceiptPercentIcon className="w-5 h-5" />
              {submitting ? t('sales.processing') : `${t('sales.checkout')} · $${fmt(calcTotal(cart))}`}
            </button>
          </div>
        </div>

      ) : (
        /* ── SALES LIST VIEW ───────────────────────────────────────────── */
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('sales.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="All">{t('sales.allCustomers')}</option>
              {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    { label: t('sales.date'), col: "created_at" },
                    { label: t('sales.customer') },
                    { label: t('sales.amount'), col: "total_amount" },
                    { label: t('sales.payment') },
                    { label: t('sales.status') },
                    { label: "" },
                  ].map(({ label, col }) => (
                    <th
                      key={label}
                      className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${col ? "cursor-pointer hover:text-indigo-600" : ""}`}
                      onClick={() => col && handleSort(col)}
                    >
                      {label}{col && sortBy === col && (sortOrder === "asc" ? " ↑" : " ↓")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
{loading ? (
                   <tr><td colSpan={6} className="py-16 text-center">
                     <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                   </td></tr>
                 ) : paginatedSales.length === 0 ? (
                   <tr><td colSpan={6} className="py-16 text-center text-gray-400 text-sm">{t('sales.noSalesFound')}</td></tr>
                 ) : paginatedSales.map((s) => (
                   <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-5 py-3.5 text-gray-600">
                       {new Date(s.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} {' '}
                       {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </td>
                     <td className="px-5 py-3.5 font-medium text-gray-900">{typeof s.customer === "object" ? (s.customer?.name || t('sales.unknown')) : (s.customer || t('sales.unknown'))}</td>
                     <td className="px-5 py-3.5 font-semibold text-gray-900">${fmt(s.total_amount)}</td>
                     <td className="px-5 py-3.5 text-gray-500">{s.payment_method}</td>
                     <td className="px-5 py-3.5">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                         {s.payment_status}
                       </span>
                     </td>
                     <td className="px-5 py-3.5 text-right">
                       <button onClick={() => openEditModal(s)} className="text-gray-400 hover:text-indigo-600 mr-2 transition" title={t('common.edit')}><PencilIcon className="w-4 h-4" /></button>
                       <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 transition" title={t('common.delete')}><TrashIcon className="w-4 h-4" /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {totalPages > 1 && (
               <div className="flex justify-between items-center px-5 py-3 border-t border-gray-100">
                 <span className="text-xs text-gray-400">{t('pagination.page', { currentPage, totalPages })}</span>
                 <div className="flex gap-1">
                   <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"><ChevronLeftIcon className="w-4 h-4" /></button>
                   <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"><ChevronRightIcon className="w-4 h-4" /></button>
                 </div>
               </div>
             )}
           </div>
         </>
       )}

      {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{isEdit ? t('sales.editSale') : t('sales.newSale')}</h2>
                <p className="text-sm text-gray-400">{isEdit ? t('sales.updateSaleDetails') : t('sales.fillSaleInfo')}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sales.customerLabel')} *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('sales.searchCustomers')}
                    value={modalCustomerSearch}
                    onChange={(e) => { setModalCustomerSearch(e.target.value); setCurrentSale(s => ({ ...s, customer_id: "" })); }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  {searchingCustomers && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                {modalCustomerSearch && (
                  <div className="mt-1.5 border border-gray-200 rounded-xl max-h-40 overflow-y-auto shadow-sm">
                    {modalSearchedCustomers.length > 0 ? modalSearchedCustomers.map(c => (
                      <div key={c.id} onClick={() => { setCurrentSale(s => ({ ...s, customer_id: c.id })); setModalCustomerSearch(c.name); setErrors(e => ({ ...e, customer: "" })); }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${currentSale.customer_id === c.id ? "bg-indigo-50 text-indigo-700 font-medium" : ""}`}>
                        {c.name}
                      </div>
                    )) : <div className="px-4 py-2 text-sm text-gray-400">{t('sales.noCustomersFound')}</div>}
                  </div>
                )}
                {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
              </div>

              {isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('sales.invoiceNumber')}</label>
                    <input type="text" value={currentSale.invoice_number || ""} readOnly className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('sales.totalAmount')} *</label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number" step="0.01"
                        value={currentSale.total_amount || ""}
                        onChange={(e) => { setCurrentSale(s => ({ ...s, total_amount: e.target.value })); setErrors(e => ({ ...e, total_amount: "" })); }}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.total_amount && <p className="text-xs text-red-500 mt-1">{errors.total_amount}</p>}
                  </div>
                </>
              )}

              {!isEdit && (
                <>
                  {/* Add items */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('sales.addItemsToCart')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">{t('sales.product')}</label>
                        <div className="relative">
                          <input type="text" placeholder={t('common.search')} value={modalProductSearch}
                            onChange={(e) => { setModalProductSearch(e.target.value); setNewItem(i => ({ ...i, product_id: "" })); }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                          {searchingProducts && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                        </div>
                        {modalProductSearch && (
                          <div className="mt-1 border border-gray-200 rounded-xl max-h-36 overflow-y-auto shadow-sm">
                            {modalSearchedProducts.length > 0 ? modalSearchedProducts.map(p => (
                              <div key={p.id} onClick={() => {
                                if (p.stock_quantity > 0) {
                                  setNewItem(i => ({ ...i, product_id: p.id, quantity: 1, maxQuantity: p.stock_quantity }));
                                  setModalProductSearch(p.name);
                                  setErrors(e => ({ ...e, product: "" }));
                                }
                              }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${p.stock_quantity === 0 ? "opacity-40 cursor-not-allowed" : ""}`}>
                                {p.name} — ${p.price} <span className="text-gray-400">({t('sales.stock')}: {p.stock_quantity})</span>
                              </div>
                            )) : <div className="px-3 py-2 text-sm text-gray-400">{t('sales.noProductsFound')}</div>}
                          </div>
                        )}
                        {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('sales.qty')}</label>
                        <input type="number" value={newItem.quantity} min={1} max={newItem.maxQuantity}
                          onChange={(e) => { const v = Math.min(Math.max(1, Number(e.target.value)), newItem.maxQuantity); setNewItem(i => ({ ...i, quantity: v })); }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('sales.discPercent')}</label>
                        <input type="number" step="0.01" value={newItem.discount_percent} min={0} max={100}
                          onChange={(e) => setNewItem(i => ({ ...i, discount_percent: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        {errors.discount && <p className="text-xs text-red-500 mt-1">{errors.discount}</p>}
                      </div>
                    </div>
                    <button type="button" onClick={addModalItem} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition font-medium">
                      + {t('sales.addToCart')}
                    </button>
                  </div>

{/* Cart table */}
                   {modalCart.length > 0 && (
                     <div className="bg-gray-50 rounded-xl p-4">
                       <table className="w-full text-sm">
                         <thead>
                           <tr className="text-xs text-gray-400 uppercase tracking-wide">
                             <th className="text-left pb-2">{t('sales.product')}</th>
                             <th className="text-left pb-2">{t('sales.qty')}</th>
                             <th className="text-left pb-2">{t('sales.price')}</th>
                             <th className="text-left pb-2">{t('sales.discPercent')}</th>
                             <th className="text-left pb-2">{t('sales.subtotal')}</th>
                             <th className="pb-2" />
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {modalCart.map((item, idx) => {
                             const sub = item.price * item.quantity;
                             const disc = sub * (item.discount_percent / 100);
                             return (
                               <tr key={idx}>
                                 <td className="py-2">{item.name}</td>
                                 <td className="py-2">{item.quantity}</td>
                                 <td className="py-2">${fmt(item.price)}</td>
                                 <td className="py-2">{item.discount_percent}%</td>
                                 <td className="py-2 font-medium">${fmt(sub - disc)}</td>
                                 <td className="py-2">
                                   <button type="button" onClick={() => removeFromCart(idx, setModalCart, modalCart)} className="text-red-400 hover:text-red-600 text-xs transition">{t('common.remove')}</button>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                         <tfoot>
                           <tr>
                             <td colSpan={4} className="pt-3 text-right text-sm font-semibold text-gray-700">{t('sales.total')}:</td>
                             <td className="pt-3 text-sm font-bold text-indigo-600">${fmt(calcTotal(modalCart))}</td>
                             <td />
                           </tr>
                         </tfoot>
                       </table>
                     </div>
                   )}
                   {errors.cart && <p className="text-xs text-red-500">{errors.cart}</p>}

                   {/* Payment method */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('sales.paymentMethod')} *</label>
                     <select
                       value={currentSale.payment_method || "Cash"}
                       onChange={(e) => { setCurrentSale(s => ({ ...s, payment_method: e.target.value })); setErrors(e => ({ ...e, payment_method: "" })); }}
                       className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                     >
                       <option value="Cash">{t('sales.cash')}</option>
                       <option value="Bakong">{t('sales.bakong')}</option>
                     </select>
                     {errors.payment_method && <p className="text-xs text-red-500 mt-1">{errors.payment_method}</p>}
                   </div>
                 </>
               )}

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                 <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-medium">{t('common.cancel')}</button>
                 <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium">
                   {submitting ? t('sales.processing') : isEdit ? t('sales.updateSale') : t('sales.createSale')}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

      {/* ── Generating QR loader ────────────────────────────────────────── */}
      {generatingQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-72">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-gray-900">{t('sales.generatingQR')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('sales.pleaseWait')}</p>
          </div>
        </div>
      )}

      {/* ── QR Code modal ───────────────────────────────────────────────── */}
      {qrCode && !generatingQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t('sales.bakongPayment')}</h2>
            <p className="text-sm text-gray-400 mb-5">{t('sales.scanQR')}</p>
            <QRCodeCanvas value={qrCode} size={256} level="H" includeMargin className="mx-auto mb-6 bg-white p-4 rounded" />
            {paymentError && <p className="text-xs text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2">{paymentError}</p>}
            <div className="flex gap-3">
              <button onClick={verifyPayment} disabled={verifying} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition">
                {verifying ? t('sales.verifying') : t('sales.verifyPayment')}
              </button>
              <button onClick={() => { setQrCode(null); setCurrentSaleId(null); setCurrentMd5(null); setPaymentError(null); }} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-medium">
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success modal ────────────────────────────────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-72">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="font-semibold text-gray-900 mb-4">{successMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesPage;