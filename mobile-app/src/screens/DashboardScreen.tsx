import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMissions } from '../hooks/useMissions';
import { useAuth } from '../contexts/AuthContext';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { data: missions, isLoading, refetch } = useMissions();

  const activeMissions = missions?.filter(m => m.status === 'in_progress') || [];
  const pendingMissions = missions?.filter(m => m.status === 'pending') || [];
  const completedToday = missions?.filter(m => {
    const today = new Date().toDateString();
    const missionDate = new Date(m.updated_at).toDateString();
    return m.status === 'completed' && missionDate === today;
  }) || [];

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const MissionCard = ({ mission }: { mission: any }) => (
    <TouchableOpacity style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <View style={[styles.statusBadge, getStatusStyle(mission.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(mission.status)]}>
            {getStatusLabel(mission.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.missionRef}>Réf: {mission.reference}</Text>
      {mission.pickup_address && (
        <Text style={styles.missionAddress} numberOfLines={1}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          {' '}{mission.pickup_address}
        </Text>
      )}
    </TouchableOpacity>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { backgroundColor: '#fef3c7' };
      case 'in_progress': return { backgroundColor: '#dbeafe' };
      case 'completed': return { backgroundColor: '#dcfce7' };
      default: return { backgroundColor: '#f3f4f6' };
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'pending': return { color: '#92400e' };
      case 'in_progress': return { color: '#1e40af' };
      case 'completed': return { color: '#166534' };
      default: return { color: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bonjour, {user?.email?.split('@')[0]} 👋
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Missions actives"
          value={activeMissions.length}
          icon="trending-up"
          color="#2563eb"
        />
        <StatCard
          title="En attente"
          value={pendingMissions.length}
          icon="time"
          color="#f59e0b"
        />
        <StatCard
          title="Terminées aujourd'hui"
          value={completedToday.length}
          icon="checkmark-circle"
          color="#10b981"
        />
      </View>

      {activeMissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Missions en cours</Text>
          {activeMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </View>
      )}

      {pendingMissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Missions à démarrer</Text>
          {pendingMissions.slice(0, 3).map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </View>
      )}
    </ScrollView>
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
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  missionRef: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  missionAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});