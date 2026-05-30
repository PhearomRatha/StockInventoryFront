import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { activityLogApi, customerApi } from "../../api";
import ModalSelect from "../../components/UI/ModalSelect";

function ActivityLogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilters = selectedUsers.length > 0 || selectedModules.length > 0 || selectedActions.length > 0 || startDate || endDate;

      let logsRes;
      if (hasFilters) {
        logsRes = await activityLogApi.filter({
          user_id: selectedUsers.length > 0 ? selectedUsers : undefined,
          module: selectedModules.length > 0 ? selectedModules : undefined,
          action: selectedActions.length > 0 ? selectedActions : undefined
        });
      } else {
        logsRes = await activityLogApi.getAll();
      }

      let logsData = logsRes.success ? (logsRes.data?.data || logsRes.data || []) : [];
      setLogs(Array.isArray(logsData) ? logsData : []);

      const usersRes = await customerApi.getAll();
      const usersData = usersRes.success ? (usersRes.data?.data || usersRes.data || []) : [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedUsers, selectedModules, selectedActions, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const dateFilteredLogs = logs.filter(log => {
    if (!startDate && !endDate) return true;
    const logDate = new Date(log.created_at).toISOString().split('T')[0];
    if (startDate && logDate < startDate) return false;
    if (endDate && logDate > endDate) return false;
    return true;
  });

  const filteredLogs = dateFilteredLogs
    .filter((log) =>
      (log.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "created_at")
        return multiplier * new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "user") {
        const userA = typeof a.user === 'object' ? a.user?.name || '' : (a.user || '');
        const userB = typeof b.user === 'object' ? b.user?.name || '' : (b.user || '');
        return multiplier * userA.localeCompare(userB);
      }
      if (sortBy === "id") return multiplier * (a.id - b.id);
      if (sortBy === "action") return multiplier * (a.action || '').localeCompare(b.action || '');
      if (sortBy === "module") return multiplier * (a.module || '').localeCompare(b.module || '');
      if (sortBy === "record_id") return multiplier * (a.record_id - b.record_id);
      return 0;
    });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Statistics
  const totalLogs = dateFilteredLogs.length;
  const todayLogs = dateFilteredLogs.filter(
    (log) =>
      new Date(log.created_at).toDateString() === new Date().toDateString()
  ).length;
  const uniqueUsers = new Set(dateFilteredLogs.map((log) => log.user_id)).size;

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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-white rounded-2xl shadow-sm"
              ></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="h-10 w-48 bg-gray-300 rounded mb-6"></div>
            {Array.from({ length: 8 }).map((_, i) => (
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
            <DocumentTextIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("activityLogs.title")}
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {t("activityLogs.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t("activityLogs.totalLogs")}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalLogs}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t("activityLogs.todaysLogs")}</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {todayLogs}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t("activityLogs.activeUsers")}</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {uniqueUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("activityLogs.user")}
            </label>
            <button
              type="button"
              onClick={() => setUserModalOpen(true)}
              className="modal-select-trigger"
            >
              <span className={selectedUsers.length === 0 ? "trigger-placeholder" : ""}>
                {selectedUsers.length === 0
                  ? t("activityLogs.selectUsers")
                  : selectedUsers.length === 1
                    ? users.find(u => u.id === selectedUsers[0])?.name || "1 user selected"
                    : `${selectedUsers.length} users selected`
                }
              </span>
              <ChevronRightIcon className="trigger-chevron w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("activityLogs.module")}
            </label>
            <button
              type="button"
              onClick={() => setModuleModalOpen(true)}
              className="modal-select-trigger"
            >
              <span className={selectedModules.length === 0 ? "trigger-placeholder" : ""}>
                {selectedModules.length === 0
                  ? t("activityLogs.selectModules")
                  : selectedModules.length === 1
                    ? selectedModules[0].replace('_', ' ')
                    : `${selectedModules.length} modules selected`
                }
              </span>
              <ChevronRightIcon className="trigger-chevron w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("activityLogs.action")}
            </label>
            <button
              type="button"
              onClick={() => setActionModalOpen(true)}
              className="modal-select-trigger"
            >
              <span className={selectedActions.length === 0 ? "trigger-placeholder" : ""}>
                {selectedActions.length === 0
                  ? t("activityLogs.selectActions")
                  : selectedActions.length === 1
                    ? selectedActions[0]
                    : `${selectedActions.length} actions selected`
                }
              </span>
              <ChevronRightIcon className="trigger-chevron w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("activityLogs.dateRange")}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalSelect
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={t("activityLogs.selectUsers")}
        options={users.map(u => ({ value: u.id, label: u.name }))}
        selectedValues={selectedUsers}
        onSelectMultiple={setSelectedUsers}
        multiSelect={true}
        placeholder={t("customers.searchPlaceholder")}
      />
      <ModalSelect
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        title={t("activityLogs.selectModules")}
        options={[
          { value: "products", label: t("navigation.products") },
          { value: "sales", label: t("navigation.sales") },
          { value: "stock_ins", label: t("reports.stockIns") },
          { value: "stock_outs", label: t("reports.stockOuts") },
          { value: "suppliers", label: t("navigation.suppliers") },
          { value: "customers", label: t("navigation.customers") },
          { value: "users", label: t("navigation.userManagement") },
          { value: "sales_payment", label: t("reports.salesPayment") || "Sales Payment" },
        ]}
        selectedValues={selectedModules}
        onSelectMultiple={setSelectedModules}
        multiSelect={true}
        placeholder={t("customers.searchPlaceholder")}
      />
      <ModalSelect
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={t("activityLogs.selectActions")}
        options={[
          { value: "created", label: t("activityLogs.created") },
          { value: "updated", label: t("activityLogs.updated") },
          { value: "deleted", label: t("activityLogs.deleted") },
        ]}
        selectedValues={selectedActions}
        onSelectMultiple={setSelectedActions}
        multiSelect={true}
        placeholder={t("customers.searchPlaceholder")}
      />

      {/* Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full lg:w-96">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("activityLogs.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <tr>
                {[
                  t("activityLogs.no") || "No",
                  t("activityLogs.user"),
                  t("activityLogs.action"),
                  t("activityLogs.module"),
                  t("activityLogs.recordId"),
                  t("activityLogs.description"),
                  t("activityLogs.date"),
                ].map((h) => {
                  const sortKey = h === t("activityLogs.date") ? "created_at" : h === t("activityLogs.no") || "No" ? "id" : h === t("activityLogs.recordId") ? "record_id" : h.toLowerCase();
                  const isSortable = ![t("activityLogs.description")].includes(h);
                  return (
                    <th key={h} className={`py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${isSortable ? 'cursor-pointer hover:bg-gray-100' : ''}`} onClick={isSortable ? () => handleSort(sortKey) : undefined}>
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900 font-mono">
                        {(currentPage - 1) * logsPerPage + index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {typeof log.user === 'object' ? log.user?.name || 'Unknown' : log.user || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        log.action === 'created' ? 'bg-green-100 text-green-800' :
                        log.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'deleted' ? 'bg-red-100 text-red-800' :
                        log.action === 'verified' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action === 'created' ? t("activityLogs.created") : log.action === 'updated' ? t("activityLogs.updated") : log.action === 'deleted' ? t("activityLogs.deleted") : log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        log.module === 'sales' ? 'bg-indigo-100 text-indigo-800' :
                        log.module === 'products' ? 'bg-emerald-100 text-emerald-800' :
                        log.module === 'users' ? 'bg-cyan-100 text-cyan-800' :
                        log.module === 'customers' ? 'bg-orange-100 text-orange-800' :
                        log.module === 'suppliers' ? 'bg-pink-100 text-pink-800' :
                        log.module === 'stock_ins' ? 'bg-yellow-100 text-yellow-800' :
                        log.module === 'stock_outs' ? 'bg-teal-100 text-teal-800' :
                        log.module === 'sales_payment' ? 'bg-violet-100 text-violet-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.module.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900 font-mono">
                        {log.record_id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600">
                        {log.description ||
                          `${log.user?.name || 'System'} performed ${log.action} on ${log.module}`}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        {t("activityLogs.noLogsFound")}
                      </p>
                      <p className="text-gray-400 mt-1">
                        {t("activityLogs.logsRecorded")}
                      </p>
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
            {t("common.showing", { start: (currentPage - 1) * logsPerPage + 1, end: Math.min(currentPage * logsPerPage, filteredLogs.length), total: filteredLogs.length })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              {t("common.previous")}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {t("common.next")}
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogPage;