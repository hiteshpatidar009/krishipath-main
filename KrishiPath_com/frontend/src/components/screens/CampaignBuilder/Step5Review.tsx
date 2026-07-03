import { useState } from 'react';
import { ArrowLeft, Rocket, MapPin, Sprout, Globe2, Check } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { toast } from '../../ui/Toast';
import { kpiSummary } from '../../../data/mockData';
import type { CampaignDraft } from './CampaignBuilder';

interface Props { draft: CampaignDraft; onBack: () => void; onLaunch: () => void; }

export function Step5Review({ draft, onBack, onLaunch }: Props) {
  const [launching, setLaunching] = useState(false);

  const rewardCost = (draft.videoReward * 700) + (draft.quizReward * 500) + (draft.brochureReward * 300) + (draft.callbackReward * 30);
  const platformFee = Math.round(rewardCost * 0.12);
  const estimatedTotal = rewardCost + platformFee;
  const walletAfter = kpiSummary.walletBalance - estimatedTotal;
  const daysRemaining = draft.endDate ? Math.max(0, Math.round((new Date(draft.endDate).getTime() - Date.now()) / 86400000)) : null;

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      toast('🚀 Campaign launched successfully! Farmers will start seeing your content shortly.', 'success');
      onLaunch();
    }, 2500);
  };

  const costBreakdown = [
    { label: 'Video Rewards', value: draft.videoReward * 700 },
    { label: 'Quiz Rewards', value: draft.quizReward * 500 },
    { label: 'Brochure Rewards', value: draft.brochureReward * 300 },
    { label: 'Callback Rewards', value: draft.callbackReward * 30 },
    { label: 'Platform Fee (12%)', value: platformFee },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Campaign Summary Card */}
        <Card padding="lg">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{draft.name || 'Untitled Campaign'}</h2>
              <p className="text-sm text-text-secondary mt-0.5">{draft.goal} · {draft.description || 'No description provided'}</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full shrink-0">Ready to Launch</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-surface-alt rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><MapPin size={12} className="text-primary" /><p className="text-[10px] text-text-muted">States</p></div>
              <p className="text-sm font-bold text-text-primary">{draft.targetStates.length || '—'}</p>
              <p className="text-[10px] text-text-muted truncate">{draft.targetStates.slice(0, 2).join(', ')}{draft.targetStates.length > 2 ? ` +${draft.targetStates.length - 2}` : ''}</p>
            </div>
            <div className="bg-surface-alt rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><Sprout size={12} className="text-teal-600" /><p className="text-[10px] text-text-muted">Crops</p></div>
              <p className="text-sm font-bold text-text-primary">{draft.targetCrops.length || 'All'}</p>
              <p className="text-[10px] text-text-muted truncate">{draft.targetCrops.length ? draft.targetCrops.slice(0, 2).join(', ') : 'All crop types'}</p>
            </div>
            <div className="bg-surface-alt rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><Globe2 size={12} className="text-indigo-600" /><p className="text-[10px] text-text-muted">Language</p></div>
              <p className="text-sm font-bold text-text-primary">{draft.language}</p>
              {daysRemaining !== null && <p className="text-[10px] text-text-muted">{daysRemaining}d remaining</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Video Reward', value: `₹${draft.videoReward}`, icon: '🎬' },
              { label: 'Quiz Reward', value: `₹${draft.quizReward}`, icon: '📝' },
              { label: 'Brochure Reward', value: `₹${draft.brochureReward}`, icon: '📄' },
              { label: 'Callback Reward', value: `₹${draft.callbackReward}`, icon: '📞' },
            ].map(item => (
              <div key={item.label} className="border border-border rounded-xl p-3 text-center">
                <p className="text-lg mb-1">{item.icon}</p>
                <p className="text-sm font-bold text-primary">{item.value}</p>
                <p className="text-[10px] text-text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Content Checklist */}
        <Card padding="md">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3">Content Checklist</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Campaign Video', done: draft.hasVideo },
              { label: 'Product Brochure', done: draft.hasBrochure },
              { label: `Quiz (${draft.quizQuestions.length} questions)`, done: draft.quizQuestions.length > 0 },
              { label: 'Target States', done: draft.targetStates.length > 0 },
              { label: 'Reward Amounts', done: true },
              { label: 'Daily Budget', done: draft.dailyBudget > 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500' : 'bg-surface-alt border border-border'}`}>
                  {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className={item.done ? 'text-text-primary' : 'text-text-muted'}>{item.label}</span>
                {!item.done && <span className="text-[10px] text-amber-500">(optional)</span>}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={onBack} className="flex-none">Back</Button>
          <Button fullWidth size="lg" leftIcon={<Rocket size={16} />} onClick={handleLaunch} loading={launching}>
            {launching ? 'Launching Campaign…' : 'Launch Campaign'}
          </Button>
        </div>
      </div>

      {/* Cost Breakdown */}
      <Card padding="lg" className="h-fit sticky top-4">
        <h3 className="text-[13px] font-semibold text-text-primary mb-4">Estimated Cost</h3>
        <div className="space-y-2.5 mb-4">
          {costBreakdown.map(item => (
            <div key={item.label} className="flex justify-between text-xs">
              <span className="text-text-secondary">{item.label}</span>
              <span className="font-semibold text-text-primary">₹{item.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-text-primary">Estimated Total</span>
            <span className="text-text-primary">₹{estimatedTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Daily Budget</span>
            <span className="font-medium text-text-secondary">₹{draft.dailyBudget.toLocaleString('en-IN')}/day</span>
          </div>
          <div className={`flex justify-between text-xs font-semibold pt-1 border-t border-border mt-2 ${walletAfter < 0 ? 'text-error' : 'text-text-secondary'}`}>
            <span>Wallet After Launch</span>
            <span>₹{walletAfter.toLocaleString('en-IN')}</span>
          </div>
          {walletAfter < 0 && (
            <p className="text-[10px] text-error bg-red-50 rounded-lg px-2 py-1.5">
              Insufficient wallet balance. Please top up before launching.
            </p>
          )}
        </div>
        <div className="mt-4 bg-primary-50 rounded-xl p-3">
          <p className="text-[10px] text-text-muted">Est. Farmer Reach</p>
          <p className="text-xl font-bold text-primary">~{(draft.dailyBudget * (daysRemaining || 30) / 5).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-text-muted">over campaign duration</p>
        </div>
      </Card>
    </div>
  );
}
