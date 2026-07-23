import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Languages, 
  Package, 
  Layers, 
  Scale, 
  LayoutList,
  MapPin,
  BookOpen,
  Newspaper,
  Video,
  BarChart,
  HelpCircle,
  Users
} from 'lucide-react';
import TranslationTabs from '../components/TranslationTabs';
import MissingTranslationsTable from '../components/MissingTranslationsTable';
import ConceptDictionaryTab from '../components/ConceptDictionaryTab';
import { useLanguages } from '../api/localizationApi';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';

const TABS = [
  { id: 'languages', label: 'Supported Languages', icon: <Languages size={16} /> },
  { id: 'PRODUCT', label: 'Products', icon: <Package size={16} /> },
  { id: 'CATEGORY', label: 'Categories', icon: <Layers size={16} /> },
  { id: 'VARIANT', label: 'Variants & Grades', icon: <Scale size={16} /> },
  { id: 'UNIT', label: 'Units', icon: <LayoutList size={16} /> },
  { id: 'MANDI', label: 'Mandis', icon: <MapPin size={16} /> },
  { id: 'content_schemes', label: 'Govt Schemes', icon: <Newspaper size={16} /> },
  { id: 'content_predictions', label: 'Predictions', icon: <BarChart size={16} /> },
  { id: 'content_polls', label: 'Polls', icon: <HelpCircle size={16} /> },
  { id: 'content_creators', label: 'Creators', icon: <Users size={16} /> },
  { id: 'content_shorts', label: 'Shorts', icon: <Video size={16} /> },
  { id: 'dictionary', label: 'Concept Dictionary', icon: <BookOpen size={16} /> }
];

export default function TranslationCenter() {
  const [activeTab, setActiveTab] = useState('languages');
  const [targetLang, setTargetLang] = useState('hi'); // Default target for missing translations
  const { data: languages, isLoading: isLoadingLangs } = useLanguages();

  // The active language list (excluding english) for the dropdown
  const targetLanguages = (languages || []).filter(l => l.code !== 'en');

  const renderContent = () => {
    if (activeTab === 'languages') {
      return (
        <motion.div
          key="languages"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configured Languages</h3>
              <p className="text-sm text-slate-500">The languages currently active in the KrishiPath ecosystem.</p>
            </div>
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors">
              + Add Language
            </button>
          </div>
          
          <EnterpriseTable 
            columns={[
              { header: 'Code', accessorKey: 'code', cell: (r) => <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{r.code}</span> },
              { header: 'Native Name', accessorKey: 'nativeName', cell: (r) => <span className="font-medium text-slate-800">{r.nativeName}</span> },
              { header: 'English Name', accessorKey: 'name', cell: (r) => <span className="text-slate-600">{r.name}</span> },
            ]}
            data={languages || []}
            isLoading={isLoadingLangs}
          />
        </motion.div>
      );
    }

    if (activeTab === 'dictionary') {
      return (
        <motion.div
          key="dictionary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <ConceptDictionaryTab />
        </motion.div>
      );
    }

    // Otherwise, it's one of the missing translation tabs
    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Missing Translations Report</h3>
            <p className="text-sm text-slate-500">Find and approve DRAFT translations for {TABS.find(t => t.id === activeTab)?.label}.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600">Target Language:</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-green-500 transition-colors"
            >
              {targetLanguages.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName} ({l.code})</option>
              ))}
            </select>
          </div>
        </div>

        <MissingTranslationsTable language={targetLang} entityType={activeTab} />
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            Translation Center
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            Centralized hub for managing Master Data translations, language configurations, and AI terminology routing across the platform.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <TranslationTabs 
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

    </div>
  );
}
