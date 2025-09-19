import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';

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
  const profileEnsuredCache = useRef(new Set<string>()); // Cache des user_id pour lesquels le profil a été assuré

  // Assure la présence du profil (upsert idempotent pour éviter les 409)
  const ensureProfile = async (u: User | null | undefined) => {
    if (!u || ensuringProfileRef.current || profileEnsuredCache.current.has(u.id)) return;
    ensuringProfileRef.current = true;
    try {
      const full_name = (u.user_metadata?.full_name as string) || (u.email?.split('@')[0] ?? '');
      const email = u.email ?? '';
      
      // Utilisation du service ProfileService pour éviter les conflits
      const success = await ProfileService.safeUpsertProfile({
        user_id: u.id,
        email,
        full_name
      });

      if (success) {
        profileEnsuredCache.current.add(u.id);
        
        // Vérification différée pour s'assurer que le profil est bien visible
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id')
              .eq('user_id', u.id)
              .single();
            
            if (!profile) {
              console.warn('Profile created but not immediately visible for user:', u.id);
              // Relancer la création si nécessaire
              profileEnsuredCache.current.delete(u.id);
            }
          } catch (error) {
            console.warn('Profile verification error:', error);
          }
        }, 500); // Délai de 500ms pour permettre la propagation
      } else {
        console.warn('ProfileService.safeUpsertProfile failed for user:', u.id);
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
        
        // Nettoyer le cache si l'utilisateur change ou se déconnecte
        if (event === 'SIGNED_OUT' || (session?.user?.id && session.user.id !== user?.id)) {
          profileEnsuredCache.current.clear();
        }
        
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
      // Nettoyer le cache des profils lors de la déconnexion
      profileEnsuredCache.current.clear();
      ProfileService.clearCache(); // Nettoyer aussi le cache du service
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