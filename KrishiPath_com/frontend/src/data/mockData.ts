// ─── Types ───────────────────────────────────────────────────────────────────

export type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'not-interested';
export type TransactionType = 'recharge' | 'campaign-spend' | 'reward-distributed' | 'platform-fee' | 'bonus';
export type NotificationCategory = 'campaign' | 'wallet' | 'leads' | 'system';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  goal: string;
  reach: number;
  videoViews: number;
  quizCompletions: number;
  brochureDownloads: number;
  callbackRequests: number;
  walletUsed: number;
  dailyBudget: number;
  launchDate: string;
  endDate: string;
  targetStates: string[];
  targetCrops: string[];
  description: string;
  videoReward: number;
  quizReward: number;
  brochureReward: number;
  callbackReward: number;
}

export interface FarmerLead {
  id: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  crop: string;
  campaignName: string;
  campaignId: string;
  requestedAt: string;
  status: LeadStatus;
  landSize: string;
  language: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  balance: number;
  invoiceId?: string;
}

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface MonthlyMetric {
  month: string;
  reach: number;
  videoViews: number;
  quizCompletions: number;
  brochureDownloads: number;
  callbacks: number;
  spend: number;
  roi: number;
}

export interface KPISummary {
  walletBalance: number;
  todaySpend: number;
  activeCampaigns: number;
  totalReach: number;
  videoCompletionRate: number;
  quizCompletionRate: number;
  brochureDownloads: number;
  callbackRequests: number;
  avgROI: number;
  totalFarmers: number;
  rewardsDistributed: number;
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaigns: Campaign[] = [
  {
    id: 'c-001',
    name: 'Kharif Season Fertilizer Drive',
    status: 'active',
    goal: 'Product Awareness',
    reach: 18400,
    videoViews: 12480,
    quizCompletions: 7920,
    brochureDownloads: 3240,
    callbackRequests: 142,
    walletUsed: 32000,
    dailyBudget: 2000,
    launchDate: '2026-06-01',
    endDate: '2026-07-31',
    targetStates: ['Maharashtra', 'Madhya Pradesh', 'Gujarat'],
    targetCrops: ['Cotton', 'Soybean', 'Maize'],
    description: 'Promoting NPK fertilizer range for Kharif season with interactive quiz and video demos',
    videoReward: 2,
    quizReward: 3,
    brochureReward: 1,
    callbackReward: 10,
  },
  {
    id: 'c-002',
    name: 'Pest Control Awareness Campaign',
    status: 'active',
    goal: 'Lead Generation',
    reach: 12800,
    videoViews: 8960,
    quizCompletions: 5120,
    brochureDownloads: 2048,
    callbackRequests: 98,
    walletUsed: 21500,
    dailyBudget: 1500,
    launchDate: '2026-06-15',
    endDate: '2026-07-30',
    targetStates: ['Punjab', 'Haryana', 'Uttar Pradesh'],
    targetCrops: ['Wheat', 'Rice', 'Sugarcane'],
    description: 'Educating farmers about integrated pest management and our bio-pesticide solutions',
    videoReward: 2,
    quizReward: 3,
    brochureReward: 1,
    callbackReward: 15,
  },
  {
    id: 'c-003',
    name: 'Organic Seed Introduction',
    status: 'paused',
    goal: 'Product Awareness',
    reach: 9200,
    videoViews: 5980,
    quizCompletions: 3680,
    brochureDownloads: 1460,
    callbackRequests: 54,
    walletUsed: 15800,
    dailyBudget: 1000,
    launchDate: '2026-05-20',
    endDate: '2026-07-20',
    targetStates: ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu'],
    targetCrops: ['Rice', 'Cotton', 'Groundnut'],
    description: 'Introducing our certified organic seed range to progressive farmers in South India',
    videoReward: 2,
    quizReward: 3,
    brochureReward: 1,
    callbackReward: 10,
  },
  {
    id: 'c-004',
    name: 'Winter Crop Webinar Series',
    status: 'draft',
    goal: 'Education',
    reach: 0,
    videoViews: 0,
    quizCompletions: 0,
    brochureDownloads: 0,
    callbackRequests: 0,
    walletUsed: 0,
    dailyBudget: 2500,
    launchDate: '2026-10-01',
    endDate: '2026-11-30',
    targetStates: ['Rajasthan', 'Punjab', 'Haryana'],
    targetCrops: ['Wheat', 'Mustard', 'Chickpea'],
    description: 'Educational webinar series for Rabi season preparation — soil health and crop rotation best practices',
    videoReward: 3,
    quizReward: 5,
    brochureReward: 2,
    callbackReward: 20,
  },
  {
    id: 'c-005',
    name: 'Drip Irrigation Awareness',
    status: 'completed',
    goal: 'Lead Generation',
    reach: 8200,
    videoViews: 6100,
    quizCompletions: 3800,
    brochureDownloads: 1200,
    callbackRequests: 18,
    walletUsed: 13400,
    dailyBudget: 800,
    launchDate: '2026-04-01',
    endDate: '2026-05-31',
    targetStates: ['Maharashtra', 'Gujarat'],
    targetCrops: ['Cotton', 'Sugarcane'],
    description: 'Promoting water-efficient drip irrigation systems for cotton and sugarcane farmers',
    videoReward: 2,
    quizReward: 3,
    brochureReward: 1,
    callbackReward: 10,
  },
];

// ─── Farmer Leads ─────────────────────────────────────────────────────────────

const firstNames = ['Ramesh', 'Suresh', 'Rajendra', 'Manoj', 'Vijay', 'Santosh', 'Dinesh', 'Mahesh', 'Ganesh', 'Prakash', 'Naresh', 'Rakesh', 'Mukesh', 'Umesh', 'Yogesh', 'Brijesh', 'Nilesh', 'Rupesh', 'Paresh', 'Hiren', 'Bhavesh', 'Jignesh', 'Kamlesh', 'Manish', 'Anil', 'Sunil', 'Kapil', 'Deepak', 'Alok', 'Sanjay'];
const lastNames = ['Patil', 'Sharma', 'Yadav', 'Patel', 'Singh', 'Verma', 'Gupta', 'Tiwari', 'Mishra', 'Reddy', 'Naidu', 'Kumar', 'Joshi', 'Desai', 'Shah', 'Mehta', 'Chaudhari', 'More', 'Pawar', 'Jadhav'];

const stateDistricts: Record<string, string[]> = {
  'Maharashtra': ['Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur', 'Solapur', 'Ahmednagar'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Moga', 'Faridkot'],
  'Uttar Pradesh': ['Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 'Bareilly', 'Gorakhpur'],
  'Karnataka': ['Bengaluru Rural', 'Mysuru', 'Belagavi', 'Dharwad', 'Tumkur', 'Hassan', 'Shimoga'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Sikar', 'Alwar'],
  'Gujarat': ['Surat', 'Rajkot', 'Vadodara', 'Gandhinagar', 'Anand', 'Mehsana', 'Bharuch'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam'],
};

const crops = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 'Maize', 'Mustard', 'Chickpea', 'Groundnut'];
const languages = ['Hindi', 'Marathi', 'Punjabi', 'Kannada', 'Gujarati'];
const landSizes = ['< 1 acre', '1–2 acres', '2–5 acres', '5–10 acres', '> 10 acres'];
const statuses: LeadStatus[] = ['new', 'contacted', 'interested', 'converted', 'not-interested'];
const campaignNames = campaigns.map(c => c.name);
const campaignIds = campaigns.map(c => c.id);

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const stateKeys = Object.keys(stateDistricts);

export const farmerLeads: FarmerLead[] = Array.from({ length: 52 }, (_, i) => {
  const state = randomFrom(stateKeys);
  const districts = stateDistricts[state];
  const campaignIndex = Math.floor(Math.random() * campaignNames.length);
  const daysAgo = Math.floor(Math.random() * 45);
  const date = new Date(2026, 5, 15 - daysAgo);
  return {
    id: `l-${String(i + 1).padStart(3, '0')}`,
    name: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
    phone: `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    state,
    district: randomFrom(districts),
    crop: randomFrom(crops),
    campaignName: campaignNames[campaignIndex],
    campaignId: campaignIds[campaignIndex],
    requestedAt: date.toISOString(),
    status: randomFrom(statuses),
    landSize: randomFrom(landSizes),
    language: randomFrom(languages),
  };
});

// ─── Wallet Transactions ──────────────────────────────────────────────────────

export const transactions: Transaction[] = [
  { id: 'txn-001', type: 'recharge', amount: 50000, description: 'Wallet Recharge via UPI', date: '2026-04-05', balance: 50000, invoiceId: 'INV-2026-0401' },
  { id: 'txn-002', type: 'platform-fee', amount: -1000, description: 'Platform Fee — April', date: '2026-04-05', balance: 49000 },
  { id: 'txn-003', type: 'campaign-spend', amount: -3200, description: 'Campaign: Drip Irrigation Awareness', date: '2026-04-10', balance: 45800 },
  { id: 'txn-004', type: 'reward-distributed', amount: -4200, description: 'Rewards: 1,400 farmers @ ₹3 avg', date: '2026-04-15', balance: 41600 },
  { id: 'txn-005', type: 'recharge', amount: 25000, description: 'Wallet Recharge via Net Banking', date: '2026-04-20', balance: 66600, invoiceId: 'INV-2026-0402' },
  { id: 'txn-006', type: 'campaign-spend', amount: -5400, description: 'Campaign: Drip Irrigation Awareness', date: '2026-04-25', balance: 61200 },
  { id: 'txn-007', type: 'bonus', amount: 2000, description: 'Promotional Bonus — New User', date: '2026-04-28', balance: 63200 },
  { id: 'txn-008', type: 'reward-distributed', amount: -3800, description: 'Rewards: 1,050 farmers @ ₹3.6 avg', date: '2026-05-02', balance: 59400 },
  { id: 'txn-009', type: 'platform-fee', amount: -1000, description: 'Platform Fee — May', date: '2026-05-05', balance: 58400 },
  { id: 'txn-010', type: 'recharge', amount: 50000, description: 'Wallet Recharge via NEFT', date: '2026-05-10', balance: 108400, invoiceId: 'INV-2026-0501' },
  { id: 'txn-011', type: 'campaign-spend', amount: -4600, description: 'Campaign: Organic Seed Introduction', date: '2026-05-15', balance: 103800 },
  { id: 'txn-012', type: 'reward-distributed', amount: -7200, description: 'Rewards: 2,400 farmers @ ₹3 avg', date: '2026-05-20', balance: 96600 },
  { id: 'txn-013', type: 'campaign-spend', amount: -3800, description: 'Campaign: Organic Seed Introduction', date: '2026-05-25', balance: 92800 },
  { id: 'txn-014', type: 'platform-fee', amount: -1000, description: 'Platform Fee — June', date: '2026-06-01', balance: 91800 },
  { id: 'txn-015', type: 'recharge', amount: 50000, description: 'Wallet Recharge via UPI', date: '2026-06-05', balance: 141800, invoiceId: 'INV-2026-0601' },
  { id: 'txn-016', type: 'campaign-spend', amount: -6400, description: 'Campaign: Kharif Season Fertilizer Drive', date: '2026-06-10', balance: 135400 },
  { id: 'txn-017', type: 'reward-distributed', amount: -5800, description: 'Rewards: 1,800 farmers @ ₹3.2 avg', date: '2026-06-15', balance: 129600 },
  { id: 'txn-018', type: 'campaign-spend', amount: -2400, description: 'Campaign: Pest Control Awareness', date: '2026-06-20', balance: 127200 },
  { id: 'txn-019', type: 'reward-distributed', amount: -2100, description: 'Rewards: 700 farmers @ ₹3 avg', date: '2026-06-25', balance: 125100 },
  { id: 'txn-020', type: 'campaign-spend', amount: -600, description: 'Campaign: Pest Control Awareness', date: '2026-07-01', balance: 124500 },
];

// ─── Analytics Timeseries ─────────────────────────────────────────────────────

export const monthlyMetrics: MonthlyMetric[] = [
  { month: 'Jan', reach: 4200, videoViews: 2800, quizCompletions: 1600, brochureDownloads: 620, callbacks: 28, spend: 8400, roi: 2.1 },
  { month: 'Feb', reach: 6800, videoViews: 4600, quizCompletions: 2800, brochureDownloads: 980, callbacks: 45, spend: 13200, roi: 2.6 },
  { month: 'Mar', reach: 12400, videoViews: 8800, quizCompletions: 5600, brochureDownloads: 1820, callbacks: 82, spend: 21800, roi: 3.0 },
  { month: 'Apr', reach: 9800, videoViews: 6800, quizCompletions: 4200, brochureDownloads: 1380, callbacks: 60, spend: 17600, roi: 2.8 },
  { month: 'May', reach: 14200, videoViews: 10200, quizCompletions: 6800, brochureDownloads: 2200, callbacks: 98, spend: 26400, roi: 3.4 },
  { month: 'Jun', reach: 18400, videoViews: 13400, quizCompletions: 8800, brochureDownloads: 3200, callbacks: 142, spend: 34200, roi: 3.8 },
];

// ─── KPI Summary ──────────────────────────────────────────────────────────────

export const kpiSummary: KPISummary = {
  walletBalance: 124500,
  todaySpend: 3420,
  activeCampaigns: 2,
  totalReach: 48230,
  videoCompletionRate: 68,
  quizCompletionRate: 54,
  brochureDownloads: 8940,
  callbackRequests: 312,
  avgROI: 3.2,
  totalFarmers: 48230,
  rewardsDistributed: 152600,
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  { id: 'n-001', category: 'campaign', title: 'Campaign Approved', message: '"Kharif Season Fertilizer Drive" has been approved and is now live. Farmers in 3 states can now see your content.', timestamp: '2026-07-02T09:15:00', read: false, link: '/campaigns' },
  { id: 'n-002', category: 'leads', title: 'New Callback Requests', message: '14 farmers from Maharashtra requested a callback in the last hour from the Pest Control Awareness campaign.', timestamp: '2026-07-02T08:42:00', read: false, link: '/leads' },
  { id: 'n-003', category: 'wallet', title: 'Daily Budget Alert', message: 'Your campaign "Pest Control Awareness" has consumed 78% of today\'s daily budget of ₹1,500.', timestamp: '2026-07-02T08:00:00', read: false, link: '/wallet' },
  { id: 'n-004', category: 'campaign', title: 'Milestone Reached', message: '"Kharif Season Fertilizer Drive" reached 10,000 farmer views. Great engagement! Your quiz completion rate is 64%.', timestamp: '2026-07-01T18:30:00', read: false, link: '/campaigns' },
  { id: 'n-005', category: 'leads', title: 'Callback Request — Ramesh Patil', message: 'Farmer Ramesh Patil (Nashik, Maharashtra) has requested a callback. He is interested in the NPK fertilizer range.', timestamp: '2026-07-01T16:20:00', read: true, link: '/leads' },
  { id: 'n-006', category: 'wallet', title: 'Rewards Distributed', message: '₹4,280 distributed to 1,426 farmers who completed your campaign activities today.', timestamp: '2026-07-01T15:00:00', read: true, link: '/wallet' },
  { id: 'n-007', category: 'system', title: 'New Feature: Audience Segmentation', message: 'You can now filter farmer audiences by crop type, land size, and language. Try it in Farmer Targeting.', timestamp: '2026-07-01T10:00:00', read: true, link: '/targeting' },
  { id: 'n-008', category: 'campaign', title: 'Campaign Paused', message: '"Organic Seed Introduction" was paused due to content review. Our team will reach out within 24 hours.', timestamp: '2026-06-30T14:45:00', read: true, link: '/campaigns' },
  { id: 'n-009', category: 'wallet', title: 'Wallet Recharged', message: 'Your wallet has been credited with ₹50,000 via UPI (Ref: UPI26060512345). Available balance: ₹1,41,800.', timestamp: '2026-06-05T11:20:00', read: true, link: '/wallet' },
  { id: 'n-010', category: 'campaign', title: 'Campaign Completed', message: '"Drip Irrigation Awareness" campaign has ended. Total reach: 8,200 farmers, 18 callback requests. View full report.', timestamp: '2026-05-31T23:59:00', read: true, link: '/analytics' },
  { id: 'n-011', category: 'leads', title: 'Lead Status Updated', message: 'Suresh Yadav from Ludhiana has been marked as Converted by your team. Campaign ROI just improved!', timestamp: '2026-06-28T09:30:00', read: true, link: '/leads' },
  { id: 'n-012', category: 'system', title: 'Monthly Report Ready', message: 'Your June 2026 performance report is ready. Total reach: 18,400, Rewards distributed: ₹34,200. Download now.', timestamp: '2026-07-01T06:00:00', read: false, link: '/analytics' },
];

// ─── Indian States ─────────────────────────────────────────────────────────────

export const indianStates = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export const cropTypes = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 'Maize', 'Mustard', 'Chickpea', 'Groundnut', 'Tomato', 'Onion', 'Potato'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatNumber = (n: number): string => {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const topDistricts = [
  { name: 'Nashik, MH', reach: 8420, pct: 86 },
  { name: 'Ludhiana, PB', reach: 6280, pct: 64 },
  { name: 'Pune, MH', reach: 5940, pct: 61 },
  { name: 'Anand, GJ', reach: 4820, pct: 49 },
  { name: 'Varanasi, UP', reach: 3960, pct: 40 },
];

export const topCrops = [
  { name: 'Cotton', engaged: 14200, pct: 92 },
  { name: 'Wheat', engaged: 11800, pct: 76 },
  { name: 'Rice', engaged: 9400, pct: 61 },
  { name: 'Soybean', engaged: 7200, pct: 47 },
  { name: 'Sugarcane', engaged: 5600, pct: 36 },
];

export const rewardSpendBreakdown = [
  { name: 'Video Rewards', value: 32400, color: '#2E7D32' },
  { name: 'Quiz Rewards', value: 48600, color: '#F9A825' },
  { name: 'Brochure Rewards', value: 8940, color: '#039BE5' },
  { name: 'Callback Rewards', value: 31200, color: '#FB8C00' },
  { name: 'Platform Fees', value: 31460, color: '#DDE8DD' },
];
