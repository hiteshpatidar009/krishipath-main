import { useEffect, useState, useCallback } from 'react';
import type { Transaction, WalletSummary, TopUpPayload } from '../types';
import { walletApi } from '../services/api';

interface WalletState {
  summary: WalletSummary | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for wallet balance, transactions, and top-up operations.
 */
export function useWallet() {
  const [state, setState] = useState<WalletState>({
    summary: null,
    transactions: [],
    loading: true,
    error: null,
  });
  const [topUpLoading, setTopUpLoading] = useState(false);

  const load = useCallback(async (txnType?: Transaction['type'] | 'all') => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [summary, transactions] = await Promise.all([
        walletApi.getWalletSummary(),
        walletApi.getTransactions(txnType),
      ]);
      setState({ summary, transactions, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load wallet',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const topUp = useCallback(
    async (payload: TopUpPayload): Promise<Transaction> => {
      setTopUpLoading(true);
      try {
        const txn = await walletApi.topUpWallet(payload);
        // Refresh wallet state after top-up
        const summary = await walletApi.getWalletSummary();
        const transactions = await walletApi.getTransactions();
        setState((s) => ({ ...s, summary, transactions }));
        return txn;
      } finally {
        setTopUpLoading(false);
      }
    },
    []
  );

  const filterTransactions = useCallback(
    async (type: Transaction['type'] | 'all') => {
      const transactions = await walletApi.getTransactions(type);
      setState((s) => ({ ...s, transactions }));
    },
    []
  );

  const downloadStatement = useCallback(async () => {
    const blob = await walletApi.downloadStatement();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishipath-statement-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    ...state,
    topUpLoading,
    refetch: load,
    topUp,
    filterTransactions,
    downloadStatement,
  };
}
