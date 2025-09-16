import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRideReservationActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  type RpcParams = Record<string, string | number | boolean | null | undefined>;
  const call = useCallback(async (fn: string, params: RpcParams) => {
    setLoading(fn); setError(null);
    const { data, error } = await supabase.rpc(fn, params);
    if (error) { setError(error.message); }
    setLoading(null);
    return { data, error };
  }, []);

  const accept = useCallback(async (reservationId: string, driverId: string) => {
    return call('accept_ride_reservation', { p_reservation_id: reservationId, p_driver: driverId });
  }, [call]);

  const reject = useCallback(async (reservationId: string, driverId: string) => {
    return call('reject_ride_reservation', { p_reservation_id: reservationId, p_driver: driverId });
  }, [call]);

  const cancel = useCallback(async (reservationId: string, actorId: string) => {
    return call('cancel_ride_reservation', { p_reservation_id: reservationId, p_actor: actorId });
  }, [call]);

  return { accept, reject, cancel, loading, error };
}
