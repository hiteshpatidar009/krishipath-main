import { useState } from 'react';
import { Target, MapPin, Sprout, Globe2, Lock, Save, RefreshCw, Users } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { toast } from '../ui/Toast';
import { indianStates, cropTypes } from '../../data/mockData';

const languages = ['Hindi', 'Marathi', 'Punjabi', 'Kannada', 'Gujarati', 'Telugu', 'Tamil', 'English'];

const stateAudienceMap: Record<string, number> = {
  'Maharashtra': 182000, 'Punjab': 134000, 'Uttar Pradesh': 248000,
  'Gujarat': 156000, 'Karnataka': 128000, 'Rajasthan': 114000,
  'Madhya Pradesh': 142000, 'Haryana': 98000, 'Andhra Pradesh': 112000,
  'Tamil Nadu': 104000,
};

export function FarmerTargeting() {
  const [selectedStates, setSelectedStates] = useState<string[]>(['Maharashtra', 'Punjab']);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Cotton', 'Wheat']);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [segmentName, setSegmentName] = useState('Kharif Segment 2026');

  const toggleState = (s: string) => setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCrop = (c: string) => setSelectedCrops(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSave = () => toast(`Segment "${segmentName}" saved successfully!`, 'success');

  const selectedStateData = selectedStates.map(s => ({
    name: s,
    farmers: stateAudienceMap[s] || 80000,
    pct: Math.min(100, ((stateAudienceMap[s] || 80000) / 250000) * 100),
  })).sort((a, b) => b.farmers - a.farmers);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Farmer Targeting</h1>
          <p className="text-sm text-text-secondary mt-0.5">Define and save reusable audience segments for your campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<RefreshCw size={14} />} onClick={() => { setSelectedStates([]); setSelectedCrops([]); }}>
            Reset
          </Button>
          <Button leftIcon={<Save size={14} />} onClick={handleSave}>Save Segment</Button>
        </div>
      </div>

      {/* Segment Name */}
      <Card padding="md">
        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Segment Name</label>
        <input
          value={segmentName}
          onChange={e => setSegmentName(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors max-w-lg"
          placeholder="e.g. Maharashtra Cotton Farmers — Kharif 2026"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* State Selection */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><MapPin size={16} className="text-primary" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-text-primary">Target States</h3>
                <p className="text-[10px] text-text-muted">{selectedStates.length} selected</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {indianStates.map(state => (
                <button
                  key={state}
                  onClick={() => toggleState(state)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                    selectedStates.includes(state) ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-border-dark',
                  ].join(' ')}
                >
                  {state}
                </button>
              ))}
            </div>
          </Card>

          {/* Crop Selection */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center"><Sprout size={16} className="text-teal-600" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-text-primary">Target Crop Types</h3>
                <p className="text-[10px] text-text-muted">{selectedCrops.length} selected · leave empty to include all crops</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {cropTypes.map(crop => (
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                    selectedCrops.includes(crop) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border text-text-secondary hover:border-border-dark',
                  ].join(' ')}
                >
                  {crop}
                </button>
              ))}
            </div>
          </Card>

          {/* Language */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Globe2 size={16} className="text-indigo-600" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-text-primary">Content Language</h3>
                <p className="text-[10px] text-text-muted">Campaign videos and quiz served in this language</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                    selectedLanguage === lang ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border text-text-secondary hover:border-border-dark',
                  ].join(' ')}
                >
                  {lang}
                </button>
              ))}
            </div>
          </Card>

          {/* Coming Soon Filters */}
          <Card padding="lg" className="opacity-60">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Lock size={16} className="text-gray-400" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-text-secondary">Advanced Filters</h3>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Income Range', 'Farm Size (acres)', 'Land Ownership', 'Irrigation Type', 'Organic / Chemical', 'App Usage Frequency'].map(f => (
                <div key={f} className="flex items-center gap-2 bg-surface-alt rounded-lg px-3 py-2.5">
                  <Lock size={12} className="text-text-muted" />
                  <span className="text-xs text-text-muted">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* State breakdown + tip */}
        <div className="space-y-4">
          {selectedStateData.length > 0 && (
            <Card padding="lg">
              <CardHeader title="State Breakdown" subtitle="Platform farmers by selected state" />
              <div className="space-y-3">
                {selectedStateData.slice(0, 6).map(s => (
                  <ProgressBar
                    key={s.name}
                    label={s.name}
                    sublabel={`${(s.farmers / 1000).toFixed(0)}K farmers`}
                    value={s.pct}
                    showPct={false}
                    size="sm"
                  />
                ))}
              </div>
            </Card>
          )}

          <Card padding="md" className="bg-primary-50 border-primary-100">
            <div className="flex items-start gap-2">
              <Target size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary mb-1">Targeting Pro Tip</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Campaigns targeting 2–3 states with 1–2 specific crop types typically achieve 40% higher engagement vs. broad campaigns.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start gap-2">
              <Users size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-text-primary mb-1">Saved Segments</p>
                <div className="space-y-2">
                  {['Kharif Segment 2025', 'South India Cotton Farmers', 'Punjab Wheat Growers'].map(s => (
                    <div key={s} className="flex items-center justify-between">
                      <p className="text-xs text-text-secondary truncate">{s}</p>
                      <button className="text-[10px] text-primary hover:underline cursor-pointer shrink-0 ml-2">Load</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
