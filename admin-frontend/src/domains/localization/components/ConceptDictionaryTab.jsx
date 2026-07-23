import React, { useState } from 'react';
import { useResolveTerm, useAddDictionaryMapping } from '../api/localizationApi';
import { Search, Plus, Cpu, AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function ConceptDictionaryTab() {
  const resolveTermMutation = useResolveTerm();
  const addMappingMutation = useAddDictionaryMapping();

  const [testTerm, setTestTerm] = useState('');
  const [testType, setTestType] = useState('PRODUCT');
  const [resolutionResult, setResolutionResult] = useState(null);

  const [addTerm, setAddTerm] = useState('');
  const [addLang, setAddLang] = useState('mr');
  const [addType, setAddType] = useState('PRODUCT');
  const [addId, setAddId] = useState('');

  const [toast, setToast] = useState(null);
  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTestResolve = async (e) => {
    e.preventDefault();
    if (!testTerm) return;
    try {
      const data = await resolveTermMutation.mutateAsync({ term: testTerm, entityType: testType });
      setResolutionResult(data);
    } catch (e) {
      setResolutionResult({ error: 'Failed to resolve term or API not reachable.' });
    }
  };

  const handleAddMapping = async (e) => {
    e.preventDefault();
    if (!addTerm || !addId) return;
    try {
      await addMappingMutation.mutateAsync({
        term: addTerm,
        entityType: addType,
        entityId: addId,
        languageCode: addLang,
        confidenceWeight: 1.0,
      });
      showToast('success', 'Mapping added successfully');
      setAddTerm('');
      setAddId('');
    } catch (e) {
      showToast('error', 'Failed to add mapping');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${toast.kind === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.kind === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Test Resolver */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-indigo-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">AI Resolution Tester</h3>
              <p className="text-sm text-slate-500">Test how the AI Engine resolves a regional term.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <form onSubmit={handleTestResolve} className="flex gap-3">
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="PRODUCT">Product</option>
                <option value="CATEGORY">Category</option>
                <option value="UNIT">Unit</option>
              </select>
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Kanda, Batata..."
                  value={testTerm}
                  onChange={(e) => setTestTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!testTerm || resolveTermMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {resolveTermMutation.isPending ? 'Testing...' : 'Test'}
              </button>
            </form>

            {resolutionResult && (
              <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Result</h4>
                
                {resolutionResult.error ? (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <AlertCircle size={16} />
                    {resolutionResult.error}
                  </div>
                ) : resolutionResult.data && resolutionResult.data.entityId ? (
                  <div className="flex items-center justify-between bg-white border border-green-100 p-3 rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Resolved to ID</span>
                      <span className="font-mono font-bold text-green-700">{resolutionResult.data.entityId}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-slate-500">Confidence</span>
                      <span className="font-bold text-slate-800">
                        {Math.round(resolutionResult.data.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm italic">
                    Could not resolve this term confidently.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Manual Override Mapping */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-emerald-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Manual Dictionary Override</h3>
              <p className="text-sm text-slate-500">Force the AI to map a specific term to a Master ID.</p>
            </div>
          </div>

          <form onSubmit={handleAddMapping} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Regional Term</label>
                <input
                  type="text"
                  placeholder="e.g. Kanda"
                  value={addTerm}
                  onChange={(e) => setAddTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Language</label>
                <select
                  value={addLang}
                  onChange={(e) => setAddLang(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="mr">Marathi</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Entity Type</label>
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="PRODUCT">Product</option>
                  <option value="CATEGORY">Category</option>
                  <option value="VARIANT">Variant</option>
                  <option value="UNIT">Unit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Canonical ID</label>
                <input
                  type="text"
                  placeholder="e.g. P001 or UUID"
                  value={addId}
                  onChange={(e) => setAddId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!addTerm || !addId || addMappingMutation.isPending}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Add Dictionary Override
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
