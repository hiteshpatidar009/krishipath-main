import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../services/axiosInstance';

// Query Keys
export const MANDI_KEYS = {
  all: ['mandis'],
  directory: () => [...MANDI_KEYS.all, 'directory'],
  detail: (id) => [...MANDI_KEYS.all, 'detail', id],
  prices: (mandiId, date) => [...MANDI_KEYS.all, 'prices', mandiId, date],
  traderPrices: (mandiId, cropId, date) => [...MANDI_KEYS.all, 'traderPrices', mandiId, cropId, date],
  crops: () => [...MANDI_KEYS.all, 'crops'],
  mandiCrops: (mandiId) => [...MANDI_KEYS.all, 'mandiCrops', mandiId],
  states: () => [...MANDI_KEYS.all, 'states'],
  districts: (stateId) => [...MANDI_KEYS.all, 'districts', stateId],
  masterData: (type) => [...MANDI_KEYS.all, 'masterData', type],
  traders: () => [...MANDI_KEYS.all, 'traders'],
  insights: (filters = {}) => [...MANDI_KEYS.all, 'insights', filters],
};

// ==========================================
// API Calls (Axios)
// ==========================================

const fetchMandis = async () => {
  const { data } = await axios.get('/mandi/admin'); // Using the admin endpoint built earlier
  return data; // Expected { success: true, data: [...] }
};

const createMandi = async (mandiData) => {
  const { data } = await axios.post('/mandi/admin', mandiData);
  return data;
};

const fetchGlobalCrops = async () => {
  const { data } = await axios.get('/mandi/admin/products/global');
  return data;
};

export const fetchMandiCrops = async (mandiId) => {
  const { data } = await axios.get(`/mandi/admin/${mandiId}/products`);
  return data;
};

const fetchTraderPrices = async ({ mandiId, cropId, date }) => {
  let url = `/mandi/admin/${mandiId}/products/${cropId}/prices`;
  if (date) url += `?date=${date}`;
  const { data } = await axios.get(url);
  return data;
};

const updateTraderPrices = async ({ mandiId, cropId, payload }) => {
  const { data } = await axios.put(`/mandi/admin/${mandiId}/products/${cropId}/prices`, payload);
  return data;
};

const createGlobalCrop = async (cropData) => {
  const { data } = await axios.post('/mandi/admin/products/global', cropData);
  return data;
};

const fetchTraders = async () => {
  const { data } = await axios.get('/mandi/admin/traders');
  return data;
};

const createTrader = async (payload) => {
  const { data } = await axios.post('/mandi/admin/traders', payload);
  return data;
};

const updateTrader = async ({ traderId, patch }) => {
  const { data } = await axios.patch(`/mandi/admin/traders/${traderId}`, patch);
  return data;
};

const assignTrader = async ({ mandiId, traderId, notes }) => {
  const { data } = await axios.post(`/mandi/admin/${mandiId}/traders`, { traderId, notes });
  return data;
};

const fetchMarketInsights = async (filters = {}) => {
  const { data } = await axios.get('/market-insights/admin', { params: filters });
  return data;
};

const createMarketInsight = async (payload) => {
  const { data } = await axios.post('/market-insights/admin', payload);
  return data;
};

const updateMarketInsight = async ({ insightId, patch }) => {
  const { data } = await axios.patch(`/market-insights/admin/${insightId}`, patch);
  return data;
};

const fetchStates = async () => {
  const { data } = await axios.get('/mandi/admin/locations/states');
  return data;
};

const fetchDistricts = async (stateId) => {
  const { data } = await axios.get(`/mandi/admin/locations/districts?stateId=${stateId}`);
  return data;
};

const fetchDailyPrices = async ({ mandiId, date }) => {
  // In a real app, pass the date to the API to filter.
  const { data } = await axios.get(`/mandi/admin/${mandiId}`);
  return data; // For now, the admin endpoint returns mandi details with crops. We will mock the prices.
};

const updatePrice = async (priceData) => {
  // Simulated mutation for now since we haven't built the batch price update endpoint yet
  return new Promise((resolve) => setTimeout(() => resolve(priceData), 500));
};

