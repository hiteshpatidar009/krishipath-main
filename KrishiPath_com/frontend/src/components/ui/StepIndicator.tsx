import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shrink-0',
                  done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary-50' : 'bg-surface-alt text-text-muted border border-border',
                ].join(' ')}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : <span>{i + 1}</span>}
              </div>
              <div className="mt-1.5 text-center">
                <div className={`text-xs font-medium whitespace-nowrap ${active ? 'text-primary' : done ? 'text-text-secondary' : 'text-text-muted'}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-[10px] text-text-muted hidden sm:block">{step.description}</div>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-6 rounded-full transition-all duration-300" style={{ background: done ? 'var(--color-primary)' : 'var(--color-border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
