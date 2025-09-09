import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FleetMarketMission, FleetMarketMissionCard } from '@/components/FleetMarketMissionCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { PublishMissionDialog } from '@/pages/fleetmarket/PublishMissionDialog';
import { listMissions } from '@/services/fleetMarketService';

export default function FleetMarketPage(){
  console.debug('[FleetMarket] mount, location should be /fleetmarket');
  const { toast } = useToast();
  const [missions, setMissions] = useState<FleetMarketMission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listMissions();
      setMissions(data);
    } catch (e:any) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Chargement missions indisponible', variant: 'destructive'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='text-2xl font-semibold'>FleetMarket</h1>
  <PublishMissionDialog onCreated={load} />
        <Button size='sm' variant='outline' onClick={load} disabled={loading}>
          <RefreshCw className='w-4 h-4 mr-1 animate-spin' style={{ animationPlayState: loading ? 'running':'paused'}} />
          Actualiser
        </Button>
      </div>
      {loading && <div className='text-sm text-muted-foreground'>Chargement...</div>}
      <div className='space-y-4'>
        {missions.map(m => (
          <FleetMarketMissionCard key={m.id} mission={m} />
        ))}
        {!loading && missions.length === 0 && (
          <div className='text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center'>Aucune mission pour le moment.</div>
        )}
      </div>
    </div>
  );
}
