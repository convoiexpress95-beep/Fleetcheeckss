import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSearchProfiles = (query: string) => {
  return useQuery({
    queryKey: ['search-profiles', query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];

      // Renvoyer l'id utilisateur (auth.users.id) pour correspondre à invited_user_id (FK sur auth.users)
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .ilike('email', `%${query}%`)
        .order('full_name', { ascending: true })
        .limit(10);

      if (error) throw error;
      // Adapter la forme pour conserver { id, email, full_name }
      return (data || []).map((p: any) => ({
        id: p.user_id,
        email: p.email,
        full_name: p.full_name,
      }));
    },
    enabled: query.length >= 3,
  });
};