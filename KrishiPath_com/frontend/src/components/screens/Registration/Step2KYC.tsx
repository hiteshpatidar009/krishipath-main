import { Button } from '../../ui/Button';
import { UserCheck, ArrowLeft } from 'lucide-react';
import { indianStates } from '../../../data/mockData';

interface Props {
  data: any;
  update: (patch: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2KYC({ data, update, onNext, onBack }: Props) {
  const valid = data.contactName.trim() && data.phone.length === 10 && data.email.includes('@') && data.state;

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><UserCheck size={16} className="text-indigo-600" /></div>
          <h2 className="text-lg font-bold text-text-primary">KYC & Contact Details</h2>
        </div>
        <p className="text-sm text-text-secondary">Help us verify your identity and stay in touch</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-secondary block mb-1.5">Contact Person Name <span className="text-error">*</span></label>
        <input
          value={data.contactName}
          onChange={e => update({ contactName: e.target.value })}
          placeholder="Full name of authorized person"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Mobile Number <span className="text-error">*</span></label>
          <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-primary transition-colors">
            <span className="px-3 py-2.5 text-sm text-text-muted bg-surface-alt border-r border-border shrink-0">+91</span>
            <input
              type="tel"
              maxLength={10}
              value={data.phone}
              onChange={e => update({ phone: e.target.value.replace(/\D/g, '') })}
              placeholder="9876543210"
              className="flex-1 px-3 py-2.5 text-sm text-text-primary outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Email Address <span className="text-error">*</span></label>
          <input
            type="email"
            value={data.email}
            onChange={e => update({ email: e.target.value })}
            placeholder="admin@company.com"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-secondary block mb-1.5">State <span className="text-error">*</span></label>
        <select
          value={data.state}
          onChange={e => update({ state: e.target.value })}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors bg-white cursor-pointer"
        >
          <option value="">Select state…</option>
          {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-secondary block mb-1.5">Registered Address</label>
        <textarea
          value={data.address}
          onChange={e => update({ address: e.target.value })}
          placeholder="Office address (street, city, pincode)"
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={onBack} className="flex-none">Back</Button>
        <Button fullWidth onClick={onNext} disabled={!valid} size="md">Continue to Wallet Setup</Button>
      </div>
    </div>
  );
}
