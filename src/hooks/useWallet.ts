import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Wallet = { balance: number } | null;

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<Wallet>(null);
  const [isConvoyeurConfirme, setIsConvoyeurConfirme] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb: any = supabase as any;
      const { data: wallet, error } = await sb
        .from('credits_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      let w = wallet as { balance: number } | null;
      if (!w) {
        try { await sb.rpc('ensure_wallet', { p_user: user.id }); } catch { /* ignore */ }
        const { data: ensured } = await sb
          .from('credits_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        w = ensured as unknown as { balance: number } | null;
      }
      setBalance(w || { balance: 0 });

      const [rolesRes, profileRes] = await Promise.all([
        sb.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'convoyeur_confirme').maybeSingle(),
        sb.from('profiles').select('is_convoyeur_confirme').eq('user_id', user.id).maybeSingle(),
      ]);

      const hasRole = !!rolesRes?.data;
      const profileData = (profileRes?.data as { is_convoyeur_confirme?: boolean } | null);
      const hasFlag = !!profileData?.is_convoyeur_confirme;
      setIsConvoyeurConfirme(hasRole || hasFlag);
    } catch (e) {
      console.error('Erreur chargement wallet:', e);
      setBalance({ balance: 0 });
      setIsConvoyeurConfirme(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { if (user?.id) refresh(); }, [user?.id, refresh]);

  const hasMinCredits = useMemo(() => (min: number) => (balance?.balance ?? 0) >= min, [balance]);

  return { balance: balance?.balance ?? 0, loading, refresh, hasMinCredits, isConvoyeurConfirme };
}
