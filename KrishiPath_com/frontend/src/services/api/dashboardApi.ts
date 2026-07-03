import type { KPISummary, MonthlyMetric, RewardBreakdownItem } from '../../types';
import { kpiSummary, monthlyMetrics } from '../../mock/dashboardData';
import { rewardSpendBreakdown } from '../../mock/campaignData';
import { delay } from '../../utils/formatters';
import { MOCK_DELAY_MIN_MS, MOCK_DELAY_MAX_MS } from '../../utils/constants';

const d = () => delay(MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS));

/**
 * Fetches KPI summary metrics for the dashboard header cards.
 *
 * BACKEND SWAP: GET /dashboard/kpi
 */
export const getKPISummary = async (): Promise<KPISummary> => {
  await d();
  return { ...kpiSummary };
};

/**
 * Fetches monthly performance timeseries for charts.
 *
 * BACKEND SWAP: GET /dashboard/metrics?range=6m
 */
export const getMonthlyMetrics = async (): Promise<MonthlyMetric[]> => {
  await d();
  return [...monthlyMetrics];
};

/**
 * Fetches reward spend breakdown for the pie chart.
 *
 * BACKEND SWAP: GET /dashboard/reward-breakdown
 */
export const getRewardBreakdown = async (): Promise<RewardBreakdownItem[]> => {
  await d();
  return [...rewardSpendBreakdown];
};

export const dashboardApi = { getKPISummary, getMonthlyMetrics, getRewardBreakdown };
