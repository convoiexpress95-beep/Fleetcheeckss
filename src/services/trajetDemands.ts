import { supabase } from '@/integrations/supabase/client';

// Table attendue (à créer côté Supabase si non existante): trajet_join_requests
// Colonnes suggérées:
// id (uuid), trajet_id (uuid FK), passenger_id (uuid FK), convoyeur_id (uuid FK), status ('pending'|'accepted'|'refused'|'expired'),
// created_at, decided_at, refund_done (boolean), meta jsonb

export interface TrajetJoinRequestRow {
  id: string;
  trajet_id: string;
  passenger_id: string;
  convoyeur_id: string;
  status: 'pending'|'accepted'|'refused'|'expired';
  created_at: string;
  decided_at: string | null;
  refund_done: boolean | null;
  meta?: any;
}

const PASSENGER_COST = 2;
const DRIVER_COST_PER_PASSENGER = 2; // conservé pour acceptJoinRequest fallback

// Helper générique pour contourner la liste restreinte de fonctions RPC typées dans les types générés.
// On force <any, any> et on re-map les erreurs ensuite.
async function rpcUnsafe(fn: string, params?: Record<string, any>) {
  // @ts-ignore forcer acceptation de la fonction hors union
  const { data, error } = await supabase.rpc<any, any>(fn as any, params as any);
  if (error) throw new Error(mapRpcError(error.message));
  return data;
}

// Crée une demande et débite seulement le passager (réservation). Le conducteur paiera à l'acceptation.
export async function requestJoinTrajet(trajetId: string) {
  return rpcUnsafe('request_join', { p_trajet: trajetId });
}

// Acceptation: débite conducteur, ajoute passager à participants, marque demande accepted
export async function acceptJoinRequest(req: TrajetJoinRequestRow) {
  if (req.status !== 'pending') return;
  return rpcUnsafe('accept_join', { p_request: req.id });
}

// Refus: rembourser passager si pas déjà remboursé.
export async function refuseJoinRequest(req: TrajetJoinRequestRow) {
  if (req.status !== 'pending') return;
  return rpcUnsafe('refuse_join', { p_request: req.id });
}

// Expiration automatique (ex: job côté serveur) — ici seulement la fonction utilitaire.
export async function expireStaleRequests(maxMinutes = 60) {
  return rpcUnsafe('expire_requests', { p_max_minutes: maxMinutes });
}

export async function expireRequestsAtDeparture() {
  return rpcUnsafe('expire_requests_at_departure');
}

function mapRpcError(msg: string): string {
  if (!msg) return 'ERREUR_INCONNUE';
  const m = msg.toUpperCase();
  if (m.includes('INSUFFICIENT_FUNDS')) return 'CREDITS_INSUFFISANTS';
  if (m.includes('CREDITS_CONDUCTEUR')) return 'CREDITS_CONDUCTEUR_INSUFFISANTS';
  if (m.includes('TRAJET_FULL')) return 'TRAJET_COMPLET';
  if (m.includes('ALREADY_REQUESTED')) return 'DEMANDE_EXISTE_DEJA';
  if (m.includes('TRAJET_CLOSED')) return 'TRAJET_CLOS';
  if (m.includes('NOT_OWNER')) return 'NON_PROPRIETAIRE';
  return msg;
}

export async function listPassengerRequests(passengerId: string) {
  const { data, error } = await (supabase
    // @ts-ignore table non présente dans types générés
    .from<any>('trajet_join_requests')
    .select('*') as any).eq('passenger_id', passengerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeRequest);
}

export async function listDriverRequests(convoyeurId: string, statusFilter?: string) {
  let query: any = (supabase
    // @ts-ignore table hors génération types
    .from<any>('trajet_join_requests')
    .select('*') as any).eq('convoyeur_id', convoyeurId)
    .order('created_at', { ascending: false });
  if (statusFilter) query = query.eq('status', statusFilter);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeRequest);
}

function normalizeRequest(row: any): TrajetJoinRequestRow {
  return {
    id: row.id,
    trajet_id: row.trajet_id,
    passenger_id: row.passenger_id,
    convoyeur_id: row.convoyeur_id,
    status: row.status,
    created_at: row.created_at,
    decided_at: row.decided_at ?? null,
    refund_done: row.refund_done ?? null,
    meta: row.meta,
  };
}
