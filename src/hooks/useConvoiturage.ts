import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Ride {
  id: string;
  driver_id: string;
  departure: string;
  destination: string;
  departure_time: string; // ISO
  duration_minutes?: number | null;
  price: number;
  seats_total: number;
  seats_available: number;
  route: string[];
  description?: string | null;
  vehicle_model?: string | null;
  options: string[];
  status: 'active' | 'cancelled' | 'completed';
}

export interface RideReservation {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  price_at_booking: number;
  message?: string | null;
  created_at: string;
}

export interface RideMessage {
  id: string;
  ride_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface SearchParams {
  departure?: string;
  destination?: string;
  date?: Date;
  passengers?: number;
}

export function useConvoiturage(search?: SearchParams) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);

  const normalized = useMemo(() => ({
    dep: (search?.departure || '').trim().toLowerCase(),
    dest: (search?.destination || '').trim().toLowerCase(),
    dateStr: search?.date ? new Date(search.date) : null,
    pax: search?.passengers ?? 1,
  }), [search?.departure, search?.destination, search?.date, search?.passengers]);

  const fetchRides = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('rides')
        .select('*')
        .eq('status', 'active')
        .gte('seats_available', normalized.pax)
        .order('departure_time', { ascending: true })
        .limit(50);

      if (normalized.dep) query = query.ilike('departure', `%${normalized.dep}%`);
      if (normalized.dest) query = query.ilike('destination', `%${normalized.dest}%`);
      if (normalized.dateStr) {
        const start = new Date(normalized.dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        query = query.gte('departure_time', start.toISOString()).lt('departure_time', end.toISOString());
      }

  const { data, error } = await query;
      if (error) throw error;
  setRides((data as Ride[]) || []);
    } catch (e: any) {
      console.error('fetchRides error', e);
      setError(e?.message || 'Erreur lors du chargement des trajets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized.dep, normalized.dest, normalized.dateStr?.toISOString?.(), normalized.pax]);

  // Realtime on rides inserts/updates affecting list
  useEffect(() => {
  const ch = supabase
      .channel('realtime:rides')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, (payload) => {
        const row = payload.new as Ride;
        setRides(prev => {
          // only add if matches current filters
          if (normalized.dep && !row.departure?.toLowerCase?.().includes(normalized.dep)) return prev;
          if (normalized.dest && !row.destination?.toLowerCase?.().includes(normalized.dest)) return prev;
          if (normalized.dateStr) {
            const d = new Date(row.departure_time);
            const s = new Date(normalized.dateStr); s.setHours(0,0,0,0);
            const e = new Date(s); e.setDate(s.getDate()+1);
            if (d < s || d >= e) return prev;
          }
          return [...prev, row].sort((a,b) => a.departure_time.localeCompare(b.departure_time));
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides' }, (payload) => {
        const row = payload.new as Ride;
        setRides(prev => prev.map(r => r.id === row.id ? row : r));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rides' }, (payload) => {
        const row = payload.old as Ride;
        setRides(prev => prev.filter(r => r.id !== row.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [normalized.dep, normalized.dest, normalized.dateStr?.toISOString?.(), normalized.pax]);

  // Actions
  const publishRide = async (input: Omit<Ride, 'id' | 'driver_id' | 'seats_available' | 'status'> & { status?: Ride['status'] }) => {
    if (!user) throw new Error('Non connecté');
  const { data, error } = await supabase.from('rides').insert({
      driver_id: user.id,
      departure: input.departure,
      destination: input.destination,
      departure_time: input.departure_time,
      duration_minutes: input.duration_minutes ?? null,
      price: input.price,
      seats_total: input.seats_total,
      route: input.route ?? [],
      description: input.description ?? null,
      vehicle_model: input.vehicle_model ?? null,
      options: input.options ?? [],
      status: input.status ?? 'active',
    }).select('*').single();
  if (error) throw error;
  return data as unknown as Ride;
  };

  const reserveRide = async (rideId: string, seats = 1, message?: string) => {
    if (!user) throw new Error('Non connecté');
    const ride = rides.find(r => r.id === rideId);
    if (!ride) throw new Error('Trajet introuvable');
  const { data, error } = await supabase.from('ride_reservations').insert({
      ride_id: rideId,
      passenger_id: user.id,
      seats_reserved: seats,
      status: 'pending',
      total_price: ride.price * seats,
      message: message ?? null,
    }).select('*').single();
  if (error) throw error;
  return data as unknown as RideReservation;
  };

  const listMessages = async (rideId: string) => {
  const { data, error } = await supabase
      .from('ride_messages')
      .select('*')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: true });
    if (error) throw error;
  return (data as unknown as RideMessage[]) || [];
  };

  const sendMessage = async (rideId: string, content: string) => {
    if (!user) throw new Error('Non connecté');
  const { data, error } = await supabase
      .from('ride_messages')
      .insert({ ride_id: rideId, sender_id: user.id, content })
      .select('*')
      .single();
    if (error) throw error;
  return data as unknown as RideMessage;
  };

  const subscribeRideMessages = (rideId: string, cb: (msg: RideMessage) => void) => {
    const ch = supabase
      .channel(`realtime:ride_messages:${rideId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `ride_id=eq.${rideId}` }, (payload: any) => {
        cb(payload.new as RideMessage);
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  };

  return {
    rides,
    loading,
    error,
    refetch: fetchRides,
    publishRide,
    reserveRide,
    listMessages,
    sendMessage,
    subscribeRideMessages,
  };
}
