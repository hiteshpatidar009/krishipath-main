import { useCampaigns } from '../../hooks/useCampaigns';
import { CampaignDashboard } from '../../components/screens/CampaignDashboard';
import type { CampaignStatus } from '../../types';
import { toast } from '../../components/ui/Toast';

export function CampaignDashboardPage() {
  const { campaigns, loading, error, refetch, pause, resume, remove, duplicate } = useCampaigns();

  const handleFilterChange = (status: CampaignStatus | 'all') => {
    refetch(status);
  };

  const handlePause = async (id: string) => {
    try {
      await pause(id);
      toast('Campaign paused', 'success');
    } catch (e) {
      toast('Failed to pause campaign', 'error');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await resume(id);
      toast('Campaign resumed', 'success');
    } catch (e) {
      toast('Failed to resume campaign', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast('Campaign deleted', 'success');
    } catch (e) {
      toast('Failed to delete campaign', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicate(id);
      toast('Campaign duplicated', 'success');
    } catch (e) {
      toast('Failed to duplicate campaign', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-error font-medium">{error || 'Failed to load campaigns'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <CampaignDashboard 
      campaigns={campaigns}
      onFilterChange={handleFilterChange}
      onPause={handlePause}
      onResume={handleResume}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
    />
  );
}
