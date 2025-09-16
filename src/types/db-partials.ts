// Types dérivés du schéma Supabase (extraits nécessaires à l'app actuelle)
// NOTE: Garder simples; on peut régénérer plus tard via codegen si besoin.

export interface TrajetPartageRow {
  id: string;
  convoyeur_id: string;
  ville_depart: string;
  ville_arrivee: string;
  date_heure: string; // ISO
  nb_places: number;
  prix_par_place: number | null;
  description?: string | null;
  participants: string[] | null;
  statut: 'ouvert' | 'complet' | 'termine' | 'annule' | null;
  created_at: string | null;
  updated_at?: string | null;
  start_lat?: number | null;
  start_lng?: number | null;
  end_lat?: number | null;
  end_lng?: number | null;
}

export interface CreditsWalletRow {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_type: string; // 'decouverte' | 'pro' | 'illimite' etc.
  credits_remaining: number;
  credits_total: number;
  status: string; // 'active'...
  updated_at: string;
}

export interface CreditsLedgerRow {
  id: string;
  user_id: string;
  amount: number; // positive (ajout) ou négatif (débit)
  reason: string;
  ref_type?: string | null;
  ref_id?: string | null;
  created_at: string;
}

export interface MissionRowMinimal {
  id: string;
  title: string;
  status: string; // status union large
  created_at: string;
}

export interface AnalyticsDataRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  missions_count: number;
  total_revenue: number;
  total_km: number;
}

export type Id = string;
