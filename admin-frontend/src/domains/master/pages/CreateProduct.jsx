import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Leaf,
  Tag, Award, Ruler, Globe, Building2, BookOpen,
  ChevronDown, ChevronUp, Save, Send, Star,
} from 'lucide-react';
import { useMasterData, useMandis, useGlobalCrops } from '../../mandi/api/mandiApi';
import { useCreateProduct, useUpdateProduct } from '../api/productAPI';
import { translateToAll } from '../../../utils/translate';

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info',       icon: Tag },
  { id: 2, label: 'Classification',   icon: Award },
  { id: 3, label: 'Aliases',          icon: BookOpen },
  { id: 4, label: 'Mandi Assignment', icon: Building2 },
  { id: 5, label: 'Review',           icon: Star },
];

const LANG_FIELDS = [
  { key: 'en', label: 'English',   flag: '🇬🇧' },
  { key: 'hi', label: 'Hindi',     flag: '🇮🇳' },
  { key: 'gu', label: 'Gujarati',  flag: '🪔' },
  { key: 'mr', label: 'Marathi',   flag: '🌿' },
  { key: 'te', label: 'Telugu',    flag: '🌾' },
];

const BLANK_TRANS = { en: '', hi: '', gu: '', mr: '', te: '' };
const BLANK_VARIANT = { name: '', minPrice: '', maxPrice: '', translations: { ...BLANK_TRANS } };
const BLANK_CLASS   = { name: '', minPrice: '', maxPrice: '', unitId: '', translations: { ...BLANK_TRANS }, variants: [{ ...BLANK_VARIANT, name: 'Super', translations: { ...BLANK_TRANS, en: 'Super' } }, { ...BLANK_VARIANT, name: 'Average', translations: { ...BLANK_TRANS, en: 'Average' } }] };
const BLANK_FORM = {
  categoryId:    '',
  cropId:        '',  
  name:          '',
  classifications: [{ ...BLANK_CLASS }],
  aliases:       [''],
  mandiIds:      [],
  status:        'ACTIVE',
};

