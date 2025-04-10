const API_URL = import.meta.env.VITE_API_URL || 'https://whass-mock-api.vercel.app/api';

export default API_URL;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    ME: '/auth/me'
  },
  SERVERS: {
    LIST: '/servers',
    DETAIL: (id) => `/servers/${id}`,
    CREATE: '/servers',
    UPDATE: (id) => `/servers/${id}`,
    DELETE: (id) => `/servers/${id}`,
    START: (id) => `/servers/${id}/start`,
    STOP: (id) => `/servers/${id}/stop`,
    RESTART: (id) => `/servers/${id}/restart`,
    CONSOLE: (id) => `/servers/${id}/console`,
    COMMAND: (id) => `/servers/${id}/command`,
    BACKUP: (id) => `/servers/${id}/backup`,
    RESTORE: (id, backupId) => `/servers/${id}/restore/${backupId}`
  },
  PLANS: {
    LIST: '/plans',
    DETAIL: (id) => `/plans/${id}`
  },
  PAYMENTS: {
    CREATE_SESSION: '/payments/create-session',
    SUBSCRIPTION: '/payments/subscription',
    INVOICES: '/payments/invoices'
  }
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}; 