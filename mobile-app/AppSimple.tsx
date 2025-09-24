import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Import des écrans simplifiés
import CovoiturageScreenSimple from './src/screens/CovoiturageScreenSimple';
import MarketplaceScreenSimple from './src/screens/MarketplaceScreenSimple';
import FacturationScreenSimple from './src/screens/FacturationScreenSimple';

const Tab = createBottomTabNavigator<any>();

// Écrans de base pour les fonctionnalités non encore implémentées
const FleetScreen = () => (
  <View style={styles.centerContainer}>
    <Text style={styles.title}>🚛 Gestion de flotte</Text>
    <Text style={styles.subtitle}>Tableau de bord des véhicules et conducteurs</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.centerContainer}>
    <Text style={styles.title}>👤 Profil</Text>
    <Text style={styles.subtitle}>Paramètres et informations du compte</Text>
  </View>
);

export default function AppSimple() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        id={undefined}
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen 
          name="Fleet" 
          component={FleetScreen}
          options={{
            title: 'Flotte',
            tabBarLabel: '🚛 Flotte',
            headerTitle: 'Gestion de flotte',
          }}
        />
        <Tab.Screen 
          name="Covoiturage" 
          component={CovoiturageScreenSimple}
          options={{
            title: 'Covoiturage',
            tabBarLabel: '🚗 Covoiturage',
            headerTitle: 'Covoiturage',
          }}
        />
        <Tab.Screen 
          name="Marketplace" 
          component={MarketplaceScreenSimple}
          options={{
            title: 'Marketplace',
            tabBarLabel: '📦 Marketplace',
            headerTitle: 'Marketplace des missions',
          }}
        />
        <Tab.Screen 
          name="Facturation" 
          component={FacturationScreenSimple}
          options={{
            title: 'Facturation',
            tabBarLabel: '💰 Facturation',
            headerTitle: 'Gestion des factures',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profil',
            tabBarLabel: '👤 Profil',
            headerTitle: 'Mon profil',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});