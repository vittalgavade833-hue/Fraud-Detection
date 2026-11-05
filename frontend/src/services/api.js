import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fraudshield-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('fraudshield-token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status !== 404) {
      // Don't toast for 404s by default, let caller handle
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// ===== TRANSACTIONS =====
export const transactionAPI = {
  create: (data) => api.post('/transactions', data),
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats'),
  exportCSV: (params) => api.get('/transactions/export/csv', { params, responseType: 'blob' }),
};

// ===== FRAUD =====
export const fraudAPI = {
  analyze: (data) => api.post('/fraud/analyze', data),
  getAlerts: (params) => api.get('/fraud/alerts', { params }),
  getAlertStats: () => api.get('/fraud/alerts/stats'),
  updateAlertStatus: (id, data) => api.put(`/fraud/alerts/${id}`, data),
  addNote: (id, data) => api.post(`/fraud/alerts/${id}/notes`, data),
};

// ===== ADMIN =====
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}`, data),
  getTrends: (params) => api.get('/admin/trends', { params }),
  getRecentActivity: () => api.get('/admin/activity'),
};

// ===== ANALYTICS =====
export const analyticsAPI = {
  getDailyVolume: (params) => api.get('/analytics/daily-volume', { params }),
  getWeeklyTrends: (params) => api.get('/analytics/weekly-trends', { params }),
  getMonthlyStats: (params) => api.get('/analytics/monthly-stats', { params }),
  getRiskDistribution: (params) => api.get('/analytics/risk-distribution', { params }),
  getAmountAnalysis: (params) => api.get('/analytics/amount-analysis', { params }),
  exportReport: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

export default api;
