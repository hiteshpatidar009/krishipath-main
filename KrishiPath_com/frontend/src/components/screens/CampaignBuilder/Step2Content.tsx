import { useState } from 'react';
import { Video, FileText, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import type { CampaignDraft } from './CampaignBuilder';

interface Props { draft: CampaignDraft; update: (p: Partial<CampaignDraft>) => void; onNext: () => void; onBack: () => void; }

export function Step2Content({ draft, update, onNext, onBack }: Props) {
  const [newQ, setNewQ] = useState({ q: '', opts: ['', '', '', ''], ans: 0 });
  const [addingQ, setAddingQ] = useState(false);

  const addQuestion = () => {
    if (!newQ.q.trim()) return;
    update({ quizQuestions: [...draft.quizQuestions, newQ] });
    setNewQ({ q: '', opts: ['', '', '', ''], ans: 0 });
    setAddingQ(false);
  };

  const removeQuestion = (i: number) => {
    update({ quizQuestions: draft.quizQuestions.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Video Upload */}
        <Card padding="lg">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">Campaign Video</h3>
          <div
            onClick={() => update({ hasVideo: !draft.hasVideo })}
            className={[
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              draft.hasVideo ? 'border-primary bg-primary-50' : 'border-border hover:border-primary-light hover:bg-primary-50/20',
            ].join(' ')}
          >
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${draft.hasVideo ? 'bg-primary' : 'bg-surface-alt'}`}>
              <Video size={22} className={draft.hasVideo ? 'text-white' : 'text-text-muted'} />
            </div>
            {draft.hasVideo ? (
              <>
                <p className="text-sm font-semibold text-primary">Video Added ✓</p>
                <p className="text-xs text-text-muted mt-1">sample_campaign_video.mp4 · 2.4 MB</p>
                <p className="text-[10px] text-primary mt-2 hover:underline">Click to replace</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary">Upload Campaign Video</p>
                <p className="text-xs text-text-secondary mt-1">MP4, MOV · Max 100MB · Recommended 1-3 min</p>
                <p className="text-xs text-text-muted mt-3">Drag & drop or <span className="text-primary font-medium">browse files</span></p>
              </>
            )}
          </div>
        </Card>

        {/* Brochure Upload */}
        <Card padding="lg">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4">Product Brochure / Catalog</h3>
          <div
            onClick={() => update({ hasBrochure: !draft.hasBrochure })}
            className={[
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              draft.hasBrochure ? 'border-primary bg-primary-50' : 'border-border hover:border-primary-light hover:bg-primary-50/20',
            ].join(' ')}
          >
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${draft.hasBrochure ? 'bg-primary' : 'bg-surface-alt'}`}>
              <FileText size={22} className={draft.hasBrochure ? 'text-white' : 'text-text-muted'} />
            </div>
            {draft.hasBrochure ? (
              <>
                <p className="text-sm font-semibold text-primary">Brochure Added ✓</p>
                <p className="text-xs text-text-muted mt-1">product_catalog_2026.pdf · 4.1 MB</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary">Upload Brochure or Catalog</p>
                <p className="text-xs text-text-secondary mt-1">PDF · Max 20MB</p>
                <p className="text-xs text-text-muted mt-3">Drag & drop or <span className="text-primary font-medium">browse files</span></p>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Quiz Builder */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Product Knowledge Quiz</h3>
              <p className="text-xs text-text-muted mt-0.5">{draft.quizQuestions.length} question{draft.quizQuestions.length !== 1 ? 's' : ''} added</p>
            </div>
            {!addingQ && (
              <Button size="sm" variant="secondary" leftIcon={<Plus size={13} />} onClick={() => setAddingQ(true)}>
                Add Question
              </Button>
            )}
          </div>

          {/* Existing Questions */}
          <div className="space-y-3 mb-3">
            {draft.quizQuestions.map((q, i) => (
              <div key={i} className="bg-surface-alt rounded-xl p-3 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-text-primary flex-1">Q{i + 1}. {q.q}</p>
                  <button onClick={() => removeQuestion(i)} className="text-text-muted hover:text-error cursor-pointer shrink-0"><Trash2 size={13} /></button>
                </div>
                <div className="mt-2 space-y-1">
                  {q.opts.filter(Boolean).map((opt, j) => (
                    <p key={j} className={`text-[11px] px-2 py-1 rounded-lg ${j === q.ans ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-text-muted'}`}>
                      {j === q.ans ? '✓ ' : '○ '}{opt}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* New Question Form */}
          {addingQ && (
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Question</label>
                <input
                  value={newQ.q}
                  onChange={e => setNewQ(prev => ({ ...prev, q: e.target.value }))}
                  placeholder="e.g. What is the recommended dose of this fertilizer?"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary block">Options (select correct answer)</label>
                {newQ.opts.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQ.ans === i}
                      onChange={() => setNewQ(prev => ({ ...prev, ans: i }))}
                      className="accent-primary shrink-0"
                    />
                    <input
                      value={opt}
                      onChange={e => {
                        const opts = [...newQ.opts];
                        opts[i] = e.target.value;
                        setNewQ(prev => ({ ...prev, opts }));
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary bg-white"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setAddingQ(false)} className="flex-1">Cancel</Button>
                <Button size="sm" onClick={addQuestion} className="flex-1">Add Question</Button>
              </div>
            </div>
          )}

          {draft.quizQuestions.length === 0 && !addingQ && (
            <p className="text-xs text-text-muted text-center py-4">No questions yet. Add questions to create an engaging quiz for farmers.</p>
          )}
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={onBack} className="flex-none">Back</Button>
          <Button fullWidth onClick={onNext} size="md">Continue to Rewards</Button>
        </div>
      </div>
    </div>
  );
}
