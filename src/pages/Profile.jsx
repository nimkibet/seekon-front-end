import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { validateToken } from '../store/slices/userSlice';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiEdit2 } from 'react-icons/fi';
import { uploadAvatarToCloudinary } from '../utils/cloudinary';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [avatar, setAvatar] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
      // Priority: user.avatar (from backend) > localStorage > null
      const avatarSource = user.avatar || user.profilePhoto || localStorage.getItem('userAvatar') || null;
      setAvatar(avatarSource);
      
      // If we have a backend profilePhoto, save it to localStorage for persistence
      if (user.avatar || user.profilePhoto) {
        localStorage.setItem('userAvatar', user.avatar || user.profilePhoto);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setIsUploadingAvatar(true);
      
      try {
        // Upload to Cloudinary avatars folder
        const uploadResult = await uploadAvatarToCloudinary(file);
        setAvatar(uploadResult.url);
        localStorage.setItem('userAvatar', uploadResult.url);
        toast.success('Profile photo uploaded successfully! Click Save to save changes.');
      } catch (error) {
        console.error('Avatar upload error:', error);
        toast.error('Failed to upload image. Please try again.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phoneNumber && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      // Update user profile via API
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          profilePhoto: avatar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Always save profile photo to localStorage for persistence
      if (avatar) {
        localStorage.setItem('userAvatar', avatar);
      }

      // Update local storage avatar if changed
      if (avatar && data.user?.profilePhoto) {
        localStorage.setItem('userAvatar', data.user.profilePhoto);
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh user data from backend to get updated profile
      setTimeout(async () => {
        try {
          const updatedUser = await dispatch(validateToken()).unwrap();
          if (updatedUser) {
            // Update form data after refresh
            setFormData({
              name: updatedUser.name || '',
              email: updatedUser.email || '',
              phoneNumber: updatedUser.phoneNumber || '',
              address: updatedUser.address || '',
            });
            // Update avatar from backend response
            const newAvatar = updatedUser.avatar || updatedUser.profilePhoto || localStorage.getItem('userAvatar') || null;
            setAvatar(newAvatar);
            // Save to localStorage for persistence
            if (updatedUser.avatar || updatedUser.profilePhoto) {
              localStorage.setItem('userAvatar', updatedUser.avatar || updatedUser.profilePhoto);
            }
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }, 500);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00A676] to-[#008A5E] px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Edit Profile
                </h1>
                <p className="text-green-100 text-sm sm:text-base">
                  Manage your account information and preferences
                </p>
              </div>
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-[#00A676] rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-lg relative flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    {isUploadingAvatar ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A676]"></div>
                      </div>
                    ) : avatar ? (
                      <img
                        src={avatar}
                        alt={formData.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  {isEditing && !isUploadingAvatar && (
                    <label className="absolute bottom-0 right-0 p-3 bg-[#00A676] rounded-full cursor-pointer hover:bg-[#008A5E] transition-colors duration-200 shadow-lg">
                      <FiCamera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {formData.name || 'User Name'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  {formData.email || 'user@example.com'}
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiUser className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed'
                    } ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed'
                    } ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiPhone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed'
                    } ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-2" />
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed'
                    }`}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data to original values
                      if (user) {
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          phoneNumber: user.phoneNumber || '',
                          address: user.address || '',
                        });
                        setAvatar(user.avatar || localStorage.getItem('userAvatar') || null);
                      }
                      setErrors({});
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#00A676] text-white rounded-lg font-semibold hover:bg-[#008A5E] transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </form>

            {/* Account Info Section */}
            {!isEditing && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {user?.role || 'User'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
