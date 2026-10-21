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
  searchProducts: (q = '') => posCall(`/products/search?q=${encodeURIComponent(q)}`),

  // 2. Checkout
  checkout: (data) => posCall('/checkout', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // 3. Headless WhatsApp Queue
  getPendingOrders: () => posCall('/orders/pending'),
  dismissPendingOrder: (id) => posCall(`/orders/pending/${id}/dismiss`, {
    method: 'PATCH'
  }),

  // 4. Barcode URLs (for direct PDF stream in new tab or download)
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
  }
};
