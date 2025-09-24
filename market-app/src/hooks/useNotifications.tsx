import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface NotificationCounts {
  messages: number;
  missions: number;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    messages: 0,
    missions: 0
  });

  useEffect(() => {
    if (!user) return;

    // Fonction pour récupérer les counts initiaux
    const fetchInitialCounts = async () => {
      try {
        // Compter les messages non lus
        const { data: conversations } = await supabase
          .from('conversations')
          .select(`
            id,
            messages!inner(
              id,
              sender_id,
              read_at,
              created_at
            )
          `)
          .or(`owner_id.eq.${user.id},convoyeur_id.eq.${user.id}`)
          .is('messages.read_at', null)
          .neq('messages.sender_id', user.id);

        const unreadMessagesCount = conversations?.reduce((total, conv) => {
          return total + (conv.messages?.length || 0);
        }, 0) || 0;

        // Compter les nouvelles missions (créées dans les dernières 24h)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // Préférence: table, fallback: vue
        let newMissionsCount = 0;
        try {
          const { count, error } = await supabase
            .from('fleetmarket_missions' as any)
            .select('*', { count: 'exact', head: true })
            .eq('statut', 'ouverte')
            .gte('created_at', twentyFourHoursAgo.toISOString());
          if (error) throw error;
          newMissionsCount = count || 0;
        } catch (e: any) {
          const msg = String(e?.message || e?.error || '').toLowerCase();
          if (msg.includes('relation') && (msg.includes('does not exist') || msg.includes('not exist') || msg.includes('undefined table'))) {
            const { count } = await supabase
              .from('marketplace_missions' as any)
              .select('*', { count: 'exact', head: true })
              .eq('statut', 'ouverte')
              .gte('created_at', twentyFourHoursAgo.toISOString());
            newMissionsCount = count || 0;
          } else {
            throw e;
          }
        }

        setCounts({
          messages: unreadMessagesCount,
          missions: newMissionsCount || 0
        });
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchInitialCounts();

    // Écouter les nouveaux messages en temps réel
    const messagesChannel = supabase
      .channel('messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Vérifier si le message n'est pas envoyé par l'utilisateur actuel
          if (payload.new.sender_id !== user.id) {
            // Vérifier si l'utilisateur est participant à cette conversation
            supabase
              .from('conversations')
              .select('*')
              .eq('id', payload.new.conversation_id)
              .or(`owner_id.eq.${user.id},convoyeur_id.eq.${user.id}`)
              .single()
              .then(({ data }) => {
                if (data) {
                  setCounts(prev => ({
                    ...prev,
                    messages: prev.messages + 1
                  }));
                }
              });
          }
        }
      )
      .subscribe();

    // Écouter les nouvelles missions en temps réel
    // Realtime sur la table; fallback: vue si la table n'est pas publiée
    const missionsChannel = supabase
      .channel('missions-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fleetmarket_missions' as any
        },
        (payload) => {
          if ((payload as any).new?.statut === 'ouverte') {
            setCounts(prev => ({ ...prev, missions: prev.missions + 1 }));
          }
        }
      )
      .subscribe();

    // Canal de secours sur l'ancienne vue si besoin
    const missionsChannelFallback = supabase
      .channel('missions-notifications-fallback')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_missions' as any
        },
        (payload) => {
          if ((payload as any).new?.statut === 'ouverte') {
            setCounts(prev => ({ ...prev, missions: prev.missions + 1 }));
          }
        }
      )
      .subscribe();

    // Écouter les mises à jour des messages (pour le read_at)
    const messageUpdatesChannel = supabase
      .channel('message-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Si un message a été marqué comme lu par l'utilisateur actuel
          if (payload.new.read_at && payload.old.read_at === null) {
            setCounts(prev => ({
              ...prev,
              messages: Math.max(0, prev.messages - 1)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
  supabase.removeChannel(missionsChannel);
  supabase.removeChannel(missionsChannelFallback);
      supabase.removeChannel(messageUpdatesChannel);
    };
  }, [user]);

  const clearMessageNotifications = () => {
    setCounts(prev => ({ ...prev, messages: 0 }));
  };

  const clearMissionNotifications = () => {
    setCounts(prev => ({ ...prev, missions: 0 }));
  };

  return {
    counts,
    clearMessageNotifications,
    clearMissionNotifications
  };
};