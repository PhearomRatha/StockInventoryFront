import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, 
  FiLock, FiEye, FiEyeOff, FiSave, FiArrowLeft,
  FiUserCheck, FiShield
} from "react-icons/fi";
import { useAuth, ROLES } from "../../context/AuthContext";
import { ElMessage } from "../../utils/message";
import { getCurrentUser, updateProfile, changePassword, setPassword } from "../../api/authApi";

function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    created_at: "",
    google_id: null
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: ""
  });
  
  // Password change
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Message
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Check if authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Load user profile from context first
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "",
        created_at: user.created_at || "",
        google_id: user.google_id || null
      });
      setEditForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
    
    setLoading(false);
  }, [user, isAuthenticated, navigate]);

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    try {
      const res = await updateProfile(editForm);
      
      if (res.success || res.status === 200) {
        // Update auth context with new user data
        updateUser({
          ...user,
          ...editForm
        });
        
        setProfile(prev => ({
          ...prev,
          ...editForm
        }));
        
        ElMessage.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        ElMessage.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      ElMessage.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Validate passwords match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.error('New passwords do not match');
        setChangingPassword(false);
        return;
      }
      
      if (passwordForm.newPassword.length < 6) {
        ElMessage.error('Password must be at least 6 characters');
        setChangingPassword(false);
        return;
      }
      
      let res;
      
      // If user has no google_id (regular user), set a new password
      // If user has google_id, change existing password
      if (!profile.google_id) {
        res = await setPassword({
          password: passwordForm.newPassword,
          password_confirmation: passwordForm.confirmPassword
        });
      } else {
        // User has existing password, change it
        res = await changePassword({
          current_password: passwordForm.currentPassword,
          password: passwordForm.newPassword,
          password_confirmation: passwordForm.confirmPassword
        });
      }
      
      if (res.success || res.status === 200) {
        ElMessage.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowPasswordFields(false);
      } else {
        ElMessage.error(res.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      ElMessage.error(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ROLES.STAFF:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-4"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-white text-4xl font-bold">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </span>
              </div>
              <span className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(profile.role)}`}>
                {profile.role || 'User'}
              </span>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-6 text-center py-3 px-4 rounded-xl font-medium ${
                message.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Profile Info */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiUser className="text-indigo-600" /> Personal Information
                </h2>
                
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiUser className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{profile.name || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMail className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiPhone className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{profile.phone || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMapPin className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{profile.address || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiCalendar className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{formatDate(profile.created_at)}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <FiUserCheck /> Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Enter address"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: profile.name,
                            phone: profile.phone,
                            address: profile.address
                          });
                        }}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column - Security */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiShield className="text-indigo-600" /> Security
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  {/* Google Account Info */}
                  {profile.google_id && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <FiMail className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">Google Account</p>
                          <p className="text-sm text-blue-700">Signed in with Google</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Password Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FiLock className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-gray-500">
                            {profile.google_id ? 'Set a password to enable email login' : 'Last changed recently'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
                      >
                        {profile.google_id ? 'Set Password' : 'Change Password'}
                      </button>
                    </div>
                    
                    {/* Password Change Form */}
                    {showPasswordFields && (
                      <form onSubmit={handleChangePassword} className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-medium mb-4">
                          {profile.google_id ? 'Set New Password' : 'Change Password'}
                        </h3>
                        
                        {!profile.google_id && (
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required={!profile.google_id}
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FiLock /> {changingPassword ? 'Changing...' : 'Update Password'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
