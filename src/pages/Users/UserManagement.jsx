import React, { useState, useEffect, useCallback } from "react";
import { 
  FaTrash, FaUserSlash, FaEdit, FaCheck, FaTimes, FaClock, 
  FaUserPlus, FaSearch, FaFilter, FaKey 
} from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAuth, ROLES } from "../../context/AuthContext";
import { canManageUser, hasLegacyPermission } from "../../context/AuthContext";
import { ElMessage } from "../../utils/message";
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword, approveUser, rejectUser } from "../../api/adminApi";
import { roleApi } from "../../api";
import { Select } from "../../components/UI";

function UserManagement() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Messages
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    password_confirmation: ""
  });
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role_id: "",
    status: 1
  });
  
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

// Fetch users
   const fetchUsers = useCallback(async (page = 1) => {
     setLoading(true);
     try {
       const params = {
         page,
         role: roleFilter !== "all" ? roleFilter : undefined,
         status: statusFilter !== "all" ? statusFilter : undefined,
         search: searchQuery || undefined
       };
       
       const res = await getUsers(params);
       console.log('Users response:', res);
       
       // Handle different response structures
       if (res?.data) {
         // Demo API format: { data: { data: [...], total: N, current_page: N, last_page: N } }
         // Real API format: { data: { data: [...], total: N, current_page: N, last_page: N } }
         const responseData = res.data;
         const usersData = responseData?.data || responseData;
         setUsers(Array.isArray(usersData) ? usersData : []);
         setCurrentPage(responseData?.current_page || 1);
         setTotalPages(responseData?.last_page || 1);
         setTotalUsers(responseData?.total || 0);
       } else if (Array.isArray(res)) {
         setUsers(res);
         setTotalUsers(res.length);
       }
     } catch (err) {
       console.error('Error fetching users:', err);
       ElMessage.error(err.message || 'Failed to fetch users');
     } finally {
       setLoading(false);
     }
   }, [roleFilter, statusFilter, searchQuery]);

