import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, Plus, Search, X, CheckCircle, AlertCircle,
  Package, Tag, Award, Ruler, RefreshCw, Filter,
} from 'lucide-react';
import { useGlobalCrops, useCreateGlobalCrop, useMasterData } from '../../mandi/api/mandiApi';

const BLANK = { name: '', code: '', categoryId: '', gradeId: '', unitId: '', description: '', status: 'ACTIVE' };

export default function ProductManager() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  const { data: products = [], isLoading, refetch } = useGlobalCrops();
  const { data: categories = [] } = useMasterData('crop_category');
  const { data: grades = [] }     = useMasterData('grade');
  const { data: units = [] }      = useMasterData('unit');
  const createCrop                  = useCreateGlobalCrop();

  /* ── Helpers ─────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const resetForm = () => { setForm(BLANK); setShowForm(false); };

  /* ── Submit ──────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) {
      showToast('error', 'Product name and category are required.');
      return;
    }
    setSubmitting(true);
    try {
      const selectedCategory = categories.find(c => c.id === form.categoryId);
      const selectedGrade    = grades.find(g => g.id === form.gradeId);
      const selectedUnit     = units.find(u => u.id === form.unitId);

      await createCrop.mutateAsync({
        name:        form.name.trim(),
        code:        form.code.trim() || undefined,
        category:    selectedCategory?.name || '',
        categoryId:  form.categoryId,
        grade:       selectedGrade?.name || '',
        gradeId:     form.gradeId || undefined,
        unit:        selectedUnit?.name || '',
        unitId:      form.unitId || undefined,
        description: form.description.trim() || undefined,
        status:      form.status,
      });
      showToast('success', `"${form.name}" added to product catalog!`);
      resetForm();
      refetch();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to add product.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Filter ──────────────────────────────────── */
  const filtered = (Array.isArray(products) ? products : []).filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q);
    const matchCat = !filterCategory || p.category === filterCategory || p.categoryId === filterCategory;
    return matchSearch && matchCat;
  });

  const uniqueCategories = [...new Set((Array.isArray(products) ? products : []).map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={24} className="text-green-600" />
            Product Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Add and manage agricultural products available on the KrishiPath platform.
          </p>
        </div>
        <button
          onClick={() => navigate('/app/master/products/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-sm transition whitespace-nowrap"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-white"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button onClick={() => refetch()} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: Array.isArray(products) ? products.length : 0, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Active',         value: (Array.isArray(products) ? products : []).filter(p => p.status === 'ACTIVE' || p.status === 'Active').length, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Categories',     value: uniqueCategories.length, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Showing',        value: filtered.length, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-3 border border-slate-100`}>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Grade</th>
              <th className="p-4 font-semibold">Unit</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
                    Loading products…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Package size={22} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      {search || filterCategory ? 'No products match your filters.' : 'No products yet. Click "Add Product" to get started.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(product => (
                <tr key={product.id || product.cropId} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Leaf size={16} className="text-green-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{product.name || product.cropName}</p>
                        {product.code && <p className="text-xs text-slate-400 font-mono">{product.code}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                      <Tag size={11} /> {product.category || '—'}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.grade ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                        <Award size={11} /> {product.grade}
                      </span>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="p-4">
                    {product.unit ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        <Ruler size={11} /> {product.unit}
                      </span>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      (product.status === 'ACTIVE' || product.status === 'Active')
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {(product.status || 'ACTIVE').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Product Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
                  <Plus size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Add New Product</h2>
                  <p className="text-xs text-slate-500">Fill details to add to the catalog</p>
                </div>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Name + Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Leaf size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Basmati Rice"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Product Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. RICE-001"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Crop Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    required
                    value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white appearance-none"
                  >
                    <option value="">Select a category…</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grade + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Grade</label>
                  <div className="relative">
                    <Award size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={form.gradeId}
                      onChange={e => setForm({ ...form, gradeId: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white appearance-none"
                    >
                      <option value="">Select grade…</option>
                      {grades.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Unit</label>
                  <div className="relative">
                    <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={form.unitId}
                      onChange={e => setForm({ ...form, unitId: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white appearance-none"
                    >
                      <option value="">Select unit…</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional product description…"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === 'ACTIVE'}
                    onChange={e => setForm({ ...form, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">Mark as Active</span>
                </label>
                <span className="text-xs text-slate-400 ml-auto">
                  Active products appear in mandi listings
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.categoryId}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
