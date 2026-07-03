import { useDashboard } from '../../hooks/useDashboard';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useFarmerLeads } from '../../hooks/useFarmerLeads';
import { Dashboard } from '../../components/screens/Dashboard';

export function DashboardPage() {
  const { kpi, metrics, breakdown, loading: dashLoading, error: dashError } = useDashboard();
  const { campaigns, loading: campLoading, error: campError } = useCampaigns();
  const { leads, loading: leadsLoading, error: leadsError } = useFarmerLeads();

  const loading = dashLoading || campLoading || leadsLoading;
  const error = dashError || campError || leadsError;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !kpi) {
    return (
      <div className="p-6 text-center">
        <p className="text-error font-medium">{error || 'Failed to load dashboard data'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const recentCampaigns = campaigns.slice(0, 3);
  const recentLeads = leads.filter(l => l.status === 'new' || l.status === 'contacted').slice(0, 5);

  return (
    <Dashboard 
      kpi={kpi} 
      metrics={metrics} 
      breakdown={breakdown} 
      recentCampaigns={recentCampaigns} 
      recentLeads={recentLeads} 
    />
  );
}
