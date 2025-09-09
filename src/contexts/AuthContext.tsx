import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

// Export explicite du contexte pour permettre d'éventuels ré-exportations ou tests
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const ensuringProfileRef = useRef(false);

  // Crée le profil si manquant pour éviter les 406 sur .single()
  const ensureProfile = async (u: User | null | undefined) => {
    if (!u || ensuringProfileRef.current) return;
    ensuringProfileRef.current = true;
    try {
      const { data: existing, error: selErr } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', u.id)
        .maybeSingle();

      if (selErr) {
        console.warn('ensureProfile select warning:', selErr.message);
      }

      if (!existing) {
        const full_name = (u.user_metadata?.full_name as string) || (u.email?.split('@')[0] ?? '');
        const email = u.email ?? '';
        const { error: insErr } = await supabase
          .from('profiles')
          .insert({ user_id: u.id, full_name, email });
        if (insErr) {
          console.warn('ensureProfile insert warning:', insErr.message);
        }
      }
    } catch (e: any) {
      console.warn('ensureProfile error:', e?.message || e);
    } finally {
      ensuringProfileRef.current = false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          // Assurer la présence du profil après connexion/refresh
          ensureProfile(session.user);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        ensureProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

  if (import.meta.env.DEV) console.debug('[AuthContext.signIn] result', { email, hasError: !!error, error });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });

      return {};
    } catch (error: unknown) {
      console.error('SignIn error:', error);
      return { error } as { error?: unknown };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

  if (import.meta.env.DEV) console.debug('[AuthContext.signUp] result', { email, hasError: !!error, error });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });

      return {};
    } catch (error: unknown) {
      console.error('SignUp error:', error);
      return { error } as { error?: unknown };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error: unknown) {
      console.error('SignOut error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};