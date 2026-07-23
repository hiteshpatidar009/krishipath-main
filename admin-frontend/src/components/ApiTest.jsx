import { useState, useEffect } from 'react';
import { productAPI, authAPI, axiosInstance } from '../services';

const ApiTest = () => {
  const [status, setStatus] = useState({
    config: '⏳ Testing...',
    products: '⏳ Testing...',
    auth: '⏳ Testing...',
    instance: '⏳ Testing...'
  });

  useEffect(() => {
    testConfiguration();
    testProductAPI();
    testAuthAPI();
    testAxiosInstance();
  }, []);

  const testConfiguration = () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const env = import.meta.env.VITE_APP_ENV;
      
      if (baseURL && env) {
        setStatus(prev => ({ 
          ...prev, 
          config: `✅ Config OK - ${env} (${baseURL})` 
        }));
      } else {
        setStatus(prev => ({ 
          ...prev, 
          config: '❌ Environment variables missing' 
        }));
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        config: `❌ Config Error: ${error.message}` 
      }));
    }
  };

  const testProductAPI = async () => {
    try {
      if (productAPI.getAll && productAPI.create && productAPI.update) {
        setStatus(prev => ({ 
          ...prev, 
          products: '✅ Product API methods available' 
        }));
      } else {
        setStatus(prev => ({ 
          ...prev, 
          products: '❌ Product API methods missing' 
        }));
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        products: `❌ Product API Error: ${error.message}` 
      }));
    }
  };

  const testAuthAPI = () => {
    try {
      if (authAPI.loginAdmin && authAPI.logout) {
        setStatus(prev => ({ 
          ...prev, 
          auth: '✅ Auth API methods available' 
        }));
      } else {
        setStatus(prev => ({ 
          ...prev, 
          auth: '❌ Auth API methods missing' 
        }));
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        auth: `❌ Auth API Error: ${error.message}` 
      }));
    }
  };

  const testAxiosInstance = () => {
    try {
      if (axiosInstance.defaults.baseURL && axiosInstance.interceptors) {
        setStatus(prev => ({ 
          ...prev, 
          instance: `✅ Axios Instance OK (${axiosInstance.defaults.baseURL})` 
        }));
      } else {
        setStatus(prev => ({ 
          ...prev, 
          instance: '❌ Axios Instance not configured' 
        }));
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        instance: `❌ Axios Instance Error: ${error.message}` 
      }));
    }
  };

  const testLiveAPI = async () => {
    try {
      setStatus(prev => ({ ...prev, products: '⏳ Testing live API...' }));
      const response = await productAPI.getAll();
      setStatus(prev => ({ 
        ...prev, 
        products: `✅ Live API works! (${response.data?.length || 0} products)` 
      }));
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        products: `❌ Live API failed: ${error.message}` 
      }));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 API Architecture Test</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Environment Config:</strong> {status.config}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Product API:</strong> {status.products}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Auth API:</strong> {status.auth}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Axios Instance:</strong> {status.instance}
      </div>

      <button 
        onClick={testLiveAPI}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Live API Connection
      </button>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Environment Variables:</strong></p>
        <p>VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
        <p>VITE_APP_ENV: {import.meta.env.VITE_APP_ENV || 'Not set'}</p>
        <p>VITE_ENABLE_LOGGING: {import.meta.env.VITE_ENABLE_LOGGING || 'Not set'}</p>
      </div>
    </div>
  );
};

export default ApiTest;