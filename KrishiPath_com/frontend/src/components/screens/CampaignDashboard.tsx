import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Pause, Play, Copy, Trash2, Eye, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge, statusLabel } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { toast } from '../ui/Toast';
import { formatCurrency, formatNumber, formatDate, campaigns as _campaigns } from '../../data/mockData';
import type { Campaign, CampaignStatus } from '../../types';

type SortKey = 'name' | 'reach' | 'walletUsed' | 'launchDate';

const statusOptions: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

interface CampaignDashboardProps {
  campaigns?: Campaign[];
  onFilterChange?: (status: CampaignStatus | 'all') => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function CampaignDashboard({
  campaigns = _campaigns,
  onFilterChange,
  onPause,
  onResume,
  onDelete,
  onDuplicate
}: CampaignDashboardProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<Campaign[]>(campaigns);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('launchDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = data
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.goal.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return mult * a.name.localeCompare(b.name);
      if (sortKey === 'reach') return mult * (a.reach - b.reach);
      if (sortKey === 'walletUsed') return mult * (a.walletUsed - b.walletUsed);
      if (sortKey === 'launchDate') return mult * (new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime());
      return 0;
    });

  const toggleStatus = (id: string) => {
    const c = data.find(c => c.id === id);
    if (!c) return;
    const isResuming = c.status === 'paused' || c.status === 'draft';
    
    if (isResuming && onResume) onResume(id);
    else if (!isResuming && onPause) onPause(id);
    else {
      // Mock fallback
      setData(prev => prev.map(camp => {
        if (camp.id !== id) return camp;
        const next = camp.status === 'active' ? 'paused' : 'active';
        toast(`Campaign "${camp.name}" ${next === 'active' ? 'resumed' : 'paused'}`, 'success');
        return { ...camp, status: next as CampaignStatus };
      }));
    }
    setOpenMenu(null);
  };

  const duplicate = (c: Campaign) => {
    if (onDuplicate) {
      onDuplicate(c.id);
    } else {
      const clone = { ...c, id: `c-${Date.now()}`, name: `${c.name} (Copy)`, status: 'draft' as CampaignStatus, reach: 0, walletUsed: 0, videoViews: 0, quizCompletions: 0, brochureDownloads: 0, callbackRequests: 0 };
      setData(prev => [clone, ...prev]);
      toast('Campaign duplicated as Draft', 'success');
    }
    setOpenMenu(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (onDelete) {
      onDelete(deleteTarget);
    } else {
      const name = data.find(c => c.id === deleteTarget)?.name;
      setData(prev => prev.filter(c => c.id !== deleteTarget));
      toast(`Campaign "${name}" deleted`, 'info');
    }
    setDeleteTarget(null);
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : <ChevronDown size={12} className="opacity-30" />;

  const statusCounts = campaigns.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Campaigns</h1>
          <p className="text-sm text-text-secondary mt-0.5">{data.length} total · {statusCounts['active'] || 0} active</p>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => navigate('/campaigns/new')}>New Campaign</Button>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-3 flex-wrap">
        {statusOptions.slice(1).map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={[
              'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
              statusFilter === opt.value ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-border-dark',
            ].join(' ')}
          >
            <span className={`w-2 h-2 rounded-full ${opt.value === 'active' ? 'bg-emerald-500' : opt.value === 'draft' ? 'bg-gray-400' : opt.value === 'paused' ? 'bg-amber-500' : 'bg-blue-500'}`} />
            {opt.label}
            <span className="bg-surface-alt px-1.5 rounded-full text-text-muted">{statusCounts[opt.value] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 border border-border rounded-lg px-3 py-2">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              placeholder="Search campaigns…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as CampaignStatus | 'all')}
            className="border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-white cursor-pointer outline-none focus:border-primary"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="secondary" size="sm" leftIcon={<Filter size={13} />}>More Filters</Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Plus size={28} />}
            title="No campaigns found"
            description="Try adjusting your filters or create a new campaign to get started."
            action={{ label: 'Create Campaign', onClick: () => navigate('/campaigns/new') }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  {[
                    { label: 'Campaign Name', key: 'name' as SortKey, flex: true },
                    { label: 'Status', key: null },
                    { label: 'Reach', key: 'reach' as SortKey },
                    { label: 'Video Views', key: null },
                    { label: 'Callbacks', key: null },
                    { label: 'Spent', key: 'walletUsed' as SortKey },
                    { label: 'Launch Date', key: 'launchDate' as SortKey },
                    { label: '', key: null },
                  ].map(({ label, key, flex }, i) => (
                    <th
                      key={i}
                      onClick={() => key && handleSort(key)}
                      className={[
                        'px-4 py-3 text-left text-xs font-semibold text-text-secondary',
                        key ? 'cursor-pointer hover:text-text-primary select-none' : '',
                        flex ? 'min-w-[200px]' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon k={key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-surface-alt transition-colors group">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{c.goal} · {c.targetStates.join(', ')}</p>
                    </td>
                    <td className="px-4 py-3.5"><Badge variant={c.status} dot>{statusLabel[c.status]}</Badge></td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-text-primary">{formatNumber(c.reach)}</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">{formatNumber(c.videoViews)}</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">{c.callbackRequests}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-text-primary">{formatCurrency(c.walletUsed)}</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">{formatDate(c.launchDate)}</td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === c.id && (
                          <div className="absolute right-0 top-8 bg-white border border-border rounded-xl shadow-lg z-20 w-44 py-1.5">
                            <button onClick={() => { navigate('/campaigns/new'); setOpenMenu(null); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-text-secondary hover:bg-surface-alt hover:text-text-primary cursor-pointer">
                              <Eye size={14} /> View Details
                            </button>
                            <button onClick={() => toggleStatus(c.id)} className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-text-secondary hover:bg-surface-alt hover:text-text-primary cursor-pointer">
                              {c.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                            </button>
                            <button onClick={() => duplicate(c)} className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-text-secondary hover:bg-surface-alt hover:text-text-primary cursor-pointer">
                              <Copy size={14} /> Duplicate
                            </button>
                            <div className="border-t border-border my-1" />
                            <button onClick={() => { setDeleteTarget(c.id); setOpenMenu(null); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-error hover:bg-red-50 cursor-pointer">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Campaign"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">"{data.find(c => c.id === deleteTarget)?.name}"</strong>? This action cannot be undone and all campaign data will be permanently removed.
        </p>
      </Modal>

      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
