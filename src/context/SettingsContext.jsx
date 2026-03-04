import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [flashSaleSettings, setFlashSaleSettings] = useState({
    isActive: false,
    endTime: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getFlashSaleSettings();
        setFlashSaleSettings({
          isActive: settings?.isActive || false,
          endTime: settings?.endTime || null
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateFlashSaleSettings = (newSettings) => {
    setFlashSaleSettings(newSettings);
  };

  const value = {
    flashSaleSettings,
    updateFlashSaleSettings,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
