import type { FarmerLead, LeadFilters, LeadStatus, DistrictStat, CropStat } from '../../types';
import { farmerLeads as mockLeads, topDistricts, topCrops } from '../../mock/farmerData';
import { delay } from '../../utils/formatters';
import { MOCK_DELAY_MIN_MS, MOCK_DELAY_MAX_MS } from '../../utils/constants';

let _leads = [...mockLeads];

const d = () => delay(MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS));

/**
 * Fetches farmer leads with optional filters.
 *
 * BACKEND SWAP: GET /leads?status=new&state=Maharashtra&crop=Cotton&search=Ramesh
 */
export const getFarmerLeads = async (filters?: LeadFilters): Promise<FarmerLead[]> => {
  await d();
  let result = [..._leads];

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters?.state) {
    result = result.filter((l) => l.state === filters.state);
  }
  if (filters?.crop) {
    result = result.filter((l) => l.crop === filters.crop);
  }
  if (filters?.campaignId) {
    result = result.filter((l) => l.campaignId === filters.campaignId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  }

  return result;
};

/**
 * Updates the status of a farmer lead.
 *
 * BACKEND SWAP: PATCH /leads/:id with { status }
 */
export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<FarmerLead> => {
  await d();
  const idx = _leads.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error(`Lead ${id} not found`);
  _leads[idx] = { ..._leads[idx], status };
  return { ..._leads[idx] };
};

/**
 * Exports leads as a CSV Blob.
 *
 * BACKEND SWAP: GET /leads/export?status=new&format=csv
 */
export const exportLeads = async (filters?: LeadFilters): Promise<Blob> => {
  const leads = await getFarmerLeads(filters);
  const header = 'ID,Name,Phone,State,District,Crop,Campaign,Status,Land Size,Language,Requested At\n';
  const rows = leads
    .map(
      (l) =>
        `${l.id},"${l.name}",${l.phone},${l.state},${l.district},${l.crop},"${l.campaignName}",${l.status},"${l.landSize}",${l.language},${l.requestedAt}`
    )
    .join('\n');
  return new Blob([header + rows], { type: 'text/csv' });
};

/**
 * Fetches top performing districts by farmer reach.
 *
 * BACKEND SWAP: GET /analytics/top-districts
 */
export const getTopDistricts = async (): Promise<DistrictStat[]> => {
  await d();
  return [...topDistricts];
};

/**
 * Fetches top crops by farmer engagement.
 *
 * BACKEND SWAP: GET /analytics/top-crops
 */
export const getTopCrops = async (): Promise<CropStat[]> => {
  await d();
  return [...topCrops];
};

export const farmerApi = {
  getFarmerLeads,
  updateLeadStatus,
  exportLeads,
  getTopDistricts,
  getTopCrops,
};
