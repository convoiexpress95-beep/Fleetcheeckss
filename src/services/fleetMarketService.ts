import { FleetMarketMission } from '@/components/FleetMarketMissionCard';
import { supabase } from '@/integrations/supabase/client';

// Fallback mémoire si supabase échoue
let memory: FleetMarketMission[] = [
  { id: 'm-demo-1', titre: 'Mission démo', description: 'Trajet Paris → Lyon', ville_depart: 'Paris', ville_arrivee: 'Lyon', date_depart: new Date().toISOString(), prix_propose: 250, statut: 'ouverte', vehicule_requis: 'berline' } as any
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

const mapRow = (r: any): FleetMarketMission => ({
  id: r.id,
  titre: r.titre,
  description: r.description || '',
  ville_depart: r.ville_depart,
  ville_arrivee: r.ville_arrivee,
  date_depart: r.date_depart,
  prix_propose: r.prix_propose ?? undefined,
  statut: r.statut,
  vehicule_requis: r.vehicule_requis || undefined
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

export async function publishMission(partial: Omit<FleetMarketMission,'id'|'statut'>): Promise<FleetMarketMission> {
  const user = (await supabase.auth.getUser()).data.user;
  const row: FleetRowInsert = {
    created_by: user?.id || '00000000-0000-0000-0000-000000000000',
    titre: (partial as any).titre,
    description: (partial as any).description ?? null,
    ville_depart: (partial as any).ville_depart || 'À définir',
    ville_arrivee: (partial as any).ville_arrivee || 'À définir',
    date_depart: (partial as any).date_depart || new Date().toISOString(),
    prix_propose: (partial as any).prix_propose ?? null,
    vehicule_requis: (partial as any).vehicule_requis ?? null,
    statut: 'ouverte'
  };
  try {
    const { data, error } = await supabase
      .from('fleetmarket_missions')
      .insert(row as any)
      .select('*')
      .single();
    if (error) throw error;
    const mission = mapRow(data);
    // Mettre aussi en cache mémoire
    memory.unshift(mission as any);
    return mission;
  } catch (e) {
    console.warn('[FleetMarket] fallback mémoire publishMission', e);
    const mission: FleetMarketMission = { id: 'm-'+Date.now(), statut: 'ouverte', ...(partial as any) };
    memory.unshift(mission);
    return mission;
  }
}
