// Centralized environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:59231/api/v1',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  IMGBB_API_KEY: import.meta.env.VITE_IMGBB_API_KEY,
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
};

export const isDevelopment = ENV.APP_ENV === 'development';
export const isProduction = ENV.APP_ENV === 'production';