import { useState } from 'react';
import { Video, BookOpen, FileText, Phone, Save, Calculator, ToggleLeft, ToggleRight, Plus, Minus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';

interface RewardType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  amount: number;
  selectedPresets: number[];
  enabled: boolean;
  color: string;
  iconBg: string;
  borderColor: string;
  presets: number[];
  unit: string;
}

const defaultRewards: RewardType[] = [
  {
    id: 'video',
    label: 'Video Watch Reward',
    description: 'Farmer earns this when they complete a campaign video (minimum 80% watched). Higher rewards drive more video completions.',
    icon: <Video size={20} />,
    amount: 2,
    selectedPresets: [2],
    enabled: true,
    color: 'text-primary',
    iconBg: 'bg-primary-50',
    borderColor: 'border-primary',
    presets: [1, 2, 3, 5, 10],
    unit: 'per video',
  },
  {
    id: 'quiz',
    label: 'Quiz Completion Reward',
    description: 'Farmer earns this upon successfully answering your product knowledge quiz. Drives deeper brand engagement.',
    icon: <BookOpen size={20} />,
    amount: 3,
    selectedPresets: [3],
    enabled: true,
    color: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    borderColor: 'border-indigo-400',
    presets: [1, 2, 3, 5, 10],
    unit: 'per quiz',
  },
  {
    id: 'brochure',
    label: 'Brochure Download Reward',
    description: 'Farmer earns this upon downloading your product brochure or catalog. Great for lead qualification.',
    icon: <FileText size={20} />,
    amount: 1,
    selectedPresets: [1],
    enabled: true,
    color: 'text-orange-600',
    iconBg: 'bg-orange-50',
    borderColor: 'border-orange-400',
    presets: [1, 2, 3, 5],
    unit: 'per download',
  },
  {
    id: 'callback',
    label: 'Callback Request Reward',
    description: 'Highest-value reward — farmer explicitly requests a sales callback. This is your most qualified lead signal.',
    icon: <Phone size={20} />,
    amount: 10,
    selectedPresets: [10],
    enabled: true,
    color: 'text-rose-600',
    iconBg: 'bg-rose-50',
    borderColor: 'border-rose-400',
    presets: [5, 10, 15, 20, 25],
    unit: 'per callback',
  },
];

