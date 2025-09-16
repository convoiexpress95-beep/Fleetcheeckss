import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue { session: Session | null; loading: boolean; }
const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session ?? null); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => { setSession(newSession); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
