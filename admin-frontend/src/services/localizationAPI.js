import api from './api';

const LOCALIZATION_URL = '/localization';

// --- Languages ---
export const getAllLanguages = async (activeOnly = false) => {
  return await api.get(`${LOCALIZATION_URL}/languages`, { params: { active: activeOnly } });
};

export const createLanguage = async (languageData) => {
  return await api.post(`${LOCALIZATION_URL}/languages`, languageData);
};

export const updateLanguage = async (id, languageData) => {
  return await api.patch(`${LOCALIZATION_URL}/languages/${id}`, languageData);
};

// --- Translations ---
export const getEntityTranslations = async (entityType, entityId) => {
  return await api.get(`${LOCALIZATION_URL}/translations/${entityType}/${entityId}`);
};

export const upsertTranslation = async (translationData) => {
  return await api.put(`${LOCALIZATION_URL}/translations`, translationData);
};

export const bulkUpsertTranslations = async (records) => {
  return await api.post(`${LOCALIZATION_URL}/translations/bulk`, { records });
};

export const approveTranslation = async (approvalData) => {
  return await api.post(`${LOCALIZATION_URL}/translations/approve`, approvalData);
};

export const resolveTranslation = async (entityType, entityId, fieldName) => {
  return await api.get(`${LOCALIZATION_URL}/translations/resolve/${entityType}/${entityId}/${fieldName}`);
};