// ─── Helper ──────────────────────────────────────────────────────────────────
function cls(...args) { return args.filter(Boolean).join(' '); }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateProduct() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState(BLANK_FORM);
  const [errors, setErrors] = useState({});

  const { data: categories    = [] } = useMasterData('crop_category');
  const { data: units         = [] } = useMasterData('unit');
  const { data: allCrops      = [] } = useGlobalCrops();
  const { data: mandis        = [], isLoading: loadingMandis } = useMandis();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  // Filter crops by selected category
  const filteredCrops = form.categoryId
    ? allCrops.filter(c => {
        if (c.categoryId === form.categoryId) return true;
        const catName = categories.find(cat => cat.id === form.categoryId)?.name || '';
        const cLower = (c.category || '').toLowerCase();
        const catLower = catName.toLowerCase();
        return cLower === catLower || (cLower && catLower && (cLower.includes(catLower) || catLower.includes(cLower)));
      })
    : allCrops;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.categoryId) e.categoryId = 'Category is required';
      if (!form.name.trim()) e.name = 'Product is required';
    }
    if (step === 2) {
      form.classifications.forEach((c, i) => {
        if (!c.name.trim()) e[`class_${i}_name`] = 'Classification name is required';
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 6)); };
  const prev = () => { setStep(s => Math.max(s - 1, 1)); setErrors({}); };

  // ── Classification helpers ───────────────────────────────────────────────────
  const updateClass = (idx, field, value) => {
    const updated = form.classifications.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    setForm({ ...form, classifications: updated });
  };
  const addClass = () => {
    setForm({ ...form, classifications: [...form.classifications, { ...BLANK_CLASS, variants: [{ name: 'Super' }, { name: 'Average' }] }] });
  };
  const removeClass = (idx) => {
    setForm({ ...form, classifications: form.classifications.filter((_, i) => i !== idx) });
  };
  const addVariant = (cIdx) => {
    const updated = form.classifications.map((c, i) =>
      i === cIdx ? { ...c, variants: [...c.variants, { name: '' }] } : c
    );
    setForm({ ...form, classifications: updated });
  };
  const updateVariant = (cIdx, vIdx, field, value) => {
    const updated = form.classifications.map((c, i) =>
      i === cIdx ? { ...c, variants: c.variants.map((v, j) => j === vIdx ? { ...v, [field]: value } : v) } : c
    );
    setForm({ ...form, classifications: updated });
  };
  const removeVariant = (cIdx, vIdx) => {
    const updated = form.classifications.map((c, i) =>
      i === cIdx ? { ...c, variants: c.variants.filter((_, j) => j !== vIdx) } : c
    );
    setForm({ ...form, classifications: updated });
  };

  // ── Alias helpers ────────────────────────────────────────────────────────────
  const updateAlias = (idx, value) => {
    const updated = [...form.aliases];
    updated[idx] = value;
    setForm({ ...form, aliases: updated });
  };
  const addAlias = () => setForm({ ...form, aliases: [...form.aliases, ''] });
  const removeAlias = (idx) => setForm({ ...form, aliases: form.aliases.filter((_, i) => i !== idx) });

  // ── Mandi toggle ─────────────────────────────────────────────────────────────
  const toggleMandi = (id) => {
    const has = form.mandiIds.includes(id);
    setForm({ ...form, mandiIds: has ? form.mandiIds.filter(m => m !== id) : [...form.mandiIds, id] });
  };

  // ── Auto Translate ───────────────────────────────────────────────────────────
  const [translatingIdx, setTranslatingIdx] = useState(null); // 'c-0' or 'v-0-0'

  const handleAutoTranslateClass = async (cIdx, text) => {
    if (!text) return;
    setTranslatingIdx(`c-${cIdx}`);
    const res = await translateToAll(text);
    setForm(prev => {
      const cls = [...prev.classifications];
      cls[cIdx].translations = { ...cls[cIdx].translations, ...res };
      return { ...prev, classifications: cls };
    });
    setTranslatingIdx(null);
  };

  const handleAutoTranslateVariant = async (cIdx, vIdx, text) => {
    if (!text) return;
    setTranslatingIdx(`v-${cIdx}-${vIdx}`);
    const res = await translateToAll(text);
    setForm(prev => {
      const cls = [...prev.classifications];
      cls[cIdx].variants[vIdx].translations = { ...cls[cIdx].variants[vIdx].translations, ...res };
      return { ...prev, classifications: cls };
    });
    setTranslatingIdx(null);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSave = async (status) => {
    setSubmitting(true);
    try {
      const payload = {
        name:          form.name.trim(),
        categoryId:    form.categoryId || undefined,
        category:      categories.find(c => c.id === form.categoryId)?.name || form.name,
        status:        status === 'draft' ? 'DRAFT' : 'ACTIVE',
        aliases:       form.aliases.filter(a => a.trim()),
        mandiIds:      form.mandiIds,
        classifications: form.classifications.map(c => ({
          name:         c.name.trim(),
          minPrice:     c.minPrice || undefined,
          maxPrice:     c.maxPrice || undefined,
          unitId:       c.unitId   || undefined,
          translations: c.translations,
          variants:     c.variants
            .filter(v => v.name.trim())
            .map(v => ({
              name:         v.name.trim(),
              minPrice:     v.minPrice || undefined,
              maxPrice:     v.maxPrice || undefined,
              translations: v.translations,
            })),
        })),
      };
      
      if (form.cropId) {
        await updateProduct.mutateAsync({ id: form.cropId, ...payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      
      showToast('success', `Product "${form.name}" ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
      setTimeout(() => navigate('/app/master/products'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to save product.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };


  // ── Helpers for review ───────────────────────────────────────────────────────
  const categoryName    = categories.find(c => c.id === form.categoryId)?.name || '—';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success'
            ? <Check size={16} className="text-green-600" />
            : <X size={16} className="text-red-500" />}
          {toast.msg}
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Create Product</h1>
            <p className="text-xs text-slate-500">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
            Save Draft
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {STEPS.map((s, idx) => {
            const Icon   = s.icon;
            const done   = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center shrink-0">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={cls(
                    'flex flex-col items-center gap-1 px-2',
                    done ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <div className={cls(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    done   ? 'bg-green-600 text-white shadow-md shadow-green-200'  : '',
                    active ? 'bg-green-600 text-white ring-4 ring-green-100 shadow-md' : '',
                    !done && !active ? 'bg-white border-2 border-slate-300 text-slate-400' : ''
                  )}>
                    {done ? <Check size={16} /> : <Icon size={15} />}
                  </div>
                  <span className={cls(
                    'text-[10px] font-semibold whitespace-nowrap',
                    active ? 'text-green-700' : done ? 'text-green-600' : 'text-slate-400'
                  )}>
                    {s.label}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cls(
                    'h-0.5 w-8 sm:w-12 mx-1 rounded-full transition-colors',
                    step > s.id ? 'bg-green-500' : 'bg-slate-200'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP 1 — Basic Info                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 1 && (
          <StepCard title="Basic Information" icon={<Tag size={18} className="text-green-600" />}>

            {/* Category Selector */}
            <Field label="Category" required error={errors.categoryId}>
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.categoryId}
                  onChange={e => {
                    setForm({ ...form, categoryId: e.target.value, cropId: '', name: '' });
                    setErrors({});
                  }}
                  className={cls(INPUT, 'pl-9 appearance-none', errors.categoryId && INPUT_ERR)}
                >
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </Field>

            {/* Product selector — filters by category */}
            <Field label="Product (Crop)" required error={errors.name}>
              <div className="relative">
                <Leaf size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.cropId}
                  onChange={e => {
                    const crop = allCrops.find(c => c.id === e.target.value);
                    setForm({ ...form, cropId: e.target.value, name: crop?.name || '' });
                    setErrors({});
                  }}
                  disabled={!form.categoryId}
                  className={cls(INPUT, 'pl-9 appearance-none disabled:opacity-50 disabled:cursor-not-allowed', errors.name && INPUT_ERR)}
                >
                  <option value="">
                    {!form.categoryId ? 'Select a category first…' : filteredCrops.length === 0 ? 'No products in this category' : 'Select a product…'}
                  </option>
                  {filteredCrops.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {form.categoryId && filteredCrops.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No products found in this category. Add products via the Crop Catalog first.
                </p>
              )}
            </Field>

            {/* Selected Product Preview */}
            {form.name && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <Leaf size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">{form.name}</p>
                  <p className="text-xs text-green-600">{categories.find(c => c.id === form.categoryId)?.name}</p>
                </div>
                <span className="ml-auto text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">Selected</span>
              </div>
            )}

          </StepCard>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP 2 — Classification                                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-green-600" />
                <h2 className="font-bold text-slate-800">Product Classification</h2>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {form.classifications.length} classification{form.classifications.length !== 1 ? 's' : ''}
              </span>
            </div>

            {form.classifications.map((c, cIdx) => (
              <div
                key={cIdx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-700">
                    Classification #{cIdx + 1}
                  </span>
                  {form.classifications.length > 1 && (
                    <button
                      onClick={() => removeClass(cIdx)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Name */}
                  <Field label="Classification Name" required error={errors[`class_${cIdx}_name`]}>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={e => { updateClass(cIdx, 'name', e.target.value); setErrors({}); }}
                        placeholder="e.g. Red Onion"
                        className={cls(INPUT, errors[`class_${cIdx}_name`] && INPUT_ERR, 'flex-1')}
                      />
                      <button
                        onClick={() => handleAutoTranslateClass(cIdx, c.name)}
                        disabled={translatingIdx === `c-${cIdx}` || !c.name}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                        title="Auto-translate to all languages"
                      >
                        {translatingIdx === `c-${cIdx}` ? <span className="animate-pulse">...</span> : <Globe size={15} />}
                        Translate
                      </button>
                    </div>
                  </Field>
                  
                  {/* Classification Translations */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {LANG_FIELDS.filter(l => l.key !== 'en').map(lang => (
                      <div key={lang.key} className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang.flag} {lang.label}</span>
                        <input
                          type="text"
                          value={c.translations?.[lang.key] || ''}
                          onChange={e => {
                            const newTrans = { ...c.translations, [lang.key]: e.target.value };
                            updateClass(cIdx, 'translations', newTrans);
                          }}
                          placeholder={lang.label}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Min Price / Max Price / Unit */}
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Min Price">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={c.minPrice}
                          onChange={e => updateClass(cIdx, 'minPrice', e.target.value)}
                          placeholder="0"
                          className={cls(INPUT, 'pl-7')}
                        />
                      </div>
                    </Field>
                    <Field label="Max Price">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={c.maxPrice}
                          onChange={e => updateClass(cIdx, 'maxPrice', e.target.value)}
                          placeholder="0"
                          className={cls(INPUT, 'pl-7')}
                        />
                      </div>
                    </Field>
                    <Field label="Unit">
                      <div className="relative">
                        <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={c.unitId}
                          onChange={e => updateClass(cIdx, 'unitId', e.target.value)}
                          className={cls(INPUT, 'pl-9 appearance-none')}
                        >
                          <option value="">Unit…</option>
                          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                    </Field>
                  </div>

                  {/* Variants */}
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 shrink-0" />
                      <label className="block text-sm font-semibold text-slate-700 flex-1">Variants</label>
                      <span className="text-xs text-slate-400 w-24 text-center">Min ₹</span>
                      <span className="text-xs text-slate-400 w-24 text-center">Max ₹</span>
                      <span className="w-7 shrink-0" />
                    </div>
                    <div className="space-y-2">
                      {c.variants.map((v, vIdx) => (
                        <div key={vIdx} className="space-y-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            <input
                              type="text"
                              value={v.name}
                              onChange={e => updateVariant(cIdx, vIdx, 'name', e.target.value)}
                              placeholder="Variant name"
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                            />
                            {/* Auto Translate Variant */}
                            <button
                              onClick={() => handleAutoTranslateVariant(cIdx, vIdx, v.name)}
                              disabled={translatingIdx === `v-${cIdx}-${vIdx}` || !v.name}
                              className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition disabled:opacity-50"
                              title="Auto-translate variant"
                            >
                              <Globe size={14} />
                            </button>
                          {/* Min Price */}
                          <div className="relative w-24 shrink-0">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={v.minPrice}
                              onChange={e => updateVariant(cIdx, vIdx, 'minPrice', e.target.value)}
                              placeholder="Min"
                              className="w-full pl-5 pr-2 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                            />
                          </div>
                          {/* Max Price */}
                          <div className="relative w-24 shrink-0">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={v.maxPrice}
                              onChange={e => updateVariant(cIdx, vIdx, 'maxPrice', e.target.value)}
                              placeholder="Max"
                              className="w-full pl-5 pr-2 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                            />
                          </div>
                          {c.variants.length > 1 && (
                            <button
                              onClick={() => removeVariant(cIdx, vIdx)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                            >
                              <X size={14} />
                            </button>
                          )}
                          </div>
                          
                          {/* Variant Translations */}
                          <div className="flex gap-2 pl-4 overflow-x-auto pb-1">
                            {LANG_FIELDS.filter(l => l.key !== 'en').map(lang => (
                              <div key={lang.key} className="w-20 shrink-0 flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 mb-0.5">{lang.flag} {lang.key.toUpperCase()}</span>
                                <input
                                  type="text"
                                  value={v.translations?.[lang.key] || ''}
                                  onChange={e => {
                                    const newTrans = { ...v.translations, [lang.key]: e.target.value };
                                    updateVariant(cIdx, vIdx, 'translations', newTrans);
                                  }}
                                  placeholder={lang.label}
                                  className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] outline-none focus:border-green-400"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addVariant(cIdx)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 mt-1 px-2 py-1 hover:bg-green-50 rounded-lg transition"
                    >
                      <Plus size={13} /> Add Variant
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addClass}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-green-300 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-50 hover:border-green-400 transition"
            >
              <Plus size={16} /> Add Classification
            </button>
          </div>
        )}



        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP 3 — Aliases                                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 3 && (
          <StepCard title="Aliases" icon={<BookOpen size={18} className="text-green-600" />}>
            <p className="text-sm text-slate-500 -mt-2 mb-2">
              Add common names, local names, or alternate spellings for this product.
            </p>
            <div className="space-y-2">
              {form.aliases.map((alias, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={alias}
                    onChange={e => updateAlias(idx, e.target.value)}
                    placeholder={`Alias ${idx + 1} (e.g. Pyaj, प्याज, ಈರುಳ್ಳಿ)`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
                  />
                  {form.aliases.length > 1 && (
                    <button
                      onClick={() => removeAlias(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addAlias}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 px-3 py-2 hover:bg-green-50 rounded-xl transition mt-1"
            >
              <Plus size={15} /> Add Alias
            </button>
          </StepCard>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP 4 — Mandi Assignment                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-green-600" />
                <h2 className="font-bold text-slate-800">Assign to Mandis</h2>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {form.mandiIds.length} selected
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
              Select which mandis will list this product. The same product (e.g. Onion) can be active across multiple mandis with different prices.
            </div>

            {loadingMandis ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
              </div>
            ) : mandis.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                No mandis found. Please create mandis first.
              </div>
            ) : (
              <div className="grid gap-2">
                {/* Select All / Deselect All */}
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => setForm({ ...form, mandiIds: mandis.map(m => m.id) })}
                    className="text-xs font-semibold text-green-700 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setForm({ ...form, mandiIds: [] })}
                    className="text-xs font-semibold text-slate-500 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
                {mandis.map(mandi => {
                  const selected = form.mandiIds.includes(mandi.id);
                  return (
                    <label
                      key={mandi.id}
                      className={cls(
                        'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        selected ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300 hover:bg-slate-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMandi(mandi.id)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{mandi.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {[mandi.city, mandi.state].filter(Boolean).join(', ') || mandi.address || 'Location not set'}
                        </p>
                      </div>
                      {selected && (
                        <span className="shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full border border-green-200">
                          ✓ Selected
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP 5 — Review                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-green-600" />
              <h2 className="font-bold text-slate-800">Review & Publish</h2>
            </div>

            {/* Basic Info */}
            <ReviewSection title="Basic Info" icon={<Tag size={15} />} onEdit={() => setStep(1)}>
              <ReviewRow label="Category"    value={categoryName} />
              <ReviewRow label="Product Name" value={form.name || '—'} highlight />
            </ReviewSection>

            {/* Classifications */}
            <ReviewSection title="Classification" icon={<Award size={15} />} onEdit={() => setStep(2)}>
              {form.classifications.map((c, i) => (
                <div key={i} className={cls(i > 0 && 'pt-3 border-t border-slate-100 mt-1')}>
                  <ReviewRow label={`#${i + 1} Name`} value={c.name || '—'} highlight />
                  <ReviewRow label="Market Price" value={c.marketPrice ? `₹${c.marketPrice}` : '—'} />
                  <ReviewRow label="Variants" value={c.variants.map(v => v.name).filter(Boolean).join(', ') || '—'} />
                </div>
              ))}
            </ReviewSection>

            {/* Aliases */}
            <ReviewSection title="Aliases" icon={<BookOpen size={15} />} onEdit={() => setStep(3)}>
              <ReviewRow
                label="Aliases"
                value={form.aliases.filter(Boolean).join(', ') || '—'}
              />
            </ReviewSection>

            {/* Mandis */}
            <ReviewSection title="Mandi Assignment" icon={<Building2 size={15} />} onEdit={() => setStep(4)}>
              <ReviewRow
                label="Assigned Mandis"
                value={form.mandiIds.length === 0 ? '—' : `${form.mandiIds.length} mandi${form.mandiIds.length !== 1 ? 's' : ''} selected`}
                highlight={form.mandiIds.length > 0}
              />
            </ReviewSection>

            {/* Publish Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleSave('draft')}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition"
              >
                <Save size={16} /> Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
              >
                <Send size={16} /> Publish Product
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        {step < 6 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={prev}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft size={15} /> Previous
            </button>
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
            >
              Next <ArrowRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const INPUT     = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white';
const INPUT_ERR = 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100';

function StepCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100 flex items-center gap-2">
        {icon}
        <h2 className="font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function ReviewSection({ title, icon, onEdit, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          {icon} {title}
        </div>
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-green-700 hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="divide-y divide-slate-50 px-4 py-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <span className="text-xs text-slate-500 shrink-0 w-32">{label}</span>
      <span className={cls(
        'text-sm text-right flex-1 truncate',
        highlight ? 'font-bold text-slate-800' : 'text-slate-700'
      )}>
        {value}
      </span>
    </div>
  );
}
