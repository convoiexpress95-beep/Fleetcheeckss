import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useWalletBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    let cancelled = false;
    (async()=>{
      if(!user){ setBalance(null); return; }
      setLoading(true);
      try{
        const { data } = await supabase.from('credits_wallets').select('balance').eq('user_id', user.id).maybeSingle();
        if(!cancelled) setBalance(data?.balance ?? 0);
      } finally { if(!cancelled) setLoading(false); }
    })();
    return ()=>{ cancelled = true; };
  }, [user]);

  return { balance, loading };
}
