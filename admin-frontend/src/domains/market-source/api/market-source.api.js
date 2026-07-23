import apiClient from '../../../services/api';

export const MarketSourceApi = {
  getAll: (params) => apiClient.get('/market-sources', { params }),
  getById: (id) => apiClient.get(`/market-sources/${id}`),
  create: (data) => apiClient.post('/market-sources', data),
  update: (id, data) => apiClient.patch(`/market-sources/${id}`, data),
  getMessages: (id) => apiClient.get(`/market-sources/${id}/messages`),
  submitPrices: (id, data) => apiClient.post(`/market-sources/${id}/prices`, data),
  getPriceHistory: (id) => apiClient.get(`/market-sources/${id}/price-history`),
  parseMessage: (id, msgId) => apiClient.post(`/market-sources/${id}/messages/${msgId}/parse`),
  updateParserProfile: (id, isAutomationEnabled) => apiClient.patch(`/market-sources/${id}/parser-profile`, { isAutomationEnabled }),
};
