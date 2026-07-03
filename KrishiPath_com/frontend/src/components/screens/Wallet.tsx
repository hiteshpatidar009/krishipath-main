import { useState } from 'react';
import { Wallet as WalletIcon, Plus, Download, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, statusLabel } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { toast } from '../ui/Toast';
import { 
  transactions as _transactions, 
  monthlyMetrics as _monthlyMetrics, 
  formatCurrency, 
  formatDate 
} from '../../data/mockData';
import { walletSummary as _walletSummary } from '../../mock';
import type { Transaction, WalletSummary, TopUpPayload } from '../../types';

const presets = [500, 1000, 5000, 10000, 25000, 50000];

const spendData = _monthlyMetrics.map(m => ({
  month: m.month,
  Rewards: Math.round(m.spend * 0.72),
  'Platform Fee': Math.round(m.spend * 0.09),
  'Campaign Mgmt': Math.round(m.spend * 0.19),
}));

interface WalletProps {
  summary?: WalletSummary;
  transactions?: Transaction[];
  onTopUp?: (payload: TopUpPayload) => Promise<Transaction>;
  onFilterTransactions?: (type: Transaction['type'] | 'all') => void;
  onDownloadStatement?: () => void;
  topUpLoading?: boolean;
}

export function Wallet({
  summary = _walletSummary,
  transactions = _transactions,
  onTopUp,
  onFilterTransactions,
  onDownloadStatement,
  topUpLoading = false
}: WalletProps) {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'all'>('all');

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  const handleTopUp = async () => {
    if (finalAmount < 100) { toast('Minimum recharge amount is ₹100', 'error'); return; }
    
    if (onTopUp) {
      try {
        await onTopUp({ amount: finalAmount, paymentMethod });
        setTopUpOpen(false);
        toast(`₹${finalAmount.toLocaleString('en-IN')} added to your wallet successfully!`, 'success');
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Top up failed', 'error');
      }
    } else {
      // Mock fallback
      setTimeout(() => {
        setTopUpOpen(false);
        toast(`₹${finalAmount.toLocaleString('en-IN')} added to your wallet successfully!`, 'success');
      }, 1800);
    }
  };

  const handleFilterChange = (val: string) => {
    const filter = val as Transaction['type'] | 'all';
    setTypeFilter(filter);
    if (onFilterTransactions) {
      onFilterTransactions(filter);
    }
  };

  const filtered = onFilterTransactions 
    ? transactions // If parent filters, take as-is
    : (typeFilter === 'all' ? transactions : transactions.filter(t => t.type === typeFilter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Wallet</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage your campaign budget and transactions</p>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setTopUpOpen(true)}>Add Funds</Button>
      </div>

      {/* Hero Balance Card */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <WalletIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Available Balance</p>
                <p className="text-xs text-white/50">{summary?.companyName || 'AgroGrow India Pvt. Ltd.'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Account ID</p>
              <p className="text-white text-sm font-mono font-semibold">{summary?.accountId || 'KP-C-00842'}</p>
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight mb-1">₹{summary?.balance?.toLocaleString('en-IN')}</p>
          <p className="text-white/60 text-sm">Last updated: {summary?.lastUpdated ? formatDate(summary.lastUpdated) : 'Today'}</p>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => setTopUpOpen(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer backdrop-blur-sm border border-white/20"
            >
              <Plus size={14} />
              Top Up
            </button>
            <button onClick={onDownloadStatement} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <Download size={14} />
              Statement
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><ArrowUpRight size={16} className="text-emerald-600" /></div>
            <p className="text-xs text-text-secondary font-medium">Total Recharged</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(summary?.totalRecharged || 0)}</p>
          <p className="text-xs text-text-muted mt-0.5">Across all time</p>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><ArrowDownRight size={16} className="text-orange-600" /></div>
            <p className="text-xs text-text-secondary font-medium">Total Spent</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(summary?.totalSpent || 0)}</p>
          <p className="text-xs text-text-muted mt-0.5">Campaigns + fees</p>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><FileText size={16} className="text-gray-500" /></div>
            <p className="text-xs text-text-secondary font-medium">Platform Fees</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(summary?.platformFees || 0)}</p>
          <p className="text-xs text-text-muted mt-0.5">₹1,000/month</p>
        </Card>
      </div>

      {/* Spend Chart */}
      <Card padding="lg">
        <CardHeader title="Monthly Spend Breakdown" subtitle="How your wallet budget is allocated each month" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={spendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE8DD" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5C6E5C', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 10, border: '1px solid #DDE8DD', fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#5C6E5C' }} />
            <Bar dataKey="Rewards" fill="#2E7D32" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Platform Fee" fill="#F9A825" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Campaign Mgmt" fill="#039BE5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Transaction History */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Transaction History</h3>
            <p className="text-xs text-text-muted mt-0.5">{filtered.length} transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => handleFilterChange(e.target.value)}
              className="text-xs border border-border rounded-lg px-3 py-1.5 text-text-primary bg-white cursor-pointer outline-none focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="recharge">Recharges</option>
              <option value="campaign-spend">Campaign Spend</option>
              <option value="reward-distributed">Rewards</option>
              <option value="platform-fee">Platform Fee</option>
              <option value="bonus">Bonus</option>
            </select>
            <Button variant="secondary" size="sm" leftIcon={<Download size={13} />}>Export</Button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(txn => (
            <div key={txn.id} className="px-5 py-3.5 hover:bg-surface-alt transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${txn.amount > 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                  {txn.amount > 0 ? <TrendingUp size={14} className="text-emerald-600" /> : <TrendingDown size={14} className="text-orange-600" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{txn.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={txn.type} size="sm">{statusLabel[txn.type]}</Badge>
                    <span className="text-xs text-text-muted">{formatDate(txn.date)}</span>
                    {txn.invoiceId && <span className="text-xs text-primary cursor-pointer hover:underline">{txn.invoiceId}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${txn.amount > 0 ? 'text-emerald-600' : 'text-text-primary'}`}>
                  {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Bal: ₹{txn.balance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top-Up Modal */}
      <Modal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Add Funds to Wallet"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setTopUpOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleTopUp} loading={topUpLoading} className="flex-1">
              {topUpLoading ? 'Processing…' : `Pay ₹${finalAmount.toLocaleString('en-IN')}`}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Choose Amount</p>
            <div className="grid grid-cols-3 gap-2">
              {presets.map(amt => (
                <button
                  key={amt}
                  onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  className={[
                    'py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer',
                    !customAmount && selectedAmount === amt
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-border text-text-secondary hover:border-border-dark',
                  ].join(' ')}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary mb-1.5">Or enter custom amount</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
              <input
                type="number"
                placeholder="0"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="w-full border border-border rounded-xl pl-7 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Payment Method</p>
            <div className="space-y-2">
              {[
                { id: 'upi', label: 'UPI / UPI QR', sub: 'GPay, PhonePe, Paytm, BHIM' },
                { id: 'netbanking', label: 'Net Banking', sub: 'All major banks supported' },
                { id: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay' },
              ].map(method => (
                <label key={method.id} className={[
                  'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                  paymentMethod === method.id ? 'border-primary bg-primary-50' : 'border-border hover:border-border-dark',
                ].join(' ')}>
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{method.label}</p>
                    <p className="text-xs text-text-muted">{method.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-surface-alt rounded-xl p-3 flex items-center justify-between text-sm border border-border">
            <span className="text-text-secondary">Amount to be credited</span>
            <span className="font-bold text-primary">₹{finalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
