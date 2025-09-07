import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useRideMessages, useSendRideMessage, useMarkRideThreadRead } from '../hooks/useRides';
import { useThemedStyles } from '../ui/useThemedStyles';
import { useAuth } from '../contexts/AuthContext';

type ParamList = { RideChat: { ride_id: string; recipient_id: string | null } };

const RideChatScreen: React.FC = () => {
  const { styles: t, colors } = useThemedStyles();
  const { user } = useAuth();
  const route = useRoute<RouteProp<ParamList, 'RideChat'>>();
  const { ride_id, recipient_id } = route.params || {} as any;
  const { data: messages = [] } = useRideMessages(ride_id);
  const send = useSendRideMessage();
  const [text, setText] = useState('');
  const markRead = useMarkRideThreadRead();

  useEffect(() => {
    if (ride_id && recipient_id) {
      markRead.mutate({ ride_id, peer_user_id: recipient_id });
    }
  }, [ride_id, recipient_id]);

  const onSend = () => {
    if (!text.trim()) return;
    send.mutate({ ride_id, recipient_id: recipient_id || null, body: text.trim() });
    setText('');
  };

  return (
    <KeyboardAvoidingView style={t.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <FlatList
        style={{ flex: 1, padding: 16 }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => {
          const mine = item.sender_id === user?.id;
          return (
            <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? colors.primary : colors.surface, padding: 10, borderRadius: 10, marginBottom: 8, maxWidth: '80%' }}>
              <Text style={{ color: mine ? '#fff' : colors.text }}>{item.body}</Text>
              <Text style={{ color: mine ? '#e5e7eb' : colors.textMuted, fontSize: 10, marginTop: 4 }}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.surfaceBorder }}>
        <TextInput value={text} onChangeText={setText} placeholder="Votre message…" placeholderTextColor={colors.textMuted} style={[t.input, { flex: 1 }]} />
        <TouchableOpacity onPress={onSend} disabled={send.isPending} style={{ backgroundColor: send.isPending ? '#93c5fd' : colors.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RideChatScreen;
