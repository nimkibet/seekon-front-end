import { API_ORIGIN } from '../config/api.js';

const getAuthToken = () => {
  return localStorage.getItem('token') ||
         sessionStorage.getItem('token') ||
         localStorage.getItem('adminToken') ||
         sessionStorage.getItem('adminToken');
};

const posCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_ORIGIN}/api/pos${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const posApi = {
  // 1. Product Search for Barcodes & SKUs
  searchProducts: (q = '', limit = 1000) => posCall(`/products/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  // Fallback to main store products API
  fetchAllStoreProducts: async () => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/products?limit=1000`);
      if (res.ok) {
        const data = await res.json();
        return data.products || [];
      }
    } catch (e) {
      console.warn('Fallback fetch store products failed:', e.message);
    }
    return [];
  },

  // Customer lookup by phone number
  lookupCustomer: (phone = '') => posCall(`/customers/lookup?phone=${encodeURIComponent(phone)}`),

  // 2. Checkout (supports Walk-In & Social Media POD)
  checkout: (data) => posCall('/checkout', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // 3. Social Media Active Deliveries & POD Reconciliation
  getDeliveries: () => posCall('/deliveries'),

  completeDeliveryPayment: (orderId, data) => posCall(`/orders/${orderId}/complete-payment`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  cancelDelivery: (orderId, data = {}) => posCall(`/orders/${orderId}/cancel-delivery`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // 4. Headless WhatsApp Queue
  getPendingOrders: () => posCall('/orders/pending'),
  dismissPendingOrder: (id) => posCall(`/orders/pending/${id}/dismiss`, {
    method: 'PATCH'
  }),

  // 5. Barcode & Receipt URLs and Direct Download Helpers
  getProductBarcodePdfUrl: (productId, copies = 21) => {
    const token = getAuthToken();
    return `${API_ORIGIN}/api/pos/barcodes/product/${productId}?copies=${copies}&token=${token || ''}`;
  },

  getCategoryBarcodePdfUrl: (category) => {
    const token = getAuthToken();
    return `${API_ORIGIN}/api/pos/barcodes/category/${encodeURIComponent(category)}?token=${token || ''}`;
  },

  getOrderReceiptPdfUrl: (orderId) => {
    return `${API_ORIGIN}/api/pos/receipt/${orderId}`;
  },

  downloadReceiptPdf: async (orderId) => {
    const token = getAuthToken();
    const res = await fetch(`${API_ORIGIN}/api/pos/receipt/${orderId}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!res.ok) throw new Error('Failed to download receipt');
    return res.blob();
  },

  downloadBarcodeSheetPdf: async (productId, copies = 21) => {
    const token = getAuthToken();
    const res = await fetch(`${API_ORIGIN}/api/pos/barcodes/product/${productId}?copies=${copies}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!res.ok) throw new Error('Failed to download barcode sheet');
    return res.blob();
  },

  downloadCategoryBarcodeSheetPdf: async (category) => {
    const token = getAuthToken();
    const res = await fetch(`${API_ORIGIN}/api/pos/barcodes/category/${encodeURIComponent(category)}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!res.ok) throw new Error('Failed to download category barcodes');
    return res.blob();
  }
};
