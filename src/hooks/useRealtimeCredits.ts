import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getWalletBalance } from '@/services/credits';

// Hook léger: écoute les entrées du ledger et rafraîchit le solde ciblé pour l'utilisateur connecté.
// Combine un poll initial et un refresh on-change. Réduit le délai visuel après accept/refuse.
export function useRealtimeCredits() {
  const { user } = useAuth();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!user) { setBalance(null); return; }
    try {
      setLoading(true);
      const b = await getWalletBalance(user.id);
      setBalance(b);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Erreur crédits');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial
  React.useEffect(() => { refresh(); }, [refresh]);

  // Realtime ledger
  React.useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`credits_ledger_user_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credits_ledger',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // petite micro-file pour batcher si rafales
        queueMicrotask(() => refresh());
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refresh]);

  return { balance, loading, error, refresh };
}
