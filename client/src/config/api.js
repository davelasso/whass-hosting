const API_URL = import.meta.env.VITE_API_URL || 'https://whass-production.up.railway.app/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  
  // Servers
  SERVERS: `${API_URL}/servers`,
  SERVER_DETAIL: (id) => `${API_URL}/servers/${id}`,
  SERVER_START: (id) => `${API_URL}/servers/${id}/start`,
  SERVER_STOP: (id) => `${API_URL}/servers/${id}/stop`,
  SERVER_RESTART: (id) => `${API_URL}/servers/${id}/restart`,
  SERVER_CONSOLE: (id) => `${API_URL}/servers/${id}/console`,
  
  // User
  USER_PROFILE: `${API_URL}/users/profile`,
  UPDATE_PROFILE: `${API_URL}/users/profile`,
  CHANGE_PASSWORD: `${API_URL}/users/change-password`,
  
  // Payments
  CREATE_CHECKOUT: `${API_URL}/payments/create-checkout`,
  VERIFY_PAYMENT: `${API_URL}/payments/verify`,
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

export default API_ENDPOINTS; 