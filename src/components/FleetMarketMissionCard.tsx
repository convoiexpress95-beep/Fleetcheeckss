import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Send, MoreVertical, CheckCircle2, Flag } from 'lucide-react';
import { findVehicleByName } from '@/data/fleetmarketVehicles';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useFleetMarketMissions } from '@/hooks/useFleetMarketMissions';

export interface FleetMarketMission {
  id: string;
  titre: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart?: string | null;
  prix_propose?: number | null;
  vehicule_requis?: string | null;
  description?: string | null;
  statut?: string | null;
}

interface Props {
  mission: FleetMarketMission;
  onSendDevis?: (m: FleetMarketMission) => void;
}

export function FleetMarketMissionCard({ mission, onSendDevis }: Props){
  const vehicle = mission.vehicule_requis ? findVehicleByName(mission.vehicule_requis) : undefined;
  const { setStatus, assign } = useFleetMarketMissions();
  const loading = setStatus.isPending || assign.isPending;
  return (
    <div className='bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all'>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1 space-y-2'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='text-lg font-semibold text-foreground'>{mission.titre}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='icon' variant='ghost' className='h-8 w-8' disabled={loading}>
                  <MoreVertical className='w-4 h-4'/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem disabled={loading} onClick={()=>setStatus.mutate({ id: mission.id, statut: 'ouverte' })}>Marquer ouverte</DropdownMenuItem>
                <DropdownMenuItem disabled={loading} onClick={()=>setStatus.mutate({ id: mission.id, statut: 'en_negociation' })}>En négociation</DropdownMenuItem>
                <DropdownMenuItem disabled={loading} onClick={()=>setStatus.mutate({ id: mission.id, statut: 'attribuee' })}>Attribuée</DropdownMenuItem>
                <DropdownMenuItem disabled={loading} onClick={()=>setStatus.mutate({ id: mission.id, statut: 'terminee' })}>Terminée</DropdownMenuItem>
                <DropdownMenuItem disabled={loading} onClick={()=>setStatus.mutate({ id: mission.id, statut: 'annulee' })}>Annulée</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={loading} onClick={()=>assign.mutate({ id: mission.id, convoyeurUserId: 'self' })}>Auto-attribuer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1'><MapPin className='w-4 h-4' /> {mission.ville_depart} → {mission.ville_arrivee}</span>
            {mission.date_depart && <span className='flex items-center gap-1'><Clock className='w-4 h-4' /> {new Date(mission.date_depart).toLocaleDateString('fr-FR')}</span>}
            {mission.prix_propose != null && <span className='text-primary font-medium'>{mission.prix_propose}€</span>}
          </div>
          {mission.description && <p className='text-sm text-muted-foreground line-clamp-2'>{mission.description}</p>}
          {mission.statut && <Badge variant={mission.statut === 'ouverte' ? 'default':'secondary'} className='mt-1 capitalize'>{mission.statut}</Badge>}
        </div>
        {vehicle && (
          <div className='w-40 flex flex-col items-center justify-center'>
            <img src={vehicle.image} alt={vehicle.name} className='w-28 h-16 object-cover rounded-md bg-muted' />
            <p className='text-xs text-muted-foreground mt-1'>{vehicle.name}</p>
          </div>
        )}
        <div className='flex flex-col justify-center gap-2 w-full md:w-48'>
          {onSendDevis && (
            <Button onClick={()=>onSendDevis(mission)} className='bg-success hover:bg-success/90 text-success-foreground'>Proposer un devis</Button>
          )}
          {mission.statut !== 'attribuee' && mission.statut !== 'terminee' && (
            <Button variant='outline' disabled={assign.isPending} onClick={()=>assign.mutate({ id: mission.id, convoyeurUserId: 'self' })}>
              <CheckCircle2 className='w-4 h-4 mr-2'/> Attribuer
            </Button>
          )}
          {mission.statut === 'attribuee' && (
            <Button variant='secondary' disabled={setStatus.isPending} onClick={()=>setStatus.mutate({ id: mission.id, statut: 'terminee' })}>
              <Flag className='w-4 h-4 mr-2'/> Terminer
            </Button>
          )}
          {loading && <span className='text-xs text-muted-foreground'>Maj...</span>}
        </div>
      </div>
    </div>
  );
}
