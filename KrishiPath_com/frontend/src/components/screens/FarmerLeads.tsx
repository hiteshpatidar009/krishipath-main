import { useState } from 'react';
import { ArrowLeft, Video, BookOpen, Phone, Download, Search, Eye, EyeOff, Share2, FileText, ChevronRight, Filter, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge, statusLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { campaigns as _campaigns, farmerLeads as _farmerLeads, formatDate } from '../../data/mockData';
import type { Campaign, FarmerLead, LeadStatus } from '../../types';

type LeadType = 'video' | 'quiz' | 'callback';

interface LeadTypeConfig {
  id: LeadType;
  label: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  borderColor: string;
  description: string;
  privacy: string;
  exportLabel: string;
  canSeeContact: boolean;
}

const leadTypes: LeadTypeConfig[] = [
  {
    id: 'video',
    label: 'Video Leads',
    icon: <Video size={16} />,
    color: 'text-primary',
    iconBg: 'bg-primary-50',
    borderColor: 'border-primary-100',
    description: 'Farmers who completed your campaign video',
    privacy: 'Username only — contact info not shared. These farmers engaged but did not opt in for contact.',
    exportLabel: 'Export for Retargeting',
    canSeeContact: false,
  },
  {
    id: 'quiz',
    label: 'Quiz Leads',
    icon: <BookOpen size={16} />,
    color: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    description: 'Farmers who completed the product knowledge quiz',
    privacy: 'Username only — contact info not shared. These farmers showed knowledge intent but did not opt in.',
    exportLabel: 'Export for Retargeting',
    canSeeContact: false,
  },
  {
    id: 'callback',
    label: 'Callback Leads',
    icon: <Phone size={16} />,
    color: 'text-rose-600',
    iconBg: 'bg-rose-50',
    borderColor: 'border-rose-100',
    description: 'Farmers who explicitly requested a sales callback',
    privacy: 'Phone number visible — farmer opted in by requesting a callback. You may contact them directly.',
    exportLabel: 'Export Contact List',
    canSeeContact: true,
  },
];

// Map campaign leads by type (simulate: video/quiz/callback based on random assignment)
function getLeadsForCampaign(campaignId: string, type: LeadType, sourceLeads: FarmerLead[]): FarmerLead[] {
  const base = sourceLeads.filter(l => l.campaignId === campaignId);
  // Distribute evenly across types (deterministic by id hash)
  return base.filter((_, i) => {
    if (type === 'video') return i % 3 === 0;
    if (type === 'quiz') return i % 3 === 1;
    return i % 3 === 2;
  });
}

function getLeadCount(campaignId: string, type: LeadType, sourceCampaigns: Campaign[]): number {
  const campaignObj = sourceCampaigns.find(c => c.id === campaignId);
  if (!campaignObj) return 0;
  if (type === 'video') return campaignObj.videoViews;
  if (type === 'quiz') return campaignObj.quizCompletions;
  return campaignObj.callbackRequests;
}

// Retargeting export modal content
function RetargetingModal({ type, leads, onClose }: { type: LeadTypeConfig; leads: FarmerLead[]; onClose: () => void }) {
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('facebook');

  const handleExport = () => {
    toast(`${leads.length} farmers exported for ${platform === 'facebook' ? 'Facebook' : 'Instagram'} retargeting!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-[15px] font-bold text-text-primary mb-1">{type.exportLabel}</h2>
        <p className="text-xs text-text-secondary mb-5">{leads.length} farmer profiles ready to export</p>

        <div className="bg-surface-alt rounded-xl p-4 border border-border mb-5">
          <p className="text-xs font-semibold text-text-primary mb-2">What's included in this export?</p>
          {type.canSeeContact ? (
            <ul className="text-xs text-text-secondary space-y-1">
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Farmer username (KrishiPath handle)</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Mobile number (farmer opted in)</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> State & District</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Crop type</li>
            </ul>
          ) : (
            <ul className="text-xs text-text-secondary space-y-1">
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Farmer username (KrishiPath handle)</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> State</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Crop type</li>
              <li className="flex items-center gap-2"><span className="text-error">✗</span> Contact number (not shared — farmer didn't opt in)</li>
            </ul>
          )}
        </div>

        <p className="text-xs font-semibold text-text-secondary mb-2">Export for platform</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setPlatform('facebook')}
            className={['flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer', platform === 'facebook' ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-border-dark'].join(' ')}
          >
            <span className="text-blue-600 font-bold text-base leading-none">f</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-text-primary">Facebook Ads</p>
              <p className="text-[10px] text-text-muted">Custom Audience</p>
            </div>
          </button>
          <button
            onClick={() => setPlatform('instagram')}
            className={['flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer', platform === 'instagram' ? 'border-pink-500 bg-pink-50' : 'border-border hover:border-border-dark'].join(' ')}
          >
            <span className="text-pink-600 font-bold text-base leading-none">ig</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-text-primary">Instagram</p>
              <p className="text-[10px] text-text-muted">Custom Audience</p>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-text-muted mb-4">
          Export will generate a CSV file formatted for {platform === 'facebook' ? 'Facebook Business Manager → Audiences → Custom Audience → Customer List' : 'Instagram → Ads Manager → Custom Audience'}. Upload this file to create a matched audience for retargeting ads.
        </p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleExport} leftIcon={<Download size={14} />} className="flex-1">
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FarmerLeadsProps {
  leads?: FarmerLead[];
  onUpdateStatus?: (id: string, status: LeadStatus) => Promise<void>;
  onExport?: (filters: any) => void;
  onFilterChange?: (filters: any) => void;
}

export function FarmerLeads({
  leads = _farmerLeads,
  onUpdateStatus,
  onExport,
  onFilterChange
}: FarmerLeadsProps = {}) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedType, setSelectedType] = useState<LeadTypeConfig | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());
  const [exportTarget, setExportTarget] = useState<LeadTypeConfig | null>(null);
  const [localLeads, setLocalLeads] = useState<FarmerLead[]>([]);

  const openCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSelectedType(null);
  };

  const openLeadType = (type: LeadTypeConfig) => {
    setSelectedType(type);
    const specificLeads = getLeadsForCampaign(selectedCampaign!.id, type.id, leads);
    setLocalLeads(specificLeads);
    setSearch('');
    setStatusFilter('all');
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    if (onUpdateStatus) {
      await onUpdateStatus(id, status);
    }
    setLocalLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast(`Lead status updated`, 'success');
  };

  const filtered = onFilterChange 
    ? localLeads
    : localLeads.filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q || l.name.toLowerCase().includes(q) || l.district.toLowerCase().includes(q) || l.phone.includes(q);
        const matchStatus = statusFilter === 'all' || l.status === statusFilter;
        return matchSearch && matchStatus;
    });

  // ── Campaign List ────────────────────────────────────────────────────────────
  if (!selectedCampaign) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Farmer Leads</h1>
          <p className="text-sm text-text-secondary mt-0.5">Select a campaign to view leads by engagement type</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Video Leads', value: _campaigns.reduce((a, c) => a + c.videoViews, 0).toLocaleString('en-IN'), icon: <Video size={16} className="text-primary" />, bg: 'bg-primary-50' },
            { label: 'Total Quiz Leads', value: _campaigns.reduce((a, c) => a + c.quizCompletions, 0).toLocaleString('en-IN'), icon: <BookOpen size={16} className="text-indigo-600" />, bg: 'bg-indigo-50' },
            { label: 'Callback Leads', value: _campaigns.reduce((a, c) => a + c.callbackRequests, 0).toLocaleString('en-IN'), icon: <Phone size={16} className="text-rose-600" />, bg: 'bg-rose-50' },
          ].map(s => (
            <Card padding="md" key={s.label}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card padding="none">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-[15px] font-semibold text-text-primary">Campaigns</h3>
            <p className="text-xs text-text-muted mt-0.5">Click a campaign to view its farmer leads by type</p>
          </div>
          <div className="divide-y divide-border">
            {_campaigns.filter(c => c.reach > 0).map(campaign => (
              <button
                key={campaign.id}
                onClick={() => openCampaign(campaign)}
                className="w-full px-5 py-4 hover:bg-surface-alt transition-colors text-left flex items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{campaign.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{campaign.goal} · {campaign.targetStates.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-bold text-primary">{campaign.videoViews.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-text-muted">Video</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-bold text-indigo-600">{campaign.quizCompletions.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-text-muted">Quiz</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-bold text-rose-600">{campaign.callbackRequests}</p>
                    <p className="text-[10px] text-text-muted">Callbacks</p>
                  </div>
                  <Badge variant={campaign.status} dot>{statusLabel[campaign.status]}</Badge>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ── Lead Type Selection ───────────────────────────────────────────────────────
  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => setSelectedCampaign(null)}>All Campaigns</Button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{selectedCampaign.name}</h1>
            <p className="text-sm text-text-secondary mt-0.5">Select lead type to view farmer profiles</p>
          </div>
        </div>

        {/* Campaign stats bar */}
        <Card padding="md">
          <div className="flex items-center gap-6 flex-wrap">
            <Badge variant={selectedCampaign.status} dot>{statusLabel[selectedCampaign.status]}</Badge>
            <span className="text-sm text-text-secondary"><strong className="text-text-primary">{selectedCampaign.reach.toLocaleString('en-IN')}</strong> total reach</span>
            <span className="text-sm text-text-secondary"><strong className="text-text-primary">{selectedCampaign.targetStates.join(', ')}</strong></span>
            <span className="text-sm text-text-secondary"><strong className="text-text-primary">{selectedCampaign.targetCrops.join(', ')}</strong></span>
          </div>
        </Card>

        {/* Lead Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leadTypes.map(type => {
            const count = getLeadCount(selectedCampaign.id, type.id, _campaigns);
            return (
              <button
                key={type.id}
                onClick={() => openLeadType(type)}
                className={`text-left bg-white rounded-2xl border-2 ${type.borderColor} p-5 hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className={`w-12 h-12 rounded-xl ${type.iconBg} flex items-center justify-center mb-4 ${type.color}`}>
                  {type.icon}
                </div>
                <p className="text-lg font-bold text-text-primary">{count.toLocaleString('en-IN')}</p>
                <p className="text-[15px] font-semibold text-text-primary mt-0.5">{type.label}</p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{type.description}</p>

                <div className={`mt-4 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg inline-block ${type.canSeeContact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {type.canSeeContact ? '📞 Contact number visible' : '👤 Username only — privacy protected'}
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs text-text-muted group-hover:text-primary transition-colors">
                  View leads <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Retargeting info */}
        <Card padding="md" className="bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <Share2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Retarget Your Audience on Social Media</p>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Export Video or Quiz leads as custom audience lists for Facebook and Instagram ads. Reach the same farmers who engaged with your KrishiPath campaign — without sharing their contact info.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Lead Detail View ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => setSelectedType(null)}>
            {selectedCampaign.name}
          </Button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${selectedType.iconBg} ${selectedType.color}`}>
            {selectedType.icon}
            <span className="text-sm font-semibold">{selectedType.label}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={selectedType.canSeeContact ? <FileText size={13} /> : <Share2 size={13} />}
            onClick={() => setExportTarget(selectedType)}
          >
            {selectedType.exportLabel}
          </Button>
        </div>
      </div>

      {/* Privacy notice */}
      <div className={`rounded-xl px-4 py-3 border flex items-start gap-3 ${selectedType.canSeeContact ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        {selectedType.canSeeContact ? (
          <Phone size={15} className="text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <Eye size={15} className="text-amber-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-xs font-semibold ${selectedType.canSeeContact ? 'text-emerald-800' : 'text-amber-800'}`}>
            {selectedType.canSeeContact ? 'Contact number visible — farmer opted in' : 'Privacy protected — username only'}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">{selectedType.privacy}</p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 border border-border rounded-lg px-3 py-2">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              placeholder="Search by name or district…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
            />
          </div>
          {selectedType.canSeeContact && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-white cursor-pointer outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="converted">Converted</option>
              <option value="not-interested">Not Interested</option>
            </select>
          )}
          <Button variant="secondary" size="sm" leftIcon={<Filter size={13} />}>Filter</Button>
          <span className="text-xs text-text-muted">{filtered.length} leads</span>
        </div>
      </Card>

      {/* Leads Table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className={`w-14 h-14 rounded-2xl ${selectedType.iconBg} flex items-center justify-center mb-4 ${selectedType.color}`}>{selectedType.icon}</div>
            <p className="text-[15px] font-semibold text-text-primary">No leads found</p>
            <p className="text-sm text-text-secondary mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Farmer</th>
                  {selectedType.canSeeContact && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Phone</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Crop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Date</th>
                  {selectedType.canSeeContact && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Status</th>
                  )}
                  {selectedType.canSeeContact && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-surface-alt transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full ${selectedType.iconBg} flex items-center justify-center text-[10px] font-bold shrink-0 ${selectedType.color}`}>
                          {lead.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          {selectedType.canSeeContact ? (
                            <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                          ) : (
                            <p className="text-sm font-medium text-text-secondary">
                              {lead.name.split(' ')[0]} {lead.name.split(' ')[1]?.[0]}.
                              <span className="text-[10px] text-text-muted ml-1">(KrishiPath handle)</span>
                            </p>
                          )}
                          <p className="text-xs text-text-muted">{lead.landSize}</p>
                        </div>
                      </div>
                    </td>
                    {selectedType.canSeeContact && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-mono text-text-secondary">
                            {revealedPhones.has(lead.id) ? lead.phone : `${lead.phone.slice(0, 5)}-XXXXX`}
                          </span>
                          <button
                            onClick={() => setRevealedPhones(prev => {
                              const next = new Set(prev);
                              next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id);
                              return next;
                            })}
                            className="text-text-muted hover:text-text-primary cursor-pointer"
                          >
                            {revealedPhones.has(lead.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-text-primary">{lead.district}</p>
                      <p className="text-xs text-text-muted">{lead.state}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">{lead.crop}</td>
                    <td className="px-4 py-3.5 text-xs text-text-muted">{formatDate(lead.requestedAt)}</td>
                    {selectedType.canSeeContact && (
                      <td className="px-4 py-3.5">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value as LeadStatus)}
                          className="border border-border rounded-lg px-2 py-1 text-xs text-text-primary bg-white cursor-pointer outline-none focus:border-primary"
                        >
                          {['new', 'contacted', 'interested', 'converted', 'not-interested'].map(s => (
                            <option key={s} value={s}>{statusLabel[s]}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    {selectedType.canSeeContact && (
                      <td className="px-4 py-3.5">
                        <a
                          href={`tel:+91${lead.phone}`}
                          className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <Phone size={12} />
                        </a>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Export footer */}
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          <p className="text-xs text-text-muted">{filtered.length} {selectedType.label.toLowerCase()} in this campaign</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setExportTarget(selectedType)} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline cursor-pointer">
              <span className="font-bold text-xs leading-none">f</span> Export for Facebook
            </button>
            <span className="text-border">·</span>
            <button onClick={() => setExportTarget(selectedType)} className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:underline cursor-pointer">
              <span className="font-bold text-xs leading-none">ig</span> Export for Instagram
            </button>
          </div>
        </div>
      </Card>

      {exportTarget && (
        <RetargetingModal
          type={exportTarget}
          leads={filtered}
          onClose={() => setExportTarget(null)}
        />
      )}
    </div>
  );
}
