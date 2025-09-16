import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface RideMessageRow {
  id: string;
  ride_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function useRideMessages(rideId?: string){
  const [messages, setMessages] = useState<RideMessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    if(!rideId) return;
    let cancelled = false;
    (async()=>{
      try{
        setLoading(true);
        const { data, error } = await supabase
          .from('ride_messages')
          .select('*')
          .eq('ride_id', rideId)
          .order('created_at', { ascending: true });
        if(error) throw error;
        if(!cancelled) setMessages((data||[]) as RideMessageRow[]);
      }catch(e){
        const msg = (e && typeof e === 'object' && 'message' in e) ? String((e as { message?: string }).message || 'Erreur chargement messages') : 'Erreur chargement messages';
        if(!cancelled) setError(msg);
      }finally{
        if(!cancelled) setLoading(false);
      }
    })();

    const channel = supabase.channel(`ride:${rideId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `ride_id=eq.${rideId}`}, (payload)=>{
        const row = payload.new as RideMessageRow;
        setMessages(prev => [...prev, row]);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  const send = async (content: string, senderId: string) => {
    if(!rideId) throw new Error('rideId absent');
    const trimmed = content.trim();
    if(!trimmed) return;
    // Client-side guard: block phone numbers before hitting DB
  if(/(?:\+?\d[\s\-.]*){8,}/.test(trimmed)){
      throw new Error("L'envoi de numéros de téléphone est interdit dans la messagerie.");
    }
    const { data, error } = await supabase
      .from('ride_messages')
      .insert({ ride_id: rideId, sender_id: senderId, content: trimmed })
      .select('*')
      .single();
    if(error) throw error;
    return data as RideMessageRow;
  };

  return { messages, loading, error, send };
}
