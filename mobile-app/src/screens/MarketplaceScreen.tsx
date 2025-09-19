import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

interface MarketplaceMission {
  id: string;
  title: string;
  description: string;
  pickup_location: string;
  delivery_location: string;
  vehicle_type: string;
  urgency: 'low' | 'medium' | 'high';
  budget_min: number;
  budget_max: number;
  deadline: string;
  company_name: string;
  company_rating: number;
  proposals_count: number;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
}

interface Proposal {
  id: string;
  mission_id: string;
  contractor_name: string;
  contractor_rating: number;
  proposed_price: number;
  estimated_duration: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const MarketplaceScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'my_missions' | 'proposals'>('browse');
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [proposalModalVisible, setProposalModalVisible] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MarketplaceMission | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data - à remplacer par de vraies données depuis Supabase
  const [availableMissions] = useState<MarketplaceMission[]>([
    {
      id: '1',
      title: 'Convoyage urgent Paris → Lyon',
      description: 'Convoyage d\'une BMW X5 neuve, manipulation soigneuse requise',
      pickup_location: 'Paris 15e (75015)',
      delivery_location: 'Lyon Part-Dieu (69003)',
      vehicle_type: 'SUV Premium',
      urgency: 'high',
      budget_min: 180,
      budget_max: 250,
      deadline: '2025-09-20T18:00:00Z',
      company_name: 'AutoLux Distribution',
      company_rating: 4.7,
      proposals_count: 3,
      status: 'open',
      created_at: '2025-09-18T10:00:00Z'
    },
    {
      id: '2', 
      title: 'Transport véhicules de société',
      description: '3 véhicules utilitaires à convoyer pour renouvellement de flotte',
      pickup_location: 'Marseille Centre (13001)',
      delivery_location: 'Nice Aéroport (06200)',
      vehicle_type: 'Utilitaire',
      urgency: 'medium',
      budget_min: 120,
      budget_max: 180,
      deadline: '2025-09-25T12:00:00Z',
      company_name: 'FleetPro Services',
      company_rating: 4.3,
      proposals_count: 7,
      status: 'open',
      created_at: '2025-09-17T14:30:00Z'
    }
  ]);

  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    pickup_location: '',
    delivery_location: '',
    vehicle_type: '',
    budget_min: 0,
    budget_max: 0,
    deadline: ''
  });

  const [newProposal, setNewProposal] = useState({
    proposed_price: 0,
    estimated_duration: '',
    message: ''
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Normal';
      case 'low': return 'Flexible';
      default: return urgency;
    }
  };

  const handlePublishMission = () => {
    if (!newMission.title || !newMission.pickup_location || !newMission.delivery_location) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Mission publiée',
      text2: 'Votre mission a été ajoutée au marketplace'
    });
    
    setPublishModalVisible(false);
    setNewMission({
      title: '',
      description: '',
      pickup_location: '',
      delivery_location: '',
      vehicle_type: '',
      budget_min: 0,
      budget_max: 0,
      deadline: ''
    });
  };

  const handleSubmitProposal = () => {
    if (!newProposal.proposed_price || !newProposal.message) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Proposition envoyée',
      text2: 'Le client recevra votre offre sous peu'
    });
    
    setProposalModalVisible(false);
    setNewProposal({
      proposed_price: 0,
      estimated_duration: '',
      message: ''
    });
  };

  const MissionCard = ({ mission }: { mission: MarketplaceMission }) => (
    <View style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(mission.urgency) }]}>
            <Text style={styles.urgencyText}>{getUrgencyLabel(mission.urgency)}</Text>
          </View>
        </View>
        <Text style={styles.budget}>{mission.budget_min}-{mission.budget_max}€</Text>
      </View>

      <Text style={styles.missionDescription} numberOfLines={2}>
        {mission.description}
      </Text>

      <View style={styles.routeContainer}>
        <View style={styles.locationItem}>
          <Ionicons name="location-outline" size={16} color="#2563eb" />
          <Text style={styles.locationText}>{mission.pickup_location}</Text>
        </View>
        <Ionicons name="arrow-down" size={16} color="#666" style={styles.arrowIcon} />
        <View style={styles.locationItem}>
          <Ionicons name="location" size={16} color="#10b981" />
          <Text style={styles.locationText}>{mission.delivery_location}</Text>
        </View>
      </View>

      <View style={styles.missionDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="car-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{mission.vehicle_type}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {new Date(mission.deadline).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="chatbubbles-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{mission.proposals_count} offres</Text>
        </View>
      </View>

      <View style={styles.companyInfo}>
        <View style={styles.companyDetails}>
          <Ionicons name="business-outline" size={16} color="#666" />
          <Text style={styles.companyName}>{mission.company_name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.rating}>{mission.company_rating}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.proposeButton}
        onPress={() => {
          setSelectedMission(mission);
          setProposalModalVisible(true);
        }}
      >
        <Text style={styles.proposeButtonText}>Faire une offre</Text>
      </TouchableOpacity>
    </View>
  );

  const TabButton = ({ title, tab, icon }: { 
    title: string; 
    tab: typeof activeTab; 
    icon: keyof typeof Ionicons.glyphMap 
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tab ? '#2563eb' : '#666'} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header avec bouton publier */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TabButton title="Parcourir" tab="browse" icon="search-outline" />
          <TabButton title="Mes missions" tab="my_missions" icon="briefcase-outline" />
          <TabButton title="Mes offres" tab="proposals" icon="paper-plane-outline" />
        </View>
        
        <TouchableOpacity 
          style={styles.publishButton}
          onPress={() => setPublishModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.publishButtonText}>Publier</Text>
        </TouchableOpacity>
      </View>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Missions disponibles</Text>
          {availableMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </ScrollView>
      )}

      {/* My Missions Tab */}
      {activeTab === 'my_missions' && (
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aucune mission publiée</Text>
            <Text style={styles.emptyStateSubtext}>
              Publiez votre première mission pour trouver des convoyeurs
            </Text>
          </View>
        </View>
      )}

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="paper-plane-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aucune offre envoyée</Text>
            <Text style={styles.emptyStateSubtext}>
              Consultez les missions et faites vos premières offres
            </Text>
          </View>
        </View>
      )}

      {/* Publish Mission Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={publishModalVisible}
        onRequestClose={() => setPublishModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publier une mission</Text>
              <TouchableOpacity onPress={() => setPublishModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre de la mission *</Text>
                <TextInput
                  style={styles.input}
                  value={newMission.title}
                  onChangeText={(text: string) => setNewMission({...newMission, title: text})}
                  placeholder="Ex: Convoyage BMW X5 Paris → Lyon"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newMission.description}
                  onChangeText={(text: string) => setNewMission({...newMission, description: text})}
                  placeholder="Décrivez votre mission en détail..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lieu de départ *</Text>
                <TextInput
                  style={styles.input}
                  value={newMission.pickup_location}
                  onChangeText={(text: string) => setNewMission({...newMission, pickup_location: text})}
                  placeholder="Adresse complète de récupération"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lieu de livraison *</Text>
                <TextInput
                  style={styles.input}
                  value={newMission.delivery_location}
                  onChangeText={(text: string) => setNewMission({...newMission, delivery_location: text})}
                  placeholder="Adresse complète de livraison"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type de véhicule</Text>
                <TextInput
                  style={styles.input}
                  value={newMission.vehicle_type}
                  onChangeText={(text: string) => setNewMission({...newMission, vehicle_type: text})}
                  placeholder="Ex: Berline, SUV, Utilitaire..."
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Budget min (€)</Text>
                  <TextInput
                    style={styles.input}
                    value={newMission.budget_min.toString()}
                    onChangeText={(text: string) => setNewMission({...newMission, budget_min: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="150"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Budget max (€)</Text>
                  <TextInput
                    style={styles.input}
                    value={newMission.budget_max.toString()}
                    onChangeText={(text: string) => setNewMission({...newMission, budget_max: parseFloat(text) || 0})}
                    keyboardType="numeric"
                    placeholder="200"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date limite</Text>
                <TextInput
                  style={styles.input}
                  value={newMission.deadline}
                  onChangeText={(text: string) => setNewMission({...newMission, deadline: text})}
                  placeholder="YYYY-MM-DD HH:MM"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setPublishModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handlePublishMission}
              >
                <Text style={styles.submitButtonText}>Publier la mission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Proposal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={proposalModalVisible}
        onRequestClose={() => setProposalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Faire une offre</Text>
              <TouchableOpacity onPress={() => setProposalModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMission && (
              <View style={styles.missionSummary}>
                <Text style={styles.summaryTitle}>{selectedMission.title}</Text>
                <Text style={styles.summaryBudget}>
                  Budget: {selectedMission.budget_min}-{selectedMission.budget_max}€
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Votre prix (€) *</Text>
                <TextInput
                  style={styles.input}
                  value={newProposal.proposed_price.toString()}
                  onChangeText={(text: string) => setNewProposal({...newProposal, proposed_price: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="Votre tarif proposé"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Durée estimée</Text>
                <TextInput
                  style={styles.input}
                  value={newProposal.estimated_duration}
                  onChangeText={(text: string) => setNewProposal({...newProposal, estimated_duration: text})}
                  placeholder="Ex: 4 heures, 1 jour..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message au client *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newProposal.message}
                  onChangeText={(text: string) => setNewProposal({...newProposal, message: text})}
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le bon choix..."
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setProposalModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitProposal}
              >
                <Text style={styles.submitButtonText}>Envoyer l'offre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  budget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  missionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  routeContainer: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  arrowIcon: {
    alignSelf: 'center',
    marginVertical: 2,
  },
  missionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  companyInfo: {
    marginBottom: 16,
  },
  companyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  rating: {
    marginLeft: 2,
    fontSize: 12,
    color: '#666',
  },
  proposeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proposeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  missionSummary: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryBudget: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});