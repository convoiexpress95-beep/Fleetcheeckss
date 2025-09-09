import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMissions, publishMission, updateMissionStatus, assignMission } from '@/services/fleetMarketService';
import type { FleetMarketMission } from '@/components/FleetMarketMissionCard';

const KEY = ['fleetmarket','missions'];

export function useFleetMarketMissions(){
  const qc = useQueryClient();
  const missionsQuery = useQuery<FleetMarketMission[]>({ queryKey: KEY, queryFn: () => listMissions() });

  const publish = useMutation({
    mutationFn: (p: Omit<FleetMarketMission,'id'|'statut'>) => publishMission(p as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); }
  });

  const setStatus = useMutation({
    mutationFn: ({ id, statut }: { id:string; statut: 'ouverte'|'en_negociation'|'attribuee'|'terminee'|'annulee' }) => updateMissionStatus(id, statut),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); }
  });

  const assign = useMutation({
    mutationFn: ({ id, convoyeurUserId }: { id:string; convoyeurUserId:string }) => assignMission(id, convoyeurUserId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); }
  });

  return {
    missions: missionsQuery.data || [],
    loading: missionsQuery.isLoading,
    error: missionsQuery.error as Error | null,
    refetch: missionsQuery.refetch,
    publish,
    setStatus,
    assign,
    invalidate: () => qc.invalidateQueries({ queryKey: KEY })
  };
}
