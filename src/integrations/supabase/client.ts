// Unified Supabase client (cleaned duplicated block)
import { createClient } from '@supabase/supabase-js';
// Use extended Database that augments generated types with quotes until upstream gen includes them
// Use extended Database that augments generated types with Convoiturage tables
import type { Database } from './types.extended';

// Allow overriding via environment variables for safer configuration in web builds
const env = (import.meta as any).env ?? {};
// Important: Never use proxy in production to avoid 405 on static hosts
const useProxy = !!env.DEV && (env.VITE_SUPABASE_USE_PROXY === '1' || !env.VITE_SUPABASE_URL);
const SUPABASE_URL = useProxy
  ? (typeof window !== 'undefined' ? `${window.location.origin}/supabase` : 'http://localhost:8080/supabase')
  : (env.VITE_SUPABASE_URL || '');
// Accept both common names for the anon key (no hardcoded default)
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!useProxy && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  if (env.DEV) {
    console.warn('[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. Auth désactivée côté web.');
  }
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});