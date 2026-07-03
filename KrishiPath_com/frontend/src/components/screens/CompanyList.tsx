import { useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, ChevronRight, Filter, MoreVertical } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';

type CompanyStatus = 'approved' | 'pending' | 'suspended';

interface CompanyEntry {
  id: string;
  name: string;
  companyId: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  state: string;
  status: CompanyStatus;
  registeredAt: string;
  campaigns: number;
  walletBalance: number;
  employees: number;
}

const mockCompanies: CompanyEntry[] = [
  { id: '1', name: 'AgroGrow India Pvt. Ltd.', companyId: 'KP-C-00842', category: 'Fertilizer', contactName: 'Rajesh Sharma', email: 'admin@agrogrow.in', phone: '9876543210', state: 'Maharashtra', status: 'approved', registeredAt: '2026-03-15', campaigns: 5, walletBalance: 124500, employees: 4 },
  { id: '2', name: 'BioHarvest Solutions', companyId: 'KP-C-00841', category: 'Bio-Fertilizer', contactName: 'Priya Patel', email: 'priya@bioharvest.com', phone: '9812345678', state: 'Gujarat', status: 'approved', registeredAt: '2026-03-10', campaigns: 3, walletBalance: 58200, employees: 2 },
  { id: '3', name: 'GreenShield Pesticides', companyId: 'KP-C-00840', category: 'Pesticide', contactName: 'Amit Kumar', email: 'amit@greenshield.in', phone: '9988776655', state: 'Punjab', status: 'approved', registeredAt: '2026-02-20', campaigns: 7, walletBalance: 210000, employees: 6 },
  { id: '4', name: 'SeedCraft Organics', companyId: 'KP-C-00839', category: 'Seeds', contactName: 'Meena Reddy', email: 'meena@seedcraft.com', phone: '9845123456', state: 'Karnataka', status: 'pending', registeredAt: '2026-06-28', campaigns: 0, walletBalance: 5000, employees: 1 },
  { id: '5', name: 'Fasal Tech Innovations', companyId: 'KP-C-00838', category: 'Agri Equipment', contactName: 'Rohan Joshi', email: 'rohan@fasaltech.in', phone: '9871234560', state: 'Rajasthan', status: 'pending', registeredAt: '2026-07-01', campaigns: 0, walletBalance: 10000, employees: 1 },
  { id: '6', name: 'KisanMitra Finance', companyId: 'KP-C-00837', category: 'Agri Finance', contactName: 'Deepa Verma', email: 'deepa@kisanmitra.com', phone: '9900112233', state: 'Uttar Pradesh', status: 'suspended', registeredAt: '2025-12-10', campaigns: 2, walletBalance: 0, employees: 3 },
];

const statusConfig = {
  approved: { label: 'Approved', icon: <CheckCircle size={12} />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending Review', icon: <Clock size={12} />, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspended', icon: <XCircle size={12} />, cls: 'bg-red-50 text-red-600 border-red-200' },
};

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyEntry[]>(mockCompanies);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const approve = (id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' as CompanyStatus } : c));
    toast('Company approved! They can now launch campaigns.', 'success');
    setOpenMenu(null);
  };

  const suspend = (id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'suspended' as CompanyStatus } : c));
    toast('Company account suspended.', 'info');
    setOpenMenu(null);
  };

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.companyId.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = { all: companies.length, approved: companies.filter(c => c.status === 'approved').length, pending: companies.filter(c => c.status === 'pending').length, suspended: companies.filter(c => c.status === 'suspended').length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Company Directory</h1>
          <p className="text-sm text-text-secondary mt-0.5">{counts.all} registered companies · {counts.pending} pending approval</p>
        </div>
        <Button variant="secondary" leftIcon={<Filter size={14} />}>Export List</Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(['all', 'approved', 'pending', 'suspended'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={[
              'flex items-center justify-between bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all',
              statusFilter === s ? 'border-primary shadow-sm' : 'border-border hover:border-border-dark',
            ].join(' ')}
          >
            <div className="text-left">
              <p className="text-xl font-bold text-text-primary">{counts[s]}</p>
              <p className="text-xs text-text-muted capitalize">{s === 'all' ? 'All Companies' : s}</p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${s === 'approved' ? 'bg-emerald-500' : s === 'pending' ? 'bg-amber-400' : s === 'suspended' ? 'bg-red-500' : 'bg-primary'}`} />
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <Card padding="md">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              placeholder="Search by company name, ID, or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as CompanyStatus | 'all')}
            className="border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-white cursor-pointer outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Company Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                {['Company', 'Company ID', 'Category', 'State', 'Campaigns', 'Wallet', 'Employees', 'Registered', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(company => {
                const cfg = statusConfig[company.status];
                return (
                  <tr key={company.id} className="hover:bg-surface-alt transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {company.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate max-w-[160px]">{company.name}</p>
                          <p className="text-xs text-text-muted">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-text-secondary">{company.companyId}</td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">{company.category}</td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">{company.state}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-text-primary">{company.campaigns}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-text-primary">₹{(company.walletBalance / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">{company.employees}</td>
                    <td className="px-4 py-3.5 text-xs text-text-muted">{company.registeredAt}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === company.id ? null : company.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === company.id && (
                          <div className="absolute right-0 top-8 bg-white border border-border rounded-xl shadow-lg z-20 w-40 py-1.5">
                            <button className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-text-secondary hover:bg-surface-alt cursor-pointer">
                              <ChevronRight size={13} /> View Details
                            </button>
                            {company.status === 'pending' && (
                              <button onClick={() => approve(company.id)} className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                                <CheckCircle size={13} /> Approve
                              </button>
                            )}
                            {company.status !== 'suspended' && (
                              <button onClick={() => suspend(company.id)} className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-error hover:bg-red-50 cursor-pointer">
                                <XCircle size={13} /> Suspend
                              </button>
                            )}
                            {company.status === 'suspended' && (
                              <button onClick={() => approve(company.id)} className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                                <CheckCircle size={13} /> Reinstate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
