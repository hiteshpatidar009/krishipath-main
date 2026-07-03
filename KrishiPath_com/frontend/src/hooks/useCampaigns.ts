import { useEffect, useState, useCallback } from 'react';
import type { Campaign, CampaignStatus } from '../types';
import { campaignApi } from '../services/api';

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing the campaign list with full CRUD operations.
 * All UI state (loading, error, optimistic updates) lives here.
 */
export function useCampaigns(initialStatus?: CampaignStatus | 'all') {
  const [state, setState] = useState<CampaignState>({
    campaigns: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async (status?: CampaignStatus | 'all') => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const campaigns = await campaignApi.getCampaigns(status);
      setState({ campaigns, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load campaigns',
      }));
    }
  }, []);

  useEffect(() => {
    load(initialStatus);
  }, [load, initialStatus]);

  const pause = useCallback(async (id: string) => {
    const updated = await campaignApi.pauseCampaign(id);
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  }, []);

  const resume = useCallback(async (id: string) => {
    const updated = await campaignApi.resumeCampaign(id);
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await campaignApi.deleteCampaign(id);
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.filter((c) => c.id !== id),
    }));
  }, []);

  const duplicate = useCallback(async (id: string) => {
    const newCampaign = await campaignApi.duplicateCampaign(id);
    setState((s) => ({ ...s, campaigns: [newCampaign, ...s.campaigns] }));
    return newCampaign;
  }, []);

  return {
    ...state,
    refetch: load,
    pause,
    resume,
    remove,
    duplicate,
  };
}
