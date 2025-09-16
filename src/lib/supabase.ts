import { createClient } from '@supabase/supabase-js';

// Configuration Supabase via variables d'environnement Vite
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // On log seulement un avertissement pour le dev; cela n'empêche pas le typecheck
  console.warn('[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. Auth désactivée côté web.');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://example.supabase.co',
  SUPABASE_ANON_KEY || 'public-anon-key',
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);
