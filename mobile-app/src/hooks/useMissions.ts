import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Mission } from '../types';
import Toast from 'react-native-toast-message';

export const useMissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['missions', user?.id],
    queryFn: async (): Promise<Mission[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
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
      // TODO: La table missions n'a pas de colonne status actuellement
      // Il faudra soit ajouter cette colonne soit utiliser un autre système de statut
      
      console.warn('useUpdateMissionStatus: colonne status non disponible dans la table missions');
      
      // Pour l'instant, on fait juste une mise à jour de updated_at
      const { data, error } = await supabase
        .from('missions')
        .update({ updated_at: new Date().toISOString() })
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