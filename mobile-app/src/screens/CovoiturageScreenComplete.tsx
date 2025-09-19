import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface CovoiturageRide {
  id: string;
  departure: string;
  destination: string;
  departure_time: string;
  duration_minutes: number | null;
  price: number;
  seats_total: number;
  seats_available: number;
  route: string[];
  description: string | null;
  vehicle_model: string | null;
  options: string[];
  status: 'active' | 'cancelled' | 'completed';
  driver: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
  };
}

interface SearchFilters {
  departure: string;
  destination: string;
  date: Date | null;
  passengers: number;
  maxPrice: number;
  instantBooking: boolean;
}

const { width } = Dimensions.get('window');

export default function CovoiturageScreenComplete({ navigation }: any) {
  const [rides, setRides] = useState<CovoiturageRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'my-trips' | 'messages'>('search');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(true);

  const [filters, setFilters] = useState<SearchFilters>({
    departure: '',
    destination: '',
    date: null,
    passengers: 1,
    maxPrice: 50,
    instantBooking: false,
  });

  // Mock data
  useEffect(() => {
    const mockRides: CovoiturageRide[] = [
      {
        id: '1',
        departure: 'Paris',
        destination: 'Lyon',
        departure_time: '2025-09-20T09:30:00Z',
        duration_minutes: 280,
        price: 45,
        seats_total: 4,
        seats_available: 2,
        route: ['Paris', 'Auxerre', 'Chalon-sur-Saône', 'Lyon'],
        description: 'Trajet direct sans arrêt, véhicule climatisé.',
        vehicle_model: 'Audi A4',
        options: ['Climatisation', 'Musique autorisée', 'Non-fumeur'],
        status: 'active',
        driver: {
          id: 'driver1',
          name: 'Thomas Dupont',
          avatar: undefined,
          rating: 4.8,
          reviewCount: 125,
          isVerified: true,
        },
      },
      {
        id: '2',
        departure: 'Marseille',
        destination: 'Nice',
        departure_time: '2025-09-20T14:15:00Z',
        duration_minutes: 180,
        price: 25,
        seats_total: 3,
        seats_available: 1,
        route: ['Marseille', 'Aix-en-Provence', 'Cannes', 'Nice'],
        description: 'Trajet côtier avec vue sur la mer.',
        vehicle_model: 'Peugeot 308',
        options: ['Climatisation', 'Animaux acceptés', 'Bagages autorisés'],
        status: 'active',
        driver: {
          id: 'driver2',
          name: 'Sophie Martin',
          avatar: undefined,
          rating: 4.9,
          reviewCount: 89,
          isVerified: true,
        },
      },
      {
        id: '3',
        departure: 'Toulouse',
        destination: 'Bordeaux',
        departure_time: '2025-09-20T16:00:00Z',
        duration_minutes: 150,
        price: 30,
        seats_total: 4,
        seats_available: 3,
        route: ['Toulouse', 'Agen', 'Bordeaux'],
        description: 'Départ flexible entre 15h30 et 16h30.',
        vehicle_model: 'Renault Mégane',
        options: ['Musique autorisée', 'Non-fumeur', 'Vélo accepté'],
        status: 'active',
        driver: {
          id: 'driver3',
          name: 'Marc Leblanc',
          avatar: undefined,
          rating: 4.7,
          reviewCount: 67,
          isVerified: false,
        },
      },
      {
        id: '4',
        departure: 'Lille',
        destination: 'Bruxelles',
        departure_time: '2025-09-21T08:00:00Z',
        duration_minutes: 75,
        price: 18,
        seats_total: 4,
        seats_available: 2,
        route: ['Lille', 'Tournai', 'Bruxelles'],
        description: 'Trajet international, documents requis.',
        vehicle_model: 'BMW Série 3',
        options: ['Climatisation', 'Non-fumeur', 'Bagages autorisés'],
        status: 'active',
        driver: {
          id: 'driver4',
          name: 'Pierre Dubois',
          avatar: undefined,
          rating: 4.6,
          reviewCount: 203,
          isVerified: true,
        },
      },
      {
        id: '5',
        departure: 'Strasbourg',
        destination: 'Paris',
        departure_time: '2025-09-21T18:30:00Z',
        duration_minutes: 300,
        price: 55,
        seats_total: 4,
        seats_available: 1,
        route: ['Strasbourg', 'Nancy', 'Metz', 'Reims', 'Paris'],
        description: 'Trajet du soir, départ après 18h.',
        vehicle_model: 'Mercedes Classe C',
        options: ['Climatisation', 'Musique autorisée', 'Non-fumeur', 'Bagages autorisés'],
        status: 'active',
        driver: {
          id: 'driver5',
          name: 'Amélie Rousseau',
          avatar: undefined,
          rating: 5.0,
          reviewCount: 34,
          isVerified: true,
        },
      }
    ];

    setTimeout(() => {
      setRides(mockRides);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRides = rides.filter(ride => {
    const matchesDeparture = !filters.departure || 
      ride.departure.toLowerCase().includes(filters.departure.toLowerCase());
    const matchesDestination = !filters.destination || 
      ride.destination.toLowerCase().includes(filters.destination.toLowerCase());
    const matchesDate = !filters.date || 
      new Date(ride.departure_time).toDateString() === filters.date.toDateString();
    const matchesSeats = ride.seats_available >= filters.passengers;
    const matchesPrice = ride.price <= filters.maxPrice;
    
    return matchesDeparture && matchesDestination && matchesDate && matchesSeats && matchesPrice;
  });

  const handleSearch = () => {
    if (!filters.departure && !filters.destination) {
      Alert.alert('Recherche', 'Veuillez saisir au moins un lieu de départ ou d\'arrivée');
      return;
    }
    setSearchExpanded(false);
    // Simulation de recherche
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleBookRide = (ride: CovoiturageRide) => {
    Alert.alert(
      'Réserver ce trajet',
      `Voulez-vous réserver ${filters.passengers} place(s) pour ${ride.departure} → ${ride.destination} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réserver',
          onPress: () => {
            Alert.alert(
              'Réservation confirmée',
              'Votre demande de réservation a été envoyée au conducteur.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? `${mins}min` : ''}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading && rides.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Recherche de trajets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Covoiturage</Text>
            <Text style={styles.headerSubtitle}>Trouvez votre trajet idéal</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setShowFilterModal(true)}
          >
            <Feather name="sliders" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Form */}
      {searchExpanded && (
        <View style={styles.searchContainer}>
          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>
                  <Feather name="map-pin" size={14} color="#06b6d4" /> Départ
                </Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ville de départ"
                  placeholderTextColor="#9ca3af"
                  value={filters.departure}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, departure: text }))}
                />
              </View>

              <TouchableOpacity
                style={styles.swapButton}
                onPress={() => {
                  setFilters(prev => ({
                    ...prev,
                    departure: prev.destination,
                    destination: prev.departure
                  }));
                }}
              >
                <Feather name="refresh-cw" size={16} color="#06b6d4" />
              </TouchableOpacity>

              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>
                  <Feather name="map-pin" size={14} color="#ef4444" /> Arrivée
                </Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ville d'arrivée"
                  placeholderTextColor="#9ca3af"
                  value={filters.destination}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, destination: text }))}
                />
              </View>
            </View>

            <View style={styles.searchRow}>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.searchLabel}>
                  <Feather name="calendar" size={14} color="#9ca3af" /> Date
                </Text>
                <View style={styles.dateInput}>
                  <Text style={styles.dateText}>
                    {filters.date 
                      ? filters.date.toLocaleDateString('fr-FR')
                      : 'Aujourd\'hui'
                    }
                  </Text>
                  <Feather name="calendar" size={16} color="#9ca3af" />
                </View>
              </TouchableOpacity>

              <View style={styles.passengersField}>
                <Text style={styles.searchLabel}>
                  <Feather name="users" size={14} color="#9ca3af" /> Places
                </Text>
                <View style={styles.passengersControl}>
                  <TouchableOpacity
                    style={styles.passengersButton}
                    onPress={() => filters.passengers > 1 && 
                      setFilters(prev => ({ ...prev, passengers: prev.passengers - 1 }))}
                  >
                    <Feather name="minus" size={16} color="#06b6d4" />
                  </TouchableOpacity>
                  <Text style={styles.passengersText}>{filters.passengers}</Text>
                  <TouchableOpacity
                    style={styles.passengersButton}
                    onPress={() => filters.passengers < 8 && 
                      setFilters(prev => ({ ...prev, passengers: prev.passengers + 1 }))}
                  >
                    <Feather name="plus" size={16} color="#06b6d4" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <View style={styles.searchButtonGradient}>
                <Feather name="search" size={18} color="white" />
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Collapsed Search Bar */}
      {!searchExpanded && (
        <TouchableOpacity
          style={styles.collapsedSearch}
          onPress={() => setSearchExpanded(true)}
        >
          <View style={styles.collapsedSearchContent}>
            <Feather name="search" size={16} color="#9ca3af" />
            <Text style={styles.collapsedSearchText}>
              {filters.departure && filters.destination 
                ? `${filters.departure} → ${filters.destination}`
                : 'Rechercher un trajet'
              }
            </Text>
            <Feather name="chevron-down" size={16} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {loading ? 'Recherche en cours...' : `${filteredRides.length} trajets trouvés`}
        </Text>
        {filteredRides.length > 0 && (
          <TouchableOpacity style={styles.sortButton}>
            <Feather name="filter" size={14} color="#9ca3af" />
            <Text style={styles.sortText}>Trier</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rides List */}
      <ScrollView style={styles.ridesList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingRides}>
            <ActivityIndicator size="small" color="#06b6d4" />
          </View>
        ) : filteredRides.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="car-multiple" size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>Aucun trajet trouvé</Text>
            <Text style={styles.emptyDescription}>
              Essayez de modifier vos critères de recherche ou explorez d'autres dates.
            </Text>
            <TouchableOpacity 
              style={styles.expandSearchButton}
              onPress={() => setSearchExpanded(true)}
            >
              <Text style={styles.expandSearchText}>Modifier la recherche</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredRides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              {/* Route and Time */}
              <View style={styles.rideHeader}>
                <View style={styles.routeInfo}>
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.routeCity}>{ride.departure}</Text>
                  </View>
                  
                  <View style={styles.routeLine}>
                    <View style={styles.routePath} />
                    <Text style={styles.routeDuration}>
                      {formatDuration(ride.duration_minutes)}
                    </Text>
                  </View>
                  
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.routeCity}>{ride.destination}</Text>
                  </View>
                </View>
                
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>{formatTime(ride.departure_time)}</Text>
                  <Text style={styles.rideDateText}>{formatDate(ride.departure_time)}</Text>
                </View>
              </View>

              {/* Driver Info */}
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitials}>
                    {ride.driver.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                
                <View style={styles.driverDetails}>
                  <View style={styles.driverNameRow}>
                    <Text style={styles.driverName}>{ride.driver.name}</Text>
                    {ride.driver.isVerified && (
                      <Feather name="check-circle" size={14} color="#10b981" />
                    )}
                  </View>
                  
                  <View style={styles.driverRating}>
                    <Feather name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>
                      {ride.driver.rating} ({ride.driver.reviewCount} avis)
                    </Text>
                  </View>
                  
                  {ride.vehicle_model && (
                    <Text style={styles.vehicleText}>
                      <MaterialCommunityIcons name="car" size={12} color="#9ca3af" />
                      {' '}{ride.vehicle_model}
                    </Text>
                  )}
                </View>
              </View>

              {/* Route Details */}
              {ride.route.length > 2 && (
                <View style={styles.routeDetails}>
                  <Text style={styles.routeLabel}>Étapes:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ride.route.map((city, index) => (
                      <View key={index} style={styles.routeStep}>
                        <Text style={styles.routeStepText}>{city}</Text>
                        {index < ride.route.length - 1 && (
                          <Feather name="arrow-right" size={10} color="#9ca3af" />
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Options */}
              {ride.options.length > 0 && (
                <View style={styles.optionsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ride.options.slice(0, 3).map((option, index) => (
                      <View key={index} style={styles.optionBadge}>
                        <Text style={styles.optionText}>{option}</Text>
                      </View>
                    ))}
                    {ride.options.length > 3 && (
                      <View style={styles.moreOptionsBadge}>
                        <Text style={styles.moreOptionsText}>+{ride.options.length - 3}</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Price and Booking */}
              <View style={styles.bookingSection}>
                <View style={styles.priceInfo}>
                  <Text style={styles.price}>{ride.price}€</Text>
                  <Text style={styles.priceLabel}>par personne</Text>
                  <View style={styles.seatsInfo}>
                    <Feather name="users" size={12} color="#9ca3af" />
                    <Text style={styles.seatsText}>
                      {ride.seats_available}/{ride.seats_total} places
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.bookButton,
                    { opacity: ride.seats_available < filters.passengers ? 0.5 : 1 }
                  ]}
                  disabled={ride.seats_available < filters.passengers}
                  onPress={() => handleBookRide(ride)}
                >
                  <View style={styles.bookButtonGradient}>
                    <Text style={styles.bookButtonText}>
                      {ride.seats_available < filters.passengers ? 'Complet' : 'Réserver'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Sélectionner une date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setFilters(prev => ({ ...prev, date: new Date() }));
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerButtonText}>Aujourd'hui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setFilters(prev => ({ ...prev, date: tomorrow }));
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerButtonText}>Demain</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerCloseButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres avancés</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowFilterModal(false)}
              >
                <Feather name="x" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Prix maximum: {filters.maxPrice}€</Text>
                {/* Note: React Native Slider would need additional setup */}
                <View style={styles.priceRange}>
                  <TouchableOpacity 
                    style={styles.priceButton}
                    onPress={() => setFilters(prev => ({ ...prev, maxPrice: Math.max(10, prev.maxPrice - 5) }))}
                  >
                    <Feather name="minus" size={16} color="#06b6d4" />
                  </TouchableOpacity>
                  <Text style={styles.priceValue}>{filters.maxPrice}€</Text>
                  <TouchableOpacity 
                    style={styles.priceButton}
                    onPress={() => setFilters(prev => ({ ...prev, maxPrice: Math.min(100, prev.maxPrice + 5) }))}
                  >
                    <Feather name="plus" size={16} color="#06b6d4" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterSection}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setFilters(prev => ({ ...prev, instantBooking: !prev.instantBooking }))}
                >
                  <View style={[styles.checkbox, filters.instantBooking && styles.checkboxActive]}>
                    {filters.instantBooking && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>Réservation instantanée uniquement</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setFilters({
                    departure: '',
                    destination: '',
                    date: null,
                    passengers: 1,
                    maxPrice: 50,
                    instantBooking: false,
                  });
                }}
              >
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilterModal(false);
                  handleSearch();
                }}
              >
                <View style={styles.applyButtonGradient}>
                  <Text style={styles.applyButtonText}>Appliquer</Text>
                </View>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
    backgroundColor: '#1e293b',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  searchContainer: {
    padding: 16,
  },
  searchCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 12,
  },
  searchField: {
    flex: 1,
  },
  searchLabel: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  searchInput: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  swapButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: 'white',
    fontSize: 15,
  },
  passengersField: {
    flex: 1,
  },
  passengersControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  passengersButton: {
    padding: 10,
  },
  passengersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  collapsedSearch: {
    margin: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  collapsedSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  collapsedSearchText: {
    flex: 1,
    color: '#d1d5db',
    fontSize: 15,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  resultsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  sortText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  ridesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingRides: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  rideCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
    marginRight: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeCity: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    marginBottom: 8,
  },
  routePath: {
    width: 2,
    height: 20,
    backgroundColor: '#4b5563',
    marginRight: 12,
  },
  routeDuration: {
    color: '#9ca3af',
    fontSize: 13,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideDateText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  driverName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  vehicleText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  routeDetails: {
    marginBottom: 16,
  },
  routeLabel: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 6,
  },
  routeStepText: {
    color: '#d1d5db',
    fontSize: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  optionText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '500',
  },
  moreOptionsBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moreOptionsText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  bookingSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.5)',
  },
  priceInfo: {
    flex: 1,
  },
  price: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seatsText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  bookButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    borderRadius: 8,
  },
  bookButtonText: {
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
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  expandSearchButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  expandSearchText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 32,
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
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 16,
  },
  priceButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  priceValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
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
    fontSize: 15,
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
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06b6d4',
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    alignItems: 'center',
    minWidth: 250,
  },
  datePickerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  datePickerButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginVertical: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  datePickerCloseButton: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  datePickerCloseText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
});