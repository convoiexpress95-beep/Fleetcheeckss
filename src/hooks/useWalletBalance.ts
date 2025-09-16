import * as React from 'react';
import { getWalletBalance } from '@/services/credits';
import { useAuth } from '@/contexts/AuthContext';

interface UseWalletBalanceOptions { intervalMs?: number }

/**
 * @deprecated Le polling de solde est remplacé par le realtime (credits ledger).
 * Gardé temporairement pour compat si importé ailleurs. Sera supprimé ultérieurement.
 */
export function useWalletBalance(opts: UseWalletBalanceOptions = {}) {
  const { user } = useAuth();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const intervalMs = opts.intervalMs ?? 15000;

  const refresh = React.useCallback(async () => {
    if (!user) { setBalance(null); return; }
    setLoading(true);
    try {
      const bal = await getWalletBalance(user.id);
      setBalance(bal);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Erreur balance');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { refresh(); }, [refresh]);
  React.useEffect(() => {
    if (!user) return;
    const id = setInterval(() => { refresh(); }, intervalMs);
    return () => clearInterval(id);
  }, [user, refresh, intervalMs]);

  return { balance, loading, error, refresh };
}