import type { CampaignStatus, LeadStatus } from '../../data/mockData';

type BadgeVariant = CampaignStatus | LeadStatus | 'info' | 'default' | 'recharge' | 'campaign-spend' | 'reward-distributed' | 'platform-fee' | 'bonus';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const styles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  draft: 'bg-gray-100 text-gray-600 border border-gray-200',
  paused: 'bg-amber-50 text-amber-700 border border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  new: 'bg-purple-50 text-purple-700 border border-purple-200',
  contacted: 'bg-sky-50 text-sky-700 border border-sky-200',
  interested: 'bg-teal-50 text-teal-700 border border-teal-200',
  converted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'not-interested': 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  default: 'bg-gray-100 text-gray-600 border border-gray-200',
  recharge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'campaign-spend': 'bg-orange-50 text-orange-700 border border-orange-200',
  'reward-distributed': 'bg-purple-50 text-purple-700 border border-purple-200',
  'platform-fee': 'bg-gray-100 text-gray-600 border border-gray-200',
  bonus: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const dotColors: Record<string, string> = {
  active: 'bg-emerald-500',
  draft: 'bg-gray-400',
  paused: 'bg-amber-500',
  completed: 'bg-blue-500',
  new: 'bg-purple-500',
  contacted: 'bg-sky-500',
  interested: 'bg-teal-500',
  converted: 'bg-emerald-500',
  'not-interested': 'bg-red-500',
};

export function Badge({ variant = 'default', children, size = 'md', dot = false }: BadgeProps) {
  const style = styles[variant] ?? styles.default;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${style} ${sizeClass}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] ?? 'bg-gray-400'}`} />}
      {children}
    </span>
  );
}

export const statusLabel: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  paused: 'Paused',
  completed: 'Completed',
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  converted: 'Converted',
  'not-interested': 'Not Interested',
  recharge: 'Recharge',
  'campaign-spend': 'Campaign Spend',
  'reward-distributed': 'Rewards',
  'platform-fee': 'Platform Fee',
  bonus: 'Bonus',
};
