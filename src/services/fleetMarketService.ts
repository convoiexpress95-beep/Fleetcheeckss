import { FleetMarketMission } from '@/components/FleetMarketMissionCard';
import { supabase } from '@/integrations/supabase/client';

// Fallback mémoire si supabase échoue
let memory: FleetMarketMission[] = [
  {
    id: 'm-demo-1',
    titre: 'Mission démo',
    description: 'Trajet Paris → Lyon',
    ville_depart: 'Paris',
    ville_arrivee: 'Lyon',
    date_depart: new Date().toISOString(),
    prix_propose: 250,
    statut: 'ouverte',
    vehicule_requis: 'berline',
    convoyeur_id: null
  }
];

type FleetRowInsert = {
  id?: string;
  created_by: string;
  titre: string;
  description?: string | null;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  prix_propose?: number | null;
  statut?: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
  vehicule_requis?: string | null;
  contact_visible?: boolean;
  created_at?: string;
  updated_at?: string;
};

interface FleetRowSelect {
  id: string;
  titre: string;
  description: string | null;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  prix_propose: number | null;
  statut: FleetMarketMission['statut'];
  vehicule_requis: string | null;
  convoyeur_id: string | null;
}

const mapRow = (r: FleetRowSelect): FleetMarketMission => ({
  id: r.id,
  titre: r.titre,
  description: r.description ?? '',
  ville_depart: r.ville_depart,
  ville_arrivee: r.ville_arrivee,
  date_depart: r.date_depart,
  prix_propose: r.prix_propose ?? undefined,
  statut: r.statut,
  vehicule_requis: r.vehicule_requis ?? undefined,
  convoyeur_id: r.convoyeur_id
});

export async function listMissions(): Promise<FleetMarketMission[]> {
  try {
    const { data, error } = await supabase
      .from('fleetmarket_missions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data || []).map(mapRow);
  } catch (e) {
    console.warn('[FleetMarket] fallback mémoire listMissions', e);
    return memory;
  }
}

export async function publishMission(partial: Omit<FleetMarketMission,'id'|'statut'|'convoyeur_id'>): Promise<FleetMarketMission> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id ?? '00000000-0000-0000-0000-000000000000';
  const row: FleetRowInsert = {
    created_by: userId,
    titre: partial.titre,
    description: partial.description ?? null,
    ville_depart: partial.ville_depart || 'À définir',
    ville_arrivee: partial.ville_arrivee || 'À définir',
    date_depart: partial.date_depart || new Date().toISOString(),
    prix_propose: partial.prix_propose ?? null,
    vehicule_requis: partial.vehicule_requis ?? null,
    statut: 'ouverte'
  };
  try {
    const { data, error } = await supabase
      .from('fleetmarket_missions')
      .insert(row)
      .select('*')
      .single();
    if (error) throw error;
    const mission = mapRow(data);
    // Mettre aussi en cache mémoire
    memory.unshift(mission);
    return mission;
  } catch (e) {
    console.warn('[FleetMarket] fallback mémoire publishMission', e);
    const mission: FleetMarketMission = { id: 'm-'+Date.now(), statut: 'ouverte', convoyeur_id: null, ...partial };
    memory.unshift(mission);
    return mission;
  }
}

export async function updateMissionStatus(id: string, statut: 'ouverte'|'en_negociation'|'attribuee'|'terminee'|'annulee') {
  try {
    const { data, error } = await supabase
      .from('fleetmarket_missions')
      .update({ statut })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    // sync mémoire
  memory = memory.map(m => m.id === id ? { ...m, statut } : m);
    return mapRow(data);
  } catch (e) {
    console.warn('[FleetMarket] fallback mémoire updateMissionStatus', e);
  memory = memory.map(m => m.id === id ? { ...m, statut } : m);
    return memory.find(m => m.id === id)!;
  }
}

export async function assignMission(id: string, convoyeurUserId: string) {
  try {
    const { data, error } = await supabase
      .from('fleetmarket_missions')
      .update({ statut: 'attribuee', convoyeur_id: convoyeurUserId })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
  memory = memory.map(m => m.id === id ? { ...m, statut: 'attribuee', convoyeur_id: convoyeurUserId } : m);
    return mapRow(data);
  } catch (e) {
    console.warn('[FleetMarket] fallback mémoire assignMission', e);
  memory = memory.map(m => m.id === id ? { ...m, statut: 'attribuee', convoyeur_id: convoyeurUserId } : m);
    return memory.find(m => m.id === id)!;
  }
}
