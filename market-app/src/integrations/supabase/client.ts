// Supabase client (config via variables d'environnement)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Permet d'utiliser le proxy "/supabase" servi par l'app hôte en développement (dev unique)
// En production (build statique), on cible directement l'URL Supabase publique.
const USE_PROXY = String(import.meta.env.VITE_SUPABASE_USE_PROXY || '').trim() === '1';
const RAW_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const URL = USE_PROXY ? '/supabase' : RAW_URL;
const KEY = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

if (!URL || !KEY) {
  console.warn('[Market] Supabase env manquants: VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_USE_PROXY)');
}

export const supabase = createClient<Database>(URL, KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});