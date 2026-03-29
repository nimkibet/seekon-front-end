import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  isLoading: false,
  error: null,
};

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://seekon-backend.railway.internal';

// Helper to flatten nested API product data for the UI
const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const p = item.product || {};
    return {
      ...item,
      id: item.productId || p._id || item.id,
      name: item.name || p.name || 'Unknown Product',
      brand: item.brand || p.brand || 'Seekon',
      price: Number(item.price !== undefined ? item.price : (p.price || 0)),
      image: item.image || p.images?.[0]?.url || p.images?.[0] || p.image || '/placeholder.png'
    };
  });
};

/**
 * SECURITY FIX: Removed userId from API URLs
 * The backend now uses the JWT token to identify the user (req.user._id)
 * This prevents IDOR (Insecure Direct Object Reference) attacks where
 * a malicious user could try to access/modify another user's cart
 * by changing the userId in the URL
 */

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      // FIX: Check both 'token' and 'adminToken' keys for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // SECURITY: No userId in URL - backend uses token
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartAPI = createAsyncThunk(
  'cart/addToCartAPI',
  async ({ product, size, color, quantity = 1 }, { rejectWithValue }) => {
    try {
      // FIX: Check both 'token' and 'adminToken' keys for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      console.log('🛒 ADD_TO_CART: Token exists:', !!token);
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      /**
       * SECURITY FIX: Only send minimal data to backend
       * Backend will verify product exists and fetch authentic data (price, name, etc.)
       * from the database. This prevents price manipulation attacks.
       */
      const response = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id || product._id,
          size,
          color,
          quantity
          // SECURITY: Do NOT send price, name, brand, image
          // Backend fetches these from database to prevent tampering
        })
      });
      
      console.log('🛒 ADD_TO_CART: Response status:', response.status);
      
      const data = await response.json();
      console.log('🛒 ADD_TO_CART: Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      
      return data.cart;
    } catch (error) {
      console.error('🛒 ADD_TO_CART: Error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuantityAPI = createAsyncThunk(
  'cart/updateQuantityAPI',
  async ({ productId, size, color, quantity }, { rejectWithValue }) => {
    try {
      // FIX: Check both 'token' and 'adminToken' keys for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // FIX: Ensure productId is a valid string, not an object
      const productIdStr = productId?._id || productId;
      if (!productIdStr || typeof productIdStr !== 'string') {
        return rejectWithValue('Invalid product ID');
      }
      
      // SECURITY: No userId in URL - backend uses token
      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: productIdStr, size, color, quantity })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }
      
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartAPI = createAsyncThunk(
  'cart/removeFromCartAPI',
  async ({ productId, size, color }, { rejectWithValue }) => {
    try {
      // FIX: Check both 'token' and 'adminToken' keys for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // FIX: Ensure productId is a valid string, not an object
      const productIdStr = productId?._id || productId;
      if (!productIdStr || typeof productIdStr !== 'string') {
        return rejectWithValue('Invalid product ID');
      }
      
      // SECURITY: No userId in URL - backend uses token
      const response = await fetch(`${API_URL}/api/cart/remove/${productIdStr}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove from cart');
      }
      
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAPI = createAsyncThunk(
  'cart/clearCartAPI',
  async (_, { rejectWithValue }) => {
    try {
      // FIX: Check both 'token' and 'adminToken' keys for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // SECURITY: No userId in URL - backend uses token
      const response = await fetch(`${API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }
      
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// FIX ISSUE #2: Add async thunk for updating cart item variant (size/color) to sync with backend
export const updateCartItemVariantAPI = createAsyncThunk(
  'cart/updateCartItemVariantAPI',
  async ({ productId, size, color }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('Authentication required');
      }

      // Ensure productId is a valid string
      const productIdStr = productId?._id || productId;
      if (!productIdStr || typeof productIdStr !== 'string') {
        return rejectWithValue('Invalid product ID');
      }

      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: productIdStr, size, color })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart item variant');
      }

      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, size, color, quantity = 1 } = action.payload;
      
      // Get product ID - check both id and _id (MongoDB uses _id)
      const productId = product.id || product._id;
      
      // Check for existing item (match by product id and color)
      const existingItem = state.items.find(
        item => {
          if (item.id === productId && item.color === color) {
            // If size is null, match items with null size
            if (size === null || size === undefined) {
              return item.size === null || item.size === undefined;
            }
            // Otherwise match exact size
            return item.size === size;
          }
          return false;
        }
      );

      if (existingItem) {
        // Increase quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item - store BOTH id and productId for compatibility
        state.items.push({
          id: productId,
          productId: productId, // Store as productId for backend compatibility
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image,
          size,
          color,
          quantity,
        });
      }

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    removeFromCart: (state, action) => {
      // Safely handle both _id and id
      const idToRemove = action.payload._id || action.payload.id || action.payload;
      const size = action.payload.size;
      const color = action.payload.color;
      
      state.items = state.items.filter(
        item => !((item._id || item.id) === idToRemove && item.size === size && item.color === color)
      );

      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    updateQuantity: (state, action) => {
      // Safely handle both _id and id
      const idToUpdate = action.payload._id || action.payload.id || action.payload;
      const size = action.payload.size;
      const color = action.payload.color;
      const quantity = action.payload.quantity;
      
      const item = state.items.find(
        item => (item._id || item.id) === idToUpdate && item.size === size && item.color === color
      );

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(
            cartItem => !((cartItem._id || cartItem.id) === idToUpdate && cartItem.size === size && cartItem.color === color)
          );
        } else {
          item.quantity = quantity;
        }

        // Update totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    },

    // Update cart item variant (size/color)
    updateCartItemVariant: (state, action) => {
      const { cartItemId, newSize, newColor } = action.payload;
      
      // Find the item to update
      const itemToUpdate = state.items.find(
        item => (item._id || item.id || item.cartItemId) === cartItemId
      );
      
      if (!itemToUpdate) return;
      
      // Check if new variant already exists in cart
      const existingVariant = state.items.find(
        item => 
          item !== itemToUpdate && 
          (item.id === itemToUpdate.id || item.productId === itemToUpdate.productId) && 
          item.size === newSize && 
          item.color === newColor
      );
      
      if (existingVariant) {
        // Merge quantities and remove old item
        existingVariant.quantity += itemToUpdate.quantity;
        state.items = state.items.filter(
          item => item !== itemToUpdate
        );
        console.log('🛒 Merged cart items - new quantity:', existingVariant.quantity);
      } else {
        // Just update the variant
        itemToUpdate.size = newSize;
        itemToUpdate.color = newColor;
        console.log('🛒 Updated cart item variant:', newSize, newColor);
      }
      
      // Update totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Sync to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = normalizeCartItems(action.payload.items);
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        // Sync to localStorage to prevent ghost data
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalItems', state.totalItems.toString());
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to cart (API)
      .addCase(addToCartAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = normalizeCartItems(action.payload.items);
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        // Sync to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalItems', state.totalItems.toString());
      })
      .addCase(addToCartAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update quantity (API)
      .addCase(updateQuantityAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuantityAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = normalizeCartItems(action.payload.items);
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        // Sync to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalItems', state.totalItems.toString());
      })
      .addCase(updateQuantityAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from cart (API)
      .addCase(removeFromCartAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = normalizeCartItems(action.payload.items);
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        // Sync to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalItems', state.totalItems.toString());
      })
      .addCase(removeFromCartAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear cart (API)
      .addCase(clearCartAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCartAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = normalizeCartItems(action.payload.items);
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        // Sync to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalItems', state.totalItems.toString());
      })
      .addCase(clearCartAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update cart item variant (API) - FIX ISSUE #2
      .addCase(updateCartItemVariantAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemVariantAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = normalizeCartItems(action.payload.items);
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        // Sync to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalItems', state.totalItems.toString());
      })
      .addCase(updateCartItemVariantAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateCartItemVariant,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;
