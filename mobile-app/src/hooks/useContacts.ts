import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

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
      if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
  });
};

export const useProfileSearch = (term: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile-search', term, user?.id],
    queryFn: async () => {
      if (!term || term.trim().length < 2) return [] as Array<{ user_id: string; full_name: string | null; email: string | null }>;
      let q = supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .limit(10);
      const like = `%${term.trim()}%`;
      q = q.or(`email.ilike.${like},full_name.ilike.${like}`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).filter((p: any) => p.user_id !== user?.id);
    },
    enabled: true,
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
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('contacts')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', contactId)
        .eq('invited_user_id', user.id)
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incoming-invitations'] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
      Toast.show({ type: 'success', text1: 'Invitation acceptée' });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message });
    },
  });
};

export const useDeclineInvitation = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('contacts')
        .update({ status: 'declined', declined_at: new Date().toISOString() })
        .eq('id', contactId)
        .eq('invited_user_id', user.id)
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incoming-invitations'] });
      Toast.show({ type: 'success', text1: 'Invitation refusée' });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message });
    },
  });
};

export const useCancelContact = () => {
  const qc = useQueryClient();
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
      qc.invalidateQueries({ queryKey: ['contacts'] });
      Toast.show({ type: 'success', text1: 'Contact supprimé' });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message });
    },
  });
};

export const useSendInvitation = () => {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async ({ email, name, contactId }: { email?: string; name?: string; contactId?: string }) => {
      if (!session?.access_token) throw new Error('User not authenticated');
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: { email, name, contactId, inviterName: session.user?.user_metadata?.full_name || session.user?.email },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      Toast.show({ type: 'success', text1: 'Invitation envoyée', text2: data?.message });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || e?.cause?.message });
    },
  });
};

export const useAddContact = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ email, name, invitedUserId }: { email: string; name?: string; invitedUserId?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('contacts')
        .insert({ user_id: user.id, email, name: name || email, invited_user_id: invitedUserId || null, status: 'pending' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      Toast.show({ type: 'success', text1: 'Contact ajouté' });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message });
    },
  });
};
