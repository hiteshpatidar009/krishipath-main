import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

let addToastFn: ((msg: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type);
}

const icons = {
  success: <CheckCircle size={16} className="text-emerald-600 shrink-0" />,
  error: <XCircle size={16} className="text-red-500 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
  info: <Info size={16} className="text-blue-500 shrink-0" />,
};

const bg = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => { addToastFn = add; return () => { addToastFn = null; }; }, [add]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm text-text-primary min-w-[280px] max-w-sm animate-in slide-in-from-bottom-2 ${bg[t.type]}`}
        >
          {icons[t.type]}
          <span className="flex-1 font-medium">{t.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-text-muted hover:text-text-primary ml-1 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
