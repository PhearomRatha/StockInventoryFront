import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaTrash, FaEdit, FaPlus, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { customerApi } from "../../api";

function CustomerCrmPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferences: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---------------- Fetch Customers ----------------
  const fetchCustomers = async () => {
    setLoading(true);
    const result = await customerApi.getAll();
    if (result.success) {
      const customersData = result.data?.data || result.data;
      setCustomers(Array.isArray(customersData) ? customersData : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------------- Handle Form Change ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Add / Edit Customer ----------------
  const handleSubmit = async () => {
    if (!form.name) return alert(t('customers.nameRequired'));
    
    let result;
    if (editingId) {
      result = await customerApi.update(editingId, form);
    } else {
      result = await customerApi.create(form);
    }

    if (result.success) {
      await fetchCustomers();
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        preferences: "",
        notes: "",
      });
      setEditingId(null);
    } else {
      alert(result.message || t('customers.saveFailed'));
    }
  };

  // ---------------- Delete Customer ----------------
  const handleDelete = async (id) => {
    if (!window.confirm(t('customers.deleteConfirm'))) return;

    const result = await customerApi.delete(id);

    if (result.success) {
      setCustomers(customers.filter((c) => c.id !== id));
    } else {
      alert(result.message || t('customers.deleteFailed'));
    }
  };

  // ---------------- Edit Customer ----------------
  const handleEdit = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      preferences: customer.preferences || "",
      notes: customer.notes || "",
    });
    setEditingId(customer.id);
  };

  // ---------------- Sorting ----------------
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort change
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
    const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const paginatedCustomers = sortedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatName = (name) => {
    // Handle object or string
    const nameStr = typeof name === 'object' ? name?.name || JSON.stringify(name) : (name || '');
    const parts = nameStr.trim().split(' ');
    if (parts.length > 1) {
      const first = parts[0];
      const last = parts.slice(1).join(' ');
      return `${last}, ${first}`;
    }
    return nameStr;
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="inline ml-1 text-blue-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 relative">

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-3"></div>
            <p className="text-blue-700 font-semibold">{t('customers.loading')}</p>
          </div>
        </div>
      )}

      {/* Customer Form */}
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-10">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <FaPlus className="text-blue-600" /> {editingId ? t('customers.editCustomer') : t('customers.addCustomer')}
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input type="text" name="name" placeholder={t('customers.namePlaceholder')} value={form.name} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="email" name="email" placeholder={t('customers.emailPlaceholder')} value={form.email} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="phone" placeholder={t('customers.phonePlaceholder')} value={form.phone} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input type="text" name="address" placeholder={t('customers.addressPlaceholder')} value={form.address} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="preferences" placeholder={t('customers.preferencesPlaceholder')} value={form.preferences} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="notes" placeholder={t('customers.notesPlaceholder')} value={form.notes} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> {editingId ? t('customers.updateCustomer') : t('customers.addCustomer')}
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">{t('customers.customerList')}</h2>
        </div>

        {customers.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">{t('customers.noCustomers')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('customers.no')}
                    </th>
                    <th onClick={() => handleSort("name")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      {t('customers.name')} {renderSortIcon("name")}
                    </th>
                    <th onClick={() => handleSort("email")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      {t('customers.email')} {renderSortIcon("email")}
                    </th>
                    <th onClick={() => handleSort("phone")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      {t('customers.phone')} {renderSortIcon("phone")}
                    </th>
                    <th onClick={() => handleSort("address")} className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-blue-600">
                      {t('customers.address')} {renderSortIcon("address")}
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('customers.preferences')}</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('customers.notes')}</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('customers.actions')}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedCustomers.map((c, index) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors duration-200">
                      <td className="py-4 px-6 text-sm text-gray-900">{index + 1}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">{formatName(c.name)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.phone}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.address}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.preferences}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.notes}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(c)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title={t('common.edit')}>
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" title={t('common.delete')}>
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                  {t('common.previous')}
                </button>
                <span>{t('customers.page', { currentPage, totalPages })}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerCrmPage;
