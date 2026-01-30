const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  // Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrder: (id) => apiCall(`/orders/${id}`),
  updateOrderStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  cancelOrder: (id) => apiCall(`/orders/${id}/cancel`, { method: 'PATCH' }),
};

export default adminApi;

