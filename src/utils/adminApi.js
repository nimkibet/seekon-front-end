const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}/api/admin${endpoint}`, config);
    
    if (!response.ok) {
      // Try to get error message from response
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      console.error('API Error:', errorData);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Network or API Error:', error);
    throw error;
  }
};

// Admin API Functions
export const adminApi = {
  // Dashboard Stats
  getStats: () => apiCall('/stats'),
  
  // Analytics - Dedicated endpoint for real analytics data
  getAnalytics: (period = 'month') => apiCall('/analytics?period=' + period),

  // Transactions
  getTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/transactions${queryString ? `?${queryString}` : ''}`);
  },
  getTransaction: (id) => apiCall(`/transactions/${id}`),
  exportTransactions: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/admin/transactions/export/csv`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    return { success: true };
  },

  // Users
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users${queryString ? `?${queryString}` : ''}`);
  },
  getUser: (id) => apiCall(`/users/${id}`),
  createUser: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateUserStatus: (id, updateData) => apiCall(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  }),
  deleteUser: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getProduct: (id) => apiCall(`/products/${id}`),
  createProduct: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  updateProduct: (id, productData) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  deleteProduct: (id) => apiCall(`/products/${id}`, { method: 'DELETE' }),

  // Settings
  updateFlashSaleSettings: async (settings) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/settings/flash-sale`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update settings');
    }
    
    return response.json();
  },

  // Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrder: (id) => apiCall(`/orders/${id}`),
  updateOrderStatus: (id, updateData) => apiCall(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  }),
  cancelOrder: (id) => apiCall(`/orders/${id}/cancel`, { method: 'PATCH' }),
  deleteOrder: (id) => apiCall(`/orders/${id}`, { method: 'DELETE' }),
  
  // Cleanup abandoned orders
  cleanupAbandonedOrders: () => apiCall('/cleanup-abandoned', { method: 'DELETE' }),

  // Notifications
  getNotifications: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },
  markNotificationRead: (id) => {
    const token = getAuthToken();
    return fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }).then(res => res.json());
  },
  markAllNotificationsRead: () => {
    const token = getAuthToken();
    return fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }).then(res => res.json());
  },

  // Coupons
  getCoupons: () => apiCall('/coupons'),
  createCoupon: (couponData) => apiCall('/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData),
  }),
  updateCoupon: (id, couponData) => apiCall(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(couponData),
  }),
  deleteCoupon: (id) => apiCall(`/coupons/${id}`, { method: 'DELETE' }),
  toggleCouponStatus: (id) => apiCall(`/coupons/${id}/toggle`, { method: 'PATCH' }),
};

export default adminApi;

