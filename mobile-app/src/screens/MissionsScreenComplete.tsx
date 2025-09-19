import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMissions, useUpdateMissionStatus } from '../hooks/useMissions';
import type { Mission } from '../types';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function MissionsScreenComplete({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'all' | 'to_start' | 'in_progress' | 'completed'>('all');
  const { data: missions = [], isLoading, isError, refetch, isRefetching } = useMissions();
  const { user } = useAuth();
  const { mutate: updateStatus } = useUpdateMissionStatus();

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('missions-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions', filter: `driver_id=eq.${user.id}` }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, refetch]);

  const onRefresh = () => { refetch(); };

  // Filtrage par onglets
  const filtered = missions.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'to_start') return m.status === 'pending' || m.status === 'inspection_start';
    if (activeTab === 'in_progress') return m.status === 'in_progress';
    if (activeTab === 'completed') return m.status === 'completed';
    return true;
  });

  const counts = {
    all: missions.length,
    to_start: missions.filter(m => m.status === 'pending' || m.status === 'inspection_start').length,
    in_progress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
  };

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'pending':
      case 'inspection_start':
        return '#f59e0b';
      case 'in_progress':
        return '#06b6d4';
      case 'inspection_end':
      case 'cost_validation':
        return '#8b5cf6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: Mission['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'inspection_start': return 'Inspection départ';
      case 'in_progress': return 'En cours';
      case 'inspection_end': return 'Inspection arrivée';
      case 'cost_validation': return 'Frais à valider';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnue';
    }
  };

  const handleStartMission = (mission: Mission) => {
    Alert.alert(
      'Démarrer la mission',
      `Êtes-vous prêt à démarrer "${mission.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: () => updateStatus({ missionId: mission.id, status: 'in_progress' }),
        },
      ]
    );
  };

  const handleCompleteDelivery = (mission: Mission) => {
    Alert.alert(
      'Finaliser la mission',
      `Confirmer la finalisation de "${mission.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => updateStatus({ missionId: mission.id, status: 'completed' }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#06b6d4" size="large" />
        <Text style={{ color: '#cbd5e1', marginTop: 12 }}>Chargement des missions...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', padding: 16 }}>
        <Text style={{ color: '#fca5a5', marginBottom: 12 }}>Erreur lors du chargement des missions.</Text>
        <TouchableOpacity onPress={() => refetch()} style={{ backgroundColor: '#06b6d4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Missions Actives</Text>
          <Text style={styles.headerSubtitle}>Suivez vos missions en cours</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={onRefresh}>
          <Feather name="refresh-cw" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statCard}>
            <Feather name="briefcase" size={20} color="#06b6d4" />
            <Text style={styles.statValue}>{counts.all}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <Feather name="play" size={20} color="#f59e0b" />
            <Text style={styles.statValue}>{counts.to_start}</Text>
            <Text style={styles.statLabel}>À démarrer</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="navigation" size={20} color="#06b6d4" />
            <Text style={styles.statValue}>{counts.in_progress}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          
          <View style={styles.statCard}>
            <Feather name="check-circle" size={20} color="#10b981" />
            <Text style={styles.statValue}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Terminées</Text>
          </View>
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Toutes ({counts.all})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'to_start' && styles.activeTab]}
            onPress={() => setActiveTab('to_start')}
          >
            <Text style={[styles.tabText, activeTab === 'to_start' && styles.activeTabText]}>
              À démarrer ({counts.to_start})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'in_progress' && styles.activeTab]}
            onPress={() => setActiveTab('in_progress')}
          >
            <Text style={[styles.tabText, activeTab === 'in_progress' && styles.activeTabText]}>
              En cours ({counts.in_progress})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Terminées ({counts.completed})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Mission List */}
      <ScrollView
        style={styles.missionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#06b6d4" />}
      >
        {filtered.map((mission) => (
          <View key={mission.id} style={styles.missionCard}>
            {/* Mission Header */}
            <View style={styles.missionHeader}>
              <View style={styles.missionTitleContainer}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(mission.status)}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(mission.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(mission.status) }]}>
                      {getStatusLabel(mission.status)}
                    </Text>
                  </View>
                  {/* enlevé: badge urgence non disponible dans le type Mission */}
                </View>
              </View>
            </View>

            {/* Route Info */}
            <View style={styles.missionRoute}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCity}>Départ</Text>
                  <Text style={styles.routeAddress}>{mission.pickup_address || '-'}</Text>
                </View>
              </View>
              <View style={styles.routeArrow}>
                <Feather name="arrow-right" size={14} color="#9ca3af" />
              </View>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCity}>Arrivée</Text>
                  <Text style={styles.routeAddress}>{mission.delivery_address || '-'}</Text>
                </View>
              </View>
            </View>

            {/* Vehicle */}
            <View style={styles.missionDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="car" size={14} color="#9ca3af" />
                <Text style={styles.detailText}>
                  {mission.vehicle_brand || ''} {mission.vehicle_model || ''} {mission.vehicle_year ? `(${mission.vehicle_year})` : ''}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="hash" size={14} color="#9ca3af" />
                <Text style={styles.detailText}>{mission.reference}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {(mission.status === 'pending' || mission.status === 'inspection_start') && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#06b6d4' }]} onPress={() => handleStartMission(mission)}>
                  <Feather name="play" size={14} color="#fff" />
                  <Text style={styles.actionText}>Démarrer</Text>
                </TouchableOpacity>
              )}
              {mission.status === 'in_progress' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]} onPress={() => handleCompleteDelivery(mission)}>
                  <Feather name="check" size={14} color="#fff" />
                  <Text style={styles.actionText}>Terminer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text" size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>Aucune mission</Text>
            <Text style={styles.emptyDescription}>
              {activeTab === 'all' ? 'Aucune mission trouvée' : 'Aucune mission dans cet onglet'}
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  headerAction: {
    padding: 8,
  },
  statsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  tabsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#06b6d4',
  },
  missionsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  missionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  missionHeader: {
    marginBottom: 16,
  },
  missionTitleContainer: {
    flex: 1,
  },
  missionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  // Styles ajoutés pour l'affichage de la route et des actions
  missionRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    gap: 12,
  },
  routePoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeArrow: {
    paddingHorizontal: 6,
  },
  routeCity: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  routeAddress: {
    color: '#9ca3af',
    fontSize: 12,
  },
  missionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});