import React, { useEffect, useState } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Listen for Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette Modal */}
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[60vh]">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-lg"
            placeholder="Search mandis, traders, settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 uppercase">
            ESC
          </kbd>
        </div>

        {/* Results Area (Mocked for now) */}
        <div className="overflow-y-auto p-2">
          {query.length > 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-1">
                <ActionItem icon={<Command size={16} />} title="Go to Dashboard" />
                <ActionItem icon={<Search size={16} />} title="Search Mandis" />
                <ActionItem icon={<ArrowRight size={16} />} title="System Settings" />
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Use</span>
            <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">↑</kbd>
            <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Use</span>
            <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Enter</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ icon, title }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors text-sm text-left">
      <div className="text-slate-400">{icon}</div>
      <span className="font-medium">{title}</span>
    </button>
  );
}
