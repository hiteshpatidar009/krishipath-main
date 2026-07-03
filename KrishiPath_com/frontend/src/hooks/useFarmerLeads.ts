import { useEffect, useState, useCallback } from 'react';
import type { FarmerLead, LeadFilters, LeadStatus } from '../types';
import { farmerApi } from '../services/api';

interface FarmerLeadsState {
  leads: FarmerLead[];
  loading: boolean;
  error: string | null;
}

export function useFarmerLeads(initialFilters?: LeadFilters) {
  const [state, setState] = useState<FarmerLeadsState>({
    leads: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async (filters?: LeadFilters) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const leads = await farmerApi.getFarmerLeads(filters);
      setState({ leads, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load farmer leads',
      }));
    }
  }, []);

  useEffect(() => {
    load(initialFilters);
  }, [load, initialFilters]);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    const updated = await farmerApi.updateLeadStatus(id, status);
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === id ? updated : l)),
    }));
    return updated;
  }, []);

  const exportCsv = useCallback(async (filters?: LeadFilters) => {
    const blob = await farmerApi.exportLeads(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishipath-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    ...state,
    refetch: load,
    updateStatus,
    exportCsv,
  };
}
