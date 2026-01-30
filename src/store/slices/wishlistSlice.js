import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Async thunks for API calls
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch wishlist');
      }
      
      return data.wishlist.items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlistAPI = createAsyncThunk(
  'wishlist/addToWishlistAPI',
  async ({ userId, product }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image
        })
      });
      
      const data = await response.json();
      
      // If backend is not running or returns error, silently fail and fall back to local storage
      if (!response.ok) {
        // Backend might not be running, return empty result
        return { added: false, wishlist: [] };
      }
      
      return { added: data.added, wishlist: data.wishlist?.items || [] };
    } catch (error) {
      // Silently handle network errors (backend not running)
      return { added: false, wishlist: [] };
    }
  }
);

export const removeFromWishlistAPI = createAsyncThunk(
  'wishlist/removeFromWishlistAPI',
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist/${userId}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      
      // If backend is not running, silently fail
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove from wishlist');
      }
      
      return data.wishlist.items;
    } catch (error) {
      // Silently handle network errors (backend not running)
      return [];
    }
  }
);

export const clearWishlistAPI = createAsyncThunk(
  'wishlist/clearWishlistAPI',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist/${userId}/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear wishlist');
      }
      
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const { product } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (!existingItem) {
        state.items.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image
        });
      }
    },

    removeFromWishlist: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
    },

    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to wishlist (API)
      .addCase(addToWishlistAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlistAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        // Don't update state if backend failed (fallback to local)
        if (action.payload.wishlist) {
          state.items = action.payload.wishlist;
        }
        state.error = null;
      })
      .addCase(addToWishlistAPI.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error for backend failures (fallback to local)
        state.error = null;
      })
      // Remove from wishlist (API)
      .addCase(removeFromWishlistAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromWishlistAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear wishlist (API)
      .addCase(clearWishlistAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearWishlistAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [];
      })
      .addCase(clearWishlistAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToWishlist: addToWishlistLocal,
  removeFromWishlist: removeFromWishlistLocal,
  clearWishlist: clearWishlistLocal,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

