import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import Toast from 'react-native-toast-message';
import { Linking } from 'react-native';
import Constants from 'expo-constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExchanging, setIsExchanging] = useState(false);
  const [handledUrls, setHandledUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Configuration du listener d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Vérification de la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth deep links: supabase appends access_token in fragment for mobile when using "token" flow.
  useEffect(() => {
    const handleUrl = async (event: { url: string } | string) => {
      try {
        // Supabase uses either fragment tokens or code for PKCE; try both helpers
        const url = typeof event === 'string' ? event : event.url;
        if (!url) return;
        // Filter for our scheme and path
        if (!(url.startsWith('fleetcheck://') && url.includes('/auth/callback'))) return;
        if (handledUrls.has(url)) return; // already processed
        setHandledUrls(prev => new Set(prev).add(url));
        if (isExchanging) return;
        setIsExchanging(true);
        // Use exchangeCodeForSession which supports PKCE/code and fragment tokens
        // @ts-ignore - typings may vary across versions
        const { data, error } = await (supabase.auth as any).exchangeCodeForSession(url);
        if (error) {
          console.warn('[OAuth] Session exchange error:', error?.message);
        }
        if (data?.session) {
          Toast.show({ type: 'success', text1: 'Connexion Google réussie' });
        }
      } catch (e: any) {
        console.warn('[OAuth] Deep link handling error', e?.message || e);
      } finally {
        setIsExchanging(false);
      }
    };

    const sub = Linking.addEventListener('url', handleUrl as any);
    // Also handle the initial URL if app opened from a link
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) handleUrl(initialUrl as any);
    });
    return () => sub.remove();
  }, [isExchanging]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue !',
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: "Erreur d'inscription",
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Compte créé',
        text2: 'Vérifiez votre email pour confirmer votre compte.',
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `fleetcheck://auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        Toast.show({ type: 'error', text1: 'Google', text2: error.message });
        return { error };
      }
      // On native, open the provider URL explicitly
      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        Toast.show({ type: 'error', text1: 'Google', text2: "URL d'authentification introuvable" });
        return { error: new Error('missing oauth url') } as any;
      }
      return {};
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Google', text2: e?.message || 'Erreur inconnue' });
      return { error: e };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de déconnexion',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        text2: 'À bientôt !',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};