// Fetch roles
   const fetchRoles = useCallback(async () => {
     try {
       const result = await roleApi.getAll();
       const rolesData = result?.data || result?.data?.data || [];
       setRoles(Array.isArray(rolesData) ? rolesData : []);
     } catch (err) {
       console.error('Error fetching roles:', err);
     }
   }, []);

  useEffect(() => {
    fetchUsers(1);
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Handle role filter change
  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchUsers(1);
      }
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchUsers]);

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate passwords match
      if (createForm.password !== createForm.password_confirmation) {
        ElMessage.error('Passwords do not match');
        setSubmitting(false);
        return;
      }
      
      // Manager can only create Staff
      if (currentUser?.role === ROLES.MANAGER && createForm.role !== ROLES.STAFF) {
        ElMessage.error('Manager can only create Staff users');
        setSubmitting(false);
        return;
      }
      
      const userData = {
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        password: createForm.password,
        password_confirmation: createForm.password_confirmation
      };
      
      const res = await createUser(userData);
      
      if (res.success || res.status === 200) {
        ElMessage.success('User created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          email: "",
          role: "",
          password: "",
          password_confirmation: ""
        });
        fetchUsers(1);
      } else {
        ElMessage.error(res.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Create user error:', err);
      ElMessage.error(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    setSubmitting(true);
    
    try {
      // Manager can only update Staff
      if (currentUser?.role === ROLES.MANAGER && selectedUser?.role !== ROLES.STAFF) {
        ElMessage.error('Manager can only edit Staff users');
        setSubmitting(false);
        return;
      }
      
      const userData = {
        name: editForm.name,
        email: editForm.email,
        role_id: editForm.role_id,
        status: editForm.status
      };
      
      const res = await updateUser(selectedUser.id, userData);
      
      if (res.success || res.status === 200) {
        ElMessage.success('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers(currentPage);
      } else {
        ElMessage.error(res.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user error:', err);
      ElMessage.error(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      
      // Check if user can delete
      if (!canManageUser(currentUser, userToDelete)) {
        ElMessage.error('You do not have permission to delete this user');
        return;
      }
      
      // Prevent self-deletion
      if (userId === currentUser?.id) {
        ElMessage.error('You cannot delete your own account');
        return;
      }
      
      const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
      if (!confirmed) return;
      
      const res = await deleteUser(userId);
      
      if (res.success || res.status === 200) {
        ElMessage.success('User deleted successfully!');
        fetchUsers(currentPage);
      } else {
        ElMessage.error(res.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      ElMessage.error(err.message || 'Failed to delete user');
    }
  };

  // Reset user password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
        ElMessage.error('Passwords do not match');
        setSubmitting(false);
        return;
      }
      
      if (resetPasswordForm.newPassword.length < 6) {
        ElMessage.error('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }
      
      const res = await resetUserPassword(selectedUser.id, resetPasswordForm.newPassword);
      
      if (res.success || res.status === 200) {
        ElMessage.success('Password reset successfully!');
        setShowResetPasswordModal(false);
        setResetPasswordForm({ newPassword: "", confirmPassword: "" });
        setSelectedUser(null);
      } else {
        ElMessage.error(res.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      ElMessage.error(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  // Approve user
  const handleApproveUser = async (userId) => {
    const result = await approveUser(userId);
    if (result.success) {
      ElMessage.success('User approved successfully!');
      fetchUsers(currentPage);
    } else {
      ElMessage.error(result.message || 'Failed to approve user');
    }
  };

  // Reject user
  const handleRejectUser = async (userId) => {
    const result = await rejectUser(userId);
    if (result.success) {
      ElMessage.success('User rejected!');
      fetchUsers(currentPage);
    } else {
      ElMessage.error(result.message || 'Failed to reject user');
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role_id: user.role?.id || user.role_id || "",
      status: user.status !== undefined ? user.status : 1
    });
    setShowEditModal(true);
  };

  // Open reset password modal
  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setResetPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowResetPasswordModal(true);
  };

  // Get user status
const getUserStatus = (user) => {
  switch (user.status) {
    case "ACTIVE":
      return {
        label: "Active",
        class: "bg-green-100 text-green-800",
      };

    case "PENDING":
      return {
        label: "Pending",
        class: "bg-yellow-100 text-yellow-800",
      };

    case "INACTIVE":
      return {
        label: "Inactive",
        class: "bg-red-100 text-red-800",
      };

    default:
      return {
        label: "Unknown",
        class: "bg-gray-100 text-gray-800",
      };
  }
};

  // Get role name
  const getRoleName = (role) => {
    if (typeof role === 'string') return role;
    if (role?.name) return role.name;
    return "Unknown";
  };

// Check if can perform action on user
   const canEdit = (user) => canManageUser(currentUser, user);
   const canDelete = (user) => canManageUser(currentUser, user) && user.id !== currentUser?.id;
   const canResetPassword = (user) => hasLegacyPermission(currentUser, 'RESET_USER_PASSWORD') && user.id !== currentUser?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        {hasLegacyPermission(currentUser, 'CREATE_USERS') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FaUserPlus /> Create User
          </button>
        )}
        </div>

        {message.text && (
          <div className={`mb-6 text-center py-3 px-4 rounded-xl font-medium shadow-lg ${
            message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <div className="w-48">
<Select
                   value={roleFilter}
                   onChange={(val) => setRoleFilter(val)}
                   options={[
                     { value: "all", label: "All Roles" },
                     { value: ROLES.ADMIN, label: "Admin" },
                     { value: ROLES.MANAGER, label: "Manager" },
                     { value: ROLES.STAFF, label: "Staff" },
                     { value: ROLES.CASHER, label: "Casher" }
                   ]}
                 />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <div className="w-48">
                <Select
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "PENDING", label: "Pending" },
                    { value: "INACTIVE", label: "Inactive" }
                  ]}
                />
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 flex items-center gap-2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* User Cards */}
        {!loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {users.map((u) => {
              const status = getUserStatus(u);
              return (
                <div key={u.id} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-gray-200 hover:border-blue-300">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{u.name}</h2>
                        <p className="text-gray-500 text-sm">{u.email}</p>
                      </div>
                    </div>
                     {/* Role Badge with color */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                      u.role === ROLES.ADMIN 
                        ? 'bg-purple-100 text-purple-800' 
                        : u.role === ROLES.MANAGER
                        ? 'bg-blue-100 text-blue-800'
                        : u.role === ROLES.STAFF
                        ? 'bg-green-100 text-green-800'
                        : u.role === ROLES.CASHER
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getRoleName(u.role)}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2 text-gray-700">
                    {/* Status-based actions */}
                    {status.label === "Pending" && (
                      <>
                        <button title="Approve" onClick={() => handleApproveUser(u.id)} className="hover:text-green-600 p-2">
                          <FaCheck />
                        </button>
                        <button title="Reject" onClick={() => handleRejectUser(u.id)} className="hover:text-red-600 p-2">
                          <FaTimes />
                        </button>
                      </>
                    )}
                    
                    {status.label === "Active" && (
                      <>
                        {canEdit(u) && (
                          <button title="Edit" onClick={() => openEditModal(u)} className="hover:text-blue-600 p-2">
                            <FaEdit />
                          </button>
                        )}
                        {canResetPassword(u) && (
                          <button title="Reset Password" onClick={() => openResetPasswordModal(u)} className="hover:text-yellow-600 p-2">
                            <FaKey />
                          </button>
                        )}
                        {canDelete(u) && (
                          <button title="Deactivate" onClick={() => updateUser(u.id, { status: 2 })} className="hover:text-yellow-600 p-2">
                            <FaUserSlash />
                          </button>
                        )}
                        {canDelete(u) && (
                          <button title="Delete" onClick={() => handleDeleteUser(u.id)} className="hover:text-red-600 p-2">
                            <FaTrash />
                          </button>
                        )}
                      </>
                    )}
                    
                    {status.label === "Inactive" && canEdit(u) && (
                      <button title="Reactivate" onClick={() => updateUser(u.id, { status: 1 })} className="hover:text-green-600 p-2">
                        <FaCheck />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No users found */}
        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No users found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * 8 + 1} to {Math.min(currentPage * 8, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Previous
              </button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchUsers(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Create New User</h2>
              
              <form onSubmit={handleCreateUser}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-3">
<Select
                     label="Role"
                     value={createForm.role}
                     onChange={(val) => setCreateForm(prev => ({ ...prev, role: val }))}
                     options={[
                       ...(currentUser?.role === ROLES.ADMIN ? [
                         { value: ROLES.ADMIN, label: "Admin" },
                         { value: ROLES.MANAGER, label: "Manager" },
                         { value: ROLES.CASHER, label: "Casher" }
                       ] : []),
                       { value: ROLES.STAFF, label: "Staff" }
                     ]}
                     required
                   />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={createForm.password_confirmation}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                    {submitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {currentUser?.role === ROLES.ADMIN && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editForm.role_id}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role_id: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
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
                  type="button"
                  onClick={handleUpdateUser}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Reset Password for {selectedUser.name}</h2>
              <p className="text-gray-500 mb-4">Enter a new password for this user.</p>
              
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Resetting...' : 'Reset Password'}
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

export default UserManagement;
