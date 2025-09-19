import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hook simulé pour l'authentification
const useAuth = () => {
  return {
    user: {
      id: '1',
      name: 'Utilisateur Demo',
      email: 'demo@example.com'
    }
  };
};

interface CovoiturageTrip {
  id: string;
  departure: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  driver_name: string;
  driver_rating: number;
  vehicle_info: string;
  status: 'available' | 'booked' | 'completed';
}

export const CovoiturageScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'my_trips' | 'create'>('search');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [createTripModalVisible, setCreateTripModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - à remplacer par de vraies données depuis Supabase
  const [availableTrips] = useState<CovoiturageTrip[]>([
    {
      id: '1',
      departure: 'Paris',
      destination: 'Lyon',
      departure_time: '2025-09-19T08:00:00Z',
      available_seats: 3,
      price_per_seat: 25,
      driver_name: 'Marie Dubois',
      driver_rating: 4.8,
      vehicle_info: 'Renault Clio - Bleu',
      status: 'available'
    },
    {
      id: '2',
      departure: 'Marseille',
      destination: 'Nice',
      departure_time: '2025-09-19T14:30:00Z',
      available_seats: 2,
      price_per_seat: 15,
      driver_name: 'Pierre Martin',
      driver_rating: 4.6,
      vehicle_info: 'Peugeot 308 - Noir',
      status: 'available'
    }
  ]);

  const [newTrip, setNewTrip] = useState({
    departure: '',
    destination: '',
    departure_time: '',
    available_seats: 4,
    price_per_seat: 0,
    vehicle_info: ''
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulation du rafraîchissement
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleBookTrip = (tripId: string) => {
    Alert.alert(
      'Réserver ce trajet',
      'Voulez-vous réserver une place pour ce trajet ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réserver', onPress: () => {
          Alert.alert(
            'Réservation confirmée',
            'Vous recevrez les détails par email'
          });
        }}
      ]
    );
  };

  const handleCreateTrip = () => {
    if (!newTrip.departure || !newTrip.destination || !newTrip.departure_time) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Trajet créé',
      text2: 'Votre offre de covoiturage a été publiée'
    });
    
    setCreateTripModalVisible(false);
    setNewTrip({
      departure: '',
      destination: '',
      departure_time: '',
      available_seats: 4,
      price_per_seat: 0,
      vehicle_info: ''
    });
  };

  const TripCard = ({ trip }: { trip: CovoiturageTrip }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <View style={styles.routeContainer}>
          <Text style={styles.departure}>{trip.departure}</Text>
          <Ionicons name="arrow-forward" size={20} color="#2563eb" />
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>
        <Text style={styles.price}>{trip.price_per_seat}€/place</Text>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.time}>
            {new Date(trip.departure_time).toLocaleString('fr-FR')}
          </Text>
        </View>
        
        <View style={styles.seatsContainer}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.seats}>{trip.available_seats} places disponibles</Text>
        </View>
      </View>

      <View style={styles.driverInfo}>
        <View style={styles.driverDetails}>
          <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.driverName}>{trip.driver_name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.rating}>{trip.driver_rating}</Text>
          </View>
        </View>
        <Text style={styles.vehicleInfo}>{trip.vehicle_info}</Text>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => handleBookTrip(trip.id)}
      >
        <Text style={styles.bookButtonText}>Réserver</Text>
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
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton title="Rechercher" tab="search" icon="search-outline" />
        <TabButton title="Mes trajets" tab="my_trips" icon="car-outline" />
        <TabButton title="Créer" tab="create" icon="add-circle-outline" />
      </View>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              style={styles.searchBar}
              onPress={() => setSearchModalVisible(true)}
            >
              <Ionicons name="search-outline" size={20} color="#666" />
              <Text style={styles.searchPlaceholder}>
                Rechercher un trajet...
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Trajets disponibles</Text>
          {availableTrips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </ScrollView>
      )}

      {/* My Trips Tab */}
      {activeTab === 'my_trips' && (
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aucun trajet pour le moment</Text>
            <Text style={styles.emptyStateSubtext}>
              Créez votre premier trajet ou réservez une place
            </Text>
          </View>
        </View>
      )}

      {/* Create Trip Tab */}
      {activeTab === 'create' && (
        <ScrollView style={styles.content}>
          <View style={styles.createForm}>
            <Text style={styles.formTitle}>Créer un nouveau trajet</Text>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setCreateTripModalVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.createButtonText}>Proposer un trajet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Create Trip Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createTripModalVisible}
        onRequestClose={() => setCreateTripModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau trajet</Text>
              <TouchableOpacity onPress={() => setCreateTripModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Départ *</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.departure}
                  onChangeText={(text: string) => setNewTrip({...newTrip, departure: text})}
                  placeholder="Ville de départ"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Destination *</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.destination}
                  onChangeText={(text: string) => setNewTrip({...newTrip, destination: text})}
                  placeholder="Ville d'arrivée"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date et heure *</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.departure_time}
                  onChangeText={(text: string) => setNewTrip({...newTrip, departure_time: text})}
                  placeholder="YYYY-MM-DD HH:MM"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Places disponibles</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.available_seats.toString()}
                  onChangeText={(text: string) => setNewTrip({...newTrip, departure_time: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sièges disponibles</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.available_seats.toString()}
                  onChangeText={(text: string) => setNewTrip({...newTrip, available_seats: parseInt(text) || 1})}
                  keyboardType="numeric"
                  placeholder="Nombre de places"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prix par place (€)</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.price_per_seat.toString()}
                  onChangeText={(text: string) => setNewTrip({...newTrip, price_per_seat: parseFloat(text) || 0})}
                  keyboardType="numeric"
                  placeholder="Prix en euros"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Véhicule</Text>
                <TextInput
                  style={styles.input}
                  value={newTrip.vehicle_info}
                  onChangeText={(text: string) => setNewTrip({...newTrip, vehicle_info: text})}
                  placeholder="Marque, modèle, couleur"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCreateTripModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleCreateTrip}
              >
                <Text style={styles.submitButtonText}>Créer le trajet</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchHeader: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  departure: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  destination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seats: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  driverInfo: {
    marginBottom: 16,
  },
  driverDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  rating: {
    marginLeft: 2,
    fontSize: 14,
    color: '#666',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
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
  createForm: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
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