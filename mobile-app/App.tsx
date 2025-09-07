import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider } from './src/contexts/AuthContext';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MissionsScreen } from './src/screens/MissionsScreen';
import { InspectionScreen } from './src/screens/InspectionScreen';
import { ContactsScreen } from './src/screens/ContactsScreen';
import NewMissionWizard from './src/screens/NewMissionWizard';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { useAuth } from './src/contexts/AuthContext';
import ShopScreen from './src/screens/ShopScreen';
import { CreditsPill } from './src/components/CreditsPill';
import { useNavigation } from '@react-navigation/native';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PublicTrackingScreen from './src/screens/PublicTrackingScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import TrajetsPartagesScreen from './src/screens/TrajetsPartagesScreen';
import BillingScreen from './src/screens/BillingScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import EditMissionScreen from './src/screens/EditMissionScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function MainTabs() {
  const nav = useNavigation();
  return (
  <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Missions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Inspection') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Outils') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <CreditsPill onPress={() => nav.navigate('Shop' as never)} />
        ),
      })}
    >
  <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Tableau de bord' }}
      />
  <Tab.Screen 
        name="Missions" 
        component={MissionsScreen}
        options={{ title: 'Missions' }}
      />
      <Tab.Screen 
        name="Inspection" 
        component={InspectionScreen}
        options={{ title: 'Inspection' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Rapports', tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Outils"
        component={MarketplaceScreen}
        options={{ title: 'Outils' }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ title: 'Contacts', tabBarButton: () => null }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{ title: 'Boutique', tabBarButton: () => null }}
      />
      <Tab.Screen
        name="NewMissionWizard"
        component={NewMissionWizard}
        options={{
          title: 'Nouvelle mission',
          tabBarButton: () => null, // onglet masqué
        }}
      />
      {/* Ecrans supplémentaires accessibles via navigation ou raccourcis */}
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages', tabBarButton: () => null }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ title: 'Profil', tabBarButton: () => null }} />
      <Tab.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Suivi', tabBarButton: () => null }} />
      <Tab.Screen name="SuiviPublic" component={PublicTrackingScreen} options={{ title: 'Suivi public', tabBarButton: () => null }} />
      <Tab.Screen name="TrajetsPartages" component={TrajetsPartagesScreen} options={{ title: 'Trajets partagés', tabBarButton: () => null }} />
      <Tab.Screen name="Billing" component={BillingScreen} options={{ title: 'Facturation', tabBarButton: () => null }} />
  <Tab.Screen name="EditMission" component={EditMissionScreen} options={{ title: 'Modifier mission', tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Ou un écran de chargement
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <MainTabs />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppContent />
            <Toast />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}