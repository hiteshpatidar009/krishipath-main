// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'root' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  companyInitials: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed';
export type CampaignGoal = 'Product Awareness' | 'Lead Generation' | 'Education' | 'Brand Building';

export interface CampaignRewards {
  videoReward: number;
  quizReward: number;
  brochureReward: number;
  callbackReward: number;
}

export interface Campaign extends CampaignRewards {
  id: string;
  name: string;
  status: CampaignStatus;
  goal: CampaignGoal | string;
  description: string;
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
  targetDistricts?: string[];
  targetCrops: string[];
  targetLanguages?: string[];
}

export interface CreateCampaignPayload {
  name: string;
  goal: string;
  description: string;
  videoReward: number;
  quizReward: number;
  brochureReward: number;
  callbackReward: number;
  dailyBudget: number;
  endDate: string;
  targetStates: string[];
  targetDistricts?: string[];
  targetCrops: string[];
  targetLanguages?: string[];
}

// ─── Farmer Leads ─────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'not-interested';

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

export interface LeadFilters {
  status?: LeadStatus | 'all';
  state?: string;
  crop?: string;
  campaignId?: string;
  search?: string;
}

// ─── Wallet / Transactions ─────────────────────────────────────────────────────

export type TransactionType =
  | 'recharge'
  | 'campaign-spend'
  | 'reward-distributed'
  | 'platform-fee'
  | 'bonus';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // positive = credit, negative = debit
  description: string;
  date: string;
  balance: number;
  invoiceId?: string;
}

export interface WalletSummary {
  balance: number;
  totalRecharged: number;
  totalSpent: number;
  platformFees: number;
  lastUpdated: string;
  accountId: string;
  companyName: string;
}

export interface TopUpPayload {
  amount: number;
  paymentMethod: 'upi' | 'netbanking' | 'card';
}

// ─── Analytics ────────────────────────────────────────────────────────────────

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

export interface RewardBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface DistrictStat {
  name: string;
  reach: number;
  pct: number;
}

export interface CropStat {
  name: string;
  engaged: number;
  pct: number;
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export type NotificationCategory = 'campaign' | 'wallet' | 'leads' | 'system';

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'invited' | 'suspended';
  permissions: string[];
}

// ─── Company ──────────────────────────────────────────────────────────────────

export type BusinessCategory =
  | 'Fertilizer'
  | 'Pesticide'
  | 'Seed'
  | 'Bio-fertilizer'
  | 'Agri-equipment'
  | 'Agri-finance'
  | 'Other';

export interface Company {
  id: string;
  name: string;
  initials: string;
  category: BusinessCategory | string;
  gstNumber?: string;
  website?: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  logoUrl?: string;
  walletBalance: number;
  activeCampaigns: number;
  totalReach: number;
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;
}

// ─── Generic API Response ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
