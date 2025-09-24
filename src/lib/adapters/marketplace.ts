import { supabase } from '@/integrations/supabase/client';

export type MarketplaceMission = {
  id: string;
  created_by: string;
  titre: string;
  description: string | null;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string; // ISO
  prix_propose: number | null;
  statut: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
  vehicule_requis: string | null;
  contact_visible: boolean | null;
  convoyeur_id: string | null;
  created_at: string;
  updated_at: string;
};

export type NewDevisInput = {
  mission_id: string;
  convoyeur_id: string;
  prix_propose: number;
  message?: string;
};

// Essaie d'abord marketplace_missions, sinon fleetmarket_missions
export async function fetchMarketplaceMissions() {
  // Les missions ouvertes, triées par date
  const tryTables = ['marketplace_missions', 'fleetmarket_missions'] as const;
  let lastError: any = null;
  for (const table of tryTables) {
    const builder: any = (supabase as any).from(table as any);
    const { data, error } = await builder
      .select('*')
      .in('statut', ['ouverte', 'en_negociation'])
      .order('date_depart', { ascending: true });
    if (!error && data) {
      return { table, missions: (data as any[]).map(r => r as MarketplaceMission) };
    }
    lastError = error;
  }
  return { table: null as unknown as 'marketplace_missions' | 'fleetmarket_missions' | null, missions: [] as MarketplaceMission[], error: lastError };
}

export async function insertDevis(input: NewDevisInput) {
  // Table: marketplace_devis
  const payload = {
    mission_id: input.mission_id,
    convoyeur_id: input.convoyeur_id,
    prix_propose: input.prix_propose,
    message: input.message ?? null,
    statut: 'envoye' as const,
  };
  const { data, error } = await supabase.from('marketplace_devis').insert(payload).select('*').single();
  return { data, error };
}
