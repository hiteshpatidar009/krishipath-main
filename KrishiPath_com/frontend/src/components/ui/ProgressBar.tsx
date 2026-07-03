interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  showPct?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, label, sublabel, color = 'var(--color-primary)', showPct = true, size = 'md' }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const barH = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className="flex flex-col gap-1.5">
      {(label || sublabel || showPct) && (
        <div className="flex items-center justify-between">
          <div>
            {label && <span className="text-sm text-text-primary font-medium">{label}</span>}
            {sublabel && <span className="text-xs text-text-muted ml-1.5">{sublabel}</span>}
          </div>
          {showPct && <span className="text-xs font-semibold" style={{ color }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full ${barH} bg-surface-alt rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
