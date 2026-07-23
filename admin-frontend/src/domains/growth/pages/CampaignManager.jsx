import React, { useState } from 'react';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';
import { Megaphone, MessageSquare, Plus } from 'lucide-react';

export default function CampaignManager() {
  const [campaigns] = useState([
    { id: 'CMP-001', name: 'Monsoon Alert 2026', type: 'SMS', target: 'MP Farmers', sentCount: 15000, status: 'Completed', date: '2026-06-15' },
    { id: 'CMP-002', name: 'Soybean Price Drop Warning', type: 'Push', target: 'Indore Mandi', sentCount: 4200, status: 'Active', date: '2026-07-12' },
    { id: 'CMP-003', name: 'Govt Scheme 2026 Subsidy', type: 'SMS', target: 'All Verified', sentCount: 0, status: 'Draft', date: '-' },
  ]);

  const columns = [
    { 
      header: 'Campaign Name', 
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{row.name}</span>
          <span className="text-xs text-slate-500 font-mono">{row.id}</span>
        </div>
      )
    },
    { 
      header: 'Type', 
      accessorKey: 'type',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          {row.type === 'SMS' ? <MessageSquare size={14} className="text-blue-500" /> : <Megaphone size={14} className="text-purple-500" />}
          <span>{row.type}</span>
        </div>
      )
    },
    { 
      header: 'Target Audience', 
      accessorKey: 'target',
    },
    { 
      header: 'Sent / Delivered', 
      accessorKey: 'sentCount',
      cell: (row) => <span className="font-mono">{row.sentCount.toLocaleString()}</span>
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row) => {
        let colors = 'bg-slate-100 text-slate-600 border-slate-200';
        if (row.status === 'Active') colors = 'bg-green-50 text-green-700 border-green-200 animate-pulse';
        if (row.status === 'Completed') colors = 'bg-blue-50 text-blue-700 border-blue-200';
        
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-orange-500" /> Campaign Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">Design and track SMS and Push Notification campaigns.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sent (This Month)</p>
          <p className="text-2xl font-bold text-slate-800">45,230</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Campaigns</p>
          <p className="text-2xl font-bold text-green-600">3</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SMS Gateway Balance</p>
          <p className="text-2xl font-bold text-slate-800">₹12,450</p>
        </div>
      </div>

      <EnterpriseTable 
        title="Recent Campaigns"
        columns={columns}
        data={campaigns}
      />
    </div>
  );
}
