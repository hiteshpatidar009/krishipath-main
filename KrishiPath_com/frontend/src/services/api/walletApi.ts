import type { Transaction, WalletSummary, TopUpPayload } from '../../types';
import { transactions as mockTransactions, walletSummary as mockSummary } from '../../mock/walletData';
import { delay } from '../../utils/formatters';
import { MOCK_DELAY_MIN_MS, MOCK_DELAY_MAX_MS, WALLET_MIN_TOPUP } from '../../utils/constants';

let _transactions = [...mockTransactions];
let _summary = { ...mockSummary };

const d = () => delay(MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS));

/**
 * Fetches wallet summary (balance, totals, account info).
 *
 * BACKEND SWAP: GET /wallet/summary
 */
export const getWalletSummary = async (): Promise<WalletSummary> => {
  await d();
  return { ..._summary };
};

/**
 * Fetches transaction history, optionally filtered by type.
 *
 * BACKEND SWAP: GET /wallet/transactions?type=recharge&page=1&limit=20
 */
export const getTransactions = async (
  type?: Transaction['type'] | 'all'
): Promise<Transaction[]> => {
  await d();
  if (!type || type === 'all') return [..._transactions];
  return _transactions.filter((t) => t.type === type);
};

/**
 * Tops up the wallet balance.
 *
 * BACKEND SWAP: POST /wallet/topup with { amount, paymentMethod }
 *   — will redirect to payment gateway in real implementation
 */
export const topUpWallet = async (payload: TopUpPayload): Promise<Transaction> => {
  if (payload.amount < WALLET_MIN_TOPUP) {
    throw new Error(`Minimum recharge amount is ₹${WALLET_MIN_TOPUP}`);
  }

  await delay(1800); // Simulate payment processing

  const newBalance = _summary.balance + payload.amount;
  const newTxn: Transaction = {
    id: `txn-${String(Date.now()).slice(-6)}`,
    type: 'recharge',
    amount: payload.amount,
    description: `Wallet Recharge via ${payload.paymentMethod.toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    balance: newBalance,
    invoiceId: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  };

  _transactions = [newTxn, ..._transactions];
  _summary = {
    ..._summary,
    balance: newBalance,
    totalRecharged: _summary.totalRecharged + payload.amount,
    lastUpdated: new Date().toISOString(),
  };

  return { ...newTxn };
};

/**
 * Downloads a wallet statement as a Blob (CSV).
 *
 * BACKEND SWAP: GET /wallet/statement?format=csv
 */
export const downloadStatement = async (): Promise<Blob> => {
  await d();
  const header = 'ID,Type,Amount,Description,Date,Balance\n';
  const rows = _transactions
    .map(
      (t) =>
        `${t.id},${t.type},${t.amount},"${t.description}",${t.date},${t.balance}`
    )
    .join('\n');
  return new Blob([header + rows], { type: 'text/csv' });
};

export const walletApi = { getWalletSummary, getTransactions, topUpWallet, downloadStatement };
