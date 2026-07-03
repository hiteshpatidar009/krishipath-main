import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm',
  secondary: 'bg-white border border-border text-text-primary hover:bg-surface-alt hover:border-border-dark',
  ghost: 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
  danger: 'bg-error text-white hover:opacity-90 active:scale-[0.98]',
  warning: 'bg-secondary text-text-primary hover:bg-secondary-dark active:scale-[0.98]',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin shrink-0" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
