// Unified Supabase client (cleaned duplicated block)
import { createClient } from '@supabase/supabase-js';
// Use extended Database that augments generated types with quotes until upstream gen includes them
// Use extended Database that augments generated types with Convoiturage tables
import type { Database } from './types.extended';

// Allow overriding via environment variables for safer configuration in web builds
const env = (import.meta as any).env ?? {};

// Debug: afficher les variables d'environnement détectées
console.log('DEBUG: env variables:', {
  VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_USE_PROXY: env.VITE_SUPABASE_USE_PROXY,
  DEV: env.DEV
});

// Forcer l'utilisation de l'URL distante (pas de proxy pour le moment)
const useProxy = false; // Temporairement désactivé pour debug
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://lucpsjwaglmiejpfxofe.supabase.co';
// Accept both common names for the anon key (avec fallback direct)
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y3BzandhZ2xtaWVqcGZ4b2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTA5NzYsImV4cCI6MjA2OTQ2Njk3Nn0.e3sJec_03qxC9C4aHpv-fLQ36wz7c_76xePBv76Ydkc';

console.log('DEBUG: Supabase config:', { SUPABASE_URL, SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'present' : 'missing' });

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 50, // Augmenter le débit pour les apps realtime
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000), // Backoff exponential plafonné à 10s
    timeout: 20000,
  },
  global: {
    headers: {
      'x-client-info': 'fleetcheck-web@1.0.0',
    },
  },
});