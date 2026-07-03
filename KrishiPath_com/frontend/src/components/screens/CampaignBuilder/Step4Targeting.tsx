import { ArrowLeft, MapPin, Sprout, Globe2, Lock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { indianStates, cropTypes } from '../../../data/mockData';
import type { CampaignDraft } from './CampaignBuilder';

const languages = ['Hindi', 'Marathi', 'Punjabi', 'Kannada', 'Gujarati', 'Telugu', 'Tamil', 'English'];

interface Props { draft: CampaignDraft; update: (p: Partial<CampaignDraft>) => void; onNext: () => void; onBack: () => void; }

export function Step4Targeting({ draft, update, onNext, onBack }: Props) {
  const toggleState = (s: string) => update({ targetStates: draft.targetStates.includes(s) ? draft.targetStates.filter(x => x !== s) : [...draft.targetStates, s] });
  const toggleCrop = (c: string) => update({ targetCrops: draft.targetCrops.includes(c) ? draft.targetCrops.filter(x => x !== c) : [...draft.targetCrops, c] });

  const valid = draft.targetStates.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* States */}
        <Card padding="lg" className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><MapPin size={16} className="text-primary" /></div>
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">Target States <span className="text-error">*</span></h3>
              <p className="text-[10px] text-text-muted">{draft.targetStates.length} selected</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {indianStates.map(s => (
              <button
                key={s}
                onClick={() => toggleState(s)}
                className={[
                  'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                  draft.targetStates.includes(s) ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-border-dark',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        {/* Audience preview */}
        <Card padding="lg">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3">Audience Preview</h3>
          <div className="text-center py-2">
            <p className="text-3xl font-bold text-primary">
              {draft.targetStates.length === 0 ? '—' : `~${(draft.targetStates.length * 120000 * (draft.targetCrops.length ? 0.3 : 1)).toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-text-muted mt-1">Matching farmers</p>
          </div>
          {draft.targetStates.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {draft.targetStates.slice(0, 4).map(s => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{s}</span>
                  <span className="font-medium text-text-primary">{(120000).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {draft.targetStates.length > 4 && <p className="text-[10px] text-text-muted">+{draft.targetStates.length - 4} more states</p>}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crops */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center"><Sprout size={16} className="text-teal-600" /></div>
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">Crop Types</h3>
              <p className="text-[10px] text-text-muted">Leave empty to include all crops</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {cropTypes.map(c => (
              <button
                key={c}
                onClick={() => toggleCrop(c)}
                className={[
                  'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                  draft.targetCrops.includes(c) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-border text-text-secondary hover:border-border-dark',
                ].join(' ')}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        {/* Language + Coming Soon */}
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Globe2 size={16} className="text-indigo-600" /></div>
              <h3 className="text-[13px] font-semibold text-text-primary">Language</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map(l => (
                <button
                  key={l}
                  onClick={() => update({ language: l })}
                  className={[
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer',
                    draft.language === l ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border text-text-secondary hover:border-border-dark',
                  ].join(' ')}
                >
                  {l}
                </button>
              ))}
            </div>
          </Card>

          <Card padding="md" className="opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-text-secondary">Advanced Filters</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
            <p className="text-xs text-text-muted">Income Range · Farm Size · Land Ownership · Organic preference</p>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={onBack} className="flex-none">Back</Button>
        <Button fullWidth onClick={onNext} disabled={!valid} size="md">Review & Launch</Button>
      </div>
    </div>
  );
}
