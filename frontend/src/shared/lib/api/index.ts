// Export all API modules
export { authApi } from './authApi';
export { httpClient } from './httpClient';

// Import httpClient for internal use
import { httpClient } from './httpClient';

// APIs adicionales para endpoints mock
export const invoicesApi = {
  getInvoices: () => httpClient.get('/invoices'),
  createInvoice: (data: any) => httpClient.post('/invoices', data),
  updateInvoice: (id: string, data: any) => httpClient.put(`/invoices/${id}`, data),
  deleteInvoice: (id: string) => httpClient.delete(`/invoices/${id}`),
};

export const declarationsApi = {
  getDeclarations: () => httpClient.get('/declarations'),
  createDeclaration: (data: any) => httpClient.post('/declarations', data),
  updateDeclaration: (id: string, data: any) => httpClient.put(`/declarations/${id}`, data),
  submitDeclaration: (id: string) => httpClient.post(`/declarations/${id}/submit`),
  payDeclaration: (id: string, paymentData: any) => httpClient.post(`/declarations/${id}/pay`, paymentData),
};

export const metricsApi = {
  getMetrics: () => httpClient.get('/metrics'),
  getSalesData: (period?: string) => httpClient.get(`/metrics/sales${period ? `?period=${period}` : ''}`),
  getTaxData: (period?: string) => httpClient.get(`/metrics/taxes${period ? `?period=${period}` : ''}`),
};

export const alertsApi = {
  getAlerts: () => httpClient.get('/alerts'),
  markAsRead: (id: string) => httpClient.patch(`/alerts/${id}/read`),
  dismissAlert: (id: string) => httpClient.patch(`/alerts/${id}/dismiss`),
};

export const userApi = {
  getProfile: () => httpClient.get('/user/profile'),
  updateProfile: (data: any) => httpClient.patch('/user/profile', data),
  changePassword: (data: any) => httpClient.post('/user/change-password', data),
};

export const chatApi = {
  sendMessage: (message: string) => httpClient.post('/chat/message', { message }),
  getChatHistory: () => httpClient.get('/chat/history'),
};