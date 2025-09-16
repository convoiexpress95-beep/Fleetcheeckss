import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks';
import { PublishMissionDialog } from '@/pages/fleetmarket/PublishMissionDialog';
import { useFleetMarketMissions } from '@/hooks/useFleetMarketMissions';
import { RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import SearchBar from '@/market/components/SearchBar';
import MissionCard from '@/market/components/MissionCard';

export default function FleetMarketPage(){
  console.debug('[FleetMarket] mount, location should be /fleetmarket');
  const { toast } = useToast();
  const { missions, loading, refetch } = useFleetMarketMissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityQuery, setCityQuery] = useState('');

  const handleSendDevis = (mission: any) => {
    toast({
      title: "Devis envoyé",
      description: `Votre devis pour "${mission.titre}" a été envoyé avec succès.`,
    });
  };

  const filtered = useMemo(()=>
    missions.filter(m => (statusFilter==='all' || m.statut === statusFilter) &&
      (!cityQuery || m.ville_depart.toLowerCase().includes(cityQuery.toLowerCase()) || m.ville_arrivee.toLowerCase().includes(cityQuery.toLowerCase()))
    ), [missions, statusFilter, cityQuery]);

  return (
    <div className='pb-10'>
      {/* Hero & recherche */}
      <SearchBar />

      <div className='container mx-auto px-6 space-y-6'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-2xl font-semibold'>Missions disponibles</h1>
          <PublishMissionDialog onCreated={() => refetch()} />
          <Button size='sm' variant='outline' onClick={() => refetch()} disabled={loading}>
            <RefreshCw className='w-4 h-4 mr-1 animate-spin' style={{ animationPlayState: loading ? 'running':'paused'}} />
            Actualiser
          </Button>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className='h-9 border rounded px-2 text-sm bg-background'>
            <option value='all'>Tous statuts</option>
            <option value='ouverte'>Ouverte</option>
            <option value='en_negociation'>En négociation</option>
            <option value='attribuee'>Attribuée</option>
            <option value='terminee'>Terminée</option>
            <option value='annulee'>Annulée</option>
          </select>
          <input value={cityQuery} onChange={e=>setCityQuery(e.target.value)} placeholder='Ville...' className='h-9 border rounded px-2 text-sm bg-background' />
        </div>

        {loading ? (
          <div className='space-y-6'>
            {[1,2,3].map(i => (
              <div key={i} className='h-32 bg-muted/50 rounded-2xl animate-pulse border border-border/20' />
            ))}
          </div>
        ) : (
          <div className='space-y-6'>
            {filtered.map((m, idx) => (
              <div key={m.id} className='animate-fade-in' style={{ animationDelay: `${idx*0.06}s` }}>
                <MissionCard
                  id={m.id}
                  departure={m.ville_depart}
                  arrival={m.ville_arrivee}
                  departureDate={m.date_depart ? new Date(m.date_depart).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  arrivalDate={m.date_depart ? new Date(m.date_depart).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  distance={'-- km'}
                  duration={'-- min'}
                  price={m.prix_propose || 0}
                  vehicle={m.vehicule_requis || 'Véhicule non spécifié'}
                  company={'FleetChecks'}
                  rating={4.8}
                  isUrgent={false}
                  status={'available'}
                  title={m.titre}
                  description={m.description || undefined}
                  onSendDevis={handleSendDevis}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className='text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center'>Aucune mission pour ces filtres.</div>
        )}
      </div>
    </div>
  );
}
