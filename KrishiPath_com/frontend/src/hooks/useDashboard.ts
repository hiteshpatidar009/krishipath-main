import { useEffect, useState, useCallback } from 'react';
import type { KPISummary, MonthlyMetric, RewardBreakdownItem } from '../types';
import { dashboardApi } from '../services/api';

interface DashboardState {
  kpi: KPISummary | null;
  metrics: MonthlyMetric[];
  breakdown: RewardBreakdownItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that loads all dashboard data in parallel.
 * Components never call dashboardApi directly.
 */
export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    kpi: null,
    metrics: [],
    breakdown: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [kpi, metrics, breakdown] = await Promise.all([
        dashboardApi.getKPISummary(),
        dashboardApi.getMonthlyMetrics(),
        dashboardApi.getRewardBreakdown(),
      ]);
      setState({ kpi, metrics, breakdown, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
