import { createClient } from '@supabase/supabase-js';

// Fallbacks pour dev/local si les variables d'env ne sont pas définies
const FALLBACK_URL = 'https://lucpsjwaglmiejpfxofe.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y3BzandhZ2xtaWVqcGZ4b2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTA5NzYsImV4cCI6MjA2OTQ2Njk3Nn0.e3sJec_03qxC9C4aHpv-fLQ36wz7c_76xePBv76Ydkc';

type ImportMetaEnv = { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string };
type ImportMetaTyped = { env?: ImportMetaEnv };
const im = (import.meta as unknown as ImportMetaTyped);
const url = im?.env?.VITE_SUPABASE_URL || FALLBACK_URL;
const anon = im?.env?.VITE_SUPABASE_ANON_KEY || im?.env?.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_ANON;

if (!im?.env?.VITE_SUPABASE_URL || !im?.env?.VITE_SUPABASE_ANON_KEY) {
  console.warn('[Convoiturage] Variables Supabase manquantes, utilisation des valeurs par défaut.');
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
});
