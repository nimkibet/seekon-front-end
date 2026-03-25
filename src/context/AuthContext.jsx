import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logout, clearError, validateToken } from '../store/slices/userSlice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🔐 AuthProvider initializing...');
  
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error, theme } = useSelector(state => state.user);

  console.log('👤 Auth state:', { user, isAuthenticated, isLoading, error, theme });

  // Check for existing token on mount
  useEffect(() => {
    // Check for token in URL query string (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      console.log('🔍 Token found in URL, saving and validating...');
      localStorage.setItem('token', urlToken);
      // Clean the token from URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
      // Validate the token
      dispatch(validateToken());
    } else {
      // Check for token in localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (token && !isAuthenticated) {
        console.log('🔍 Token found in localStorage, validating...');
        dispatch(validateToken());
      }
    }
  }, [dispatch, isAuthenticated]);

  // Apply theme to document
  useEffect(() => {
    console.log('🎨 Applying theme:', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const login = async (credentials) => {
    return dispatch(loginUser(credentials));
  };

  const register = async (userData) => {
    return dispatch(registerUser(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    theme,
    login,
    register,
    logout: logoutUser,
    clearError: clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

