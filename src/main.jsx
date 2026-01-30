import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

console.log('🚀 Starting Seekon App initialization...');
console.log('📦 React version:', React.version);
console.log('🌍 Environment:', import.meta.env.MODE);

try {
  const rootElement = document.getElementById('root');
  console.log('🎯 Root element found:', !!rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found in DOM');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('⚛️ React root created successfully');
  
  root.render(
    <React.StrictMode>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1500,
          style: {
            background: '#1F1F1F',
            color: '#FAFAFA',
            border: '1px solid #00A676',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#00A676',
              secondary: '#FAFAFA',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#FAFAFA',
            },
          },
        }}
      />
    </React.StrictMode>
  );
  
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error during app initialization:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: red; font-family: Arial, sans-serif;">
      <h1>🚨 App Initialization Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Stack:</strong></p>
      <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px;">${error.stack}</pre>
    </div>
  `;
}

