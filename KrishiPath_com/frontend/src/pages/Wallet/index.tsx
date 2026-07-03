import { useWallet } from '../../hooks/useWallet';
import { Wallet } from '../../components/screens/Wallet';
import type { TopUpPayload } from '../../types';

export function WalletPage() {
  const { summary, transactions, loading, error, topUp, topUpLoading, filterTransactions, downloadStatement } = useWallet();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 text-center">
        <p className="text-error font-medium">{error || 'Failed to load wallet data'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <Wallet 
      summary={summary}
      transactions={transactions}
      onTopUp={topUp}
      onFilterTransactions={filterTransactions}
      onDownloadStatement={downloadStatement}
      topUpLoading={topUpLoading}
    />
  );
}
