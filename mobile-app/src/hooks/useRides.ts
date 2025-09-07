import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { useEffect, useMemo } from 'react';

export type RideRow = {
  id: string;
  user_id: string;
  from_city: string;
  to_city: string;
  date: string;
  departure_time: string;
  arrival_time: string | null;
  duration_min: number | null;
  seats: number;
  seats_available: number;
  price_per_seat: number;
  comfort: 'eco'|'confort'|'pro';
  instant: boolean;
  created_at: string;
  updated_at: string;
};

export const useSearchRides = (params: { from?: string; to?: string; date?: string; seatsMin?: number; maxPrice?: number; instantOnly?: boolean; }) => {
  return useQuery({
    queryKey: ['rides-search', params],
    queryFn: async () => {
  const { data, error } = await (supabase as any).rpc('search_rides', {
        _from_text: params.from || null,
        _to_text: params.to || null,
        _date: params.date || null,
        _seats_min: params.seatsMin || null,
        _max_price: params.maxPrice || null,
        _instant_only: params.instantOnly || false,
      });
      if (error) throw error;
      return (data || []) as RideRow[];
    }
  });
};

export const useCreateRide = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: Omit<RideRow, 'id'|'created_at'|'updated_at'|'user_id'>) => {
      if (!user?.id) throw new Error('Auth requise');
  const { data, error } = await (supabase as any).from('rides').insert({
        user_id: user.id,
        from_city: p.from_city,
        to_city: p.to_city,
        date: p.date,
        departure_time: p.departure_time,
        arrival_time: p.arrival_time,
        duration_min: p.duration_min,
        seats: p.seats,
        seats_available: p.seats_available,
        price_per_seat: p.price_per_seat,
        comfort: p.comfort,
        instant: p.instant,
  }).select('*').single();
      if (error) throw error;
      return data as RideRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rides-search'] });
      qc.invalidateQueries({ queryKey: ['my-rides'] });
      Toast.show({ type: 'success', text1: 'Trajet publié' });
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message })
  });
};

export const useToggleFavoriteRide = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ride_id, isFav }: { ride_id: string; isFav: boolean; }) => {
      if (!user?.id) throw new Error('Auth requise');
      if (isFav) {
  const { error } = await (supabase as any).from('ride_favorites').delete().eq('user_id', user.id).eq('ride_id', ride_id);
        if (error) throw error;
      } else {
  const { error } = await (supabase as any).from('ride_favorites').insert({ user_id: user.id, ride_id });
        if (error) throw error;
      }
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rides-search'] });
      qc.invalidateQueries({ queryKey: ['my-favorite-rides'] });
    }
  });
};

export const useRequestRide = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: { ride_id: string; seats_requested: number; message?: string; }) => {
      if (!user?.id) throw new Error('Auth requise');
      const { error } = await (supabase as any).from('ride_requests').insert({
        ride_id: p.ride_id, passenger_id: user.id, seats_requested: p.seats_requested, message: p.message || null
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => Toast.show({ type: 'success', text1: 'Demande envoyée' }),
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message })
  });
};

export type RideMessage = {
  id: string;
  ride_id: string;
  sender_id: string;
  recipient_id: string | null;
  body: string;
  created_at: string;
};

export type RideMessageRead = {
  ride_id: string;
  user_id: string;
  peer_user_id: string;
  last_read_at: string;
};

export type RideConversation = {
  ride_id: string;
  peer_user_id: string;
  last_message: RideMessage;
  unread_count: number;
};

