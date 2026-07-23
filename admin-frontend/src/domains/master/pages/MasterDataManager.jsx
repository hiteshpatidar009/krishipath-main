import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, CheckCircle, AlertCircle, RefreshCw, Search, Globe } from 'lucide-react';
import api from '../../../services/api';
import { translateToAll, LANG_FIELDS } from '../../../utils/translate';

const LABELS = {
  crop_category: {
    title: 'Crop Categories',
    singular: 'Crop Category',
    hint: 'Group crops into clear agricultural categories.',
    codePlaceholder: 'e.g. GRAIN',
    namePlaceholder: 'e.g. Grains & Cereals',
  },
  grade: {
    title: 'Grades',
    singular: 'Grade',
    hint: 'Maintain quality grades used in mandi pricing.',
    codePlaceholder: 'e.g. A1',
    namePlaceholder: 'e.g. Premium Grade A',
  },
  unit: {
    title: 'Units',
    singular: 'Unit',
    hint: 'Maintain units used for crop quantities and prices.',
    codePlaceholder: 'e.g. QTL',
    namePlaceholder: 'e.g. Quintal',
  },
  language: {
    title: 'Languages',
    singular: 'Language',
    hint: 'Enable languages available in KrishiPath.',
    codePlaceholder: 'e.g. HI',
    namePlaceholder: 'e.g. Hindi',
  },
};

const BLANK = { name: '', code: '', description: '', status: 'ACTIVE', translations: {} };

export default function MasterDataManager({ type }) {
  const copy = LABELS[type] || { title: type, singular: type, hint: '', codePlaceholder: 'CODE', namePlaceholder: 'Name' };
  const [items, setItems]   = useState([]);
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast]   = useState(null);
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!form?.name) return;
    setTranslating(true);
    const res = await translateToAll(form.name);
    setForm(prev => ({ ...prev, translations: { ...prev.translations, ...res } }));
    setTranslating(false);
  };

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── data ─────────────────────── */
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/mandi/admin/master-data/${type}`);
      setItems(data.data || []);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Could not load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type]);

  /* ── save (create / update) ───── */
  const save = async (event) => {
    event.preventDefault();
    if (!form?.name?.trim()) { showToast('error', 'Name is required'); return; }
    if (!form?.code?.trim()) { showToast('error', 'Code is required'); return; }
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description?.trim() || undefined,
        status: form.status || 'ACTIVE',
        translations: form.translations,
      };
      if (form.id) {
        await api.patch(`/mandi/admin/master-data/${type}/${form.id}`, payload);
        showToast('success', `${copy.singular} updated!`);
      } else {
        await api.post(`/mandi/admin/master-data/${type}`, payload);
        showToast('success', `${copy.singular} created!`);
      }
      setForm(null);
      load();
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Could not save the record.');
    }
  };

  /* ── delete ───────────────────── */
  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/mandi/admin/master-data/${type}/${item.id}`);
      showToast('success', `${copy.singular} deleted!`);
      load();
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Could not delete the record.');
    }
  };

  /* ── filter ───────────────────── */
  const filtered = items.filter(it => {
    if (!search) return true;
    const q = search.toLowerCase();
    return it.name?.toLowerCase().includes(q) || it.code?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
          ${toast.kind === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.kind === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.hint}</p>
        </div>
        <button
          onClick={() => setForm({ ...BLANK })}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add {copy.singular}
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${copy.title.toLowerCase()}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>
        <button onClick={load} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-8 text-center text-slate-400" colSpan={5}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
                    Loading…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-8 text-center text-slate-400" colSpan={5}>
                  {search ? `No ${copy.title.toLowerCase()} matching "${search}".` : `No ${copy.title.toLowerCase()} yet. Click "Add ${copy.singular}" to create one.`}
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                  </td>
                  <td className="p-4 font-mono text-slate-600 text-xs">
                    <span className="bg-slate-100 px-2 py-1 rounded">{item.code}</span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs max-w-48 truncate">{item.description || '—'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                      ${item.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {item.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label="Edit"
                        onClick={() => setForm({ ...item })}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        aria-label="Delete"
                        onClick={() => remove(item)}
                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400 bg-slate-50/50">
            {filtered.length} {copy.title.toLowerCase()} {search && `matching "${search}"`}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={save} className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
              <h2 className="font-bold text-slate-800">{form.id ? 'Edit' : 'Add'} {copy.singular}</h2>
              <button type="button" onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={copy.namePlaceholder}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                  />
                  {['crop_category', 'crop_subcategory', 'grade', 'unit'].includes(type) && (
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
                  )}
                </div>
                
                {/* Translations Row */}
                {['crop_category', 'crop_subcategory', 'grade', 'unit'].includes(type) && (
                  <div className="flex gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-x-auto pb-1">
                    {LANG_FIELDS.filter(l => l.key !== 'en').map(lang => (
                      <div key={lang.key} className="w-24 shrink-0 flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 mb-0.5">{lang.flag} {lang.label}</span>
                        <input
                          type="text"
                          value={form.translations?.[lang.key] || ''}
                          onChange={e => {
                            const newTrans = { ...(form.translations || {}), [lang.key]: e.target.value };
                            setForm({ ...form, translations: newTrans });
                          }}
                          placeholder={lang.label}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none focus:border-green-400"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder={copy.codePlaceholder}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition uppercase"
                />
                <p className="text-xs text-slate-400 mt-1">Unique identifier code (auto uppercased)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition resize-none"
                  placeholder="Optional description…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
              >
                {form.id ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
