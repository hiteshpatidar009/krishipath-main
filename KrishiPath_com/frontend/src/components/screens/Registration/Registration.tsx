import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { StepIndicator } from '../../ui/StepIndicator';
import { Step1CompanyInfo } from './Step1CompanyInfo';
import { Step2KYC } from './Step2KYC';
import { Step3WalletSetup } from './Step3WalletSetup';
import { Step4Success } from './Step4Success';

const steps = [
  { label: 'Company Info', description: 'Basic details' },
  { label: 'KYC & Contact', description: 'Verification' },
  { label: 'Wallet Setup', description: 'Add funds' },
  { label: 'All Done!', description: 'Start now' },
];

export function Registration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    businessCategory: '',
    website: '',
    gst: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    state: '',
    initialRecharge: 5000,
    password: '',
  });

  const update = (patch: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...patch }));
  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Leaf size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[15px] font-bold text-text-primary">KrishiPath</span>
          <span className="text-xs text-text-muted ml-2">Company Registration</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {step < 3 && (
            <div className="bg-white rounded-2xl border border-border shadow-lg p-6 mb-6">
              <StepIndicator steps={steps} current={step} />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            {step === 0 && <Step1CompanyInfo data={formData} update={update} onNext={next} />}
            {step === 1 && <Step2KYC data={formData} update={update} onNext={next} onBack={back} />}
            {step === 2 && <Step3WalletSetup data={formData} update={update} onNext={next} onBack={back} />}
            {step === 3 && <Step4Success onGo={() => navigate('/')} />}
          </div>
        </div>
      </div>
    </div>
  );
}
