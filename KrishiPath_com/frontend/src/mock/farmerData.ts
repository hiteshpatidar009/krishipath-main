import type { FarmerLead, DistrictStat, CropStat } from '../types';
import { randomFrom } from '../utils/formatters';

// ─── Static lookup data ───────────────────────────────────────────────────────

const firstNames = [
  'Ramesh', 'Suresh', 'Rajendra', 'Manoj', 'Vijay', 'Santosh', 'Dinesh', 'Mahesh',
  'Ganesh', 'Prakash', 'Naresh', 'Rakesh', 'Mukesh', 'Umesh', 'Yogesh', 'Brijesh',
  'Nilesh', 'Rupesh', 'Paresh', 'Hiren', 'Bhavesh', 'Jignesh', 'Kamlesh', 'Manish',
  'Anil', 'Sunil', 'Kapil', 'Deepak', 'Alok', 'Sanjay',
];
const lastNames = [
  'Patil', 'Sharma', 'Yadav', 'Patel', 'Singh', 'Verma', 'Gupta', 'Tiwari',
  'Mishra', 'Reddy', 'Naidu', 'Kumar', 'Joshi', 'Desai', 'Shah', 'Mehta',
  'Chaudhari', 'More', 'Pawar', 'Jadhav',
];

const stateDistricts: Record<string, string[]> = {
  Maharashtra: ['Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur', 'Solapur', 'Ahmednagar'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Moga', 'Faridkot'],
  'Uttar Pradesh': ['Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 'Bareilly', 'Gorakhpur'],
  Karnataka: ['Bengaluru Rural', 'Mysuru', 'Belagavi', 'Dharwad', 'Tumkur', 'Hassan', 'Shimoga'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Sikar', 'Alwar'],
  Gujarat: ['Surat', 'Rajkot', 'Vadodara', 'Gandhinagar', 'Anand', 'Mehsana', 'Bharuch'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam'],
};

const crops = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 'Maize', 'Mustard', 'Chickpea', 'Groundnut'];
const languages = ['Hindi', 'Marathi', 'Punjabi', 'Kannada', 'Gujarati'];
const landSizes = ['< 1 acre', '1–2 acres', '2–5 acres', '5–10 acres', '> 10 acres'];
const statuses: FarmerLead['status'][] = ['new', 'contacted', 'interested', 'converted', 'not-interested'];
const stateKeys = Object.keys(stateDistricts);

// ─── Farmer Leads (52 records) ────────────────────────────────────────────────

const campaignNames = [
  'Kharif Season Fertilizer Drive',
  'Pest Control Awareness Campaign',
  'Organic Seed Introduction',
  'Drip Irrigation Awareness',
];
const campaignIds = ['c-001', 'c-002', 'c-003', 'c-005'];

// Seeded data generation — consistent across renders
const _seed = 42;
let _rngState = _seed;
const seededRandom = (): number => {
  _rngState = (_rngState * 1664525 + 1013904223) & 0xffffffff;
  return ((_rngState >>> 0) % 1000) / 1000;
};
const seededFrom = <T>(arr: T[]): T => arr[Math.floor(seededRandom() * arr.length)];

export const farmerLeads: FarmerLead[] = Array.from({ length: 52 }, (_, i) => {
  const state = seededFrom(stateKeys);
  const districts = stateDistricts[state];
  const campaignIndex = Math.floor(seededRandom() * campaignNames.length);
  const daysAgo = Math.floor(seededRandom() * 45);
  const date = new Date(2026, 5, 20 - daysAgo);
  return {
    id: `l-${String(i + 1).padStart(3, '0')}`,
    name: `${seededFrom(firstNames)} ${seededFrom(lastNames)}`,
    phone: `98${String(Math.floor(seededRandom() * 1e8)).padStart(8, '0')}`,
    state,
    district: seededFrom(districts),
    crop: seededFrom(crops),
    campaignName: campaignNames[campaignIndex],
    campaignId: campaignIds[campaignIndex],
    requestedAt: date.toISOString(),
    status: seededFrom(statuses),
    landSize: seededFrom(landSizes),
    language: seededFrom(languages),
  };
});

// ─── Top Districts & Crops (for Analytics) ────────────────────────────────────

export const topDistricts: DistrictStat[] = [
  { name: 'Nashik, MH', reach: 8420, pct: 86 },
  { name: 'Ludhiana, PB', reach: 6280, pct: 64 },
  { name: 'Pune, MH', reach: 5940, pct: 61 },
  { name: 'Anand, GJ', reach: 4820, pct: 49 },
  { name: 'Varanasi, UP', reach: 3960, pct: 40 },
];

export const topCrops: CropStat[] = [
  { name: 'Cotton', engaged: 14200, pct: 92 },
  { name: 'Wheat', engaged: 11800, pct: 76 },
  { name: 'Rice', engaged: 9400, pct: 61 },
  { name: 'Soybean', engaged: 7200, pct: 47 },
  { name: 'Sugarcane', engaged: 5600, pct: 36 },
];

// Export for use in constants if needed
export { randomFrom, stateKeys, crops, languages };
