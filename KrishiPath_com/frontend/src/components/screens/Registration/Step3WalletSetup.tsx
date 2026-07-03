import { useState } from 'react';
import { Wallet, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

const presets = [500, 1000, 5000, 10000];

interface Props {
  data: any;
  update: (patch: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3WalletSetup({ data, update, onNext, onBack }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const valid = data.password.length >= 8 && data.password === confirm;

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 2000);
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Wallet size={16} className="text-amber-600" /></div>
          <h2 className="text-lg font-bold text-text-primary">Wallet Setup</h2>
        </div>
        <p className="text-sm text-text-secondary">Set your account password and add initial campaign budget</p>
      </div>

      {/* Password */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Password <span className="text-error">*</span></label>
          <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-primary transition-colors">
            <input
              type={showPw ? 'text' : 'password'}
              value={data.password}
              onChange={e => update({ password: e.target.value })}
              placeholder="Min 8 characters"
              className="flex-1 px-4 py-2.5 text-sm text-text-primary outline-none"
            />
            <button onClick={() => setShowPw(!showPw)} className="px-3 text-text-muted hover:text-text-primary cursor-pointer">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">Confirm Password <span className="text-error">*</span></label>
          <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-primary transition-colors">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className={`flex-1 px-4 py-2.5 text-sm outline-none ${confirm && confirm !== data.password ? 'text-error' : 'text-text-primary'}`}
            />
            <button onClick={() => setShowConfirm(!showConfirm)} className="px-3 text-text-muted hover:text-text-primary cursor-pointer">
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {confirm && confirm !== data.password && <p className="text-[10px] text-error mt-1">Passwords don't match</p>}
        </div>
      </div>

      {/* Initial Recharge */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-2">Initial Campaign Budget</p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map(amt => (
            <button
              key={amt}
              onClick={() => update({ initialRecharge: amt })}
              className={[
                'py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-center',
                data.initialRecharge === amt ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-border-dark',
              ].join(' ')}
            >
              ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-2">You can add more anytime from the Wallet section</p>
      </div>

      {/* Payment Method */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-2">Payment Method</p>
        <div className="space-y-2">
          {[
            { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm, BHIM' },
            { id: 'netbanking', label: 'Net Banking', sub: 'All major Indian banks' },
            { id: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay' },
          ].map(m => (
            <label key={m.id} className={[
              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              paymentMethod === m.id ? 'border-primary bg-primary-50' : 'border-border hover:border-border-dark',
            ].join(' ')}>
              <input type="radio" name="pm" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
                <p className="text-xs text-text-muted">{m.sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-primary-50 rounded-xl p-3 flex items-center justify-between border border-primary-100">
        <span className="text-sm text-text-secondary">Wallet will be credited with</span>
        <span className="font-bold text-primary text-lg">₹{data.initialRecharge.toLocaleString('en-IN')}</span>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={onBack} className="flex-none">Back</Button>
        <Button fullWidth onClick={handleFinish} disabled={!valid} loading={loading} size="md">
          {loading ? 'Setting up your account…' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );
}
