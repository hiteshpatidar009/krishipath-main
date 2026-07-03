import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, Gift, MapPin, Sprout, Trophy, Calendar } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Card, CardHeader } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import {
  kpiSummary, monthlyMetrics, rewardSpendBreakdown,
  topDistricts, topCrops, formatCurrency, formatNumber,
} from '../../data/mockData';

const periods = ['7 Days', '30 Days', '6 Months', 'Custom'];

export function Analytics() {
  const [period, setPeriod] = useState('6 Months');

  const prevMonth = monthlyMetrics[monthlyMetrics.length - 2];
  const currMonth = monthlyMetrics[monthlyMetrics.length - 1];
  const reachDelta = Math.round(((currMonth.reach - prevMonth.reach) / prevMonth.reach) * 100);
  const spendDelta = Math.round(((currMonth.spend - prevMonth.spend) / prevMonth.spend) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">Deep-dive into your campaign performance and farmer engagement</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-0.5">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
                period === p ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Reach"
          value={formatNumber(kpiSummary.totalReach)}
          icon={<Users size={18} className="text-primary" />}
          iconBg="bg-primary-50"
          delta={reachDelta}
          trend="up"
          deltaLabel="vs previous month"
        />
        <StatCard
          label="Unique Farmers"
          value={formatNumber(Math.round(kpiSummary.totalFarmers * 0.87))}
          icon={<Sprout size={18} className="text-teal-600" />}
          iconBg="bg-teal-50"
          delta={24}
          trend="up"
        />
        <StatCard
          label="Total Rewards Paid"
          value={formatCurrency(kpiSummary.rewardsDistributed)}
          icon={<Gift size={18} className="text-secondary-dark" />}
          iconBg="bg-amber-50"
          delta={spendDelta}
          trend="up"
        />
        <StatCard
          label="Average ROI"
          value={`${kpiSummary.avgROI}x`}
          icon={<TrendingUp size={18} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
          delta={18}
          trend="up"
        />
      </div>

      {/* Reach + Spend Area Chart */}
      <Card padding="lg">
        <CardHeader
          title="Reach & Spend Trend"
          subtitle="Farmer reach vs wallet spend over the selected period"
          action={<Button variant="ghost" size="sm" leftIcon={<Calendar size={13} />}>Export</Button>}
        />
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyMetrics} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="reachAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2E7D32" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F9A825" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#F9A825" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE8DD" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #DDE8DD', fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area yAxisId="left" type="monotone" dataKey="reach" name="Farmer Reach" stroke="#2E7D32" strokeWidth={2.5} fill="url(#reachAreaGrad)" />
            <Area yAxisId="right" type="monotone" dataKey="spend" name="Wallet Spend (₹)" stroke="#F9A825" strokeWidth={2.5} fill="url(#spendAreaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar + Pie Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader title="Engagement by Activity" subtitle="Monthly breakdown of farmer interactions" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyMetrics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE8DD" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #DDE8DD', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="videoViews" name="Video Views" fill="#2E7D32" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quizCompletions" name="Quiz Completions" fill="#F9A825" radius={[4, 4, 0, 0]} />
              <Bar dataKey="brochureDownloads" name="Downloads" fill="#039BE5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <CardHeader title="Reward Mix" subtitle="Spend by activity type" />
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={rewardSpendBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={3}>
                {rewardSpendBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 10, border: '1px solid #DDE8DD', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {rewardSpendBreakdown.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-text-secondary">{item.name.replace(' Rewards', '').replace('Platform Fees', 'Fees')}</span>
                </div>
                <span className="font-semibold text-text-primary">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Lists + Champion Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Campaign */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Trophy size={16} className="text-amber-600" /></div>
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">Top Campaign</h3>
              <p className="text-[10px] text-text-muted">This period</p>
            </div>
          </div>
          <p className="text-sm font-bold text-text-primary mb-1">Kharif Season Fertilizer Drive</p>
          <p className="text-xs text-text-muted mb-4">Maharashtra, MP, Gujarat · Product Awareness</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Reach', value: '18.4K' },
              { label: 'Video Views', value: '12.5K' },
              { label: 'Callbacks', value: '142' },
              { label: 'ROI', value: '4.1x' },
            ].map(s => (
              <div key={s.label} className="bg-surface-alt rounded-lg p-2.5">
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Districts */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><MapPin size={16} className="text-primary" /></div>
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">Top Districts</h3>
              <p className="text-[10px] text-text-muted">By farmer reach</p>
            </div>
          </div>
          <div className="space-y-3">
            {topDistricts.map((d, i) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-muted w-4">{i + 1}</span>
                    <span className="text-xs font-medium text-text-primary">{d.name}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{formatNumber(d.reach)}</span>
                </div>
                <ProgressBar value={d.pct} showPct={false} size="sm" color="#2E7D32" />
              </div>
            ))}
          </div>
        </Card>

        {/* Top Crops */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center"><Sprout size={16} className="text-teal-600" /></div>
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">Top Crops</h3>
              <p className="text-[10px] text-text-muted">By farmer engagement</p>
            </div>
          </div>
          <div className="space-y-3">
            {topCrops.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-muted w-4">{i + 1}</span>
                    <span className="text-xs font-medium text-text-primary">{c.name}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{formatNumber(c.engaged)}</span>
                </div>
                <ProgressBar value={c.pct} showPct={false} size="sm" color="#4CAF50" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Month-over-month comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Reach Growth', curr: currMonth.reach, prev: prevMonth.reach, fmt: formatNumber },
          { label: 'Video Views', curr: currMonth.videoViews, prev: prevMonth.videoViews, fmt: formatNumber },
          { label: 'Quiz Completions', curr: currMonth.quizCompletions, prev: prevMonth.quizCompletions, fmt: formatNumber },
          { label: 'Callback Requests', curr: currMonth.callbacks, prev: prevMonth.callbacks, fmt: String },
        ].map(({ label, curr, prev, fmt }) => {
          const delta = Math.round(((curr - prev) / prev) * 100);
          return (
            <Card padding="md" key={label}>
              <p className="text-xs text-text-muted mb-2">{label}</p>
              <p className="text-xl font-bold text-text-primary">{fmt(curr)}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {delta >= 0 ? '+' : ''}{delta}%
                </span>
                <span className="text-xs text-text-muted">vs {prevMonth.month}</span>
              </div>
              <div className="mt-2 h-1 bg-surface-alt rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (curr / (curr * 1.3)) * 100)}%` }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
