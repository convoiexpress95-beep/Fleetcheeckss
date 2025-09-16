import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';

export const useMyContacts = (page = 0, pageSize = 10, search = '') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts', user?.id, page, pageSize, search],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Tentative d'appel RPC (signature sans arguments)
      const { data, error } = await supabase.rpc('get_contacts_with_stats');
      if (!error && Array.isArray(data)) {
        // Filtrage + pagination côté client (search insensible à la casse sur name/email)
        const normalizedSearch = (search || '').trim().toLowerCase();
        const filtered = normalizedSearch
          ? (data as any[]).filter(c => (
              (c.name || '').toLowerCase().includes(normalizedSearch) ||
              (c.email || '').toLowerCase().includes(normalizedSearch)
            ))
          : (data as any[]);
        const start = page * pageSize;
        const paginated = filtered.slice(start, start + pageSize);
        return { data: paginated, count: filtered.length };
      }

      // Fallback si 404 ou RPC absente: on reconstruit une requête directe sur contacts
      if (error && ((error as any).code === 'PGRST100' || (error as any).message?.includes('404'))) {
        if (import.meta.env.DEV) {
          try {
            // Diagnostic détaillé pour comprendre la nature du 404
            // On tente un fetch brut sur l'endpoint RPC pour voir la réponse exacte
            const restUrl = (supabase as any).restUrl || `${(supabase as any).url}/rest/v1`;
            const endpoint = `${restUrl}/rpc/get_contacts_with_stats`;
            console.warn('[contacts][rpc] 404 détecté – tentative de diagnostic', { endpoint, code: (error as any).code, message: (error as any).message });
            fetch(endpoint, {
              method: 'POST',
              headers: {
                'apikey': (supabase as any).anonKey || (supabase as any).supabaseKey || '',
                'authorization': `Bearer ${(supabase as any).anonKey || (supabase as any).supabaseKey || ''}`,
                'content-type': 'application/json'
              },
              body: '{}'
            })
              .then(r => r.text().then(t => ({ status: r.status, body: t })))
              .then(res => console.warn('[contacts][rpc][raw fetch] résultat', res))
              .catch(e => console.error('[contacts][rpc][raw fetch] échec', e));
          } catch(e) {
            console.error('[contacts][rpc] diagnostic fetch erreur', e);
          }
        }
        // Requête basique avec OR user_id / invited_user_id
        let query = supabase
          .from('contacts')
          .select('*')
          .or(`user_id.eq.${user.id},invited_user_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        if (search) {
          const ilike = `%${search}%`;
          query = query.ilike('name', ilike).ilike('email', ilike); // simple heuristique
        }
        const { data: raw, error: fbError } = await query;
        if (fbError) throw fbError;
        const all = raw || [];
        const start = page * pageSize;
        const paginated = all.slice(start, start + pageSize);
        return { data: paginated, count: all.length };
      }

      // Si autre erreur, on propage
      if (error) throw error;
      return { data: [], count: 0 };
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
  const { toast } = useToast();

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
  const { toast } = useToast();

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
  const { toast } = useToast();

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
  const { toast } = useToast();

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
  const { toast } = useToast();

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