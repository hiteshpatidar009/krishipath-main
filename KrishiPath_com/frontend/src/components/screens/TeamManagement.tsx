import { useState } from 'react';
import { Plus, Users, Shield, Eye, Megaphone, Wallet, BarChart2, Trash2, MoreVertical, Mail, Copy, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';

interface Permission {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'invited' | 'suspended';
  lastLogin: string;
  addedAt: string;
}

const allPermissions: Permission[] = [
  { id: 'campaigns', label: 'Campaign Management', description: 'Create, edit, pause and launch campaigns', icon: <Megaphone size={14} className="text-primary" /> },
  { id: 'leads', label: 'View Farmer Leads', description: 'View and export farmer leads and contacts', icon: <Users size={14} className="text-indigo-600" /> },
  { id: 'wallet', label: 'Wallet Access', description: 'View wallet balance and transaction history', icon: <Wallet size={14} className="text-amber-600" /> },
  { id: 'wallet_topup', label: 'Wallet Top-Up', description: 'Add funds to the company wallet', icon: <Wallet size={14} className="text-amber-700" /> },
  { id: 'analytics', label: 'Analytics', description: 'View campaign analytics and reports', icon: <BarChart2 size={14} className="text-blue-600" /> },
  { id: 'team', label: 'Team Management', description: 'Invite and manage team members', icon: <Shield size={14} className="text-rose-600" /> },
  { id: 'rewards', label: 'Reward Settings', description: 'Configure reward amounts and types', icon: <Eye size={14} className="text-teal-600" /> },
];

const initialMembers: TeamMember[] = [
  { id: 'm-001', name: 'Rajesh Sharma', email: 'rajesh@agrogrow.in', role: 'Company Root', permissions: allPermissions.map(p => p.id), status: 'active', lastLogin: '2026-07-02T09:15:00', addedAt: '2026-03-15' },
  { id: 'm-002', name: 'Sunita Patel', email: 'sunita@agrogrow.in', role: 'Campaign Manager', permissions: ['campaigns', 'leads', 'analytics'], status: 'active', lastLogin: '2026-07-01T16:30:00', addedAt: '2026-04-10' },
  { id: 'm-003', name: 'Vikram Singh', email: 'vikram@agrogrow.in', role: 'Field Executive', permissions: ['leads', 'analytics'], status: 'active', lastLogin: '2026-06-30T11:00:00', addedAt: '2026-05-01' },
  { id: 'm-004', name: 'Pooja Mehta', email: 'pooja@agrogrow.in', role: 'Finance', permissions: ['wallet', 'wallet_topup', 'analytics'], status: 'invited', lastLogin: '—', addedAt: '2026-07-01' },
];

const roleTemplates = [
  { label: 'Campaign Manager', permissions: ['campaigns', 'leads', 'analytics'] },
  { label: 'Field Executive', permissions: ['leads', 'analytics'] },
  { label: 'Finance', permissions: ['wallet', 'wallet_topup', 'analytics'] },
  { label: 'Analyst', permissions: ['analytics', 'leads'] },
  { label: 'Custom', permissions: [] },
];

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Campaign Manager', permissions: ['campaigns', 'leads', 'analytics'] });
  const [inviteLoading, setInviteLoading] = useState(false);

  const applyTemplate = (templateLabel: string) => {
    const t = roleTemplates.find(r => r.label === templateLabel);
    if (t) setNewMember(prev => ({ ...prev, role: templateLabel, permissions: [...t.permissions] }));
  };

  const togglePermission = (id: string) => {
    setNewMember(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id) ? prev.permissions.filter(p => p !== id) : [...prev.permissions, id],
    }));
  };

  const sendInvite = () => {
    if (!newMember.name || !newMember.email) { toast('Please fill name and email', 'error'); return; }
    setInviteLoading(true);
    setTimeout(() => {
      const member: TeamMember = {
        id: `m-${Date.now()}`,
        ...newMember,
        status: 'invited',
        lastLogin: '—',
        addedAt: new Date().toISOString().split('T')[0],
      };
      setMembers(prev => [...prev, member]);
      setInviteLoading(false);
      setInviteOpen(false);
      setNewMember({ name: '', email: '', role: 'Campaign Manager', permissions: ['campaigns', 'leads', 'analytics'] });
      toast(`Invitation sent to ${member.email}`, 'success');
    }, 1400);
  };

  const removeMember = (id: string) => {
    const name = members.find(m => m.id === id)?.name;
    setMembers(prev => prev.filter(m => m.id !== id));
    toast(`${name} removed from team`, 'info');
    setOpenMenu(null);
  };

  const copyCompanyId = () => {
    navigator.clipboard.writeText('KP-C-00842');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast('Company ID copied to clipboard', 'success');
  };

  const statusBadge = (status: string) => {
    if (status === 'active') return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
    if (status === 'invited') return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Invited</span>;
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Suspended</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Team Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">{members.length} members · Manage roles and permissions</p>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setInviteOpen(true)}>Invite Member</Button>
      </div>

      {/* Company ID Card */}
      <Card padding="md" className="bg-primary-50 border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Your Company ID</p>
              <p className="text-xs text-text-secondary mt-0.5">Share this with employees so they can log in under your account</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <code className="text-lg font-bold text-primary font-mono tracking-widest">KP-C-00842</code>
            <button onClick={copyCompanyId} className="flex items-center gap-1.5 text-xs text-primary border border-primary-100 rounded-lg px-2.5 py-1.5 hover:bg-white transition-colors cursor-pointer font-medium">
              {copiedId ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-semibold text-text-primary">Team Members</h3>
          <p className="text-xs text-text-muted mt-0.5">Root account has full access and cannot be restricted</p>
        </div>
        <div className="divide-y divide-border">
          {members.map(member => (
            <div key={member.id} className="px-5 py-4 hover:bg-surface-alt transition-colors group flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${member.role === 'Company Root' ? 'bg-primary text-white' : 'bg-primary-50 text-primary'}`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-text-primary">{member.name}</p>
                    {member.role === 'Company Root' && <span className="text-[9px] font-bold text-white bg-primary px-1.5 py-0.5 rounded">ROOT</span>}
                    {statusBadge(member.status)}
                  </div>
                  <p className="text-xs text-text-secondary">{member.email}</p>
                  <p className="text-xs text-text-muted mt-0.5">{member.role} · Last login: {member.lastLogin === '—' ? 'Never' : new Date(member.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.permissions.slice(0, 4).map(pid => {
                      const perm = allPermissions.find(p => p.id === pid);
                      return perm ? (
                        <span key={pid} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-surface-alt text-text-secondary rounded-full border border-border">
                          {perm.icon} {perm.label}
                        </span>
                      ) : null;
                    })}
                    {member.permissions.length > 4 && (
                      <span className="text-[10px] text-text-muted px-2 py-0.5">+{member.permissions.length - 4} more</span>
                    )}
                    {member.role === 'Company Root' && (
                      <span className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary rounded-full border border-primary-100 font-medium">All permissions</span>
                    )}
                  </div>
                </div>
              </div>

              {member.role !== 'Company Root' && (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={15} />
                  </button>
                  {openMenu === member.id && (
                    <div className="absolute right-0 top-8 bg-white border border-border rounded-xl shadow-lg z-20 w-40 py-1.5">
                      <button className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-text-secondary hover:bg-surface-alt cursor-pointer">
                        <Mail size={13} /> Resend Invite
                      </button>
                      <button onClick={() => removeMember(member.id)} className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-error hover:bg-red-50 cursor-pointer">
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={sendInvite} loading={inviteLoading} className="flex-1" leftIcon={<Mail size={14} />}>
              Send Invitation
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Full Name <span className="text-error">*</span></label>
              <input
                value={newMember.name}
                onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sunita Patel"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Email Address <span className="text-error">*</span></label>
              <input
                type="email"
                value={newMember.email}
                onChange={e => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="sunita@yourcompany.com"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">Role Template</label>
            <div className="flex flex-wrap gap-2">
              {roleTemplates.map(t => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t.label)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                    newMember.role === t.label ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-border-dark',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">Permissions</label>
            <div className="space-y-2">
              {allPermissions.map(perm => (
                <label key={perm.id} className={[
                  'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                  newMember.permissions.includes(perm.id) ? 'border-primary bg-primary-50' : 'border-border hover:border-border-dark',
                ].join(' ')}>
                  <input
                    type="checkbox"
                    checked={newMember.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="accent-primary mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {perm.icon}
                      <p className="text-xs font-semibold text-text-primary">{perm.label}</p>
                    </div>
                    <p className="text-[11px] text-text-muted">{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-800">
              An invitation email will be sent to <strong>{newMember.email || 'the employee'}</strong> with a link to set up their password. They'll use your Company ID <strong>KP-C-00842</strong> + their email to log in.
            </p>
          </div>
        </div>
      </Modal>

      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
