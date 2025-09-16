import { supabase } from '@/integrations/supabase/client';
import type { TrajetPartageRow } from '@/types/db-partials';

export interface PublishTrajetInput {
  convoyeur_id: string;
  ville_depart: string;
  ville_arrivee: string;
  date_heure: string; // ISO ou local convertible
  nb_places: number;
  prix_par_place?: number | null;
  description?: string;
}

// Certaines incohérences de schéma historique (conducteur_id vs convoyeur_id, prix_par_place vs price, ville_depart/ville_arrivee vs departure/destination)
// On normalise ici en ne renvoyant que la forme TrajetPartageRow attendue par le reste du code.
export async function listTrajets(limit = 100): Promise<TrajetPartageRow[]> {
  const { data, error } = await supabase
    .from('trajets_partages')
    .select('*')
    .order('date_heure', { ascending: true })
    .limit(limit);
  if (error) throw error;
  if (!data) return [];
  return data.map((row: any): TrajetPartageRow => ({
    id: row.id,
    convoyeur_id: row.convoyeur_id ?? row.conducteur_id, // fallback si ancien champ
    ville_depart: row.ville_depart ?? row.departure ?? '',
    ville_arrivee: row.ville_arrivee ?? row.destination ?? '',
    date_heure: row.date_heure,
    nb_places: row.nb_places ?? row.seats_total ?? 0,
    prix_par_place: row.prix_par_place ?? row.price ?? null,
    description: row.description ?? null,
    participants: row.participants ?? [],
    statut: row.statut ?? row.status ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
    start_lat: row.start_lat ?? null,
    start_lng: row.start_lng ?? null,
    end_lat: row.end_lat ?? null,
    end_lng: row.end_lng ?? null,
  }));
}

export async function publishTrajet(input: PublishTrajetInput): Promise<TrajetPartageRow> {
  // On suppose que la table réelle utilise les colonnes 'conducteur_id', 'departure', 'destination', 'price'.
  // On insère en doublant les informations (ville_depart/ville_arrivee) pour compat ascendante si colonnes existent.
  const payload: any = {
    conducteur_id: input.convoyeur_id,
    convoyeur_id: input.convoyeur_id, // si colonne existe
    departure: input.ville_depart.trim(),
    destination: input.ville_arrivee.trim(),
    ville_depart: input.ville_depart.trim(),
    ville_arrivee: input.ville_arrivee.trim(),
    date_heure: new Date(input.date_heure).toISOString(),
    nb_places: input.nb_places,
    seats_total: input.nb_places,
    prix_par_place: input.prix_par_place ?? null,
    price: input.prix_par_place ?? null,
    description: input.description || null,
    participants: [] as string[],
    statut: 'ouvert',
    status: 'ouvert',
  };
  const { data, error } = await supabase
    .from('trajets_partages')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  // normalisation identique à listTrajets
  const row: any = data;
  return {
    id: row.id,
    convoyeur_id: row.convoyeur_id ?? row.conducteur_id,
    ville_depart: row.ville_depart ?? row.departure ?? '',
    ville_arrivee: row.ville_arrivee ?? row.destination ?? '',
    date_heure: row.date_heure,
    nb_places: row.nb_places ?? row.seats_total ?? 0,
    prix_par_place: row.prix_par_place ?? row.price ?? null,
    description: row.description ?? null,
    participants: row.participants ?? [],
    statut: row.statut ?? row.status ?? 'ouvert',
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
    start_lat: row.start_lat ?? null,
    start_lng: row.start_lng ?? null,
    end_lat: row.end_lat ?? null,
    end_lng: row.end_lng ?? null,
  };
}

// Ancienne fonction joinTrajet (désormais remplacée par demande + acceptation). Gardée pour compat descendante éventuelle.
export async function joinTrajet(_trajet: TrajetPartageRow, _userId: string): Promise<void> {
  throw new Error('UTILISER_REQUEST_FLOW');
}

export function remainingSeats(trajet: TrajetPartageRow): number {
  const used = (trajet.participants || []).length;
  return Math.max(0, trajet.nb_places - used);
}

export function isFull(trajet: TrajetPartageRow): boolean {
  return remainingSeats(trajet) === 0;
}
