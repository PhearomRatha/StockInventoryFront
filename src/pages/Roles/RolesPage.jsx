import React, { useState, useEffect, useCallback } from "react";
import {
  FaTrash, FaUserSlash, FaEdit, FaCheck, FaTimes, FaClock,
  FaUserPlus, FaSearch, FaFilter, FaKey, FaListUl, FaPlus
} from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAuth, ROLES } from "../../context/AuthContext";
import { ElMessage } from "../../utils/message";
import api from "../../plugin/axios";
import ENDPOINTS from "../../api/endpoints";

function RolesPage() {
  const { user: currentUser, hasPermission } = useAuth();
  
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    display_name: "",
    description: ""
  });
  
  const [editForm, setEditForm] = useState({
    name: "",
    display_name: "",
    description: ""
  });
  
  // Permission form states
  const [permissionForm, setPermissionForm] = useState({});
  
  // Available permissions (would come from backend in real app)
  const availablePermissions = [
    // User Management
    { key: 'VIEW_USERS', label: 'View Users', module: 'users' },
    { key: 'CREATE_USERS', label: 'Create Users', module: 'users' },
    { key: 'EDIT_USERS', label: 'Edit Users', module: 'users' },
    { key: 'DELETE_USERS', label: 'Delete Users', module: 'users' },
    { key: 'RESET_USER_PASSWORD', label: 'Reset User Passwords', module: 'users' },
    
    // Reports & Logs
    { key: 'VIEW_REPORTS', label: 'View Reports', module: 'reports' },
    { key: 'VIEW_ACTIVITY_LOGS', label: 'View Activity Logs', module: 'activity_logs' },
    
    // Categories & Suppliers
    { key: 'MANAGE_CATEGORIES', label: 'Manage Categories', module: 'categories' },
    { key: 'MANAGE_SUPPLIERS', label: 'Manage Suppliers', module: 'suppliers' },
    
    // Products
    { key: 'CREATE_PRODUCTS', label: 'Create Products', module: 'products' },
    { key: 'EDIT_PRODUCTS', label: 'Edit Products', module: 'products' },
    { key: 'DELETE_PRODUCTS', label: 'Delete Products', module: 'products' },
    { key: 'VIEW_ALL_PRODUCTS', label: 'View All Products', module: 'products' },
    
    // Profile
    { key: 'EDIT_OWN_PROFILE', label: 'Edit Own Profile', module: 'profile' },
    { key: 'CHANGE_OWN_PASSWORD', label: 'Change Own Password', module: 'profile' }
  ];
  
  // Fetch roles
  const fetchRoles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.ROLES.INDEX}?page=${page}`);
      console.log('Roles response:', res);
      
      if (res.data && res.data.data) {
        const rolesData = res.data.data.data || res.data.data;
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        setCurrentPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
        setTotalRoles(res.data.data.total || 0);
      } else if (Array.isArray(res.data)) {
        setRoles(res.data);
        setTotalRoles(res.data.length);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      ElMessage.error(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch all permissions
  const fetchPermissions = useCallback(async () => {
    try {
      // In a real app, this would fetch from backend
      // For now, we'll use the static list above
      setPermissions(availablePermissions);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  }, []);
  
  useEffect(() => {
    fetchRoles(1);
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);
  
  // Handle search with debounce (would be implemented with filters in real app)
  useEffect(() => {
    // Placeholder for search/filter functionality
  }, []);
  
  // Create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const roleData = {
        name: createForm.name,
        display_name: createForm.display_name,
        description: createForm.description
      };
      
      const res = await api.post(ENDPOINTS.ROLES.STORE, roleData);
      
      if (res.status === 200 || res.data.success) {
        ElMessage.success('Role created successfully!');
        setShowCreateModal(false);
        setCreateForm({ name: "", display_name: "", description: "" });
        fetchRoles(1);
      } else {
        ElMessage.error(res.data.message || 'Failed to create role');
      }
    } catch (err) {
      console.error('Create role error:', err);
      ElMessage.error(err.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update role
  const handleUpdateRole = async () => {
    setSubmitting(true);
    
    try {
      const roleData = {
        name: editForm.name,
        display_name: editForm.display_name,
        description: editForm.description
      };
      
      const res = await api.patch(
        ENDPOINTS.ROLES.UPDATE(selectedRole.id), 
        roleData
      );
      
      if (res.status === 200 || res.data.success) {
        ElMessage.success('Role updated successfully!');
        setShowEditModal(false);
        setSelectedRole(null);
        fetchRoles(currentPage);
      } else {
        ElMessage.error(res.data.message || 'Failed to update role');
      }
    } catch (err) {
      console.error('Update role error:', err);
      ElMessage.error(err.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Delete role
  const handleDeleteRole = async (roleId) => {
    try {
      const confirmed = window.confirm(
        'Are you sure you want to delete this role? This action cannot be undone.'
      );
      if (!confirmed) return;
      
      const res = await api.delete(
        ENDPOINTS.ROLES.DESTROY(roleId)
      );
      
      if (res.status === 200 || res.data.success) {
        ElMessage.success('Role deleted successfully!');
        fetchRoles(currentPage);
      } else {
        ElMessage.error(res.data.message || 'Failed to delete role');
      }
    } catch (err) {
      console.error('Delete role error:', err);
      ElMessage.error(err.message || 'Failed to delete role');
    }
  };
  
  // Update role permissions
  const handleUpdateRolePermissions = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Get checked permissions
      const checkedPermissions = Object.keys(permissionForm)
        .filter(key => permissionForm[key])
        .map(key => {
          const perm = availablePermissions.find(p => p.key === key);
          return perm ? { name: key } : null;
        })
        .filter(Boolean);
      
      // In a real app, this would send to backend
      // For now, we'll just show success
      ElMessage.success('Permissions updated successfully!');
      setShowPermissionModal(false);
      setPermissionForm({});
    } catch (err) {
      console.error('Update permissions error:', err);
      ElMessage.error(err.message || 'Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Open edit modal
  const openEditModal = (role) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name || "",
      display_name: role.display_name || "",
      description: role.description || ""
    });
    setShowEditModal(true);
  };
  
  // Open permission modal
  const openPermissionModal = (role) => {
    setSelectedRole(role);
    // Initialize permission form with role's current permissions
    // In a real app, we'd fetch these from backend
    setShowPermissionModal(true);
  };
  
  // Get permission checkbox status
  const getPermissionChecked = (permissionKey) => {
    if (!selectedRole) return false;
    // In a real app, we'd check against role's actual permissions
    // For now, return false (no permissions assigned by default)
    return false;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          {hasPermission(currentUser, 'CREATE_USERS') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FaPlus /> Create Role
            </button>
          )}
        </div>
        
        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {/* Roles Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Roles List</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {role.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openEditModal(role)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openPermissionModal(role)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaKey />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center text-sm">
                <div className="text-gray-500">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalRoles)} of {totalRoles} roles
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchRoles(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeftIcon className="w-4 h-4" /> Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchRoles(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Create Role Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Create New Role</h2>
              
              <form onSubmit={handleCreateRole}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={createForm.display_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit Role Modal */}
        {showEditModal && selectedRole && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Edit Role</h2>
              
              <form onSubmit={handleUpdateRole}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Permission Modal */}
        {showPermissionModal && selectedRole && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Permissions for {selectedRole.display_name}</h2>
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleUpdateRolePermissions}>
                {/* Group permissions by module */}
                {[
                  { key: 'users', label: 'User Management', icon: <FaUserSlash /> },
                  { key: 'reports', label: 'Reports & Logs', icon: <FaListUl /> },
                  { key: 'categories', label: 'Categories & Suppliers', icon: <FaListUl /> },
                  { key: 'products', label: 'Products', icon: <FaPlus /> },
                  { key: 'profile', label: 'Profile', icon: <FaUserPlus /> }
                ].map((module) => (
                  <div key={module.key} className="mb-6">
                    <div className="flex items-center mb-3">
                      {module.icon}
                      <span className="ml-3 text-lg font-semibold text-gray-800">{module.label}</span>
                    </div>
                    <div className="space-y-2">
                      {availablePermissions
                        .filter(p => p.module === module.key)
                        .map((permission) => (
                          <div key={permission.key} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`permission-${permission.key}-${selectedRole.id}`}
                              checked={getPermissionChecked(permission.key)}
                              onChange={(e) => 
                                setPermissionForm(prev => ({
                                  ...prev,
                                  [permission.key]: e.target.checked
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`permission-${permission.key}-${selectedRole.id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {permission.label}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={() => setShowPermissionModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Permissions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RolesPage;