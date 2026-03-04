import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const CurrencyContext = createContext();

// Default exchange rate fallback
const DEFAULT_EXCHANGE_RATE = 130;

// API URL for settings
const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app';

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  // Initialize state lazily from localStorage
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('seekon_currency') || 'KES';
    }
    return 'KES';
  });

  // Exchange rate state - fetched from API
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);

  // Fetch exchange rate from API on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/exchange-rate`);
        const data = await response.json();
        if (data.success && data.rate) {
          setExchangeRate(data.rate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Keep default rate on error
      }
    };

    fetchExchangeRate();
  }, []);

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('seekon_currency', currency);
  }, [currency]);

  // Toggle between KES and USD
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'KES' ? 'USD' : 'KES');
  };

  // Format price based on active currency
  const formatPrice = (amountInKsh) => {
    if (!amountInKsh && amountInKsh !== 0) return '';
    
    if (currency === 'USD') {
      const usdAmount = amountInKsh / exchangeRate;
      return '$' + usdAmount.toFixed(2);
    }
    return 'KSh ' + amountInKsh.toLocaleString();
  };

  const value = {
    currency,
    exchangeRate,
    toggleCurrency,
    formatPrice
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
