import { useFarmerLeads } from '../../hooks/useFarmerLeads';
import { FarmerLeads } from '../../components/screens/FarmerLeads';
import type { LeadFilters } from '../../types';

export function FarmerLeadsPage() {
  const { leads, loading, error, refetch, updateStatus, exportCsv } = useFarmerLeads();

  const handleFilterChange = (filters: LeadFilters) => {
    refetch(filters);
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
        <p className="text-error font-medium">{error || 'Failed to load farmer leads'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <FarmerLeads 
      leads={leads}
      onUpdateStatus={updateStatus}
      onExport={exportCsv}
      onFilterChange={handleFilterChange}
    />
  );
}
