import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// Hook Supabase inspections
import { useInspectionMissions } from '../hooks/useInspections';

interface InspectionStats {
  missionsCount: number;
  contactsCount: number;
  completedInspections: number;
  pendingInspections: number;
  weeklyMissions: Array<{
    day: string;
    missions: number;
    inspections: number;
  }>;
  topDrivers: Array<{
    id: string;
    name: string;
    completedMissions: number;
    rating: number;
  }>;
}

interface Mission {
  id: string;
  title: string;
  reference: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  description: string;
  donor_id: string | null;
  driver_id: string | null;
  vehicle: {
    brand: string;
    model: string;
    plate: string;
  };
  departure: {
    address: string;
    city: string;
  };
  arrival: {
    address: string;
    city: string;
  };
  inspections: {
    departure: boolean;
    arrival: boolean;
    gpsTracking: boolean;
  };
}

const { width } = Dimensions.get('window');

export default function InspectionsScreenComplete({ navigation }: any) {
  const { missions: dbMissions, isLoading, error } = useInspectionMissions();
  const [stats, setStats] = useState<InspectionStats | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'inspections'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (isLoading) { setLoading(true); return; }
    if (error) { setLoading(false); return; }
    // Adapter les missions issues du hook au format local (déjà aligné dans le hook)
    // @ts-ignore - types compatibles
    setMissions(dbMissions as any);
    // Stats simples basées sur données réelles
    const completed = (dbMissions || []).filter((m: any) => m.status === 'completed').length;
    const pending = (dbMissions || []).filter((m: any) => m.status === 'pending').length;
    setStats({
      missionsCount: dbMissions?.length || 0,
      contactsCount: 0,
      completedInspections: completed,
      pendingInspections: pending,
      weeklyMissions: [
        { day: 'Lun', missions: 0, inspections: 0 },
        { day: 'Mar', missions: 0, inspections: 0 },
        { day: 'Mer', missions: 0, inspections: 0 },
        { day: 'Jeu', missions: 0, inspections: 0 },
        { day: 'Ven', missions: 0, inspections: 0 },
        { day: 'Sam', missions: 0, inspections: 0 },
        { day: 'Dim', missions: 0, inspections: 0 },
      ],
      topDrivers: [],
    });
    setLoading(false);
  }, [dbMissions, isLoading, error]);

  const filteredMissions = missions.filter(mission => {
    if (filterStatus === 'all') return true;
    return mission.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#06b6d4';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const handleCreateMission = () => {
    Alert.alert(
      'Nouvelle mission',
      'Créer une nouvelle mission d\'inspection ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer',
          onPress: () => {
            setShowCreateModal(true);
          }
        }
      ]
    );
  };

  const handleViewMission = (mission: Mission) => {
    Alert.alert(
      mission.title,
      `Référence: ${mission.reference}\nStatut: ${getStatusLabel(mission.status)}\n\nInspections:\n• Départ: ${mission.inspections.departure ? 'Oui' : 'Non'}\n• Arrivée: ${mission.inspections.arrival ? 'Oui' : 'Non'}\n• GPS: ${mission.inspections.gpsTracking ? 'Oui' : 'Non'}`,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Voir détails', onPress: () => {} }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Chargement des inspections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Inspections</Text>
          <Text style={styles.headerSubtitle}>Gestionnaire de missions FleetCheck</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={handleCreateMission}
        >
          <Feather name="plus" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <MaterialCommunityIcons 
            name="view-dashboard" 
            size={16} 
            color={activeTab === 'dashboard' ? '#06b6d4' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Tableau de bord
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'missions' && styles.activeTab]}
          onPress={() => setActiveTab('missions')}
        >
          <Feather 
            name="truck" 
            size={16} 
            color={activeTab === 'missions' ? '#06b6d4' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'missions' && styles.activeTabText]}>
            Missions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inspections' && styles.activeTab]}
          onPress={() => setActiveTab('inspections')}
        >
          <MaterialCommunityIcons 
            name="clipboard-check" 
            size={16} 
            color={activeTab === 'inspections' ? '#06b6d4' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'inspections' && styles.activeTabText]}>
            Rapports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="truck" size={24} color="#06b6d4" />
                  <Text style={styles.statValue}>{stats?.missionsCount || 0}</Text>
                  <Text style={styles.statLabel}>Missions</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#10b981" />
                  <Text style={styles.statValue}>{stats?.contactsCount || 0}</Text>
                  <Text style={styles.statLabel}>Contacts</Text>
                </View>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="clipboard-check" size={24} color="#f59e0b" />
                  <Text style={styles.statValue}>{stats?.completedInspections || 0}</Text>
                  <Text style={styles.statLabel}>Inspections OK</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="clipboard-alert" size={24} color="#ef4444" />
                  <Text style={styles.statValue}>{stats?.pendingInspections || 0}</Text>
                  <Text style={styles.statLabel}>En attente</Text>
                </View>
              </View>
            </View>

            {/* Weekly Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Activité hebdomadaire</Text>
                <Text style={styles.chartSubtitle}>Missions et inspections</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartData}>
                  {stats?.weeklyMissions.map((item, index) => (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.bar, 
                            { height: (item.missions / 15) * 80, backgroundColor: '#06b6d4' }
                          ]} 
                        />
                        <View 
                          style={[
                            styles.bar, 
                            { height: (item.inspections / 20) * 80, backgroundColor: '#10b981', marginLeft: 4 }
                          ]} 
                        />
                      </View>
                      <Text style={styles.barLabel}>{item.day}</Text>
                      <Text style={styles.barValue}>{item.missions}M</Text>
                      <Text style={styles.barValue}>{item.inspections}I</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Top Drivers */}
            <View style={styles.driversContainer}>
              <Text style={styles.driversTitle}>Meilleurs convoyeurs</Text>
              {stats?.topDrivers.map((driver, index) => (
                <View key={driver.id} style={styles.driverCard}>
                  <View style={styles.driverRank}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                  </View>
                  
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverInitials}>
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <View style={styles.driverStats}>
                      <Text style={styles.driverMissions}>
                        {driver.completedMissions} missions
                      </Text>
                      <View style={styles.driverRating}>
                        <Feather name="star" size={12} color="#f59e0b" />
                        <Text style={styles.ratingText}>{driver.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'missions' && (
          <>
            {/* Filter Bar */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
                  onPress={() => setFilterStatus('all')}
                >
                  <Text style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>
                    Toutes ({missions.length})
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'pending' && styles.activeFilter]}
                  onPress={() => setFilterStatus('pending')}
                >
                  <Text style={[styles.filterText, filterStatus === 'pending' && styles.activeFilterText]}>
                    En attente ({missions.filter(m => m.status === 'pending').length})
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'in_progress' && styles.activeFilter]}
                  onPress={() => setFilterStatus('in_progress')}
                >
                  <Text style={[styles.filterText, filterStatus === 'in_progress' && styles.activeFilterText]}>
                    En cours ({missions.filter(m => m.status === 'in_progress').length})
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterButton, filterStatus === 'completed' && styles.activeFilter]}
                  onPress={() => setFilterStatus('completed')}
                >
                  <Text style={[styles.filterText, filterStatus === 'completed' && styles.activeFilterText]}>
                    Terminées ({missions.filter(m => m.status === 'completed').length})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Missions List */}
            <View style={styles.missionsList}>
              {filteredMissions.map((mission) => (
                <TouchableOpacity 
                  key={mission.id} 
                  style={styles.missionCard}
                  onPress={() => handleViewMission(mission)}
                >
                  <View style={styles.missionHeader}>
                    <View style={styles.missionTitleContainer}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <Text style={styles.missionReference}>{mission.reference}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(mission.status)}20` }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(mission.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(mission.status) }]}>
                        {getStatusLabel(mission.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.missionRoute}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
                      <Text style={styles.routeText}>{mission.departure.city}</Text>
                    </View>
                    <View style={styles.routeArrow}>
                      <Feather name="arrow-right" size={14} color="#9ca3af" />
                    </View>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
                      <Text style={styles.routeText}>{mission.arrival.city}</Text>
                    </View>
                  </View>

                  <View style={styles.missionDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="car" size={14} color="#9ca3af" />
                      <Text style={styles.detailText}>
                        {mission.vehicle.brand} {mission.vehicle.model}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Feather name="calendar" size={14} color="#9ca3af" />
                      <Text style={styles.detailText}>
                        {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.inspectionFlags}>
                    {mission.inspections.departure && (
                      <View style={styles.inspectionFlag}>
                        <MaterialCommunityIcons name="clipboard-check" size={12} color="#10b981" />
                        <Text style={styles.flagText}>Départ</Text>
                      </View>
                    )}
                    {mission.inspections.arrival && (
                      <View style={styles.inspectionFlag}>
                        <MaterialCommunityIcons name="clipboard-check" size={12} color="#f59e0b" />
                        <Text style={styles.flagText}>Arrivée</Text>
                      </View>
                    )}
                    {mission.inspections.gpsTracking && (
                      <View style={styles.inspectionFlag}>
                        <MaterialCommunityIcons name="map-marker" size={12} color="#06b6d4" />
                        <Text style={styles.flagText}>GPS</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {filteredMissions.length === 0 && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="clipboard-text" size={48} color="#6b7280" />
                  <Text style={styles.emptyTitle}>Aucune mission</Text>
                  <Text style={styles.emptyDescription}>
                    {filterStatus === 'all' 
                      ? 'Aucune mission trouvée'
                      : `Aucune mission "${getStatusLabel(filterStatus)}"`
                    }
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === 'inspections' && (
          <View style={styles.inspectionsContent}>
            <View style={styles.inspectionStats}>
              <Text style={styles.inspectionsTitle}>Rapports d'inspection</Text>
              
              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <MaterialCommunityIcons name="file-chart" size={20} color="#06b6d4" />
                  <Text style={styles.reportTitle}>Rapport mensuel</Text>
                </View>
                <Text style={styles.reportDescription}>
                  Synthèse des inspections du mois en cours
                </Text>
                <TouchableOpacity style={styles.reportButton}>
                  <Text style={styles.reportButtonText}>Générer</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <MaterialCommunityIcons name="file-table" size={20} color="#10b981" />
                  <Text style={styles.reportTitle}>Export données</Text>
                </View>
                <Text style={styles.reportDescription}>
                  Export Excel de toutes les inspections
                </Text>
                <TouchableOpacity style={styles.reportButton}>
                  <Text style={styles.reportButtonText}>Exporter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Mission Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle mission</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowCreateModal(false)}
              >
                <Feather name="x" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Titre de la mission</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Transport BMW X5"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Description de la mission..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Options d'inspection</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity style={styles.checkboxItem}>
                    <View style={[styles.checkbox, styles.checkboxActive]}>
                      <Feather name="check" size={12} color="white" />
                    </View>
                    <Text style={styles.checkboxText}>Inspection départ</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.checkboxItem}>
                    <View style={[styles.checkbox, styles.checkboxActive]}>
                      <Feather name="check" size={12} color="white" />
                    </View>
                    <Text style={styles.checkboxText}>Inspection arrivée</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.checkboxItem}>
                    <View style={styles.checkbox}>
                    </View>
                    <Text style={styles.checkboxText}>Tracking GPS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  setShowCreateModal(false);
                  Alert.alert('Mission créée', 'La nouvelle mission a été créée avec succès !');
                }}
              >
                <Text style={styles.createButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#1e293b',
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
    borderRadius: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#06b6d4',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  chartData: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 40,
  },
  barContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  barValue: {
    color: '#9ca3af',
    fontSize: 9,
  },
  driversContainer: {
    margin: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  driversTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  driverRank: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverMissions: {
    color: '#9ca3af',
    fontSize: 12,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  activeFilter: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#06b6d4',
  },
  missionsList: {
    paddingHorizontal: 16,
  },
  missionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  missionReference: {
    color: '#9ca3af',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  missionRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  routeArrow: {
    marginHorizontal: 12,
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
  inspectionFlags: {
    flexDirection: 'row',
    gap: 8,
  },
  inspectionFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  flagText: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  inspectionsContent: {
    padding: 16,
  },
  inspectionStats: {
    gap: 16,
  },
  inspectionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reportTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reportDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 12,
  },
  reportButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  checkboxText: {
    color: '#d1d5db',
    fontSize: 14,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.5)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    flex: 2,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});