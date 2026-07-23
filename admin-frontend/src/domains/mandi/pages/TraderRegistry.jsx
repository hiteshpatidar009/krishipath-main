import React, { useMemo, useState } from 'react';
import { BadgeCheck, Phone, Plus, RefreshCw, Search, Store, XCircle } from 'lucide-react';

import {
  useAssignTrader,
  useCreateTrader,
  useMandis,
  useMandiCrops,
  useTraderRegistry,
  useUpdateTrader,
} from '../api/mandiApi';

const emptyForm = {
  shopName: '',
  phone: '',
  licenseNumber: '',
  primaryMandiId: '',
  cropSpecializations: [],
};

export default function TraderRegistry() {
  const { data: traders = [], isLoading, refetch } = useTraderRegistry();
  const { data: mandis = [] } = useMandis();
  const { data: mandiCrops = [], isLoading: cropsLoading } = useMandiCrops(form.primaryMandiId);
  const createTrader = useCreateTrader();
  const updateTrader = useUpdateTrader();
  const assignTrader = useAssignTrader();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(null);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return traders;
    return traders.filter((trader) => [trader.shopName, trader.phone, trader.licenseNumber, trader.primaryMandiName]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(value)));
  }, [query, traders]);

  const notify = (type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await createTrader.mutateAsync({
        shopName: form.shopName.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim() || undefined,
        primaryMandiId: form.primaryMandiId,
        cropSpecializations: form.cropSpecializations,
        verificationStatus: 'PENDING',
      });
      setForm(emptyForm);
      setShowForm(false);
      notify('success', 'Trader created in PENDING status. Verify the license before approval.');
    } catch (error) {
      notify('error', error.response?.data?.message || error.message || 'Unable to create trader');
    }
  };

  const approveAndAssign = async (trader) => {
    try {
      await updateTrader.mutateAsync({
        traderId: trader.id,
        patch: { verificationStatus: 'APPROVED', isActive: true },
      });
      await assignTrader.mutateAsync({
        mandiId: trader.primaryMandiId,
        traderId: trader.id,
        notes: 'Approved and assigned from Trader Registry',
      });
      notify('success', `${trader.shopName} is approved and assigned to ${trader.primaryMandiName || 'the primary mandi'}.`);
    } catch (error) {
      notify('error', error.response?.data?.message || error.message || 'Unable to approve trader');
    }
  };

  const reject = async (trader) => {
    try {
      await updateTrader.mutateAsync({ traderId: trader.id, patch: { verificationStatus: 'REJECTED' } });
      notify('success', `${trader.shopName} was rejected.`);
    } catch (error) {
      notify('error', error.response?.data?.message || error.message || 'Unable to reject trader');
    }
  };

  const busy = createTrader.isPending || updateTrader.isPending || assignTrader.isPending;

  return (
    <div className="space-y-6">
      {message && (
        <div className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Store size={22} className="text-emerald-600" /> Trader Registry</h1>
          <p className="mt-1 text-sm text-slate-500">Create, verify and assign real buyers before publishing their crop offers.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-emerald-600" title="Refresh"><RefreshCw size={17} /></button>
          <button onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Add Trader</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Shop name
            <input required value={form.shopName} onChange={(event) => setForm({ ...form, shopName: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Indian mobile number
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="10 digits" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700">License number
            <input value={form.licenseNumber} onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Primary mandi
            <select required value={form.primaryMandiId} onChange={(event) => setForm({ ...form, primaryMandiId: event.target.value, cropSpecializations: [] })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Select mandi</option>
              {mandis.map((mandi) => <option key={mandi.id} value={mandi.id}>{mandi.name}</option>)}
            </select>
          </label>
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-semibold text-slate-700">Crop specializations (optional)</legend>
            <p className="mt-1 text-xs text-slate-500">Choose crop names; the correct backend product IDs are stored automatically.</p>
            <div className="mt-2 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
              {!form.primaryMandiId ? (
                <span className="text-sm text-slate-400">Select a primary mandi first.</span>
              ) : cropsLoading ? (
                <span className="text-sm text-slate-400">Loading mandi crops…</span>
              ) : mandiCrops.length === 0 ? (
                <span className="text-sm text-amber-700">No enabled crop is assigned to this mandi.</span>
              ) : mandiCrops.map((crop) => (
                <label key={crop.cropId} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.cropSpecializations.includes(crop.cropId)}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      cropSpecializations: event.target.checked
                        ? [...current.cropSpecializations, crop.cropId]
                        : current.cropSpecializations.filter((id) => id !== crop.cropId),
                    }))}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {crop.cropName || crop.name || crop.cropId}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2 md:col-span-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create Pending Trader</button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <Search size={16} className="text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shop, phone, license or mandi" className="w-full text-sm outline-none" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><RefreshCw className="animate-spin text-slate-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No real traders have been registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Trader</th><th className="px-4 py-3">Mandi</th><th className="px-4 py-3">License</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((trader) => (
                  <tr key={trader.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><div className="font-semibold text-slate-800">{trader.shopName}</div><div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone size={11} />{trader.phone || 'No phone'}</div></td>
                    <td className="px-4 py-3 text-slate-600">{trader.primaryMandiName || trader.primaryMandiId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{trader.licenseNumber || 'Not entered'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${trader.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : trader.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{trader.verificationStatus}</span></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2">
                      <button disabled={busy} onClick={() => approveAndAssign(trader)} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"><BadgeCheck size={13} />{trader.verificationStatus === 'APPROVED' ? 'Ensure assigned' : 'Approve & assign'}</button>
                      {trader.verificationStatus !== 'REJECTED' && <button disabled={busy} onClick={() => reject(trader)} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"><XCircle size={13} />Reject</button>}
                    </div></td>
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
