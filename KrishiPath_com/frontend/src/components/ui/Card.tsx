import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, padding = 'md', hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-border',
        'shadow-[0_1px_4px_rgba(46,125,50,0.06)]',
        hover ? 'transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(46,125,50,0.12)] cursor-pointer' : '',
        paddings[padding],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-3">{action}</div>}
    </div>
  );
}
