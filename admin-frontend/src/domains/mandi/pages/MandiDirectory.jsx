import React, { useState, useMemo } from 'react';
import { useMandis, useCreateMandi, useStates, useDistricts } from '../api/mandiApi';
import EnterpriseTable from '../../../shared/components/ui/EnterpriseTable';
import { Building2, MapPin, Plus, Clock, CheckCircle, AlertCircle, X, RefreshCw, Globe } from 'lucide-react';
import { translateToAll, LANG_FIELDS } from '../../../utils/translate';

// Language options for mandi
const LANGUAGE_OPTIONS = [
  { label: 'Hindi (हिंदी)', value: 'hi' },
  { label: 'English', value: 'en' },
  { label: 'Marathi (मराठी)', value: 'mr' },
  { label: 'Gujarati (ગુજરાતી)', value: 'gu' },
  { label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'pa' },
  { label: 'Telugu (తెలుగు)', value: 'te' },
  { label: 'Tamil (தமிழ்)', value: 'ta' },
  { label: 'Kannada (ಕನ್ನಡ)', value: 'kn' },
];

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'SEASONAL', 'MAINTENANCE'];

export default function MandiDirectory() {
  const { data: mandis, isLoading, isError, error, refetch } = useMandis();
  const createMandi = useCreateMandi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [toast, setToast] = useState(null);

  const { data: states } = useStates();
  const { data: districts } = useDistricts(selectedState);

  const [form, setForm] = useState({
    name: '',
    stateId: '',
    districtId: '',
    address: '',
    latitude: '',
    longitude: '',
    defaultLanguageCode: 'hi',
    openingTime: '09:00',
    closingTime: '17:00',
    aiPredictionEnabled: true,
    analyticsEnabled: true,
    status: 'ACTIVE',
    translations: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!form.name) return;
    setTranslating(true);
    const res = await translateToAll(form.name);
    setForm(prev => ({ ...prev, translations: { ...prev.translations, ...res } }));
    setTranslating(false);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStateChange = (stateId) => {
    setSelectedState(stateId);
    setForm(f => ({ ...f, stateId, districtId: '' }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('error', 'Mandi name is required'); return; }
    if (!form.stateId) { showToast('error', 'Please select a state'); return; }
    if (!form.districtId) { showToast('error', 'Please select a district'); return; }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        stateId: form.stateId,
        districtId: form.districtId,
        address: form.address || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        defaultLanguageCode: form.defaultLanguageCode || 'hi',
        openingTime: form.openingTime || undefined,
        closingTime: form.closingTime || undefined,
        aiPredictionEnabled: form.aiPredictionEnabled,
        analyticsEnabled: form.analyticsEnabled,
        status: form.status,
        translations: form.translations,
      };
      await createMandi.mutateAsync(payload);
      setIsModalOpen(false);
      setForm({ name: '', stateId: '', districtId: '', address: '', latitude: '', longitude: '', defaultLanguageCode: 'hi', openingTime: '09:00', closingTime: '17:00', aiPredictionEnabled: true, analyticsEnabled: true, status: 'ACTIVE', translations: {} });
      setSelectedState('');
      showToast('success', 'Mandi created successfully!');
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to create Mandi');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'INACTIVE') return 'bg-slate-50 text-slate-600 border-slate-200';
    if (s === 'SEASONAL') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'MAINTENANCE') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const columns = [
    {
      header: 'Mandi Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <div className="font-bold text-slate-800">{row.name}</div>
            <div className="text-xs text-slate-400 font-mono">{row.code || row.id?.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'district',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span>{row.districtName || row.district || '—'}, {row.stateName || row.state || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Language',
      accessorKey: 'defaultLanguageCode',
      cell: (row) => {
        const lang = LANGUAGE_OPTIONS.find(l => l.value === row.defaultLanguageCode);
        return <span className="text-slate-600 text-sm">{lang ? lang.label : (row.defaultLanguageCode || '—')}</span>;
      },
    },
    {
      header: 'Hours',
      accessorKey: 'openingTime',
      cell: (row) => (
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <Clock size={13} className="shrink-0" />
          {row.openingTime || '—'} – {row.closingTime || '—'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyle(row.status)}`}>
          {(row.status || 'Active').toUpperCase()}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
        <AlertCircle size={18} />
        Error loading mandis: {error?.response?.data?.message || error?.message}
      </div>
    );
  }

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={22} className="text-green-600" /> Mandi Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Supervise and manage all agricultural markets across the platform.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Add Mandi
          </button>
        </div>
      </div>

      <EnterpriseTable
        title={`All Mandis (${mandis?.length ?? 0})`}
        columns={columns}
        data={mandis || []}
      />

      {/* Create Mandi Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-green-600" /> Add Mandi
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mandi Name <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                    placeholder="e.g. Neemuch Krishi Upaj Mandi"
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
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none focus:border-green-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State <span className="text-red-500">*</span></label>
                <select
                  value={form.stateId}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-white"
                  required
                >
                  <option value="">Select state…</option>
                  {(states || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District <span className="text-red-500">*</span></label>
                <select
                  value={form.districtId}
                  onChange={e => setForm({ ...form, districtId: e.target.value })}
                  disabled={!selectedState}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  required
                >
                  <option value="">{selectedState ? 'Select district…' : 'Select state first'}</option>
                  {(districts || []).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Language</label>
                <select
                  value={form.defaultLanguageCode}
                  onChange={e => setForm({ ...form, defaultLanguageCode: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-white"
                >
                  {LANGUAGE_OPTIONS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">The primary language in which this mandi operates.</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition resize-none"
                  placeholder="Enter mandi address…"
                />
              </div>

              {/* Lat / Lng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                    placeholder="24.4754"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                    placeholder="74.8723"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={form.openingTime}
                    onChange={e => setForm({ ...form, openingTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={form.closingTime}
                    onChange={e => setForm({ ...form, closingTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-white"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Enable AI Predictions</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, aiPredictionEnabled: !f.aiPredictionEnabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.aiPredictionEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.aiPredictionEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Enable Analytics</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, analyticsEnabled: !f.analyticsEnabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.analyticsEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.analyticsEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
                >
                  {submitting ? 'Creating…' : 'Create Mandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
