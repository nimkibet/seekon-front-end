import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiPlus, FiShield, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = search ? { search } : {};
      const data = await adminApi.getUsers(params);
      setUsers(data.users || data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await adminApi.createUser(newUser);
      console.log('User created successfully:', response);
      toast.success('User added successfully');
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      const errorMessage = error.message || 'Failed to add user. Please check your connection.';
      toast.error(errorMessage);
      console.error('Full error details:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminApi.deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'user' || !currentRole ? 'admin' : 'user';
      await adminApi.updateUserStatus(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminApi.updateUserStatus(userId, { status: newStatus });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleColor = (role) => {
    if (role === 'admin' || role === 'superadmin') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    }
    return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Users</h1>
            <p className="text-gray-400">Manage all registered users</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#00A676] hover:bg-[#008A5E] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 mb-4 sm:mb-6">
        <div className="relative">
          <FiSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A676]"
            placeholder="Search by name, email, or phone..."
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        {isLoading ? (
          <div className="p-4 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#00A676] mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 sm:p-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase hidden lg:table-cell">Phone</th>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase hidden xl:table-cell">Joined</th>
                    <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-white font-medium text-sm sm:text-base">{user.name || 'N/A'}</td>
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-300 text-xs sm:text-sm">{user.email}</td>
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-300 hidden lg:table-cell text-xs sm:text-sm">{user.phone || 'N/A'}</td>
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRoleToggle(user._id, user.role)}
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getRoleColor(user.role)}`}
                          title={`Click to change role to ${user.role === 'user' ? 'admin' : 'user'}`}
                        >
                          <FiShield className="inline w-3 h-3 mr-1" />
                          {user.role || 'user'}
                        </button>
                      </td>
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(user._id, user.status)}
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            user.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border-green-500/50'
                              : 'bg-red-500/20 text-red-400 border-red-500/50'
                          }`}
                        >
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-400 text-xs sm:text-sm hidden xl:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete user"
                        >
                          <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border-b border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm sm:text-base">{user.name || 'N/A'}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">{user.email}</p>
                      {user.phone && (
                        <p className="text-gray-500 text-xs mt-1">{user.phone}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors ml-2"
                      title="Delete user"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => handleRoleToggle(user._id, user.role)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${getRoleColor(user.role)}`}
                      title={`Click to change role to ${user.role === 'user' ? 'admin' : 'user'}`}
                    >
                      <FiShield className="inline w-3 h-3 mr-1" />
                      {user.role || 'user'}
                    </button>
                    <button
                      onClick={() => handleStatusToggle(user._id, user.status)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Add New User</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676]"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676]"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676]"
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676]"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <option value="user" className="bg-gray-800 text-white">User</option>
                    <option value="admin" className="bg-gray-800 text-white">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#00A676] hover:bg-[#008A5E] text-white rounded-lg transition-colors"
                >
                  Add User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Delete User</h2>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">{selectedUser.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;



