import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMissions, publishMission, updateMissionStatus, assignMission } from '@/services/fleetMarketService';
import type { FleetMarketMission } from '@/components/FleetMarketMissionCard';

const KEY = ['fleetmarket','missions'];

export function useFleetMarketMissions(){
  const qc = useQueryClient();
  const missionsQuery = useQuery<FleetMarketMission[]>({ queryKey: KEY, queryFn: () => listMissions() });

  const publish = useMutation({
    mutationFn: (p: Omit<FleetMarketMission,'id'|'statut'>) => publishMission(p as any),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<FleetMarketMission[]>(KEY) || [];
      // Optimistic insert placeholder
      const optimistic: FleetMarketMission = {
        id: `tmp-${Date.now()}`,
        titre: vars.titre,
        description: vars.description || '',
        ville_depart: vars.ville_depart,
        ville_arrivee: vars.ville_arrivee,
        date_depart: vars.date_depart,
        prix_propose: vars.prix_propose,
        statut: 'ouverte',
        vehicule_requis: vars.vehicule_requis,
        convoyeur_id: null,
      } as any;
      qc.setQueryData<FleetMarketMission[]>(KEY, [optimistic, ...prev]);
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
    },
    onSettled: () => { qc.invalidateQueries({ queryKey: KEY }); }
  });

  const setStatus = useMutation({
    mutationFn: ({ id, statut }: { id:string; statut: 'ouverte'|'en_negociation'|'attribuee'|'terminee'|'annulee' }) => updateMissionStatus(id, statut),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<FleetMarketMission[]>(KEY);
      if (prev) {
        qc.setQueryData<FleetMarketMission[]>(KEY, prev.map(m => m.id === vars.id ? { ...m, statut: vars.statut } : m));
      }
      return { prev };
    },
    onError: (_e, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); },
    onSettled: () => { qc.invalidateQueries({ queryKey: KEY }); }
  });

  const assign = useMutation({
    mutationFn: ({ id, convoyeurUserId }: { id:string; convoyeurUserId:string }) => assignMission(id, convoyeurUserId),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<FleetMarketMission[]>(KEY);
      if (prev) {
        qc.setQueryData<FleetMarketMission[]>(KEY, prev.map(m => m.id === vars.id ? { ...m, statut: 'attribuee', convoyeur_id: vars.convoyeurUserId } : m));
      }
      return { prev };
    },
    onError: (_e, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); },
    onSettled: () => { qc.invalidateQueries({ queryKey: KEY }); }
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
