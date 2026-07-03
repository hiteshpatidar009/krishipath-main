import { useNavigate } from 'react-router-dom';
import {
  Wallet, Users, Megaphone, TrendingUp, Video, BookOpen,
  FileText, Phone, Plus, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { StatCard } from '../ui/StatCard';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, statusLabel } from '../ui/Badge';
import {
  kpiSummary as _kpiSummary, campaigns as _campaigns, farmerLeads as _farmerLeads, monthlyMetrics as _monthlyMetrics,
  rewardSpendBreakdown as _rewardSpendBreakdown, formatCurrency, formatNumber,
} from '../../data/mockData';
import type { KPISummary, MonthlyMetric, RewardBreakdownItem, Campaign, FarmerLead } from '../../types';

const quickActions = [
  { icon: Plus, label: 'Create Campaign', sub: 'Launch a new farmer campaign', to: '/campaigns/new', color: 'bg-primary', iconColor: 'text-white' },
  { icon: Wallet, label: 'Top Up Wallet', sub: 'Add funds to your wallet', to: '/wallet', color: 'bg-secondary', iconColor: 'text-text-primary' },
  { icon: TrendingUp, label: 'View Analytics', sub: 'Detailed performance reports', to: '/analytics', color: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: Users, label: 'Export Leads', sub: 'Download farmer contacts', to: '/leads', color: 'bg-purple-50', iconColor: 'text-purple-600' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-text-secondary mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' && p.value > 1000 ? formatNumber(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

interface DashboardProps {
  kpi?: KPISummary;
  metrics?: MonthlyMetric[];
  breakdown?: RewardBreakdownItem[];
  recentCampaigns?: Campaign[];
  recentLeads?: FarmerLead[];
}

export function Dashboard({ 
  kpi = _kpiSummary, 
  metrics = _monthlyMetrics, 
  breakdown = _rewardSpendBreakdown,
  recentCampaigns = _campaigns.slice(0, 3),
  recentLeads = _farmerLeads.filter(l => l.status === 'new' || l.status === 'contacted').slice(0, 5)
}: DashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Good morning, AgroGrow India 👋</h1>
          <p className="text-sm text-text-secondary mt-0.5">Here's what's happening with your campaigns today.</p>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => navigate('/campaigns/new')}>
          New Campaign
        </Button>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wallet Balance"
          value={formatCurrency(kpi?.walletBalance || 0)}
          icon={<Wallet size={18} className="text-primary" />}
          iconBg="bg-primary-50"
          delta={12}
          trend="up"
          deltaLabel="vs last month"
          action={
            <button onClick={() => navigate('/wallet')} className="text-[10px] font-semibold text-primary hover:underline cursor-pointer">Top Up</button>
          }
        />
        <StatCard
          label="Today's Spend"
          value={formatCurrency(kpi?.todaySpend || 0)}
          icon={<TrendingUp size={18} className="text-warning" />}
          iconBg="bg-amber-50"
          deltaLabel="across 2 active campaigns"
        />
        <StatCard
          label="Active Campaigns"
          value={String(kpi?.activeCampaigns || 0)}
          icon={<Megaphone size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
          delta={33}
          trend="up"
          deltaLabel="vs last month"
        />
        <StatCard
          label="Total Farmer Reach"
          value={formatNumber(kpi?.totalReach || 0)}
          icon={<Users size={18} className="text-purple-600" />}
          iconBg="bg-purple-50"
          delta={28}
          trend="up"
          deltaLabel="vs last month"
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Video Completion Rate"
          value={`${kpi?.videoCompletionRate || 0}%`}
          icon={<Video size={18} className="text-teal-600" />}
          iconBg="bg-teal-50"
          delta={5}
          trend="up"
        />
        <StatCard
          label="Quiz Completion Rate"
          value={`${kpi?.quizCompletionRate || 0}%`}
          icon={<BookOpen size={18} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          delta={8}
          trend="up"
        />
        <StatCard
          label="Brochure Downloads"
          value={formatNumber(kpi?.brochureDownloads || 0)}
          icon={<FileText size={18} className="text-orange-600" />}
          iconBg="bg-orange-50"
          delta={15}
          trend="up"
        />
        <StatCard
          label="Callback Requests"
          value={formatNumber(kpi?.callbackRequests || 0)}
          icon={<Phone size={18} className="text-rose-600" />}
          iconBg="bg-rose-50"
          delta={22}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padding="lg">
          <CardHeader
            title="Campaign Performance"
            subtitle="Farmer reach over the last 6 months"
            action={
              <button onClick={() => navigate('/analytics')} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer">
                Full Report <ArrowRight size={12} />
              </button>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2E7D32" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F9A825" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#F9A825" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE8DD" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              <Area type="monotone" dataKey="reach" name="Reach" stroke="#2E7D32" strokeWidth={2} fill="url(#reachGrad)" />
              <Area type="monotone" dataKey="videoViews" name="Video Views" stroke="#F9A825" strokeWidth={2} fill="url(#viewGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Reward Spend" subtitle="Breakdown by activity type" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {breakdown?.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 10, border: '1px solid #DDE8DD', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {breakdown?.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                  <span className="text-text-secondary">{item.name.replace(' Rewards', '')}</span>
                </div>
                <span className="font-semibold text-text-primary">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="none">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Recent Campaigns</h3>
              <p className="text-xs text-text-muted mt-0.5">Your latest campaign activity</p>
            </div>
            <button onClick={() => navigate('/campaigns')} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentCampaigns.map(c => (
              <div key={c.id} className="px-5 py-3.5 hover:bg-surface-alt transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{c.targetStates.join(', ')} · {c.goal}</p>
                  </div>
                  <Badge variant={c.status} dot>{statusLabel[c.status]}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-text-secondary"><span className="font-semibold text-text-primary">{formatNumber(c.reach)}</span> reach</span>
                  <span className="text-xs text-text-secondary"><span className="font-semibold text-text-primary">{c.callbackRequests}</span> callbacks</span>
                  <span className="text-xs text-text-secondary"><span className="font-semibold text-text-primary">{formatCurrency(c.walletUsed)}</span> spent</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="none">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Recent Leads</h3>
              <p className="text-xs text-text-muted mt-0.5">Farmers who requested callbacks</p>
            </div>
            <button onClick={() => navigate('/leads')} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentLeads.map(lead => (
              <div key={lead.id} className="px-5 py-3.5 hover:bg-surface-alt transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                    <p className="text-xs text-text-muted">{lead.district}, {lead.state} · {lead.crop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={lead.status} size="sm">{statusLabel[lead.status]}</Badge>
                  <button className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
                    <Phone size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, sub, to, color, iconColor }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-border-dark transition-all duration-200 text-left cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={18} className={iconColor} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-muted mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
