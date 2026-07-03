import type { Campaign, CreateCampaignPayload, CampaignStatus } from '../../types';
import { campaigns as mockCampaigns } from '../../mock/campaignData';
import { delay } from '../../utils/formatters';
import { MOCK_DELAY_MIN_MS, MOCK_DELAY_MAX_MS } from '../../utils/constants';

// In-memory mutable store so CRUD operations feel real within the session
let _campaigns = [...mockCampaigns];

const d = () => delay(MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS));

/**
 * Fetches all campaigns, optionally filtered by status.
 *
 * BACKEND SWAP: GET /campaigns?status=active&page=1&limit=20
 */
export const getCampaigns = async (status?: CampaignStatus | 'all'): Promise<Campaign[]> => {
  await d();
  if (!status || status === 'all') return [..._campaigns];
  return _campaigns.filter((c) => c.status === status);
};

/**
 * Fetches a single campaign by ID.
 *
 * BACKEND SWAP: GET /campaigns/:id
 */
export const getCampaignById = async (id: string): Promise<Campaign> => {
  await d();
  const c = _campaigns.find((c) => c.id === id);
  if (!c) throw new Error(`Campaign ${id} not found`);
  return { ...c };
};

/**
 * Creates a new campaign.
 *
 * BACKEND SWAP: POST /campaigns with CreateCampaignPayload
 */
export const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  await d();
  const newCampaign: Campaign = {
    id: `c-${String(Date.now()).slice(-6)}`,
    status: 'draft',
    reach: 0,
    videoViews: 0,
    quizCompletions: 0,
    brochureDownloads: 0,
    callbackRequests: 0,
    walletUsed: 0,
    ...payload,
  };
  _campaigns = [newCampaign, ..._campaigns];
  return { ...newCampaign };
};

/**
 * Updates a campaign by ID.
 *
 * BACKEND SWAP: PATCH /campaigns/:id with partial payload
 */
export const updateCampaign = async (
  id: string,
  patch: Partial<Campaign>
): Promise<Campaign> => {
  await d();
  const idx = _campaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Campaign ${id} not found`);
  _campaigns[idx] = { ..._campaigns[idx], ...patch };
  return { ..._campaigns[idx] };
};

/**
 * Deletes a campaign permanently.
 *
 * BACKEND SWAP: DELETE /campaigns/:id
 */
export const deleteCampaign = async (id: string): Promise<void> => {
  await d();
  _campaigns = _campaigns.filter((c) => c.id !== id);
};

/**
 * Pauses an active campaign.
 *
 * BACKEND SWAP: POST /campaigns/:id/pause
 */
export const pauseCampaign = async (id: string): Promise<Campaign> =>
  updateCampaign(id, { status: 'paused' });

/**
 * Resumes a paused campaign.
 *
 * BACKEND SWAP: POST /campaigns/:id/resume
 */
export const resumeCampaign = async (id: string): Promise<Campaign> =>
  updateCampaign(id, { status: 'active' });

/**
 * Duplicates an existing campaign as a new draft.
 *
 * BACKEND SWAP: POST /campaigns/:id/duplicate
 */
export const duplicateCampaign = async (id: string): Promise<Campaign> => {
  const source = await getCampaignById(id);
  return createCampaign({
    ...source,
    name: `${source.name} (Copy)`,
  });
};

export const campaignApi = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  pauseCampaign,
  resumeCampaign,
  duplicateCampaign,
};
