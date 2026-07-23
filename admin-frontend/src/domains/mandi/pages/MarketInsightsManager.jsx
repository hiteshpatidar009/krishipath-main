import React, { useMemo, useState } from 'react';
import { Archive, BrainCircuit, CalendarDays, Plus, RefreshCw, Save } from 'lucide-react';

import {
  useCreateMarketInsight,
  useGlobalCrops,
  useMandis,
  useMarketInsights,
  useUpdateMarketInsight,
} from '../api/mandiApi';

const futureDate = (days) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

const createEmptyForm = () => ({
  productId: '',
  mandiId: '',
  scope: 'MANDI',
  recommendation: 'HOLD',
  status: 'DRAFT',
  currentPrice: '',
  targetPrice: '',
  expectedRangeMin: '',
  expectedRangeMax: '',
  confidencePercent: '75',
  summary: '',
  positiveFactors: '',
  riskFactors: '',
  bestWindowFrom: '',
  bestWindowTo: '',
  weatherLabel: '',
  weatherSummary: '',
  storageAdvice: '',
  storageExpectedGainMin: '',
  storageExpectedGainMax: '',
  expiresAt: futureDate(14),
});

const optionalNumber = (value) => value === '' ? null : Number(value);
const factorList = (value) => String(value || '')
  .split(/\r?\n/)
  .map((label) => label.trim())
  .filter(Boolean)
  .map((label) => ({ label, impact: 'Published', impactVal: 0 }));

