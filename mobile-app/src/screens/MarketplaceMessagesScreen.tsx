import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface Conversation {
  id: string;
  participant: {
    name: string;
    company?: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  missionTitle?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  isCurrentUser: boolean;
  attachment?: string;
}

export default function MarketplaceMessagesScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participant: {
          name: 'BMW Concession Paris',
          company: 'BMW France',
        },
        lastMessage: {
          content: 'Parfait, merci pour votre offre. Nous validons le transport pour demain.',
          timestamp: '2025-09-18T14:30:00Z',
          isRead: false
        },
        unreadCount: 2,
        missionTitle: 'Transport BMW X3 - Paris vers Lyon'
      },
      {
        id: '2',
        participant: {
          name: 'Mercedes Elite',
          company: 'Mercedes-Benz',
        },
        lastMessage: {
          content: 'Le véhicule est prêt pour la prise en charge.',
          timestamp: '2025-09-18T11:15:00Z',
          isRead: true
        },
        unreadCount: 0,
        missionTitle: 'Livraison Mercedes - Marseille vers Nice'
      },
      {
        id: '3',
        participant: {
          name: 'Jean Dupont',
          company: 'Convoyeur',
        },
        lastMessage: {
          content: 'Je suis disponible pour cette mission, quel est votre tarif ?',
          timestamp: '2025-09-17T16:45:00Z',
          isRead: true
        },
        unreadCount: 0,
        missionTitle: 'Convoyage Audi A6 - Toulouse vers Bordeaux'
      }
    ];

    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  const loadMessages = (conversationId: string) => {
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Bonjour, je suis intéressé par votre mission de transport.',
        timestamp: '2025-09-18T10:00:00Z',
        senderId: 'user1',
        senderName: 'Vous',
        isCurrentUser: true
      },
      {
        id: '2',
        content: 'Parfait ! Pouvez-vous me confirmer votre disponibilité pour demain ?',
        timestamp: '2025-09-18T10:15:00Z',
        senderId: 'client1',
        senderName: 'BMW Concession Paris',
        isCurrentUser: false
      },
      {
        id: '3',
        content: 'Oui, je suis disponible. Je peux prendre en charge le véhicule à 9h.',
        timestamp: '2025-09-18T10:30:00Z',
        senderId: 'user1',
        senderName: 'Vous',
        isCurrentUser: true
      },
      {
        id: '4',
        content: 'Parfait, merci pour votre offre. Nous validons le transport pour demain.',
        timestamp: '2025-09-18T14:30:00Z',
        senderId: 'client1',
        senderName: 'BMW Concession Paris',
        isCurrentUser: false
      }
    ];

    setMessages(mockMessages);
    setSelectedConversation(conversationId);
  };

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      senderId: 'user1',
      senderName: 'Vous',
      isCurrentUser: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#d1d5db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="edit" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!selectedConversation ? (
          // Conversation List
          <View style={styles.conversationsList}>
            <Text style={styles.sectionTitle}>Conversations récentes</Text>
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.conversationItem}
                  onPress={() => loadMessages(item.id)}
                >
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.participant.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    {item.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text style={styles.participantName}>
                        {item.participant.name}
                      </Text>
                      <Text style={styles.timestamp}>
                        {formatDate(item.lastMessage.timestamp)}
                      </Text>
                    </View>

                    {item.missionTitle && (
                      <Text style={styles.missionTitle} numberOfLines={1}>
                        📋 {item.missionTitle}
                      </Text>
                    )}

                    <Text 
                      style={[
                        styles.lastMessage,
                        !item.lastMessage.isRead && styles.unreadMessage
                      ]} 
                      numberOfLines={2}
                    >
                      {item.lastMessage.content}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          // Chat Interface
          <View style={styles.chatContainer}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                style={styles.backToChatButton}
                onPress={() => setSelectedConversation(null)}
              >
                <Feather name="arrow-left" size={20} color="#d1d5db" />
              </TouchableOpacity>
              
              <View style={styles.chatHeaderContent}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>
                    {conversations.find(c => c.id === selectedConversation)?.participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.chatParticipantName}>
                    {conversations.find(c => c.id === selectedConversation)?.participant.name}
                  </Text>
                  <Text style={styles.chatParticipantStatus}>En ligne</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.chatAction}>
                <Feather name="phone" size={18} color="#d1d5db" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageContainer,
                    item.isCurrentUser ? styles.sentMessage : styles.receivedMessage
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      item.isCurrentUser ? styles.sentBubble : styles.receivedBubble
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      item.isCurrentUser ? styles.sentText : styles.receivedText
                    ]}>
                      {item.content}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              )}
            />

            {/* Message Input */}
            <View style={styles.messageInput}>
              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachButton}>
                  <Feather name="paperclip" size={20} color="#9ca3af" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.textInput}
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Tapez votre message..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={500}
                />
                
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    messageText.trim() && styles.sendButtonActive
                  ]}
                  onPress={sendMessage}
                  disabled={!messageText.trim()}
                >
                  <Feather 
                    name="send" 
                    size={18} 
                    color={messageText.trim() ? "#06b6d4" : "#9ca3af"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#d1d5db',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerAction: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginRight: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#9ca3af',
    fontSize: 12,
  },
  missionTitle: {
    color: '#06b6d4',
    fontSize: 13,
    marginBottom: 4,
  },
  lastMessage: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 18,
  },
  unreadMessage: {
    color: 'white',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  backToChatButton: {
    padding: 8,
    marginRight: 12,
  },
  chatHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  smallAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chatParticipantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatParticipantStatus: {
    color: '#10b981',
    fontSize: 12,
  },
  chatAction: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  sentBubble: {
    backgroundColor: '#06b6d4',
  },
  receivedBubble: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentText: {
    color: 'white',
  },
  receivedText: {
    color: '#d1d5db',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginHorizontal: 16,
  },
  messageInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderRadius: 16,
  },
});