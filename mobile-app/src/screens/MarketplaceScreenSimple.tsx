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

interface Mission {
  id: string;
  title: string;
  description: string;
  departure: string;
  destination: string;
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  deadline: string;
  client_name: string;
  client_rating: number;
}

const MarketplaceScreenSimple = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'publish'>('browse');
  
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    departure: '',
    destination: '',
    budget: 0,
    deadline: '',
  });

  const mockMissions: Mission[] = [
    {
      id: '1',
      title: 'Transport de marchandises fragiles',
      description: 'Livraison d\'objets en verre, manipulation délicate requise',
      departure: 'Paris',
      destination: 'Lyon',
      budget: 350,
      urgency: 'high',
      deadline: '2025-01-15',
      client_name: 'Sophie Bernard',
      client_rating: 4.7,
    },
    {
      id: '2',
      title: 'Déménagement petit appartement',
      description: 'Transport de meubles et cartons pour studio 20m²',
      departure: 'Marseille',
      destination: 'Nice',
      budget: 200,
      urgency: 'medium',
      deadline: '2025-01-18',
      client_name: 'Marc Dubois',
      client_rating: 4.5,
    },
    {
      id: '3',
      title: 'Livraison urgente documents',
      description: 'Contrats importants à remettre en main propre',
      departure: 'Toulouse',
      destination: 'Bordeaux',
      budget: 150,
      urgency: 'high',
      deadline: '2025-01-12',
      client_name: 'Caroline Morel',
      client_rating: 4.9,
    },
    {
      id: '4',
      title: 'Transport d\'équipement sportif',
      description: 'Vélos et matériel de cyclisme pour compétition',
      departure: 'Lille',
      destination: 'Strasbourg',
      budget: 280,
      urgency: 'medium',
      deadline: '2025-01-20',
      client_name: 'Jean-Pierre Martin',
      client_rating: 4.6,
    },
    {
      id: '5',
      title: 'Livraison de produits artisanaux',
      description: 'Objets de créateur pour salon professionnel',
      departure: 'Nantes',
      destination: 'Rennes',
      budget: 120,
      urgency: 'low',
      deadline: '2025-01-25',
      client_name: 'Amélie Rousseau',
      client_rating: 4.8,
    },
  ];

  const handleBidMission = (mission: Mission) => {
    Alert.alert('Proposition', `Proposition envoyée pour: ${mission.title}`);
  };

  const handlePublishMission = () => {
    Alert.alert('Publication', `Mission publiée: ${newMission.title}`);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      default: return '#34d399';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return '🔴 Urgent';
      case 'medium': return '🟡 Modéré';
      default: return '🟢 Normal';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
            📋 Parcourir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'publish' && styles.activeTab]}
          onPress={() => setActiveTab('publish')}
        >
          <Text style={[styles.tabText, activeTab === 'publish' && styles.activeTabText]}>
            📝 Publier
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'browse' && (
          <View>
            <Text style={styles.sectionTitle}>Missions disponibles</Text>
            {mockMissions.map((mission) => (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.missionHeader}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={[styles.urgencyBadge, { color: getUrgencyColor(mission.urgency) }]}>
                    {getUrgencyText(mission.urgency)}
                  </Text>
                </View>
                
                <Text style={styles.missionDescription}>{mission.description}</Text>
                <Text style={styles.missionRoute}>
                  📍 {mission.departure} → {mission.destination}
                </Text>
                <Text style={styles.missionBudget}>💰 Budget: {mission.budget}€</Text>
                <Text style={styles.missionDeadline}>⏰ Échéance: {mission.deadline}</Text>
                <Text style={styles.missionClient}>
                  👤 Client: {mission.client_name} ⭐ {mission.client_rating}
                </Text>

                <TouchableOpacity 
                  style={styles.bidButton}
                  onPress={() => handleBidMission(mission)}
                >
                  <Text style={styles.bidButtonText}>Faire une proposition</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'publish' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Publier une nouvelle mission</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre de la mission</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Transport de meubles"
                  value={newMission.title}
                  onChangeText={(text) => setNewMission({...newMission, title: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description détaillée</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Décrivez votre mission en détail..."
                  value={newMission.description}
                  onChangeText={(text) => setNewMission({...newMission, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Point de départ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville de départ"
                  value={newMission.departure}
                  onChangeText={(text) => setNewMission({...newMission, departure: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville d'arrivée"
                  value={newMission.destination}
                  onChangeText={(text) => setNewMission({...newMission, destination: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget proposé (€)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Montant en euros"
                  value={newMission.budget.toString()}
                  onChangeText={(text) => setNewMission({...newMission, budget: parseFloat(text) || 0})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date limite</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AAAA-MM-JJ"
                  value={newMission.deadline}
                  onChangeText={(text) => setNewMission({...newMission, deadline: text})}
                />
              </View>

              <TouchableOpacity style={styles.publishButton} onPress={handlePublishMission}>
                <Text style={styles.publishButtonText}>Publier la mission</Text>
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
    borderBottomColor: '#9333ea',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#9333ea',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  missionCard: {
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
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  urgencyBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  missionRoute: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  missionBudget: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 4,
  },
  missionDeadline: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
  },
  missionClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bidButton: {
    backgroundColor: '#9333ea',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  bidButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  publishButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MarketplaceScreenSimple;