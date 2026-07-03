import { Megaphone, Target, BookOpen } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import type { CampaignDraft } from './CampaignBuilder';

const goals = [
  { id: 'Product Awareness', icon: <Megaphone size={22} className="text-primary" />, label: 'Product Awareness', desc: 'Educate farmers about your product features and benefits', bg: 'bg-primary-50', border: 'border-primary' },
  { id: 'Lead Generation', icon: <Target size={22} className="text-rose-600" />, label: 'Lead Generation', desc: 'Collect farmer contact details and callback requests', bg: 'bg-rose-50', border: 'border-rose-300' },
  { id: 'Education', icon: <BookOpen size={22} className="text-indigo-600" />, label: 'Farmer Education', desc: 'Share agri knowledge, best practices and crop guidance', bg: 'bg-indigo-50', border: 'border-indigo-300' },
];

interface Props { draft: CampaignDraft; update: (p: Partial<CampaignDraft>) => void; onNext: () => void; onBack: () => void; }

export function Step1BasicInfo({ draft, update, onNext }: Props) {
  const valid = draft.name.trim() && draft.goal;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="lg">
        <h3 className="text-[15px] font-semibold text-text-primary mb-4">Campaign Details</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">Campaign Name <span className="text-error">*</span></label>
            <input
              value={draft.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="e.g. Kharif Season Fertilizer Drive 2026"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">Campaign Description</label>
            <textarea
              value={draft.description}
              onChange={e => update({ description: e.target.value })}
              placeholder="Briefly describe what this campaign is about and what you want to achieve…"
              rows={4}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card padding="lg">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">Campaign Goal <span className="text-error">*</span></h3>
          <div className="space-y-3">
            {goals.map(g => (
              <button
                key={g.id}
                onClick={() => update({ goal: g.id })}
                className={[
                  'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer',
                  draft.goal === g.id ? `${g.border} ${g.bg}` : 'border-border hover:border-border-dark',
                ].join(' ')}
              >
                <div className={`w-10 h-10 rounded-lg ${g.bg} flex items-center justify-center shrink-0`}>{g.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{g.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{g.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Button fullWidth onClick={onNext} disabled={!valid} size="lg">
          Continue to Content
        </Button>
      </div>
    </div>
  );
}
