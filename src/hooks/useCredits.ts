import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionRow } from '@/types/db-partials';
import { useAuth } from '@/contexts/AuthContext';
type CreditsWalletRow = { balance: number };
type CreditsLedgerRow = { delta: number };

interface CreditsState {
  loading: boolean;
  error: string | null;
  balance: {
    plan_type: string;
    credits_remaining: number;
    credits_total: number;
    wallet_balance: number;
    ledger_delta: number;
  } | null;
  refresh(): void;
}

export function useCredits(): CreditsState {
  const { user } = useAuth();
  const [state, setState] = React.useState<Omit<CreditsState, 'refresh'>>({ loading: !!user, error: null, balance: null });

  const load = React.useCallback(async () => {
    if (!user) {
      setState({ loading: false, error: null, balance: null });
      return;
    }
    setState(s => ({ ...s, loading: true }));
    try {
      const [subs, wallet, ledger] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('credits_wallets').select('*').eq('user_id', user.id).maybeSingle(),
  supabase.from('credits_ledger').select('delta').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      ] as const);
      if (subs.error) throw subs.error;
      if (wallet.error) throw wallet.error;
      if (ledger.error) throw ledger.error;
  const sub = subs.data as SubscriptionRow | null;
  const w = wallet.data as CreditsWalletRow | null;
  const ledgerRows = (ledger.data as CreditsLedgerRow[] | null) || [];
  const ledger_delta = ledgerRows.reduce((acc, r) => acc + (r.delta || 0), 0);
      setState({
        loading: false,
        error: null,
        balance: sub ? {
          plan_type: sub.plan_type,
          credits_remaining: sub.credits_remaining,
          credits_total: sub.credits_total,
          wallet_balance: w?.balance ?? sub.credits_remaining,
          ledger_delta,
        } : null,
      });
    } catch (e: any) {
      setState({ loading: false, error: e.message || 'Erreur crédits', balance: null });
    }
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}