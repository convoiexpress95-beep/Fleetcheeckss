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
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { useAuth } from './src/contexts/AuthContext';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function MainTabs() {
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
        name="Contacts" 
        component={ContactsScreen}
        options={{ title: 'Contacts' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
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