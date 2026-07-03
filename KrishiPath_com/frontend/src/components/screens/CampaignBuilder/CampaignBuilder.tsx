import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StepIndicator } from '../../ui/StepIndicator';
import { Button } from '../../ui/Button';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Content } from './Step2Content';
import { Step3Rewards } from './Step3Rewards';
import { Step4Targeting } from './Step4Targeting';
import { Step5Review } from './Step5Review';

const steps = [
  { label: 'Basic Info', description: 'Name & goal' },
  { label: 'Content', description: 'Videos & quiz' },
  { label: 'Rewards', description: 'Amounts & budget' },
  { label: 'Targeting', description: 'Audience filters' },
  { label: 'Review', description: 'Launch' },
];

export interface CampaignDraft {
  name: string;
  goal: string;
  description: string;
  videoReward: number;
  quizReward: number;
  brochureReward: number;
  callbackReward: number;
  dailyBudget: number;
  endDate: string;
  targetStates: string[];
  targetCrops: string[];
  language: string;
  hasVideo: boolean;
  hasBrochure: boolean;
  quizQuestions: { q: string; opts: string[]; ans: number }[];
}

const defaultDraft: CampaignDraft = {
  name: '',
  goal: '',
  description: '',
  videoReward: 2,
  quizReward: 3,
  brochureReward: 1,
  callbackReward: 10,
  dailyBudget: 2000,
  endDate: '',
  targetStates: [],
  targetCrops: [],
  language: 'Hindi',
  hasVideo: false,
  hasBrochure: false,
  quizQuestions: [],
};

export function CampaignBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CampaignDraft>(defaultDraft);

  const update = (patch: Partial<CampaignDraft>) => setDraft(prev => ({ ...prev, ...patch }));
  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const stepProps = { draft, update, onNext: next, onBack: back };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => navigate('/campaigns')}>
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Create Campaign</h1>
          <p className="text-sm text-text-secondary mt-0.5">Step {step + 1} of {steps.length} — {steps[step].label}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
        <StepIndicator steps={steps} current={step} />
      </div>

      {/* Step Content */}
      {step === 0 && <Step1BasicInfo {...stepProps} />}
      {step === 1 && <Step2Content {...stepProps} />}
      {step === 2 && <Step3Rewards {...stepProps} />}
      {step === 3 && <Step4Targeting {...stepProps} />}
      {step === 4 && <Step5Review draft={draft} onBack={back} onLaunch={() => navigate('/campaigns')} />}
    </div>
  );
}
