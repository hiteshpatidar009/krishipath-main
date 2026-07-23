/**
 * productAPI.js
 * All API calls for the Product Catalog system.
 * Base URL: /mandi/admin/products/global
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../services/axiosInstance';

const BASE = '/mandi/admin/products/global';

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const PRODUCT_KEYS = {
  all:             ['products'],
  list:            ()         => [...PRODUCT_KEYS.all, 'list'],
  detail:          (id)       => [...PRODUCT_KEYS.all, 'detail', id],
  classifications: (id)       => [...PRODUCT_KEYS.all, 'classifications', id],
  mandis:          (id)       => [...PRODUCT_KEYS.all, 'mandis', id],
};

// ─── Raw API calls ────────────────────────────────────────────────────────────

const fetchProducts       = () => axios.get(BASE).then(r => r.data);
const fetchProduct        = (id) => axios.get(`${BASE}/${id}`).then(r => r.data);
const createProduct       = (data) => axios.post(BASE, data).then(r => r.data);
const updateProduct       = ({ id, ...data }) => axios.patch(`${BASE}/${id}`, data).then(r => r.data);

const fetchClassifications = (id) => axios.get(`${BASE}/${id}/classifications`).then(r => r.data);
const addClassification    = ({ productId, ...data }) => axios.post(`${BASE}/${productId}/classifications`, data).then(r => r.data);
const updateClassification = ({ productId, cId, ...data }) => axios.patch(`${BASE}/${productId}/classifications/${cId}`, data).then(r => r.data);
const deleteClassification = ({ productId, cId }) => axios.delete(`${BASE}/${productId}/classifications/${cId}`).then(r => r.data);

const addVariant           = ({ productId, cId, ...data }) => axios.post(`${BASE}/${productId}/classifications/${cId}/variants`, data).then(r => r.data);
const updateVariant        = ({ productId, cId, vId, ...data }) => axios.patch(`${BASE}/${productId}/classifications/${cId}/variants/${vId}`, data).then(r => r.data);
const deleteVariant        = ({ productId, cId, vId }) => axios.delete(`${BASE}/${productId}/classifications/${cId}/variants/${vId}`).then(r => r.data);

const setAliases           = ({ id, aliases }) => axios.put(`${BASE}/${id}/aliases`, { aliases }).then(r => r.data);
const setTranslations      = ({ id, translations }) => axios.put(`${BASE}/${id}/translations`, translations).then(r => r.data);
const setMandis            = ({ id, mandiIds }) => axios.put(`${BASE}/${id}/mandis`, { mandiIds }).then(r => r.data);
const fetchProductMandis   = (id) => axios.get(`${BASE}/${id}/mandis`).then(r => r.data);

// ─── React Query Hooks ────────────────────────────────────────────────────────

export const useProducts = () =>
  useQuery({
    queryKey: PRODUCT_KEYS.list(),
    queryFn:  fetchProducts,
    select:   (res) => res.data || [],
  });

export const useProduct = (id) =>
  useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn:  () => fetchProduct(id),
    enabled:  !!id,
    select:   (res) => res.data || null,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess:  () => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.list() }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess:  (_, vars) => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.list() });
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(vars.id) });
    },
  });
};

export const useClassifications = (productId) =>
  useQuery({
    queryKey: PRODUCT_KEYS.classifications(productId),
    queryFn:  () => fetchClassifications(productId),
    enabled:  !!productId,
    select:   (res) => res.data || [],
  });

export const useAddClassification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addClassification,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.classifications(vars.productId) }),
  });
};

export const useUpdateClassification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateClassification,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.classifications(vars.productId) }),
  });
};

export const useDeleteClassification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClassification,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.classifications(vars.productId) }),
  });
};

export const useAddVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addVariant,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.classifications(vars.productId) }),
  });
};

export const useUpdateVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateVariant,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.classifications(vars.productId) }),
  });
};

export const useDeleteVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVariant,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.classifications(vars.productId) }),
  });
};

export const useSetAliases = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setAliases,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(vars.id) }),
  });
};

export const useSetTranslations = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setTranslations,
    onSuccess:  (_, vars) => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(vars.id) }),
  });
};

export const useSetMandis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setMandis,
    onSuccess:  (_, vars) => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.mandis(vars.id) });
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.list() });
    },
  });
};

export const useProductMandis = (id) =>
  useQuery({
    queryKey: PRODUCT_KEYS.mandis(id),
    queryFn:  () => fetchProductMandis(id),
    enabled:  !!id,
    select:   (res) => res.data || [],
  });
