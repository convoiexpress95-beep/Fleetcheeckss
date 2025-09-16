import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useRideReservationActions } from './useRideReservationActions';

export interface RideParticipantProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}
export interface RideReservationParticipant {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  price_at_booking: number;
  passenger?: RideParticipantProfile;
}

interface RideReservationRaw { id: string; ride_id: string; passenger_id: string; seats: number; status: 'pending'|'accepted'|'rejected'|'cancelled'; created_at: string; price_at_booking: number; }
interface ProfileRow { user_id: string; display_name: string | null; avatar_url: string | null; }

export function useRideParticipants(rideId?: string) {
  const { user } = useAuth();
  const { accept, reject, cancel, loading: actionLoading } = useRideReservationActions();
  const [driver, setDriver] = useState<RideParticipantProfile | null>(null);
  const [reservations, setReservations] = useState<RideReservationParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    let stop = false;
    (async()=>{
      if(!rideId){ setReservations([]); return; }
      setLoading(true); setError(null);
      try {
        // Fetch reservations
        const rRes = await supabase.from('ride_reservations').select('id, ride_id, passenger_id, seats, status, created_at, price_at_booking').eq('ride_id', rideId);
        const raw = (rRes.data||[]) as RideReservationRaw[];
        const passengerIds = Array.from(new Set(raw.map(r=>r.passenger_id)));
        let profiles: Record<string, RideParticipantProfile> = {};
        if(passengerIds.length){
          const rProf = await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', passengerIds);
          profiles = Object.fromEntries((rProf.data||[] as ProfileRow[]).map((p)=>[p.user_id, p]));
        }
        // Fetch driver via rides join (only needed for avatar/display)
        const rRide = await supabase.from('rides').select('driver_id').eq('id', rideId).maybeSingle();
        if(rRide.data?.driver_id){
          const rDriver = await supabase.from('profiles').select('user_id, display_name, avatar_url').eq('user_id', rRide.data.driver_id).maybeSingle();
          setDriver(rDriver.data || { user_id: rRide.data.driver_id, display_name: null, avatar_url: null });
        } else {
          setDriver(null);
        }
        const withProf: RideReservationParticipant[] = raw.map(r => ({ ...r, passenger: profiles[r.passenger_id] }));
        if(!stop){ setReservations(withProf); }
      } catch(e){ if(!stop) setError(e instanceof Error ? e.message : 'Erreur'); }
      finally { if(!stop) setLoading(false); }
    })();
    return ()=>{ stop = true; };
  }, [rideId]);

  const updateStatusLocally = (resId: string, status: RideReservationParticipant['status']) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status } : r));
  };

  const actAccept = async (resId: string, driverId: string) => {
    const { error } = await accept(resId, driverId); if(!error) updateStatusLocally(resId, 'accepted'); return !error;
  };
  const actReject = async (resId: string, driverId: string) => {
    const { error } = await reject(resId, driverId); if(!error) updateStatusLocally(resId, 'rejected'); return !error;
  };
  const actCancel = async (resId: string, actorId: string) => {
    const { error } = await cancel(resId, actorId); if(!error) updateStatusLocally(resId, 'cancelled'); return !error;
  };

  return { driver, reservations, loading, error, actionLoading, actAccept, actReject, actCancel, currentUserId: user?.id };
}
