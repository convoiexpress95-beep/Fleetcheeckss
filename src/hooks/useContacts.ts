import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useMyContacts = (page = 0, pageSize = 10, search = '') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts', user?.id, page, pageSize, search],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      let query = supabase
        .from('contacts_with_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
  });
};

export const useIncomingInvitations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['incoming-invitations', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('invited_user_id', user.id)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Invitation acceptée",
        description: "Vous avez accepté l'invitation",
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

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('invited_user_id', user.id)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-invitations'] });
      toast({
        title: "Invitation refusée",
        description: "Vous avez refusé l'invitation",
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

export const useCancelContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact supprimé",
        description: "Le contact a été supprimé",
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

export const useSendInvitation = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ email, name, contactId }: { email?: string; name?: string; contactId?: string }) => {
      if (!session?.access_token) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          name,
          contactId,
          inviterName: session.user?.user_metadata?.full_name || session.user?.email
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Invitation envoyée",
        description: data?.message || "L'invitation a été envoyée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || (error?.cause?.message) || "Une erreur est survenue lors de l'envoi de l'invitation",
        variant: "destructive",
      });
    },
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ email, name, invitedUserId }: { email: string; name?: string; invitedUserId?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          email,
          name: name || email,
          invited_user_id: invitedUserId || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact ajouté",
        description: "Le contact a été ajouté avec succès",
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