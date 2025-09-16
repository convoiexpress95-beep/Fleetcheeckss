import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useNotificationsSummary() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [pendingDriver, setPendingDriver] = useState(0);
  const [pendingPassenger, setPendingPassenger] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(()=>{
    let cancelled = false;
    async function refresh(){
      if(!user){ if(!cancelled){ setCount(0); setPendingDriver(0); setPendingPassenger(0); setUnreadMessages(0);} return; }
      try {
        const rRides = await supabase.from('rides').select('id').eq('driver_id', user.id);
        const rideIds = (rRides.data||[]).map(r=>r.id);
        let driverPending = 0;
        if(rideIds.length){
          const rPending = await supabase.from('ride_reservations').select('id').in('ride_id', rideIds).eq('status','pending');
            driverPending = (rPending.data||[]).length;
        }
        const rMyPending = await supabase.from('ride_reservations').select('id').eq('passenger_id', user.id).eq('status','pending');
        const passengerPending = (rMyPending.data||[]).length;
        const unreadRes = await supabase.rpc('count_unread_ride_messages', { p_user: user.id });
        const unread = (!unreadRes.error && typeof unreadRes.data === 'number') ? unreadRes.data : 0;
        if(!cancelled){
          setPendingDriver(driverPending);
          setPendingPassenger(passengerPending);
          setUnreadMessages(unread);
          setCount(driverPending + passengerPending + unread);
        }
      } catch {
        if(!cancelled){ setCount(0); }
      }
    }
    refresh();
    const t = setInterval(refresh, 30000);
    // Realtime
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if(user){
      channel = supabase.channel('notif_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_reservations' }, refresh)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages' }, refresh)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_message_reads' }, refresh)
        .subscribe();
    }
    return ()=>{ cancelled = true; clearInterval(t); if(channel) supabase.removeChannel(channel); };
  }, [user]);

  return { count, pendingDriver, pendingPassenger, unreadMessages };
}
