/*
  Instrumentation générique des requêtes PostgREST / Supabase.
  Activation : définir VITE_DEBUG_DB=1
  Objectifs :
    - Mesurer durée
    - Loguer status + erreurs
    - Fournir un identifiant court corrélable
    - Limiter le bruit si désactivé
  Usage typique :
    const { data, error } = await instrumentDbQuery('missions-select', () =>
      supabase.from('marketplace_missions').select('*')
    );
*/
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
  PostgrestMaybeSingleResponse
} from '@supabase/supabase-js';

const ENABLED = import.meta.env.VITE_DEBUG_DB === '1';

interface InstrumentMeta {
  id: string;
  label: string;
  durationMs: number;
  status?: number;
  error?: unknown;
}

function stackSlice(): string[] {
  if (!ENABLED) return [];
  const raw = new Error().stack?.split('\n').slice(2, 7) || [];
  return raw.map(l => l.trim());
}

function log(kind: 'OK' | 'ERR' | 'EX', meta: InstrumentMeta) {
  if (!ENABLED) return;
  const base = { kind, id: meta.id, label: meta.label, dur: meta.durationMs.toFixed(1), status: meta.status };
  switch (kind) {
    case 'OK':
      console.debug('[DB]', base);
      break;
    case 'ERR':
      console.warn('[DB-QueryError]', { ...base, error: meta.error });
      break;
    case 'EX':
      console.error('[DB-Exception]', { ...base, error: meta.error, stack: stackSlice() });
      break;
  }
}

// Signature assouplie pour accepter les builders Supabase (thenables PostgrestFilterBuilder)
export async function instrumentDbQuery<T>(label: string, fn: () => Promise<any> | any): Promise<any> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const start = performance.now();
  try {
    const res: any = await fn(); // Toujours await le builder
    const durationMs = performance.now() - start;
    if (ENABLED) {
      if (res?.error) {
        log('ERR', { id, label, durationMs, status: res.status, error: res.error });
      } else {
        log('OK', { id, label, durationMs, status: res?.status });
      }
    }
    return res;
  } catch (error) {
    const durationMs = performance.now() - start;
    if (ENABLED) {
      log('EX', { id, label, durationMs, error });
    }
    throw error;
  }
}

export function dbTraceEnabled() { return ENABLED; }
