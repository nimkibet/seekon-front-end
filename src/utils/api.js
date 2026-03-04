import axios from 'axios';

// Use environment variable for deployment, fallback to production URL for development
// Ensure baseURL always ends with /api for correct routing
let apiUrl = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app/api';
if (!apiUrl.endsWith('/api')) {
  apiUrl = apiUrl + '/api';
}
const API_BASE_URL = apiUrl;

// Create axios instance with default config
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Auth Token to every request
client.interceptors.request.use(
  (config) => {
    // FIX: Check both 'token' and 'adminToken' keys for compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to standardise error responses
const handleApiError = (error, context) => {
  console.error(`API Error (${context}):`, error.response?.data || error.message);
  const message = error.response?.data?.message || error.message || 'Something went wrong';
  throw new Error(message);
};

export const getOrders = async () => {
  try {
    // Get user's orders from backend
    const response = await client.get('/orders/my-orders'); 
    return response.data;
  } catch (error) {
    // Fallback if endpoint doesn't exist yet
    console.warn('getOrders endpoint might be missing on backend');
    return []; 
  }
};

export const api = {
  // ==========================================
  // 🛍️ PRODUCTS
  // ==========================================
  getProducts: async (filters = {}) => {
    try {
      // Pass filters (category, price, etc.) as query parameters
      const response = await client.get('/products', { params: filters });
      return response.data.products || response.data; 
    } catch (error) {
      handleApiError(error, 'getProducts');
    }
  },

  getProduct: async (id) => {
    try {
      const response = await client.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getProduct');
    }
  },

  // ==========================================
  // 👤 AUTHENTICATION
  // ==========================================
  login: async (credentials) => {
    try {
      const response = await client.post('/auth/login', credentials);
      // Save token immediately upon successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      handleApiError(error, 'login');
    }
  },

  register: async (userData) => {
    try {
      const response = await client.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      handleApiError(error, 'register');
    }
  },

  getProfile: async () => {
    try {
      const response = await client.get('/auth/me');
      return response.data;
    } catch (error) {
      handleApiError(error, 'getProfile');
    }
  },

  // ==========================================
  // ⚙️ SETTINGS
  // ==========================================
  // HARDCODED FIX for Flash Sale - directly calling verified backend endpoint
  getFlashSaleSettings: async () => {
    try {
      const response = await axios.get('https://seekonbackend-production.up.railway.app/api/settings/flash-sale');
      console.log('Flash Sale Settings Response:', response.data);
      return response.data || { isActive: false, endTime: null };
    } catch (error) {
      console.error('Flash Sale Settings Error:', error.message);
      return { isActive: false, endTime: null };
    }
  },

  // ==========================================
  // 📦 ORDERS & PAYMENTS
  // ==========================================
  createOrder: async (orderData) => {
    try {
      // Mapping 'createOrder' to M-Pesa STK Push for now, as it's the primary action
      // You might want to split this into 'createOrder' (DB) and 'pay' (M-Pesa) later
      const paymentPayload = {
        phoneNumber: orderData.shippingAddress?.phone, // Ensure phone is passed
        amount: orderData.total,
        userEmail: orderData.userEmail || 'guest@seekon.com'
      };

      const response = await client.post('/payment/stk-push', paymentPayload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'createOrder/Payment');
    }
  },

  getOrders: async () => {
    try {
      // Get user's orders from backend
      const response = await client.get('/orders/my-orders'); 
      return response.data;
    } catch (error) {
      // Fallback if endpoint doesn't exist yet
      console.warn('getOrders endpoint might be missing on backend');
      return []; 
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      const response = await client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getOrderDetails');
    }
  },

  // ==========================================
  // 🤖 AI & UTILS
  // ==========================================
  // Note: For best results, use the openaiService.js directly in your components
  // This is kept for backward compatibility if any component calls api.sendChatMessage
  sendChatMessage: async (message, userId) => {
    // We mock this locally or call a backend proxy if you want to hide the OpenAI key
    // For now, returning a basic response to prevent errors
    return {
      message: "I'm connected to the backend now! Please ensure openaiService is used for smart responses.",
      suggestions: ['Shop Nike', 'Check Orders', 'Contact Support']
    };
  },

  // ==========================================
  // ⭐ REVIEWS
  // ==========================================
  addReview: async (productId, reviewData) => {
    try {
      // Send productId both in URL and in body for robustness
      const response = await client.post(`/products/${productId}/reviews`, {
        ...reviewData,
        productId: productId
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'addReview');
    }
  },

  checkCanReview: async (productId) => {
    try {
      const response = await client.get(`/products/${productId}/can-review`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'checkCanReview');
    }
  },
};