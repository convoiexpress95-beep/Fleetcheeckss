import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PublishMissionDialog } from '@/pages/fleetmarket/PublishMissionDialog';
import { useFleetMarketMissions } from '@/hooks/useFleetMarketMissions';
import { RefreshCw } from 'lucide-react';
import { FleetMarketMissionCard } from '@/components/FleetMarketMissionCard';
import { useState, useMemo } from 'react';

export default function FleetMarketPage(){
  console.debug('[FleetMarket] mount, location should be /fleetmarket');
  const { toast } = useToast();
  const { missions, loading, refetch } = useFleetMarketMissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityQuery, setCityQuery] = useState('');

  const filtered = useMemo(()=>
    missions.filter(m => (statusFilter==='all' || m.statut === statusFilter) &&
      (!cityQuery || m.ville_depart.toLowerCase().includes(cityQuery.toLowerCase()) || m.ville_arrivee.toLowerCase().includes(cityQuery.toLowerCase()))
    ), [missions, statusFilter, cityQuery]);

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='text-2xl font-semibold'>FleetMarket</h1>
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
      {loading && <div className='text-sm text-muted-foreground'>Chargement...</div>}
      <div className='space-y-4'>
        {filtered.map(m => (
          <FleetMarketMissionCard key={m.id} mission={m} />
        ))}
        {!loading && filtered.length === 0 && (
          <div className='text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center'>Aucune mission pour ces filtres.</div>
        )}
      </div>
    </div>
  );
}
