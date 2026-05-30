import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaSearch,
  FaExclamationCircle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

import { supplierApi } from "../../api";

function Suppliers() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = t("suppliers.nameRequired");

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t("suppliers.invalidEmail");

    if (form.phone && !/^(\+855\d{8,9}|0\d{8,9}|\d{9,10})$/.test(form.phone))
      newErrors.phone = t("suppliers.invalidPhone");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchSuppliers = async () => {
    const result = await supplierApi.getAll();
    if (result.success) {
      const suppliersData = result.data?.data || result.data;
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // remove error as user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (editingIndex !== null) {
        const supplierId = suppliers[editingIndex].id;
        await supplierApi.update(supplierId, form);
        setEditingIndex(null);
      } else {
        await supplierApi.create(form);
      }
      fetchSuppliers();
      resetForm();
    } catch (err) {
      console.error("Error saving supplier:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
    setErrors({});
  };

  const handleEdit = (index) => {
    setForm(suppliers[index]);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    const supplierId = suppliers[index].id;
    if (window.confirm(t("suppliers.deleteConfirm"))) {
      setDeletingId(supplierId);
      try {
        await supplierApi.delete(supplierId);
        fetchSuppliers();
      } catch (err) {
        console.error("Error deleting supplier:", err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSuppliers = [...suppliers]
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
            <FaUserTie className="text-blue-600" /> {t("suppliers.title")}
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5 mb-8">

          {/* NAME */}
          <div>
            <label className="font-medium">{t("suppliers.name")} *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full border p-2 rounded-lg ${
                errors.name ? "border-red-500" : "focus:ring-blue-400"
              }`}
              placeholder={t("suppliers.namePlaceholder")}
            />
            {errors.name && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <FaExclamationCircle /> {errors.name}
              </p>
            )}
          </div>

          {/* COMPANY */}
          <div>
            <label className="font-medium">{t("suppliers.company")}</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-blue-400"
              placeholder={t("suppliers.companyPlaceholder")}
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="font-medium">{t("suppliers.phone")}</label>
            <div className={`flex items-center border p-2 rounded-lg ${
              errors.phone ? "border-red-500" : ""
            }`}>
              <FaPhoneAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="flex-1 outline-none"
                placeholder={t("suppliers.phonePlaceholder")}
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <FaExclamationCircle /> {errors.phone}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="font-medium">{t("suppliers.email")}</label>
            <div className={`flex items-center border p-2 rounded-lg ${
              errors.email ? "border-red-500" : ""
            }`}>
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="flex-1 outline-none"
                placeholder={t("suppliers.emailPlaceholder")}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <FaExclamationCircle /> {errors.email}
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="font-medium">{t("suppliers.address")}</label>
            <div className="flex items-center border p-2 rounded-lg">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="flex-1 outline-none"
                placeholder={t("suppliers.addressPlaceholder")}
              />
            </div>
          </div>

          {/* NOTES */}
          <div className="md:col-span-2">
            <label className="font-medium">{t("suppliers.notes")}</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-blue-400"
              placeholder={t("suppliers.notesPlaceholder")}
            ></textarea>
          </div>

          {/* BUTTONS */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-3">
            {editingIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                {t("common.cancel")}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {isSubmitting ? t("suppliers.processing") : editingIndex !== null ? <><FaSave /> {t("common.update")}</> : <><FaPlus /> {t("common.add")}</>}
            </button>
          </div>
        </form>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-2 mb-5">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder={t("suppliers.searchPlaceholder")}
            className="border p-2 rounded-lg w-full focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-blue-600" /> {t("suppliers.suppliersList")}
            </h2>
          </div>

          {sortedSuppliers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">{t("suppliers.noSuppliersFound")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                  <tr>
                    {["No", t("suppliers.name"), t("suppliers.company"), t("suppliers.phone"), t("suppliers.email"), t("suppliers.address"), t("suppliers.notes")].map((key) => (
                      <th
                        key={key}
                        className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600"
                        onClick={() => key !== "No" && handleSort(key)}
                      >
                        {key === "No" ? key : key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortConfig.key === key && key !== "No"
                          ? sortConfig.direction === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </th>
                    ))}
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t("common.actions")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {sortedSuppliers.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors duration-200">
                      <td className="py-4 px-6 text-sm text-gray-900">{i + 1}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">{s.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{s.company}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{s.phone}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{s.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{s.address}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{s.notes}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(i)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title={t("common.edit")}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(i)}
                            disabled={deletingId === s.id}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title={t("common.delete")}
                          >
                            {deletingId === s.id ? t("suppliers.processing") : <FaTrash className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Suppliers;
