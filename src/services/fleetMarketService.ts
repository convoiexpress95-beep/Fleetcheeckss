import { FleetMarketMission } from '@/components/FleetMarketMissionCard';
import { supabase } from '@/integrations/supabase/client';

// Mémoire locale (utilisée uniquement en lecture si la base est inaccessible)
let memory: FleetMarketMission[] = [
  {
    id: '1',
    titre: 'Transport véhicule Paris-Lyon',
    description: 'Convoyage d\'une berline de Paris vers Lyon, véhicule récent en parfait état.',
    ville_depart: 'Paris',
    ville_arrivee: 'Lyon',
    date_depart: new Date(Date.now() + 86400000 * 2).toISOString(),
    prix_propose: 850,
    statut: 'ouverte',
    vehicule_requis: 'Remorque',
    convoyeur_id: null
  },
  {
    id: '2',
    titre: 'Convoyage Marseille-Bordeaux',
    description: 'Transport d\'un SUV compact, départ flexible selon convoyeur.',
    ville_depart: 'Marseille',
    ville_arrivee: 'Bordeaux',
    date_depart: new Date(Date.now() + 86400000 * 5).toISOString(),
    prix_propose: 650,
    statut: 'en_negociation',
    vehicule_requis: 'Plateau',
    convoyeur_id: null
  },
  {
    id: '3',
    titre: 'Moto sportive Nice-Monaco',
    description: 'Convoyage d\'une moto sportive haut de gamme, manipulation délicate requise.',
    ville_depart: 'Nice',
    ville_arrivee: 'Monaco',
    date_depart: new Date(Date.now() + 86400000).toISOString(),
    prix_propose: 180,
    statut: 'ouverte',
    vehicule_requis: 'Moto',
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

// Résolution dynamique de la table pour compatibilité avec drive-connect-suite-main
// Priorité: 'fleetmarket_missions', fallback: 'marketplace_missions'
let resolvedTable: 'fleetmarket_missions' | 'marketplace_missions' | null = null;

async function resolveTableName(): Promise<'fleetmarket_missions' | 'marketplace_missions'> {
  if (resolvedTable) return resolvedTable;
  // Essai rapide sur fleetmarket_missions (HEAD select)
  try {
    const { error } = await supabase
      .from('fleetmarket_missions')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (!error) {
      resolvedTable = 'fleetmarket_missions';
      return resolvedTable;
    }
  } catch (_) { /* ignore */ }
  // Fallback: marketplace_missions
  try {
    const { error } = await supabase
      .from('marketplace_missions')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (!error) {
      resolvedTable = 'marketplace_missions';
      return resolvedTable;
    }
  } catch (_) { /* ignore */ }
  // Par défaut, rester sur fleetmarket_missions même si non existante (le fallback mémoire prendra le relais)
  resolvedTable = 'fleetmarket_missions';
  return resolvedTable;
}

export async function listMissions(): Promise<FleetMarketMission[]> {
  try {
    const table = await resolveTableName();
    const { data, error } = await supabase
      .from(table)
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
  const table = await resolveTableName();
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select('*')
    .single();
  if (error) {
    // Le trigger lève une erreur 'INSUFFICIENT_CREDITS' si solde < 1
    if ((error as any).message?.includes('INSUFFICIENT_CREDITS')) {
      throw new Error('Crédits insuffisants pour publier (1 crédit requis)');
    }
    throw error;
  }
  const mission = mapRow(data);
  memory.unshift(mission);
  return mission;
}

export async function updateMissionStatus(id: string, statut: 'ouverte'|'en_negociation'|'attribuee'|'terminee'|'annulee') {
  try {
    const table = await resolveTableName();
    const { data, error } = await supabase
      .from(table)
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
    const table = await resolveTableName();
    const { data, error } = await supabase
      .from(table)
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
