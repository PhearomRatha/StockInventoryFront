import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

import { stockInApi, supplierApi, productApi } from "../../api";
import { Select } from "../../components/UI";

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString();
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
};

function StockInPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    supplier_id: "",
    product_id: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockInHistory, setStockInHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");


  // Load everything in one call
  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const [overviewRes] = await Promise.all([
        stockInApi.getOverview(),
        supplierApi.getAll(),
        productApi.getAll(),
      ]);

      if (overviewRes.success) {
        setSuppliers(overviewRes.data?.suppliers || []);
        setProducts(overviewRes.data?.products || []);
        setStockInHistory(overviewRes.data?.stock_history || []);
      }
    } catch (err) {
      console.error("Load overview error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const name = e?.target?.name || e?.name;
    const value = e?.target?.value !== undefined ? e.target.value : e?.value;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { supplier_id, product_id, quantity, date, notes } = formData;
    if (!supplier_id || !product_id || !quantity) {
      setModalMessage(t("stockIn.fillRequired"));
      setShowErrorModal(true);
      return;
    }

    const payload = {
      supplier_id,
      product_id,
      quantity: Number(quantity),
      date,
      notes,
    };

    const result = await stockInApi.create(payload);

    if (result.success) {
      setModalMessage(t("stockIn.stockInRecorded"));
      setShowSuccessModal(true);
      setFormData({
        supplier_id: "",
        product_id: "",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadOverview();
    } else {
      setModalMessage(result.message || t("stockIn.failedRecord"));
      setShowErrorModal(true);
    }
  };

  // Filtered stock-in history
  const filteredHistory = stockInHistory
    .filter((r) => {
      const matchesSearch =
        r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSupplier = selectedSupplier === "All" || r.supplier_name === selectedSupplier;
      const matchesDate = !selectedDate || r.received_date === selectedDate;
      return matchesSearch && matchesSupplier && matchesDate;
    })
    .sort((a, b) => new Date(b.received_date) - new Date(a.received_date));

  const totalValue = filteredHistory.reduce(
    (sum, r) => sum + Number(r.quantity) * Number(r.cost || 0),
    0
  );

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
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TruckIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t("stockIn.title")}</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">{t("stockIn.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t("stockIn.newStockIn")}</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Select
                label={t("stockIn.supplier")}
                value={formData.supplier_id}
                onChange={(val) => handleInputChange({ name: "supplier_id", value: val })}
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                required
                placeholder={t("stockIn.selectSupplier")}
              />
            </div>
            <div>
              <Select
                label={t("stockIn.product")}
                value={formData.product_id}
                onChange={(val) => handleInputChange({ name: "product_id", value: val })}
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: `${p.stock_quantity} in stock`
                }))}
                required
                placeholder={t("stockIn.selectProduct")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("stockIn.quantity")} *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" className="w-full px-4 py-3 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("stockIn.date")} *</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("stockIn.notes")}</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" rows="3"></textarea>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl">{t("stockIn.recordStockIn")}</button>
          </form>
        </div>

        {/* Stock-In History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t("stockIn.stockInHistory")}</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t("products.searchPlaceholder")} className="flex-1 px-4 py-3 border rounded-xl" />
            <div className="w-full md:w-64 flex-shrink-0">
              <Select
                value={selectedSupplier}
                onChange={(val) => setSelectedSupplier(val)}
                options={[
                  { value: "All", label: t("stockIn.allSuppliers") || "All Suppliers" },
                  ...suppliers.map((s) => ({ value: s.name, label: s.name }))
                ]}
              />
            </div>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-4 py-3 border rounded-xl" />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <TruckIcon className="w-16 h-16 mx-auto mb-4" />
              <p>{t("stockIn.noStockOuts")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[t("stockIn.product"), t("stockIn.supplier"), t("stockIn.qty"), t("stockIn.unitCost"), t("stockIn.receivedBy"), t("stockIn.date")].map(h => (
                      <th key={h} className="py-4 px-6 text-left text-xs font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">{r.product_name}</td>
                      <td className="py-4 px-6">{r.supplier_name}</td>
                      <td className="py-4 px-6 font-semibold">{r.quantity}</td>
                      <td className="py-4 px-6 font-semibold">${Number(r.cost || 0).toFixed(2)}</td>
                      <td className="py-4 px-6 text-gray-600">{r.received_by_name}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDateTime(r.received_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 py-4 px-6 bg-gray-50 rounded-lg text-right font-semibold text-gray-900">{t("stockIn.totalStockValue")}: ${totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("common.success")}</h2>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full px-6 py-3 bg-green-600 text-white rounded-xl">{t("common.continue")}</button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("common.error")}</h2>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button onClick={() => setShowErrorModal(false)} className="w-full px-6 py-3 bg-red-600 text-white rounded-xl">{t("common.close")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockInPage;