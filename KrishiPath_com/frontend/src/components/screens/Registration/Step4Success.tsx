import { useState } from 'react';
import { Clock, ArrowRight, Leaf, CheckCircle, Mail, Phone } from 'lucide-react';
import { Button } from '../../ui/Button';

interface Props { onGo: () => void; }

export function Step4Success({ onGo }: Props) {
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div className="p-8 text-center space-y-6">
      {/* Pending Approval Badge */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center">
              <Clock size={28} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Leaf size={14} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Registration Submitted!</h2>
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mt-2">
          <Clock size={12} /> Pending KrishiPath Approval
        </div>
        <p className="text-sm text-text-secondary mt-3 max-w-sm leading-relaxed">
          Your company registration is under review. Our team will verify your details within <strong>24–48 business hours</strong>.
        </p>
      </div>

      {/* What Happens Next */}
      <div className="bg-surface-alt rounded-2xl p-5 text-left space-y-3.5">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">What happens next</p>
        {[
          { done: true, icon: <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />, label: 'Registration received', sub: 'Your details have been submitted successfully' },
          { done: false, icon: <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />, label: 'KYC Verification', sub: 'Our team verifies your company & GST details (24–48 hrs)' },
          { done: false, icon: <Mail size={14} className="text-primary shrink-0 mt-0.5" />, label: 'Approval email', sub: 'You will receive login credentials once approved' },
          { done: false, icon: <ArrowRight size={14} className="text-indigo-500 shrink-0 mt-0.5" />, label: 'Launch your campaigns', sub: 'Reach farmers across India with reward-based campaigns' },
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            {step.icon}
            <div>
              <p className={`text-sm font-semibold ${step.done ? 'text-emerald-700' : 'text-text-primary'}`}>{step.label}</p>
              <p className="text-xs text-text-muted">{step.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
        <p className="text-xs font-semibold text-blue-800 mb-2">Need faster approval?</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-blue-700">
            <Phone size={12} /> +91 98765 43210
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-700">
            <Mail size={12} /> support@krishipath.in
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => { setEmailSent(true); }}
        >
          {emailSent ? '✓ Reminder Sent' : 'Send Me a Reminder'}
        </Button>
        <Button fullWidth rightIcon={<ArrowRight size={16} />} onClick={onGo}>
          Preview Dashboard
        </Button>
      </div>

      <p className="text-xs text-text-muted">
        You're registering as a <strong>Root Company Account</strong>. After approval, you can add team members from Team Management.
      </p>
    </div>
  );
}
