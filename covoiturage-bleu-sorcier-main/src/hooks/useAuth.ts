import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuth(){
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if(!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) setError(error.message);
    return !error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, meta?: Record<string, unknown>) => {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: meta || {} } });
    if(error) setError(error.message);
    return !error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, loading, error, signIn, signUp, signOut };
}
