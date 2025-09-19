import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';

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

const CovoiturageScreenSimple = () => {
    const [activeTab, setActiveTab] = useState('search');
  
  const demoTrips = [
    {
      id: 1,
      from: 'Paris',
      to: 'Lyon',
      date: '15 Jan 2025',
      time: '14:30',
      price: '45€',
      driver: 'Jean D.',
      seats: 3,
      rating: 4.8,
    },
    {
      id: 2,
      from: 'Marseille',
      to: 'Nice',
      date: '16 Jan 2025',
      time: '09:15',
      price: '25€',
      driver: 'Marie L.',
      seats: 2,
      rating: 4.9,
    },
    {
      id: 3,
      from: 'Bordeaux',
      to: 'Toulouse',
      date: '17 Jan 2025',
      time: '16:45',
      price: '30€',
      driver: 'Paul M.',
      seats: 4,
      rating: 4.7,
    },
  ];

  const currentUser = {
    name: 'Utilisateur Demo',
    rating: 4.6,
    trips: 12,
  };
  const [searchFilters, setSearchFilters] = useState({
    departure: '',
    destination: '',
    date: '',
  });
  
  const [newTrip, setNewTrip] = useState({
    departure: '',
    destination: '',
    departure_time: '',
    available_seats: 1,
    price_per_seat: 0,
    vehicle_info: '',
  });

  // Données d'exemple
  const mockTrips: CovoiturageTrip[] = [
    {
      id: '1',
      departure: 'Paris',
      destination: 'Lyon',
      departure_time: '08:00',
      available_seats: 3,
      price_per_seat: 25,
      driver_name: 'Marie Dupont',
      driver_rating: 4.8,
      vehicle_info: 'Peugeot 308 - Blanc',
      status: 'available',
    },
    {
      id: '2', 
      departure: 'Lyon',
      destination: 'Marseille',
      departure_time: '14:30',
      available_seats: 2,
      price_per_seat: 20,
      driver_name: 'Pierre Martin',
      driver_rating: 4.6,
      vehicle_info: 'Renault Mégane - Gris',
      status: 'available',
    },
  ];

  const handleSearch = () => {
    Alert.alert('Recherche', `Recherche de trajets de ${searchFilters.departure} vers ${searchFilters.destination}`);
  };

  const handleCreateTrip = () => {
    Alert.alert('Création', `Trajet créé: ${newTrip.departure} → ${newTrip.destination}`);
  };

  const handleBookTrip = (trip: CovoiturageTrip) => {
    Alert.alert('Réservation', `Réservation confirmée pour le trajet ${trip.departure} → ${trip.destination}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            🔍 Rechercher
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            ➕ Créer
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'search' && (
          <View>
            {/* Formulaire de recherche */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rechercher un trajet</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Départ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville de départ"
                  value={searchFilters.departure}
                  onChangeText={(text) => setSearchFilters({...searchFilters, departure: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville d'arrivée"
                  value={searchFilters.destination}
                  onChangeText={(text) => setSearchFilters({...searchFilters, destination: text})}
                />
              </View>

              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </TouchableOpacity>
            </View>

            {/* Résultats de recherche */}
            <Text style={styles.sectionTitle}>Trajets disponibles</Text>
            {mockTrips.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripRoute}>
                    {trip.departure} → {trip.destination}
                  </Text>
                  <Text style={styles.tripPrice}>{trip.price_per_seat}€/place</Text>
                </View>
                
                <Text style={styles.tripTime}>Départ: {trip.departure_time}</Text>
                <Text style={styles.tripDriver}>
                  Conducteur: {trip.driver_name} ⭐ {trip.driver_rating}
                </Text>
                <Text style={styles.tripVehicle}>{trip.vehicle_info}</Text>
                <Text style={styles.tripSeats}>
                  {trip.available_seats} place(s) disponible(s)
                </Text>

                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => handleBookTrip(trip)}
                >
                  <Text style={styles.bookButtonText}>Réserver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'create' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Créer un nouveau trajet</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Départ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville de départ"
                  value={newTrip.departure}
                  onChangeText={(text) => setNewTrip({...newTrip, departure: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville d'arrivée"
                  value={newTrip.destination}
                  onChangeText={(text) => setNewTrip({...newTrip, destination: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Heure de départ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={newTrip.departure_time}
                  onChangeText={(text) => setNewTrip({...newTrip, departure_time: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Places disponibles</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de places"
                  value={newTrip.available_seats.toString()}
                  onChangeText={(text) => setNewTrip({...newTrip, available_seats: parseInt(text) || 1})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prix par place (€)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Prix en euros"
                  value={newTrip.price_per_seat.toString()}
                  onChangeText={(text) => setNewTrip({...newTrip, price_per_seat: parseFloat(text) || 0})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Véhicule</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Marque, modèle, couleur"
                  value={newTrip.vehicle_info}
                  onChangeText={(text) => setNewTrip({...newTrip, vehicle_info: text})}
                />
              </View>

              <TouchableOpacity style={styles.createButton} onPress={handleCreateTrip}>
                <Text style={styles.createButtonText}>Créer le trajet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tripTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripDriver: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripVehicle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripSeats: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripsContainer: {
    flex: 1,
    marginTop: 16,
  },
  tripDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    width: '48%',
  },
});

export default CovoiturageScreenSimple;