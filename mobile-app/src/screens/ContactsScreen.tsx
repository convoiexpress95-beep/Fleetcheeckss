import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Contact } from '../types';

export const ContactsScreen: React.FC = () => {
  const { user } = useAuth();

  const { data: contacts, isLoading, refetch } = useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'declined': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'declined': return 'Refusé';
      default: return status;
    }
  };

  const renderContactItem = ({ item: contact }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {contact.name || contact.email.split('@')[0]}
          </Text>
          <Text style={styles.contactEmail}>{contact.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contact.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(contact.status)}</Text>
        </View>
      </View>

      {contact.status === 'active' && (
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEmail(contact.email)}
          >
            <Ionicons name="mail-outline" size={20} color="#2563eb" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCall(contact.email)} // Assuming phone might be stored differently
          >
            <Ionicons name="call-outline" size={20} color="#10b981" />
            <Text style={styles.actionText}>Appeler</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.contactMeta}>
        <Ionicons name="time-outline" size={14} color="#6b7280" />
        <Text style={styles.metaText}>
          Ajouté le {new Date(contact.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>
          Vos contacts professionnels
        </Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Aucun contact</Text>
            <Text style={styles.emptyText}>
              Vos contacts seront ajoutés depuis l'interface web
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});