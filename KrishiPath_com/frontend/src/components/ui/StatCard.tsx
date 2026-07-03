import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg?: string;
  delta?: number;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  sublabel?: string;
  action?: ReactNode;
}

export function StatCard({ label, value, icon, iconBg = 'bg-primary-50', delta, deltaLabel, trend, sublabel, action }: StatCardProps) {
  const isPositive = trend === 'up' || (delta !== undefined && delta >= 0);
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-[0_1px_4px_rgba(46,125,50,0.06)] flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        {action && <div>{action}</div>}
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-text-primary tracking-tight">{value}</div>
        <div className="text-xs text-text-secondary mt-0.5">{label}</div>
        {deltaLabel && <div className="text-xs text-text-muted mt-1">{deltaLabel}</div>}
        {sublabel && <div className="text-xs text-text-muted mt-1">{sublabel}</div>}
      </div>
    </div>
  );
}