export const useRideMessages = (ride_id?: string) => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['ride-messages', ride_id],
    enabled: !!ride_id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ride_messages')
        .select('*')
        .eq('ride_id', ride_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as RideMessage[];
    }
  });

  useEffect(() => {
    if (!ride_id) return;
    const ch = (supabase as any).channel(`ride_msgs_${ride_id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `ride_id=eq.${ride_id}` }, () => {
        qc.invalidateQueries({ queryKey: ['ride-messages', ride_id] });
      })
      .subscribe();
    return () => { try { ch.unsubscribe(); } catch {} };
  }, [ride_id]);

  return query;
};

export const useSendRideMessage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { ride_id: string; recipient_id: string | null; body: string; }) => {
      if (!user?.id) throw new Error('Auth requise');
      const { error } = await (supabase as any).from('ride_messages').insert({
        ride_id: p.ride_id,
        sender_id: user.id,
        recipient_id: p.recipient_id,
        body: p.body,
      });
      if (error) throw error;
      // Fire-and-forget push notification via Edge Function
      try {
        if (p.recipient_id) {
          await (supabase as any).functions.invoke('push-ride-message', {
            body: {
              ride_id: p.ride_id,
              recipient_id: p.recipient_id,
              body: p.body,
              sender_id: user.id,
            }
          });
        }
      } catch {}
      return true;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['ride-messages', vars.ride_id] });
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: 'Message non envoyé', text2: e?.message })
  });
};

export const useMarkRideThreadRead = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { ride_id: string; peer_user_id: string; }) => {
      if (!user?.id) throw new Error('Auth requise');
      const { error } = await (supabase as any).rpc('mark_ride_thread_read', { _ride_id: p.ride_id, _peer_user_id: p.peer_user_id });
      if (error) throw error;
      return true;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['ride-inbox'] });
      qc.invalidateQueries({ queryKey: ['ride-unreads'] });
      qc.invalidateQueries({ queryKey: ['ride-messages', vars.ride_id] });
    }
  });
};

export const useRideInbox = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['ride-inbox', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const { data: msgs, error: e1 } = await (supabase as any)
        .from('ride_messages')
        .select('*')
        .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
        .order('created_at', { ascending: false })
        .limit(500);
      if (e1) throw e1;

      const { data: reads, error: e2 } = await (supabase as any)
        .from('ride_message_reads')
        .select('*')
        .eq('user_id', uid);
      if (e2) throw e2;

      const lastReadMap = new Map<string, string>(); // key: ride|peer -> iso
      (reads || []).forEach((r: any) => {
        lastReadMap.set(`${r.ride_id}|${r.peer_user_id}`, r.last_read_at);
      });

      const convMap = new Map<string, { last_message: RideMessage; unread: number; ride_id: string; peer_user_id: string }>();
      (msgs || []).forEach((m: any) => {
        const peer = m.sender_id === uid ? m.recipient_id : m.sender_id;
        if (!peer) return; // skip broadcast/null
        const key = `${m.ride_id}|${peer}`;
        const prev = convMap.get(key);
        const lastRead = lastReadMap.get(key);
        const isFromPeer = m.sender_id === peer;
        const isUnread = isFromPeer && (!lastRead || new Date(m.created_at) > new Date(lastRead));
        if (!prev) {
          convMap.set(key, { ride_id: m.ride_id, peer_user_id: peer, last_message: m as RideMessage, unread: isUnread ? 1 : 0 });
        } else {
          // keep first in list as last_message since msgs are desc
          prev.unread += isUnread ? 1 : 0;
        }
      });

      const conversations: RideConversation[] = Array.from(convMap.values()).map(v => ({
        ride_id: v.ride_id,
        peer_user_id: v.peer_user_id,
        last_message: v.last_message,
        unread_count: v.unread,
      }));

      // Also provide a fast map for UI badges
      const unreadMap: Record<string, number> = {};
      conversations.forEach(c => { unreadMap[`${c.ride_id}|${c.peer_user_id}`] = c.unread_count; });

      return { conversations, unreadMap } as { conversations: RideConversation[]; unreadMap: Record<string, number> };
    }
  });
  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    const ch1 = (supabase as any).channel(`inbox_rec_${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `recipient_id=eq.${uid}` }, () => {
        qc.invalidateQueries({ queryKey: ['ride-inbox', uid] });
      })
      .subscribe();
    const ch2 = (supabase as any).channel(`inbox_send_${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `sender_id=eq.${uid}` }, () => {
        qc.invalidateQueries({ queryKey: ['ride-inbox', uid] });
      })
      .subscribe();
    return () => { try { ch1.unsubscribe(); ch2.unsubscribe(); } catch {} };
  }, [user?.id]);
  return query;
};

export const useUnreadMap = () => {
  const { data } = useRideInbox();
  return data?.unreadMap || {};
};

export const useMyRides = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-rides', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('rides').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as RideRow[];
    }
  });
};

export const useMyFavoriteRides = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-favorite-rides', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ride_favorites')
        .select('ride_id, rides(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Map to RideRow[]
      const mapped: RideRow[] = (data || [])
        .map((row: any) => row.rides)
        .filter(Boolean);
      return mapped;
    }
  });
};
