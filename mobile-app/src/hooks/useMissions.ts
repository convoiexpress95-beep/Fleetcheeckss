import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';

export const useMissions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: async (): Promise<Mission[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .or(`driver_id.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('missions-realtime-mobile')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions',
        filter: `driver_id=eq.${user.id}`,
      }, () => {
        // Invalider le cache pour recharger la liste
        queryClient.invalidateQueries({ queryKey: ['missions'] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions',
        filter: `created_by=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['missions'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return query;
};

export const useMission = (missionId: string) => {
  return useQuery({
    queryKey: ['mission', missionId],
    queryFn: async (): Promise<Mission> => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!missionId,
  });
};

export const useUpdateMissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, status }: { missionId: string; status: string }) => {
      const { data, error } = await supabase
        .from('missions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', missionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      Toast.show({
        type: 'success',
        text1: 'Statut mis à jour',
        text2: 'Le statut de la mission a été modifié',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message,
      });
    },
  });
};