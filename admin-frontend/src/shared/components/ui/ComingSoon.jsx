import React from 'react';
import { Hammer, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract a readable name from the pathname (e.g., "/app/master/categories" -> "Categories")
  const pathParts = location.pathname.split('/');
  const moduleName = pathParts[pathParts.length - 1]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Hammer className="text-slate-400" size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {moduleName} - Coming Soon
      </h1>
      <p className="text-slate-500 mb-8">
        The interface for the <span className="font-semibold text-slate-700">{moduleName}</span> module is currently under construction by the architecture team.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
      >
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );
}
