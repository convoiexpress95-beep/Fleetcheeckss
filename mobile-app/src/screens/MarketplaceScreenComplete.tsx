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
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMarketplaceMissions } from '../hooks/useMarketplace';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

interface Mission {
  id: string;
  titre: string;
  ville_depart: string;
  ville_arrivee: string;
  prix_propose: number;
  statut: string;
  date_mission: string;
  vehicule_requis?: string;
  description?: string;
  client?: {
    company_name: string;
  };
}

export default function MarketplaceScreenComplete({ navigation }: any) {
  const { user } = useAuth();
  const { missions: dbMissions, isLoading, error, refetch } = useMarketplaceMissions();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalMissions: 0,
    assignedMissions: 0,
    convoyeurs: 156,
    averageRating: 4.9
  });

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
    if (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de charger les missions du marketplace');
      return;
    }
    const mapped: Mission[] = (dbMissions || []).map((m: any) => ({
      id: m.id,
      titre: m.titre || 'Mission marketplace',
      ville_depart: m.ville_depart || '-',
      ville_arrivee: m.ville_arrivee || '-',
      prix_propose: m.prix_propose ?? 0,
      statut: m.statut || 'available',
      date_mission: m.date_depart || m.created_at || new Date().toISOString(),
      vehicule_requis: m.vehicule_requis || undefined,
      description: m.description || undefined,
    }));

    setMissions(mapped);
    setStats((s) => ({
      ...s,
      totalMissions: mapped.length,
      assignedMissions: mapped.filter(x => x.statut !== 'available').length,
    }));
    setLoading(false);
  }, [dbMissions, isLoading, error]);

  const filteredMissions = missions.filter(mission =>
    mission.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.ville_depart.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.ville_arrivee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMakeOffer = (mission: Mission) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour envoyer une offre.');
      return;
    }
    Alert.alert(
      'Faire une offre',
      `Souhaitez-vous proposer ${mission.prix_propose}€ pour "${mission.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            try {
              const { error } = await supabase.from('marketplace_devis').insert({
                mission_id: mission.id,
                convoyeur_id: user.id,
                prix_propose: mission.prix_propose || 0,
                message: `Offre rapide depuis mobile pour ${mission.titre}`,
              }).select('*').single();
              if (error) throw error;
              Alert.alert('Succès', 'Votre offre a été envoyée avec succès.');
            } catch (e: any) {
              Alert.alert('Erreur', e.message || 'Impossible d\'envoyer l\'offre');
            }
          }
        }
      ]
    );
  };

  const filterOptions = [
    'Urgent',
    'Berline',
    'SUV',
    'Véhicule de luxe',
    'Paris',
    'Lyon',
    'Marseille',
    'Lille'
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Chargement des missions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.brandSection}>
            <LinearGradient 
              colors={['#06b6d4', '#0891b2']} 
              style={styles.brandIcon}
            >
              <Text style={styles.brandLetter}>F</Text>
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>FleetMarket</Text>
              <Text style={styles.brandSubtitle}>Marketplace</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={20} color="#d1d5db" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="message-circle" size={20} color="#d1d5db" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient 
                colors={['#06b6d4', '#0891b2']} 
                style={styles.profileIcon}
              >
                <Feather name="user" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <Feather name="search" size={16} color="#06b6d4" />
            <Text style={[styles.navText, styles.navTextActive]}>Accueil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Feather name="briefcase" size={16} color="#9ca3af" />
            <Text style={styles.navText}>Toutes les missions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Feather name="user-check" size={16} color="#9ca3af" />
            <Text style={styles.navText}>Mes offres</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Feather name="activity" size={16} color="#9ca3af" />
            <Text style={styles.navText}>Suivi</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par ville, type de véhicule..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Feather name="filter" size={18} color="#06b6d4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <LinearGradient 
          colors={['rgba(30, 41, 59, 0.3)', 'rgba(15, 23, 42, 0.3)']} 
          style={styles.statsContainer}
        >
          <Text style={styles.statsTitle}>Missions disponibles</Text>
          <Text style={styles.statsSubtitle}>
            Trouvez votre prochaine mission de convoyage
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.statIcon}>
                <Feather name="briefcase" size={16} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>{stats.totalMissions}</Text>
              <Text style={styles.statLabel}>Missions</Text>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.statIcon}>
                <Feather name="users" size={16} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>{stats.convoyeurs}</Text>
              <Text style={styles.statLabel}>Convoyeurs</Text>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statIcon}>
                <Feather name="star" size={16} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.statIcon}>
                <Feather name="trending-up" size={16} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>+12%</Text>
              <Text style={styles.statLabel}>Cette semaine</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Mission List */}
        <View style={styles.missionsList}>
          {filteredMissions.map((mission) => (
            <LinearGradient
              key={mission.id}
              colors={['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.3)']}
              style={styles.missionCard}
            >
              <View style={styles.missionHeader}>
                <View style={styles.missionTitleContainer}>
                  <Text style={styles.missionTitle}>{mission.titre}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                      {mission.statut === 'available' ? 'Ouverte' : 'En négociation'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.favoriteButton}>
                  <Feather name="heart" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#10b981" />
                  <Text style={styles.routeText}>{mission.ville_depart}</Text>
                </View>
                
                <View style={styles.routeArrow}>
                  <Feather name="arrow-right" size={16} color="#06b6d4" />
                </View>
                
                <View style={styles.routeItem}>
                  <MaterialCommunityIcons name="map-marker-check" size={16} color="#ef4444" />
                  <Text style={styles.routeText}>{mission.ville_arrivee}</Text>
                </View>
              </View>

              <View style={styles.missionDetails}>
                <View style={styles.detailItem}>
                  <Feather name="calendar" size={14} color="#9ca3af" />
                  <Text style={styles.detailText}>
                    {new Date(mission.date_mission).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                
                {mission.vehicule_requis && (
                  <View style={styles.detailItem}>
                    <Feather name="truck" size={14} color="#9ca3af" />
                    <Text style={styles.detailText}>{mission.vehicule_requis}</Text>
                  </View>
                )}
                
                {mission.client?.company_name && (
                  <View style={styles.detailItem}>
                    <Feather name="user" size={14} color="#9ca3af" />
                    <Text style={styles.detailText}>{mission.client.company_name}</Text>
                  </View>
                )}
              </View>

              <View style={styles.missionFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Prix proposé</Text>
                  <Text style={styles.priceValue}>{mission.prix_propose}€</Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Détails</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.offerButton}
                    onPress={() => handleMakeOffer(mission)}
                  >
                    <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.offerButtonGradient}>
                      <Feather name="send" size={14} color="white" />
                      <Text style={styles.offerButtonText}>Offre</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          ))}
        </View>

        {filteredMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>Aucune mission trouvée</Text>
            <Text style={styles.emptyDescription}>
              Essayez de modifier vos critères de recherche
            </Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterOptions}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOption,
                    selectedFilters.includes(filter) && styles.filterOptionSelected
                  ]}
                  onPress={() => toggleFilter(filter)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.includes(filter) && styles.filterOptionTextSelected
                  ]}>
                    {filter}
                  </Text>
                  {selectedFilters.includes(filter) && (
                    <Feather name="check" size={16} color="#06b6d4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSelectedFilters([])}
              >
                <Text style={styles.clearButtonText}>Effacer tout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.applyButtonGradient}>
                  <Text style={styles.applyButtonText}>Appliquer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.fabGradient}>
          <Feather name="plus" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandLetter: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  brandName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  navText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 6,
  },
  navTextActive: {
    color: '#06b6d4',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    padding: 4,
  },
  statsContainer: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statsTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    width: '22%',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  missionsList: {
    paddingHorizontal: 24,
  },
  missionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  missionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 8,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  routeArrow: {
    marginHorizontal: 12,
  },
  missionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#d1d5db',
    fontSize: 13,
    marginLeft: 6,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    color: '#06b6d4',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.5)',
  },
  detailsButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  offerButton: {
    borderRadius: 8,
  },
  offerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  offerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  refreshButtonText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterOptions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  filterOptionText: {
    color: '#d1d5db',
    fontSize: 16,
  },
  filterOptionTextSelected: {
    color: '#06b6d4',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.5)',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.5)',
  },
  clearButtonText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#06b6d4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});