import React from 'react';
import { motion } from 'framer-motion';

export default function TranslationTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <span className={isActive ? 'text-green-600' : 'text-slate-400'}>{tab.icon}</span>}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