export default function MarketInsightsManager() {
  const [form, setForm] = useState(createEmptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const { data: insights = [], isLoading, refetch } = useMarketInsights();
  const { data: products = [] } = useGlobalCrops();
  const { data: mandis = [] } = useMandis();
  const createInsight = useCreateMarketInsight();
  const updateInsight = useUpdateMarketInsight();

  const productNames = useMemo(() => new Map(products.map((product) => [
    product.id || product.cropId,
    product.name || product.cropName || product.nameEn || product.code,
  ])), [products]);
  const mandiNames = useMemo(() => new Map(mandis.map((mandi) => [mandi.id, mandi.name])), [mandis]);

  const notify = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        productId: form.productId,
        mandiId: form.scope === 'MANDI' ? form.mandiId : null,
        scope: form.scope,
        recommendation: form.recommendation,
        status: form.status,
        source: 'ADMIN',
        currentPrice: optionalNumber(form.currentPrice),
        targetPrice: optionalNumber(form.targetPrice),
        expectedRangeMin: optionalNumber(form.expectedRangeMin),
        expectedRangeMax: optionalNumber(form.expectedRangeMax),
        confidencePercent: Number(form.confidencePercent),
        summary: form.summary.trim(),
        positiveFactors: factorList(form.positiveFactors),
        riskFactors: factorList(form.riskFactors),
        bestWindowFrom: form.bestWindowFrom || null,
        bestWindowTo: form.bestWindowTo || null,
        weatherImpact: form.weatherLabel || form.weatherSummary
          ? { label: form.weatherLabel.trim(), summary: form.weatherSummary.trim() }
          : null,
        storageAdvice: form.storageAdvice.trim() || null,
        storageExpectedGainMin: optionalNumber(form.storageExpectedGainMin),
        storageExpectedGainMax: optionalNumber(form.storageExpectedGainMax),
        expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      };
      await createInsight.mutateAsync(payload);
      setForm(createEmptyForm());
      setShowForm(false);
      notify('success', form.status === 'PUBLISHED'
        ? 'Market insight published to the mobile app.'
        : 'Market insight saved as a draft.');
    } catch (error) {
      notify('error', error.response?.data?.message || error.message || 'Unable to save market insight');
    }
  };

  const archive = async (insight) => {
    try {
      await updateInsight.mutateAsync({ insightId: insight.id, patch: { status: 'ARCHIVED' } });
      notify('success', 'Market insight archived.');
    } catch (error) {
      notify('error', error.response?.data?.message || error.message || 'Unable to archive market insight');
    }
  };

  const busy = createInsight.isPending || updateInsight.isPending;
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="space-y-6">
      {message && (
        <div className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><BrainCircuit size={23} className="text-emerald-600" /> Market Insights</h1>
          <p className="mt-1 text-sm text-slate-500">Publish traceable crop guidance, weather impact and storage advice to Home and Mandi.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-emerald-600" title="Refresh"><RefreshCw size={17} /></button>
          <button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Insight</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700">Crop
              <select required value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className={inputClass}>
                <option value="">Select crop</option>
                {products.map((product) => <option key={product.id || product.cropId} value={product.id || product.cropId}>{product.name || product.cropName || product.nameEn || product.code}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Scope
              <select value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value, mandiId: event.target.value === 'MANDI' ? form.mandiId : '' })} className={inputClass}>
                <option value="MANDI">Mandi</option><option value="NATIONAL">National</option><option value="STATE">State</option><option value="DISTRICT">District</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Mandi
              <select required={form.scope === 'MANDI'} disabled={form.scope !== 'MANDI'} value={form.mandiId} onChange={(event) => setForm({ ...form, mandiId: event.target.value })} className={`${inputClass} disabled:opacity-50`}>
                <option value="">Select mandi</option>
                {mandis.map((mandi) => <option key={mandi.id} value={mandi.id}>{mandi.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Recommendation
              <select value={form.recommendation} onChange={(event) => setForm({ ...form, recommendation: event.target.value })} className={inputClass}>
                <option value="SELL">Sell</option><option value="HOLD">Hold</option><option value="WAIT">Wait</option><option value="REVIEW">Review</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {[
              ['currentPrice', 'Current price'], ['targetPrice', 'Target price'],
              ['expectedRangeMin', 'Range min'], ['expectedRangeMax', 'Range max'],
              ['confidencePercent', 'Confidence %'],
            ].map(([field, label]) => (
              <label key={field} className="text-sm font-semibold text-slate-700">{label}
                <input type="number" min={field === 'confidencePercent' ? 0 : undefined} max={field === 'confidencePercent' ? 100 : undefined} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className={inputClass} />
              </label>
            ))}
          </div>

          <label className="block text-sm font-semibold text-slate-700">Farmer-facing summary
            <textarea required rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className={inputClass} placeholder="Explain the recommendation and evidence in clear language." />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Positive factors (one per line)
              <textarea rows={3} value={form.positiveFactors} onChange={(event) => setForm({ ...form, positiveFactors: event.target.value })} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-slate-700">Risk factors (one per line)
              <textarea rows={3} value={form.riskFactors} onChange={(event) => setForm({ ...form, riskFactors: event.target.value })} className={inputClass} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700">Best window from<input type="date" value={form.bestWindowFrom} onChange={(event) => setForm({ ...form, bestWindowFrom: event.target.value })} className={inputClass} /></label>
            <label className="text-sm font-semibold text-slate-700">Best window to<input type="date" value={form.bestWindowTo} onChange={(event) => setForm({ ...form, bestWindowTo: event.target.value })} className={inputClass} /></label>
            <label className="text-sm font-semibold text-slate-700">Weather impact label<input value={form.weatherLabel} onChange={(event) => setForm({ ...form, weatherLabel: event.target.value })} className={inputClass} placeholder="Low / Moderate / High" /></label>
            <label className="text-sm font-semibold text-slate-700">Weather explanation<input value={form.weatherSummary} onChange={(event) => setForm({ ...form, weatherSummary: event.target.value })} className={inputClass} /></label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">Storage advice<input value={form.storageAdvice} onChange={(event) => setForm({ ...form, storageAdvice: event.target.value })} className={inputClass} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm font-semibold text-slate-700">Gain min<input type="number" value={form.storageExpectedGainMin} onChange={(event) => setForm({ ...form, storageExpectedGainMin: event.target.value })} className={inputClass} /></label>
              <label className="text-sm font-semibold text-slate-700">Gain max<input type="number" value={form.storageExpectedGainMax} onChange={(event) => setForm({ ...form, storageExpectedGainMax: event.target.value })} className={inputClass} /></label>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-emerald-200 pt-4">
            <div className="flex flex-wrap gap-4">
              <label className="text-sm font-semibold text-slate-700">Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClass}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select>
              </label>
              <label className="text-sm font-semibold text-slate-700">Expires on
                <input required={form.status === 'PUBLISHED'} type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className={inputClass} />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button disabled={busy} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} /> Save Insight</button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><RefreshCw className="animate-spin text-slate-400" /></div>
        ) : insights.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No market insight has been entered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Crop / Mandi</th><th className="px-4 py-3">Advice</th><th className="px-4 py-3">Confidence</th><th className="px-4 py-3">Validity</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {insights.map((insight) => (
                  <tr key={insight.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><div className="font-semibold text-slate-800">{productNames.get(insight.productId) || insight.productId}</div><div className="text-xs text-slate-500">{insight.mandiId ? (mandiNames.get(insight.mandiId) || insight.mandiId) : insight.scope}</div></td>
                    <td className="max-w-md px-4 py-3"><div className="font-semibold text-emerald-700">{insight.recommendation}</div><div className="line-clamp-2 text-xs text-slate-500">{insight.summary || 'No summary'}</div></td>
                    <td className="px-4 py-3 text-slate-600">{insight.confidencePercent ?? '—'}%</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${insight.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : insight.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{insight.status}</span><div className="mt-1 flex items-center gap-1 text-xs text-slate-400"><CalendarDays size={11} />{insight.expiresAt ? new Date(insight.expiresAt).toLocaleDateString() : 'No expiry'}</div></td>
                    <td className="px-4 py-3 text-right">{insight.status !== 'ARCHIVED' && <button disabled={busy} onClick={() => archive(insight)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"><Archive size={13} /> Archive</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