export function RewardSettings() {
  const [rewards, setRewards] = useState<RewardType[]>(defaultRewards);
  const [volumes, setVolumes] = useState({ video: 1000, quiz: 500, brochure: 800, callback: 30 });
  const [saving, setSaving] = useState(false);

  const togglePreset = (rewardId: string, preset: number) => {
    setRewards(prev => prev.map(r => {
      if (r.id !== rewardId) return r;
      const isSelected = r.selectedPresets.includes(preset);
      let newPresets: number[];
      if (isSelected) {
        newPresets = r.selectedPresets.filter(p => p !== preset);
        if (newPresets.length === 0) newPresets = [1]; // minimum ₹1
      } else {
        newPresets = [...r.selectedPresets, preset];
      }
      const newAmount = newPresets.reduce((a, b) => a + b, 0);
      return { ...r, selectedPresets: newPresets, amount: Math.max(1, newAmount) };
    }));
  };

  const setManualAmount = (rewardId: string, val: number) => {
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, amount: Math.max(1, val), selectedPresets: [] } : r));
  };

  const adjustAmount = (rewardId: string, delta: number) => {
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, amount: Math.max(1, r.amount + delta), selectedPresets: [] } : r));
  };

  const toggleEnabled = (id: string) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast('Reward settings saved successfully!', 'success'); }, 1200);
  };

  const estimatedCost = rewards.reduce((acc, r) => {
    const vol = volumes[r.id as keyof typeof volumes] || 0;
    return acc + (r.enabled ? r.amount * vol : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Reward Settings</h1>
          <p className="text-sm text-text-secondary mt-0.5">Set default reward amounts for each farmer activity — minimum ₹1 per activity</p>
        </div>
        <Button leftIcon={<Save size={14} />} onClick={handleSave} loading={saving}>Save Settings</Button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-amber-600 text-base shrink-0 mt-0.5">💡</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">How multi-select presets work</p>
          <p className="text-xs text-amber-700 mt-0.5">Click multiple preset chips to combine reward amounts. For example, selecting ₹2 + ₹3 sets the reward to ₹5 per farmer. Minimum reward is always ₹1. You can also type a custom amount directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {rewards.map(reward => {
            const activePct = Math.min(100, (reward.amount / 30) * 100);
            return (
              <Card key={reward.id} padding="lg" className={reward.enabled ? '' : 'opacity-60'}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${reward.iconBg} flex items-center justify-center shrink-0 ${reward.color}`}>
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="text-[15px] font-semibold text-text-primary">{reward.label}</h3>
                      <button
                        onClick={() => toggleEnabled(reward.id)}
                        className={`cursor-pointer transition-colors shrink-0 ${reward.enabled ? 'text-primary' : 'text-text-muted'}`}
                        title={reward.enabled ? 'Disable this reward' : 'Enable this reward'}
                      >
                        {reward.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">{reward.description}</p>

                    {/* Amount display + manual input */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => adjustAmount(reward.id, -1)}
                          disabled={!reward.enabled || reward.amount <= 1}
                          className="w-8 h-10 flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={13} />
                        </button>
                        <div className="flex items-center px-2 border-x border-border">
                          <span className="text-text-muted text-sm">₹</span>
                          <input
                            type="number"
                            min={1}
                            value={reward.amount}
                            disabled={!reward.enabled}
                            onChange={e => setManualAmount(reward.id, Number(e.target.value))}
                            className="w-14 text-center py-2 text-sm font-bold text-text-primary outline-none disabled:opacity-50 bg-transparent"
                          />
                        </div>
                        <button
                          onClick={() => adjustAmount(reward.id, 1)}
                          disabled={!reward.enabled}
                          className="w-8 h-10 flex items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-xs text-text-muted">{reward.unit}</span>
                      {reward.selectedPresets.length > 1 && (
                        <span className="text-xs bg-primary-50 text-primary px-2 py-0.5 rounded-full font-medium">
                          {reward.selectedPresets.map(p => `₹${p}`).join(' + ')} = ₹{reward.amount}
                        </span>
                      )}
                    </div>

                    {/* Multi-select preset chips */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-text-muted">Quick add:</span>
                      {reward.presets.map(p => {
                        const active = reward.selectedPresets.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => togglePreset(reward.id, p)}
                            disabled={!reward.enabled}
                            className={[
                              'px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                              active ? `${reward.borderColor} bg-opacity-10 text-text-primary shadow-sm` : 'border-border text-text-muted hover:border-border-dark',
                              active ? reward.iconBg : '',
                            ].join(' ')}
                            style={active ? { borderColor: 'currentColor' } : {}}
                          >
                            {active ? '✓ ' : ''}₹{p}
                          </button>
                        );
                      })}
                    </div>

                    {/* Visual bar */}
                    {reward.enabled && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                          <span>Reward level</span>
                          <span className={`font-semibold ${reward.amount >= 10 ? 'text-emerald-600' : reward.amount >= 5 ? 'text-amber-600' : 'text-text-secondary'}`}>
                            {reward.amount >= 10 ? 'High' : reward.amount >= 5 ? 'Medium' : 'Standard'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${activePct}%`, background: `var(--color-primary)` }} />
                        </div>
                      </div>
                    )}

                    {!reward.enabled && (
                      <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg px-3 py-2">
                        ⚠ Disabled — farmers won't earn any reward for this activity in new campaigns.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live Estimator */}
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center"><Calculator size={16} className="text-primary" /></div>
              <div>
                <h3 className="text-[13px] font-semibold text-text-primary">Cost Estimator</h3>
                <p className="text-[10px] text-text-muted">Enter expected volumes to estimate cost</p>
              </div>
            </div>
            <div className="space-y-3">
              {rewards.map(r => (
                <div key={r.id}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-text-secondary">{r.label.replace(' Reward', '')}</label>
                    <span className={`text-xs font-semibold ${r.enabled ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {r.enabled ? `₹${(r.amount * (volumes[r.id as keyof typeof volumes] || 0)).toLocaleString('en-IN')}` : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={volumes[r.id as keyof typeof volumes]}
                      disabled={!r.enabled}
                      onChange={e => setVolumes(prev => ({ ...prev, [r.id]: Number(e.target.value) }))}
                      placeholder="Est. count"
                      className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary disabled:opacity-40 disabled:bg-surface-alt"
                    />
                    <span className="text-xs text-text-muted shrink-0">× ₹{r.amount}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">Estimated Total</span>
                <span className="text-lg font-bold text-primary">₹{estimatedCost.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">Based on estimated engagement</p>
            </div>
          </Card>

          <Card padding="md">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Reward Guidelines</h4>
            <ul className="space-y-2.5 text-xs text-text-secondary">
              <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">•</span>Minimum reward is ₹1 per activity — cannot go below this.</li>
              <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">•</span>Use multi-select chips to combine amounts (e.g. ₹2+₹3 = ₹5).</li>
              <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">•</span>Callback rewards should be 3–5× higher — these are real leads.</li>
              <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">•</span>These defaults apply to new campaigns. Override per-campaign in the Campaign Builder.</li>
              <li className="flex items-start gap-2"><span className="text-primary shrink-0 mt-0.5">•</span>Rewards are credited to farmer wallets within 24 hours of activity.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
