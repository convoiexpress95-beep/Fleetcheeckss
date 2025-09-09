import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FleetMarketMission, FleetMarketMissionCard } from '@/components/FleetMarketMissionCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { PublishMissionDialog } from '@/pages/fleetmarket/PublishMissionDialog';

export default function FleetMarketPage(){
  const { toast } = useToast();
  const [missions, setMissions] = useState<FleetMarketMission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketplace_missions')
      .select('*')
      .order('created_at', { ascending: false });
    if(error){
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de charger les missions', variant: 'destructive'});
    } else {
      setMissions(data as any);
    }
    setLoading(false);
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
