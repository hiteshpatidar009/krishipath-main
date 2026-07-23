import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';
import { Users, Phone, MapPin, Search, RefreshCw, Activity, CheckCircle2, UserCircle2 } from 'lucide-react';
import { getFarmers } from '../../../services/adminAPI';

export default function FarmerDirectory() {
  const [search, setSearch] = useState('');
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-farmers', search],
    queryFn: async () => {
      const res = await getFarmers({ search: search || undefined });
      return res.data?.data?.farmers || [];
    }
  });

  const columns = [
    { 
      header: 'Farmer Info', 
      accessorKey: 'firstName',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <UserCircle2 size={20} className="text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">
              {row.firstName} {row.lastName || ''}
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              {row.id?.slice(0, 8)}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Contact', 
      accessorKey: 'phone',
      cell: (row) => (
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Phone size={14} className="text-slate-400" />
          <span>{row.phone}</span>
        </div>
      )
    },
    { 
      header: 'Location', 
      accessorKey: 'districtName',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-700">
            {row.village || 'N/A'}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin size={12} />
            <span>
              {row.districtName || 'Unknown'}, {row.stateName || ''}
            </span>
          </div>
        </div>
      )
    },
    { 
      header: 'Profile Status', 
      accessorKey: 'profileStatus',
      cell: (row) => {
        const isComplete = row.profileStatus === 'COMPLETE';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
            isComplete 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isComplete ? <CheckCircle2 size={12} /> : <Activity size={12} />}
            {row.profileStatus || 'INCOMPLETE'}
          </span>
        );
      }
    },
    {
      header: 'Registered On',
      accessorKey: 'createdAt',
      cell: (row) => (
        <span className="text-sm text-slate-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" /> Farmer Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all registered farmers across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search phone or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button 
            onClick={() => refetch()}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isError ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
          Failed to load farmers. Please try again.
        </div>
      ) : (
        <EnterpriseTable 
          title={`Registered Farmers (${data?.length || 0})`}
          columns={columns}
          data={data || []}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
