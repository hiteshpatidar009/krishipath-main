import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../services/axiosInstance';

// Query Keys
export const LOC_KEYS = {
  all: ['localization'],
  languages: () => [...LOC_KEYS.all, 'languages'],
  missing: (langCode, entityType) => [...LOC_KEYS.all, 'missing', langCode, entityType],
  dictionary: () => [...LOC_KEYS.all, 'dictionary'],
};

// ==========================================
// API Calls (Axios)
// ==========================================

const fetchLanguages = async () => {
  const { data } = await axios.get('/mandi/admin/master-data/language');
  return data;
};

const fetchMissingTranslations = async ({ queryKey }) => {
  const [_key, _type, langCode, entityType] = queryKey;
  if (!langCode || !entityType) return { data: [] };
  const { data } = await axios.get(`/localization/translations/missing?lang=${langCode}&entityType=${entityType}`);
  return data;
};

const approveTranslation = async ({ entityType, entityId, fieldName, languageCode, translatedValue }) => {
  const { data } = await axios.post('/localization/translations/approve', {
    entityType, entityId, fieldName, languageCode, translatedValue
  });
  return data;
};

const addDictionaryMapping = async ({ term, entityType, entityId, languageCode, confidenceWeight = 1.0 }) => {
  const { data } = await axios.post('/localization/dictionary', {
    term, entityType, entityId, languageCode, confidenceWeight
  });
  return data;
};

const resolveTerm = async ({ term, entityType }) => {
  const { data } = await axios.post('/localization/dictionary/resolve', {
    term, entityType
  });
  return data;
};

// ==========================================
// TanStack Query Hooks
// ==========================================

export const useLanguages = () => {
  return useQuery({
    queryKey: LOC_KEYS.languages(),
    queryFn: fetchLanguages,
    select: (res) => res.data || [], 
  });
};

export const useMissingTranslations = (langCode, entityType) => {
  return useQuery({
    queryKey: LOC_KEYS.missing(langCode, entityType),
    queryFn: fetchMissingTranslations,
    select: (res) => res.data || [],
    enabled: !!langCode && !!entityType,
  });
};

export const useApproveTranslation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveTranslation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOC_KEYS.missing(variables.languageCode, variables.entityType) });
    },
  });
};

export const useAddDictionaryMapping = () => {
  return useMutation({
    mutationFn: addDictionaryMapping,
  });
};

export const useResolveTerm = () => {
  return useMutation({
    mutationFn: resolveTerm,
  });
};
