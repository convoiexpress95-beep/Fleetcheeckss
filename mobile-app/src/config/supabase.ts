import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Récupération des variables Supabase avec fallback
const getSupabaseConfig = () => {
  // 1) Variables d'env publiques (recommandé avec EAS): EXPO_PUBLIC_*
  //    Configurez-les via "eas secrets" ou env dans le CI.
  const env: any = (typeof process !== 'undefined' ? (process as any).env : {}) || {};
  let SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
  let SUPABASE_ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  // 2) Fallback: expo.extra dans app.json
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const extraConfig = Constants?.expoConfig?.extra ?? {} as any;
    SUPABASE_URL = SUPABASE_URL || extraConfig.SUPABASE_URL;
    SUPABASE_ANON_KEY = SUPABASE_ANON_KEY || extraConfig.SUPABASE_ANON_KEY;
  }

  // 3) Dernier recours: valeurs dev locales (à éviter en prod)
  if (!SUPABASE_URL) {
    SUPABASE_URL = "https://vdygbqinodzvkdwegvpq.supabase.co";
  }
  if (!SUPABASE_ANON_KEY) {
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWdicWlub2R6dmtkd2VndnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTc5MzgsImV4cCI6MjA3Mzk5MzkzOH0.TTe5vUCj9e08yQtS-UuAqrCPU4lmjIpur1uiPsMXvXo";
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY };
};

const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseConfig();

// Expose the project URL when needed by other modules (e.g., building function links)
export const SUPABASE_PROJECT_URL = SUPABASE_URL;

console.log('[Supabase] Configuration:', { 
  url: SUPABASE_URL ? 'OK' : 'MANQUANT',
  key: SUPABASE_ANON_KEY ? 'OK' : 'MANQUANT' 
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configuration Supabase manquante. Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});