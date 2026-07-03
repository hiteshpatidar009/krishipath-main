import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
      {description && <p className="text-sm text-text-secondary mt-1.5 max-w-xs">{description}</p>}
      {action && (
        <div className="mt-5">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
