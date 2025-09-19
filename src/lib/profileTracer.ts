/*
  Outil d'instrumentation des requêtes vers la table profiles.
  Activation : définir VITE_DEBUG_PROFILES=1 dans l'environnement.
*/
import type { PostgrestResponse, PostgrestSingleResponse, PostgrestMaybeSingleResponse } from '@supabase/supabase-js';

const ENABLED = import.meta.env.VITE_DEBUG_PROFILES === '1';

function shortStack(): string[] {
  const raw = new Error().stack?.split('\n').slice(2, 8) || [];
  return raw.map(l => l.trim());
}

interface InstrumentMeta {
  id: string;
  label: string;
  durationMs: number;
  status?: number;
  error?: unknown;
}

function log(kind: 'OK' | '409' | 'ERR' | 'EX', meta: InstrumentMeta) {
  if (!ENABLED) return;
  const base = { kind, id: meta.id, label: meta.label, dur: meta.durationMs.toFixed(1), status: meta.status };
  switch (kind) {
    case 'OK':
      console.debug('[ProfilesOK]', base);
      break;
    case '409':
      console.warn('[Profiles409]', { ...base, error: meta.error, stack: shortStack() });
      break;
    case 'ERR':
      console.debug('[ProfilesQueryError]', { ...base, error: meta.error });
      break;
    case 'EX':
      console.error('[ProfilesException]', { ...base, error: meta.error, stack: shortStack() });
      break;
  }
}

export async function instrumentProfilesQuery<T>(label: string, fn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T> | PostgrestMaybeSingleResponse<T>>): Promise<any> {
  if (!ENABLED) return fn();
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const start = performance.now();
  try {
    const res: any = await fn();
    const durationMs = performance.now() - start;
    if (res?.status === 409 || res?.error?.code === '409') {
      log('409', { id, label, durationMs, status: res.status, error: res.error });
    } else if (res?.error) {
      log('ERR', { id, label, durationMs, status: res.status, error: res.error });
    } else {
      log('OK', { id, label, durationMs, status: res?.status });
    }
    return res;
  } catch (error) {
    const durationMs = performance.now() - start;
    log('EX', { id, label, durationMs, error });
    throw error;
  }
}

// Helper spécifiques
export function wrapProfilesSelect(label: string, builder: () => Promise<any>) {
  return instrumentProfilesQuery(label, builder);
}

export function profilesTraceEnabled() { return ENABLED; }
