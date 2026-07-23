import React, { useState } from 'react';
import { useGlobalCrops, useCreateGlobalCrop, useMasterData } from '../../mandi/api/mandiApi';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';
import { Leaf, Plus, MoreVertical, Eye, Edit2, Archive, Copy, Globe, History, X } from 'lucide-react';
import { translateToAll, LANG_FIELDS } from '../../../utils/translate';

export default function CropCatalog() {
  const { data: crops, isLoading, isError } = useGlobalCrops();
  const { data: categories = [], isLoading: isLoadingCategories } = useMasterData('crop_category');
  const createCrop = useCreateGlobalCrop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [form, setForm] = useState({ name: '', category: '', imageUrl: '', status: 'ACTIVE', translations: {} });
  const [translating, setTranslating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAutoTranslate = async () => {
    if (!form.name) return;
    setTranslating(true);
    try {
      const results = await translateToAll(form.name, LANG_FIELDS.filter(l => l.key !== 'en').map(l => l.key));
      setForm(prev => ({ ...prev, translations: { ...prev.translations, ...results } }));
    } catch (e) {
      console.error(e);
    } finally {
      setTranslating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCrop.mutateAsync(form);
      setIsModalOpen(false);
      setForm({ name: '', category: '', imageUrl: '', status: 'ACTIVE', translations: {} });
    } catch (e) {
      alert("Failed to create Crop.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const columns = [
    { 
      header: 'Crop Name', 
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Leaf size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{row.name}</span>
            <span className="text-xs text-slate-500 font-mono">{row.code || row.id}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Category', 
      accessorKey: 'category',
      cell: (row) => (
        <span className="text-slate-600 font-medium">{row.category}</span>
      )
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
          row.status === 'ACTIVE' || row.status === 'Active'
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          {(row.status || 'ACTIVE').toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <div className="relative">
          <button 
            onClick={() => toggleDropdown(row.id)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          
          {activeDropdown === row.id && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 flex flex-col">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                <Eye size={14} className="text-slate-400" /> View Details
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                <Edit2 size={14} className="text-slate-400" /> Edit Catalog
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                <Copy size={14} className="text-slate-400" /> Duplicate
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                <Globe size={14} className="text-slate-400" /> Translations
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                <History size={14} className="text-slate-400" /> History
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                <Archive size={14} className="text-red-400" /> Archive
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  // Removed unused DynamicForm schema and formFields

  if (isLoading || isLoadingCategories) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        Error loading crops. Make sure the backend API is connected!
      </div>
    );
  }

  return (
    <div className="space-y-6" onClick={() => activeDropdown && setActiveDropdown(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Crop Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">Centralized registry for all platform commodities.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> Add Crop
        </button>
      </div>

      <EnterpriseTable 
        title={`Total Crops (${crops.length})`}
        columns={columns}
        data={crops}
      />

      {/* Add Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Leaf size={18} className="text-emerald-600" /> Register New Crop
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              
              {/* Name & Translation Row */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Crop Name (English) <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                    placeholder="e.g. Soybean"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={translating || !form.name}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                    title="Auto-translate to all languages"
                  >
                    {translating ? <span className="animate-pulse">...</span> : <Globe size={15} />}
                    Translate
                  </button>
                </div>

                {/* Translations Row */}
                <div className="flex gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-x-auto pb-1">
                  {LANG_FIELDS.filter(l => l.key !== 'en').map(lang => (
                    <div key={lang.key} className="w-28 shrink-0 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 mb-0.5">{lang.flag} {lang.label}</span>
                      <input
                        type="text"
                        value={form.translations?.[lang.key] || ''}
                        onChange={e => {
                          const newTrans = { ...(form.translations || {}), [lang.key]: e.target.value };
                          setForm({ ...form, translations: newTrans });
                        }}
                        placeholder={lang.label}
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.name || !form.category}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Creating...' : 'Create Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