const fetchMasterData = async (type) => {
  const { data } = await axios.get(`/mandi/admin/master-data/${type}`);
  return data;
};

// ==========================================
// TanStack Query Hooks
// ==========================================

export const useMandis = () => {
  return useQuery({
    queryKey: MANDI_KEYS.directory(),
    queryFn: fetchMandis,
    // API payload: { success, data: { mandis, total } } OR { success, data: [...] }
    select: (res) => res.data?.mandis || res.data || [],
  });
};

export const useCreateMandi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMandi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANDI_KEYS.directory() });
    },
  });
};

export const useGlobalCrops = () => {
  return useQuery({
    queryKey: MANDI_KEYS.crops(),
    queryFn: fetchGlobalCrops,
    select: (res) => res.data || [], 
  });
};

export const useMandiCrops = (mandiId) => {
  return useQuery({
    queryKey: MANDI_KEYS.mandiCrops(mandiId),
    queryFn: () => fetchMandiCrops(mandiId),
    enabled: !!mandiId,
    select: (res) => res.data || [], 
  });
};

export const useTraderPrices = (mandiId, cropId, date) => {
  return useQuery({
    queryKey: MANDI_KEYS.traderPrices(mandiId, cropId, date),
    queryFn: () => fetchTraderPrices({ mandiId, cropId, date }),
    enabled: !!mandiId && !!cropId,
    select: (res) => res.data || null, 
  });
};

export const useUpdateTraderPrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTraderPrices,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MANDI_KEYS.traderPrices(variables.mandiId, variables.cropId, variables.payload?.priceDate) });
    },
  });
};

export const useCreateGlobalCrop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGlobalCrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANDI_KEYS.crops() });
    },
  });
};

export const useTraderRegistry = () => useQuery({
  queryKey: MANDI_KEYS.traders(),
  queryFn: fetchTraders,
  select: (res) => res.data || [],
});

export const useCreateTrader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrader,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MANDI_KEYS.traders() }),
  });
};

export const useUpdateTrader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTrader,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MANDI_KEYS.traders() }),
  });
};

export const useAssignTrader = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignTrader,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MANDI_KEYS.traders() }),
  });
};

export const useMarketInsights = (filters = {}) => useQuery({
  queryKey: MANDI_KEYS.insights(filters),
  queryFn: () => fetchMarketInsights(filters),
  select: (res) => res.data || [],
});

export const useCreateMarketInsight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMarketInsight,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...MANDI_KEYS.all, 'insights'] }),
  });
};

export const useUpdateMarketInsight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMarketInsight,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...MANDI_KEYS.all, 'insights'] }),
  });
};

export const useStates = () => {
  return useQuery({
    queryKey: MANDI_KEYS.states(),
    queryFn: fetchStates,
    select: (res) => res.data || [], 
  });
};

export const useDistricts = (stateId) => {
  return useQuery({
    queryKey: MANDI_KEYS.districts(stateId),
    queryFn: () => fetchDistricts(stateId),
    enabled: !!stateId, // Only fetch when a stateId is selected
    select: (res) => res.data || [],
  });
};

export const useDailyPrices = (mandiId, date) => {
  return useQuery({
    queryKey: MANDI_KEYS.prices(mandiId, date),
    queryFn: () => fetchDailyPrices({ mandiId, date }),
    enabled: !!mandiId, // Only run if mandiId is provided
    select: (res) => {
      // Temporary mock mapping: map crops to mock price data so the spreadsheet UI can be tested
      return (res.data?.crops || []).map((c) => ({
        cropId: c.cropId,
        name: c.cropName || c.cropId,
        minPrice: c.minPrice || '',
        maxPrice: c.maxPrice || '',
        modalPrice: c.modalPrice || '',
      }));
    }
  });
};

export const useUpdatePrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePrice,
    onSuccess: (data) => {
      // Ideally, invalidate the prices query here, but since it's mocked, we do nothing
      console.log('Price updated successfully', data);
    },
  });
};

export const useMasterData = (type) => {
  return useQuery({
    queryKey: MANDI_KEYS.masterData(type),
    queryFn: () => fetchMasterData(type),
    enabled: !!type,
    select: (res) => res.data || [],
  });
};
