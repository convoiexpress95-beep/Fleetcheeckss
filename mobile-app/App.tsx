import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import CovoiturageScreenComplete from './src/screens/CovoiturageScreenComplete';
import MarketplaceScreenComplete from './src/screens/MarketplaceScreenComplete';
import MarketplaceMessagesScreen from './src/screens/MarketplaceMessagesScreen';
import MissionsScreenComplete from './src/screens/MissionsScreenComplete';
import InspectionsScreenComplete from './src/screens/InspectionsScreenComplete';
import FacturationScreenComplete from './src/screens/FacturationScreenComplete';
import ProfileScreen from './src/screens/ProfileScreen';
import ShopScreen from './src/screens/ShopScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0b1220',
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 70 : 88,
          paddingBottom: Platform.OS === 'android' ? 12 : 24,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000000',
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        headerStyle: {
          backgroundColor: '#0b1220',
        },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: '600', color: 'white' },
      }}
    >
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreenComplete}
        options={{
          title: 'Marketplace',
          tabBarLabel: 'Marketplace',
          headerTitle: 'Marketplace des missions',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="storefront-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Missions" 
        component={MissionsScreenComplete}
        options={{
          title: 'Missions',
          tabBarLabel: 'Missions',
          headerTitle: 'Missions actives',
          tabBarIcon: ({ color, size }) => (
            <Feather name="truck" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Inspections" 
        component={InspectionsScreenComplete}
        options={{
          title: 'Inspections',
          tabBarLabel: 'Inspections',
          headerTitle: 'Inspections véhicules',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-check-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Covoiturage" 
        component={CovoiturageScreenComplete}
        options={{
          title: 'Covoiturage',
          tabBarLabel: 'Covoiturage',
          headerTitle: 'Covoiturage',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="car-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{
          title: 'Boutique',
          tabBarLabel: 'Boutique',
          headerTitle: 'Boutique de crédits',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Facturation" 
        component={FacturationScreenComplete}
        options={{
          title: 'Facturation',
          tabBarLabel: 'Facturation',
          headerTitle: 'Gestion des factures',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          headerTitle: 'Mon profil',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading, user } = useAuth();
  if (loading) return null;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" backgroundColor="#0b1220" translucent={false} />
      )}
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </AuthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  // Styles pour compatibilité - peuvent être supprimés si plus nécessaires
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  comingSoon: {
    fontSize: 14,
    color: '#f59e0b',
    textAlign: 'center',
    fontWeight: '500',
  },
});