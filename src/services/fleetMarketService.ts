import { FleetMarketMission } from '@/components/FleetMarketMissionCard';

// Service mock : pas de connexion Supabase directe.
// On conserve possibilité future d'intégration API réelle.

let mock: FleetMarketMission[] = [
  {
    id: 'demo-1',
    titre: 'Transport Citadine Paris → Lyon',
    ville_depart: 'Paris',
    ville_arrivee: 'Lyon',
    date_depart: new Date().toISOString(),
    prix_propose: 180,
    vehicule_requis: 'Citadine',
    description: 'Course standard sans urgence',
    statut: 'ouverte'
  }
];

export async function listMissions(): Promise<FleetMarketMission[]> {
  // Simule délai réseau
  await new Promise(r=>setTimeout(r,150));
  return [...mock];
}

export async function publishMission(partial: Omit<FleetMarketMission,'id'|'statut'>): Promise<FleetMarketMission>{
  await new Promise(r=>setTimeout(r,200));
  const m: FleetMarketMission = { id: 'm-'+Date.now(), statut:'ouverte', ...partial } as FleetMarketMission;
  mock.unshift(m);
  return m;
}
