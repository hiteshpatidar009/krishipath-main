import type { KPISummary, MonthlyMetric } from '../types';

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

// ─── Monthly Metrics (6-month timeseries) ─────────────────────────────────────

export const monthlyMetrics: MonthlyMetric[] = [
  { month: 'Jan', reach: 4200, videoViews: 2800, quizCompletions: 1600, brochureDownloads: 620, callbacks: 28, spend: 8400, roi: 2.1 },
  { month: 'Feb', reach: 6800, videoViews: 4600, quizCompletions: 2800, brochureDownloads: 980, callbacks: 45, spend: 13200, roi: 2.6 },
  { month: 'Mar', reach: 12400, videoViews: 8800, quizCompletions: 5600, brochureDownloads: 1820, callbacks: 82, spend: 21800, roi: 3.0 },
  { month: 'Apr', reach: 9800, videoViews: 6800, quizCompletions: 4200, brochureDownloads: 1380, callbacks: 60, spend: 17600, roi: 2.8 },
  { month: 'May', reach: 14200, videoViews: 10200, quizCompletions: 6800, brochureDownloads: 2200, callbacks: 98, spend: 26400, roi: 3.4 },
  { month: 'Jun', reach: 18400, videoViews: 13400, quizCompletions: 8800, brochureDownloads: 3200, callbacks: 142, spend: 34200, roi: 3.8 },
];
