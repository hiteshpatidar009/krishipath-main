import type { Transaction, WalletSummary } from '../types';

// ─── Wallet Summary ────────────────────────────────────────────────────────────

export const walletSummary: WalletSummary = {
  balance: 124500,
  totalRecharged: 177000,
  totalSpent: 52500,
  platformFees: 3000,
  lastUpdated: '2026-07-02T09:42:00',
  accountId: 'KP-C-00842',
  companyName: 'AgroGrow India Pvt. Ltd.',
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions: Transaction[] = [
  { id: 'txn-001', type: 'recharge', amount: 50000, description: 'Wallet Recharge via UPI', date: '2026-04-05', balance: 50000, invoiceId: 'INV-2026-0401' },
  { id: 'txn-002', type: 'platform-fee', amount: -1000, description: 'Platform Fee — April', date: '2026-04-05', balance: 49000 },
  { id: 'txn-003', type: 'campaign-spend', amount: -3200, description: 'Campaign: Drip Irrigation Awareness', date: '2026-04-10', balance: 45800 },
  { id: 'txn-004', type: 'reward-distributed', amount: -4200, description: 'Rewards: 1,400 farmers @ ₹3 avg', date: '2026-04-15', balance: 41600 },
  { id: 'txn-005', type: 'recharge', amount: 25000, description: 'Wallet Recharge via Net Banking', date: '2026-04-20', balance: 66600, invoiceId: 'INV-2026-0402' },
  { id: 'txn-006', type: 'campaign-spend', amount: -5400, description: 'Campaign: Drip Irrigation Awareness', date: '2026-04-25', balance: 61200 },
  { id: 'txn-007', type: 'bonus', amount: 2000, description: 'Promotional Bonus — New User', date: '2026-04-28', balance: 63200 },
  { id: 'txn-008', type: 'reward-distributed', amount: -3800, description: 'Rewards: 1,050 farmers @ ₹3.6 avg', date: '2026-05-02', balance: 59400 },
  { id: 'txn-009', type: 'platform-fee', amount: -1000, description: 'Platform Fee — May', date: '2026-05-05', balance: 58400 },
  { id: 'txn-010', type: 'recharge', amount: 50000, description: 'Wallet Recharge via NEFT', date: '2026-05-10', balance: 108400, invoiceId: 'INV-2026-0501' },
  { id: 'txn-011', type: 'campaign-spend', amount: -4600, description: 'Campaign: Organic Seed Introduction', date: '2026-05-15', balance: 103800 },
  { id: 'txn-012', type: 'reward-distributed', amount: -7200, description: 'Rewards: 2,400 farmers @ ₹3 avg', date: '2026-05-20', balance: 96600 },
  { id: 'txn-013', type: 'campaign-spend', amount: -3800, description: 'Campaign: Organic Seed Introduction', date: '2026-05-25', balance: 92800 },
  { id: 'txn-014', type: 'platform-fee', amount: -1000, description: 'Platform Fee — June', date: '2026-06-01', balance: 91800 },
  { id: 'txn-015', type: 'recharge', amount: 50000, description: 'Wallet Recharge via UPI', date: '2026-06-05', balance: 141800, invoiceId: 'INV-2026-0601' },
  { id: 'txn-016', type: 'campaign-spend', amount: -6400, description: 'Campaign: Kharif Season Fertilizer Drive', date: '2026-06-10', balance: 135400 },
  { id: 'txn-017', type: 'reward-distributed', amount: -5800, description: 'Rewards: 1,800 farmers @ ₹3.2 avg', date: '2026-06-15', balance: 129600 },
  { id: 'txn-018', type: 'campaign-spend', amount: -2400, description: 'Campaign: Pest Control Awareness', date: '2026-06-20', balance: 127200 },
  { id: 'txn-019', type: 'reward-distributed', amount: -2100, description: 'Rewards: 700 farmers @ ₹3 avg', date: '2026-06-25', balance: 125100 },
  { id: 'txn-020', type: 'campaign-spend', amount: -600, description: 'Campaign: Pest Control Awareness', date: '2026-07-01', balance: 124500 },
];
