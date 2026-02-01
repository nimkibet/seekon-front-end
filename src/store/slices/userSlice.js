import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserAvatar, setUserAvatar, cleanupOldAvatarKeys } from '../../utils/userAvatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Clean up old shared avatar keys on initialization
cleanupOldAvatarKeys();

// Real login with backend API
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

             if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('adminToken', data.token); // For admin compatibility
                
                // Store profile photo in user-specific localStorage key
                const userId = data.user.id || data.user._id;
                if (data.user.profilePhoto) {
                  setUserAvatar(userId, data.user.profilePhoto);
                }
                
                return {
                  id: data.user.id,
                  _id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  role: data.user.role || 'user',
                  avatar: data.user.profilePhoto || getUserAvatar(userId) || null,
                  phoneNumber: data.user.phoneNumber || '',
                  address: data.user.address || '',
                  createdAt: data.user.createdAt
                };
              } else {
                return rejectWithValue(data.message || 'Login failed');
              }
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Login failed. Please ensure the server is running.');
    }
  }
);

// Validate token and get current user
export const validateToken = createAsyncThunk(
  'user/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        return rejectWithValue(data.message || 'Invalid token');
      }

             if (data.success) {
                const userId = data.user.id || data.user._id;
                return {
                  id: data.user.id || data.user._id,
                  _id: data.user.id || data.user._id,
                  name: data.user.name,
                  email: data.user.email,
                  role: data.user.role || 'user',
                  avatar: data.user.profilePhoto || getUserAvatar(userId) || null,
                  phoneNumber: data.user.phoneNumber || '',
                  address: data.user.address || '',
                  createdAt: data.user.createdAt
                };
              } else {
                return rejectWithValue(data.message || 'Token validation failed');
              }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Real register with backend API
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      });

      // Handle network errors before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();

             if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('adminToken', data.token);
                
                // Store profile photo in user-specific localStorage key
                const userId = data.user.id || data.user._id;
                if (data.user.profilePhoto) {
                  setUserAvatar(userId, data.user.profilePhoto);
                }
                
                return {
                  id: data.user.id,
                  _id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  role: data.user.role || 'user',
                  avatar: data.user.profilePhoto || getUserAvatar(userId) || null,
                  phoneNumber: data.user.phoneNumber || '',
                  address: data.user.address || '',
                  createdAt: data.user.createdAt
                };
              } else {
                return rejectWithValue(data.message || 'Registration failed');
              }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Better error messages for different scenarios
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return rejectWithValue('Unable to connect to server. Please check your internet connection and ensure the backend is running.');
      }
      
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to send password reset email');
      }

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      return rejectWithValue(error.message || 'Failed to send password reset email');
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

// Verify email thunk
export const verifyEmail = createAsyncThunk(
  'user/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Email verification failed');
      }

      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      return rejectWithValue(error.message || 'Email verification failed');
    }
  }
);

// Resend verification email thunk
export const resendVerificationEmail = createAsyncThunk(
  'user/resendVerificationEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to resend verification email');
      }

      return data;
    } catch (error) {
      console.error('Resend verification error:', error);
      return rejectWithValue(error.message || 'Failed to resend verification email');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  theme: 'light', // 'light' or 'dark'
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    updateAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate Token
      .addCase(validateToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Save profile photo to user-specific localStorage when user data is loaded
        const userId = action.payload?.id || action.payload?._id;
        if (action.payload?.avatar || action.payload?.profilePhoto) {
          setUserAvatar(userId, action.payload.avatar || action.payload.profilePhoto);
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Don't show error for missing token (user just not logged in)
        if (action.payload !== 'No token found') {
          state.error = action.payload;
        }
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Save profile photo to user-specific localStorage when user logs in
        const userId = action.payload?.id || action.payload?._id;
        if (action.payload?.avatar || action.payload?.profilePhoto) {
          setUserAvatar(userId, action.payload.avatar || action.payload.profilePhoto);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Save profile photo to user-specific localStorage when user registers
        const userId = action.payload?.id || action.payload?._id;
        if (action.payload?.avatar || action.payload?.profilePhoto) {
          setUserAvatar(userId, action.payload.avatar || action.payload.profilePhoto);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Resend Verification Email
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, toggleTheme, setTheme } = userSlice.actions;
// validateToken is already exported above as export const validateToken
export default userSlice.reducer;
