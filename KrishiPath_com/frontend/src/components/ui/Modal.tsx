import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} flex flex-col max-h-[90vh]`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer z-10">
            <X size={16} />
          </button>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
