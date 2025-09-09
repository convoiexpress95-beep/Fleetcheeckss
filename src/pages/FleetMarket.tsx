import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PublishMissionDialog } from '@/pages/fleetmarket/PublishMissionDialog';
import { useFleetMarketMissions } from '@/hooks/useFleetMarketMissions';
import { RefreshCw } from 'lucide-react';
import { FleetMarketMissionCard } from '@/components/FleetMarketMissionCard';

export default function FleetMarketPage(){
  console.debug('[FleetMarket] mount, location should be /fleetmarket');
  const { toast } = useToast();
  const { missions, loading, refetch } = useFleetMarketMissions();

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='text-2xl font-semibold'>FleetMarket</h1>
        <PublishMissionDialog onCreated={() => refetch()} />
        <Button size='sm' variant='outline' onClick={() => refetch()} disabled={loading}>
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
