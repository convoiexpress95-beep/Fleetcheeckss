import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

type Ride = {
  id: string;
  driver_id?: string;
  departure: string;
  destination: string;
  departure_time: string; // ISO
};

type RideReservation = { ride_id: string };

type ConversationItem = {
  id: string; // ride id
  title: string; // departure -> destination
  subtitle: string; // date/time text
  lastMessage?: { text: string; time: string } | null;
};

type RideMessageRow = {
  id: string;
  ride_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type UIMessage = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string; // HH:mm
};

export default function CovoiturageMessages() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesListRef = useRef<FlatList<UIMessage>>(null);

  const isAuthenticated = !!user?.id;

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      messagesListRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (messages.length) scrollToEnd();
  }, [messages, scrollToEnd]);

  // Load conversations list (rides where user is driver or passenger)
  useEffect(() => {
    let cancelled = false;
    const loadConversations = async () => {
      if (!user?.id) {
        setConversations([]);
        return;
      }
      try {
        setLoading(true);
        const [{ data: asDriver, error: err1 }, { data: asPassenger, error: err2 }] = await Promise.all([
          supabase.from('rides').select('*').eq('driver_id', user.id).limit(50) as any,
          supabase.from('ride_reservations').select('ride_id').eq('passenger_id', user.id).limit(100) as any,
        ]);

        if (err1) console.warn('[covoit] rides asDriver error:', err1);
        if (err2) console.warn('[covoit] ride_reservations error:', err2);

        const rideIds = new Set<string>();
        (asDriver as Ride[] | null || []).forEach((r) => r && rideIds.add(r.id));
        (asPassenger as RideReservation[] | null || []).forEach((r) => r && rideIds.add(r.ride_id));
        const ids = Array.from(rideIds);
        if (!ids.length) {
          setConversations([]);
          setSelectedId(null);
          return;
        }

        const [{ data: rides, error: errRides }, { data: msgs, error: errMsgs }] = await Promise.all([
          supabase
            .from('rides')
            .select('*')
            .in('id', ids)
            .order('departure_time', { ascending: false }) as any,
          supabase
            .from('ride_messages')
            .select('*')
            .in('ride_id', ids)
            .order('created_at', { ascending: false }) as any,
        ]);

        if (errRides) console.warn('[covoit] rides fetch error:', errRides);
        if (errMsgs) console.warn('[covoit] ride_messages fetch error:', errMsgs);

        const latestByRide = new Map<string, RideMessageRow>();
        (msgs as RideMessageRow[] | null || []).forEach((m) => {
          if (!m) return;
          if (!latestByRide.has(m.ride_id)) latestByRide.set(m.ride_id, m);
        });

        const mapped: ConversationItem[] = (rides as Ride[] | null || []).map((r) => {
          const last = latestByRide.get(r.id);
          return {
            id: r.id,
            title: `${r.departure} → ${r.destination}`,
            subtitle: new Date(r.departure_time).toLocaleString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            }),
            lastMessage: last
              ? {
                  text: last.content,
                  time: new Date(last.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                }
              : null,
          } as ConversationItem;
        });

        if (!cancelled) {
          setConversations(mapped);
          if (!selectedId && mapped.length) setSelectedId(mapped[0].id);
        }
      } catch (e: any) {
        console.error('[covoit] loadConversations error:', e);
        Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible de charger les conversations." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadConversations();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Load messages for selected ride + subscribe realtime
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const loadMessages = async () => {
      if (!selectedId) {
        setMessages([]);
        return;
      }
      try {
        const { data, error } = (await supabase
          .from('ride_messages')
          .select('*')
          .eq('ride_id', selectedId)
          .order('created_at', { ascending: true })) as unknown as { data: RideMessageRow[] | null; error: any };
        if (error) throw error;
        if (!active) return;
        setMessages(
          (data || []).map((m) => ({
            id: m.id,
            text: m.content,
            sender: m.sender_id === user?.id ? 'me' : 'them',
            time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      } catch (e: any) {
        console.error('[covoit] loadMessages error:', e);
        Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible de charger les messages." });
      }

      // Realtime subscription
      channel = supabase
        .channel(`rt:ride_messages:${selectedId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ride_messages', filter: `ride_id=eq.${selectedId}` },
          (payload: { new?: RideMessageRow }) => {
            const m = payload.new;
            if (!m) return;
            setMessages((prev) => [
              ...prev,
              {
                id: m.id,
                text: m.content,
                sender: m.sender_id === user?.id ? 'me' : 'them',
                time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        )
        .subscribe();
    };
    loadMessages();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedId, user?.id]);

  const handleSend = useCallback(async () => {
    try {
      const content = newMessage.trim();
      if (!content || !selectedId || !user?.id) return;
      setNewMessage('');
      const { error } = await supabase
        .from('ride_messages')
        .insert({ ride_id: selectedId, sender_id: user.id, content });
      if (error) throw error;
    } catch (e: any) {
      console.error('[covoit] send message error:', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: "Échec de l'envoi du message." });
    }
  }, [newMessage, selectedId, user?.id]);

  const selectedConv = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}> 
        <Text style={styles.title}>Messages (Covoiturage)</Text>
        <Text style={styles.empty}>Veuillez vous connecter pour voir vos conversations.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Messages (Covoiturage)</Text>

        {/* Conversations list */}
        <View style={styles.conversationsCard}>
          {loading ? (
            <View style={styles.center}> 
              <ActivityIndicator color="#60a5fa" />
            </View>
          ) : conversations.length === 0 ? (
            <Text style={styles.empty}>Aucune conversation pour l'instant.</Text>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.conversationPill, selectedId === item.id && styles.conversationPillActive]}
                  onPress={() => setSelectedId(item.id)}
                >
                  <Text numberOfLines={1} style={styles.conversationTitle}>{item.title}</Text>
                  <Text style={styles.conversationSubtitle}>{item.subtitle}</Text>
                  {!!item.lastMessage?.text && (
                    <Text numberOfLines={1} style={styles.conversationLast}>
                      {item.lastMessage.time} · {item.lastMessage.text}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Selected conversation header */}
        {selectedConv ? (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{selectedConv.title}</Text>
            <Text style={styles.headerSub}>{selectedConv.subtitle}</Text>
          </View>
        ) : null}

        {/* Messages list */}
        <View style={styles.messagesCard}>
          {selectedId ? (
            <FlatList
              ref={messagesListRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => (
                <View style={[styles.messageRow, item.sender === 'me' ? styles.messageRowMe : styles.messageRowThem]}>
                  <View style={[styles.messageBubble, item.sender === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                  <Text style={styles.messageTime}>{item.time}</Text>
                </View>
              )}
              contentContainerStyle={{ padding: 12 }}
              onContentSizeChange={scrollToEnd}
            />
          ) : (
            <View style={styles.center}> 
              <Text style={styles.empty}>Sélectionnez une conversation ci-dessus.</Text>
            </View>
          )}
        </View>

        {/* Composer */}
        <View style={styles.composerBar}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={handleSend}
            editable={!!selectedId}
          />
          <TouchableOpacity style={[styles.sendBtn, !newMessage.trim() || !selectedId ? styles.sendBtnDisabled : null]} onPress={handleSend} disabled={!newMessage.trim() || !selectedId}>
            <Text style={styles.sendText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: 'white' },
  empty: { color: '#9ca3af' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  conversationsCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    minHeight: 86,
  },
  conversationPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    minWidth: 200,
  },
  conversationPillActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#0b1220',
  },
  conversationTitle: { color: '#e5e7eb', fontWeight: '600' },
  conversationSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  conversationLast: { color: '#cbd5e1', fontSize: 12, marginTop: 6 },

  header: { paddingHorizontal: 4 },
  headerTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '700' },
  headerSub: { color: '#94a3b8', marginTop: 2 },

  messagesCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageRow: { marginVertical: 6, maxWidth: '85%' },
  messageRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageRowThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  bubbleMe: { backgroundColor: '#2563eb' },
  bubbleThem: { backgroundColor: '#1f2937' },
  messageText: { color: '#fff' },
  messageTime: { color: '#94a3b8', fontSize: 12, marginTop: 4 },

  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  input: {
    flex: 1,
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendBtnDisabled: {
    backgroundColor: '#1f2937',
  },
  sendText: { color: 'white', fontWeight: '700' },
});