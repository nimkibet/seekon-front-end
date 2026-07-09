import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiLock, FiCreditCard, FiMail, FiShoppingBag, FiSave, FiPhone, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../config/api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'Seekon Apparel',
    storeEmail: 'admin@seekon.com',
    currency: 'KES',
    taxRate: 16,
    shippingCost: 500,
    freeShippingThreshold: 5000,
    orderExpiryTime: 24,
    lowStockThreshold: 10,
    enableEmails: true,
    enableSMS: false
  });

  const [authorizedPhones, setAuthorizedPhones] = useState([]);
  const [newPhone, setNewPhone] = useState('');
  const [loadingPhones, setLoadingPhones] = useState(false);

  useEffect(() => {
    const fetchPhones = async () => {
      setLoadingPhones(true);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const res = await axios.get(`${API_URL}/settings/authorized-phones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setAuthorizedPhones(res.data.phones);
        }
      } catch (err) {
        console.error('Failed to load authorized phone numbers:', err);
      } finally {
        setLoadingPhones(false);
      }
    };
    fetchPhones();
  }, []);

  const handleAddPhone = () => {
    if (!newPhone.trim()) return;
    const cleaned = newPhone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      toast.error('Invalid phone number format.');
      return;
    }
    if (authorizedPhones.includes(cleaned)) {
      toast.error('Phone number already exists in list.');
      return;
    }
    setAuthorizedPhones(prev => [...prev, cleaned]);
    setNewPhone('');
  };

  const handleRemovePhone = (phone) => {
    setAuthorizedPhones(prev => prev.filter(p => p !== phone));
  };

  const handleSavePhones = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const res = await axios.put(`${API_URL}/settings/authorized-phones`, {
        phones: authorizedPhones
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setAuthorizedPhones(res.data.phones);
        toast.success('Authorized phone numbers updated successfully!');
      }
    } catch (err) {
      console.error('Failed to save authorized phone numbers:', err);
      toast.error('Failed to save phone numbers.');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'notifications', label: 'Notifications', icon: FiMail },
    { id: 'shipping', label: 'Shipping', icon: FiShoppingBag },
    { id: 'status_cms', label: 'WhatsApp Status', icon: FiPhone }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (activeTab === 'status_cms') {
      await handleSavePhones();
    } else {
      toast.success('Settings saved successfully!');
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleSettingChange('storeName', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Store Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white"
                style={{ color: 'white', backgroundColor: '#1f2937' }}
              >
                <option value="KES" style={{ backgroundColor: '#1f2937', color: 'white' }}>KES - Kenyan Shilling</option>
                <option value="USD" style={{ backgroundColor: '#1f2937', color: 'white' }}>USD - US Dollar</option>
                <option value="EUR" style={{ backgroundColor: '#1f2937', color: 'white' }}>EUR - Euro</option>
                <option value="GBP" style={{ backgroundColor: '#1f2937', color: 'white' }}>GBP - British Pound</option>
                <option value="UGX" style={{ backgroundColor: '#1f2937', color: 'white' }}>UGX - Ugandan Shilling</option>
                <option value="TZS" style={{ backgroundColor: '#1f2937', color: 'white' }}>TZS - Tanzanian Shilling</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleSettingChange('taxRate', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Name</label>
                  <input
                    type="text"
                    value="Admin User"
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value="admin@seekon.com"
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <input
                    type="text"
                    value="Super Admin"
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Confirm new password"
                  />
                </div>
                <button className="w-full bg-[#00A676] hover:bg-[#008A5E] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Update Password
                </button>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Two-Factor Authentication</h3>
              <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiCreditCard className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-white">Card Payments</h4>
                      <p className="text-sm text-gray-400">Visa, MasterCard, Amex</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A676]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiMail className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="font-semibold text-white">M-Pesa</h4>
                      <p className="text-sm text-gray-400">Mobile money payment</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A676]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Order Confirmations</h4>
                    <p className="text-sm text-gray-400">Receive email when orders are placed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A676]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Stock Alerts</h4>
                    <p className="text-sm text-gray-400">Get notified when stock is low</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A676]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">SMS Notifications</h4>
                    <p className="text-sm text-gray-400">Enable SMS alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A676]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Shipping Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Cost (KES)</label>
                  <input
                    type="number"
                    value={settings.shippingCost}
                    onChange={(e) => handleSettingChange('shippingCost', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Free Shipping Threshold (KES)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleSettingChange('freeShippingThreshold', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order Expiry Time (hours)</label>
                  <input
                    type="number"
                    value={settings.orderExpiryTime}
                    onChange={(e) => handleSettingChange('orderExpiryTime', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleSettingChange('lowStockThreshold', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'status_cms':
        return (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20 animate-fadeIn">
              <h3 className="text-lg font-bold text-white mb-2">WhatsApp Status Admin Settings</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Specify which admin WhatsApp phone numbers are authorized to broadcast status updates to the storefront. 
                Any status updates posted by these phone numbers will be automatically processed and displayed on the storefront.
              </p>

              {loadingPhones ? (
                <div className="text-white py-4 text-center">Loading settings...</div>
              ) : (
                <div className="space-y-6">
                  {/* Add Phone Number Input */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. 254700000000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPhone()}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A676]"
                    />
                    <button
                      onClick={handleAddPhone}
                      className="px-5 py-2 bg-[#00A676] hover:bg-[#008A5E] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Phone Numbers List */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Authorized Phone Numbers</label>
                    {authorizedPhones.length === 0 ? (
                      <p className="text-gray-500 text-sm italic py-2">No phone numbers configured. The system will fall back to environment variables list.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
                        {authorizedPhones.map(phone => (
                          <div key={phone} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white">
                            <span className="font-mono text-sm tracking-wide">{phone}</span>
                            <button
                              onClick={() => handleRemovePhone(phone)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded-full transition-all"
                              title="Remove number"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your store preferences and configurations</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-[#00A676] hover:bg-[#008A5E] text-white font-bold rounded-lg transition-colors"
        >
          <FiSave className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00A676] text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default AdminSettings;
