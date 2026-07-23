import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketSourceApi } from '../api/market-source.api';
import { Plus, Search, Filter, MoreVertical, Building2 } from 'lucide-react';

export default function MarketSourceList() {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const response = await MarketSourceApi.getAll();
      setSources(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch market sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSources = sources.filter(s => 
    s.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market Sources</h1>
          <p className="text-slate-500 mt-1">Manage trusted sources for market intelligence and pricing data.</p>
        </div>
        <button
          onClick={() => navigate('/app/market-sources/create')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Market Source
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm hover:bg-slate-50 font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Business / Owner</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Trust Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading market sources...</td>
                </tr>
              ) : filteredSources.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 flex flex-col items-center">
                    <Building2 className="w-12 h-12 text-slate-200 mb-3" />
                    <p>No market sources found.</p>
                  </td>
                </tr>
              ) : (
                filteredSources.map((source) => (
                  <tr 
                    key={source.id} 
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/market-sources/${source.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{source.businessName}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{source.ownerName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{source.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div>Mandi ID: {source.mandiId?.substring(0, 8)}...</div>
                      <div className="text-xs text-slate-400">{source.address || 'No address'}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        source.trustScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                        source.trustScore >= 50 ? 'bg-amber-100 text-amber-800' : 
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {source.trustScore}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        source.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {source.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                        onClick={(e) => { e.stopPropagation(); /* show menu */ }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>Showing {filteredSources.length} sources</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-300 bg-white rounded hover:bg-slate-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-300 bg-white rounded hover:bg-slate-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
