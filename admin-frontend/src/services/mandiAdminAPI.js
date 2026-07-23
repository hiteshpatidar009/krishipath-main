import api from './api';

const MANDI_API_URL = '/mandi/admin';
const MANDI_PUBLIC_URL = '/mandi';

export const getAllMandis = async (params = {}) => {
  return await api.get(MANDI_API_URL, { params });
};

export const getMandiDetails = async (id) => {
  return await api.get(`${MANDI_API_URL}/${id}`);
};

export const createMandi = async (mandiData) => {
  return await api.post(MANDI_API_URL, mandiData);
};

export const updateMandi = async (id, mandiData) => {
  return await api.patch(`${MANDI_API_URL}/${id}`, mandiData);
};

export const updateMandiStatus = async (id, status) => {
  return await api.patch(`${MANDI_API_URL}/${id}/status`, { status });
};

export const duplicateMandi = async (id, duplicateData) => {
  return await api.post(`${MANDI_API_URL}/${id}/duplicate`, duplicateData);
};

// --- Crops ---
export const getMandiCrops = async (mandiId) => {
  return await api.get(`${MANDI_API_URL}/${mandiId}/products`);
};

export const toggleMandiCrop = async (mandiId, cropData) => {
  return await api.put(`${MANDI_API_URL}/${mandiId}/products`, cropData);
};

export const bulkToggleMandiCrops = async (mandiId, crops) => {
  return await api.put(`${MANDI_API_URL}/${mandiId}/products/bulk`, { crops });
};

export const bulkAssignCropsToMandis = async (mandiIds, cropIds) => {
  return await api.post(`${MANDI_API_URL}/products/bulk-assign`, { mandiIds, cropIds });
};

// --- Traders ---
export const getMandiTraders = async (mandiId) => {
  return await api.get(`${MANDI_API_URL}/${mandiId}/traders`);
};

export const assignTraderToMandi = async (mandiId, traderData) => {
  return await api.post(`${MANDI_API_URL}/${mandiId}/traders`, traderData);
};

export const removeTraderFromMandi = async (mandiId, traderId) => {
  return await api.delete(`${MANDI_API_URL}/${mandiId}/traders/${traderId}`);
};

export const transferTrader = async (traderId, transferData) => {
  return await api.post(`${MANDI_API_URL}/traders/${traderId}/transfer`, transferData);
};

// --- Prices ---
export const getMandiOfficialPrices = async (mandiId) => {
  return await api.get(`${MANDI_API_URL}/${mandiId}/official-prices`);
};

export const upsertMandiOfficialPrice = async (mandiId, priceData) => {
  return await api.put(`${MANDI_API_URL}/${mandiId}/official-prices`, priceData);
};

export const copyMandiPrices = async (copyData) => {
  return await api.post(`${MANDI_API_URL}/prices/copy`, copyData);
};

// --- Locations ---
export const fetchStates = async () => {
  return await api.get(`${MANDI_API_URL}/locations/states`);
};

export const createState = async (data) => {
  return await api.post(`${MANDI_API_URL}/locations/states`, data);
};

export const updateState = async (id, data) => {
  return await api.patch(`${MANDI_API_URL}/locations/states/${id}`, data);
};

export const deleteState = async (id) => {
  return await api.delete(`${MANDI_API_URL}/locations/states/${id}`);
};

export const fetchDistricts = async (stateId = '') => {
  const url = stateId 
    ? `${MANDI_API_URL}/locations/districts?stateId=${stateId}` 
    : `${MANDI_API_URL}/locations/districts`;
  return await api.get(url);
};

export const createDistrict = async (data) => {
  return await api.post(`${MANDI_API_URL}/locations/districts`, data);
};

export const updateDistrict = async (id, data) => {
  return await api.patch(`${MANDI_API_URL}/locations/districts/${id}`, data);
};

export const deleteDistrict = async (id) => {
  return await api.delete(`${MANDI_API_URL}/locations/districts/${id}`);
};
