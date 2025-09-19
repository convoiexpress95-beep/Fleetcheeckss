import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export type DBMarketplaceMission = {
  id: string;
  titre: string | null;
  ville_depart: string | null;
  ville_arrivee: string | null;
  prix_propose: number | null;
  statut: string | null;
  date_depart: string | null;
  vehicule_requis?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function useMarketplaceMissions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['marketplace_missions'],
    queryFn: async (): Promise<DBMarketplaceMission[]> => {
      // Essayer d'abord marketplace_missions
      let { data, error } = await supabase
        .from('marketplace_missions')
        .select('id, titre, ville_depart, ville_arrivee, prix_propose, statut, date_depart, vehicule_requis, description, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback: fleetmarket_missions (vue de compat)
        const { data: data2, error: error2 } = await supabase
          .from('fleetmarket_missions')
          .select('id, titre, ville_depart, ville_arrivee, prix_propose, statut, date_depart, vehicule_requis, description, created_at')
          .order('created_at', { ascending: false });
        if (error2) throw error2;
        return data2 || [];
      }

      return data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('realtime:marketplace_missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_missions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['marketplace_missions'] });
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch { /* noop */ }
    };
  }, [queryClient]);

  return {
    missions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as any,
    refetch: query.refetch,
  };
}
