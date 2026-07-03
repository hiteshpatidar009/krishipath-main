import { Video, BookOpen, FileText, Phone, ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import type { CampaignDraft } from './CampaignBuilder';

const rewardTypes = [
  { key: 'videoReward' as const, label: 'Video Watch', icon: <Video size={18} />, color: 'text-primary', iconBg: 'bg-primary-50', presets: [1, 2, 3, 5] },
  { key: 'quizReward' as const, label: 'Quiz Completion', icon: <BookOpen size={18} />, color: 'text-indigo-600', iconBg: 'bg-indigo-50', presets: [2, 3, 5, 8] },
  { key: 'brochureReward' as const, label: 'Brochure Download', icon: <FileText size={18} />, color: 'text-orange-600', iconBg: 'bg-orange-50', presets: [1, 2, 3] },
  { key: 'callbackReward' as const, label: 'Callback Request', icon: <Phone size={18} />, color: 'text-rose-600', iconBg: 'bg-rose-50', presets: [10, 15, 20, 25] },
];

interface Props { draft: CampaignDraft; update: (p: Partial<CampaignDraft>) => void; onNext: () => void; onBack: () => void; }

export function Step3Rewards({ draft, update, onNext, onBack }: Props) {
  const estimatedReach = Math.round(draft.dailyBudget / ((draft.videoReward * 0.7 + draft.quizReward * 0.5 + draft.brochureReward * 0.3 + draft.callbackReward * 0.03) || 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card padding="lg">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">Reward Amounts per Farmer Activity</h3>
          <div className="space-y-5">
            {rewardTypes.map(rt => (
              <div key={rt.key} className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl ${rt.iconBg} flex items-center justify-center shrink-0 ${rt.color}`}>{rt.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary mb-2">{rt.label}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={draft[rt.key]}
                        onChange={e => update({ [rt.key]: Number(e.target.value) })}
                        className="w-20 border border-border rounded-lg pl-6 pr-2 py-2 text-sm text-text-primary outline-none focus:border-primary"
                      />
                    </div>
                    {rt.presets.map(p => (
                      <button
                        key={p}
                        onClick={() => update({ [rt.key]: p })}
                        className={[
                          'px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer',
                          draft[rt.key] === p ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-muted hover:border-border-dark',
                        ].join(' ')}
                      >
                        ₹{p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">Budget & Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Daily Budget <span className="text-error">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                <input
                  type="number"
                  value={draft.dailyBudget}
                  onChange={e => update({ dailyBudget: Number(e.target.value) })}
                  className="w-full border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1">Campaign pauses automatically when daily limit is hit</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">Campaign End Date</label>
              <input
                type="date"
                value={draft.endDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => update({ endDate: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={onBack} className="flex-none">Back</Button>
          <Button fullWidth onClick={onNext} size="md">Continue to Targeting</Button>
        </div>
      </div>

      {/* Live Cost Estimator */}
      <Card padding="lg" className="h-fit sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><Calculator size={16} className="text-primary" /></div>
          <div>
            <h4 className="text-[13px] font-semibold text-text-primary">Cost Estimator</h4>
            <p className="text-[10px] text-text-muted">Based on daily budget</p>
          </div>
        </div>
        <div className="space-y-2.5 mb-4">
          {rewardTypes.map(rt => {
            const mult = rt.key === 'videoReward' ? 0.7 : rt.key === 'quizReward' ? 0.5 : rt.key === 'brochureReward' ? 0.3 : 0.03;
            const est = Math.round(estimatedReach * mult);
            return (
              <div key={rt.key} className="flex justify-between text-xs">
                <span className="text-text-secondary">{rt.label}</span>
                <span className="font-semibold text-text-primary">~{est} × ₹{draft[rt.key]} = ₹{(est * draft[rt.key]).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Daily Budget</span>
            <span className="font-semibold text-text-primary">₹{draft.dailyBudget.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Est. Daily Reach</span>
            <span className="font-semibold text-primary">~{estimatedReach.toLocaleString('en-IN')} farmers</span>
          </div>
          <div className="bg-primary-50 rounded-lg px-3 py-2 mt-2">
            <p className="text-[10px] text-text-muted">Est. Monthly Reach</p>
            <p className="text-sm font-bold text-primary">~{(estimatedReach * 30).toLocaleString('en-IN')} farmers</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
