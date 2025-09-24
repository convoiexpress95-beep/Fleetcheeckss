import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform, Pressable } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import CovoiturageScreenComplete from './src/screens/CovoiturageScreenComplete';
import MarketplaceScreenComplete from './src/screens/MarketplaceScreenComplete';
import MarketplaceMessagesScreen from './src/screens/MarketplaceMessagesScreen';
import MissionsScreenComplete from './src/screens/MissionsScreenComplete';
import InspectionsScreenComplete from './src/screens/InspectionsScreenComplete';
import MissionWizardScreen from './src/screens/MissionWizardScreen';
import CreateMissionScreen from './src/screens/CreateMissionScreen';
import InAppNavigationScreen from './src/screens/InAppNavigationScreen';
import FacturationScreenComplete from './src/screens/FacturationScreenComplete';
import ProfileScreen from './src/screens/ProfileScreen';
import ShopScreen from './src/screens/ShopScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CovoiturageMyTrips from './src/screens/CovoiturageMyTrips';
import CovoiturageMessages from './src/screens/CovoiturageMessages';
import CovoiturageTripDetails from './src/screens/CovoiturageTripDetails';
import DevisScreen from './src/screens/DevisScreen';
import CovoituragePublish from './src/screens/CovoituragePublish';
import Toast from 'react-native-toast-message';

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();
const MarketplaceStackNav = createNativeStackNavigator<any>();
const CovoiturageStackNav = createNativeStackNavigator<any>();
const FacturationStackNav = createNativeStackNavigator<any>();
const InspectionsStackNav = createNativeStackNavigator<any>();

// Configuration simple de React Query pour React Native
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function HeaderActions({ onMessages, onList, onBell }: { onMessages?: () => void; onList?: () => void; onBell?: () => void }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {onMessages && (
        <Pressable onPress={onMessages} style={{ paddingHorizontal: 8 }}>
          <MaterialIcons name="chat-bubble-outline" size={20} color="#38bdf8" />
        </Pressable>
      )}
      {onList && (
        <Pressable onPress={onList} style={{ paddingHorizontal: 8 }}>
          <MaterialIcons name="format-list-bulleted" size={20} color="#a78bfa" />
        </Pressable>
      )}
      {onBell && (
        <Pressable onPress={onBell} style={{ paddingLeft: 8 }}>
          <MaterialIcons name="notifications-none" size={20} color="#f59e0b" />
        </Pressable>
      )}
    </View>
  );
}

function MarketplaceStack() {
  return (
    <MarketplaceStackNav.Navigator id={undefined} screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#0b1220' }, headerTintColor: 'white' }}>
      <MarketplaceStackNav.Screen
        name="MarketplaceHome"
        component={MarketplaceScreenComplete}
        options={({ navigation }) => ({
          title: 'Marketplace',
          headerRight: () => (
            <HeaderActions
              onMessages={() => navigation.navigate('MarketplaceMessages')}
              onList={() => navigation.navigate('ActiveMissions')}
              onBell={() => navigation.navigate('Notifications')}
            />
          ),
        })}
      />
  <MarketplaceStackNav.Screen name="ActiveMissions" component={InspectionsScreenComplete} options={{ title: 'Missions actives', headerShown: false }} />
      <MarketplaceStackNav.Screen name="MarketplaceMessages" component={MarketplaceMessagesScreen} options={{ title: 'Messages' }} />
      <MarketplaceStackNav.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </MarketplaceStackNav.Navigator>
  );
}

function CovoiturageStack() {
  return (
    <CovoiturageStackNav.Navigator id={undefined} screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#0b1220' }, headerTintColor: 'white' }}>
      <CovoiturageStackNav.Screen
        name="CovoiturageHome"
        component={CovoiturageScreenComplete}
        options={({ navigation }) => ({
          title: 'Covoiturage',
          headerRight: () => (
            <HeaderActions
              onMessages={() => navigation.navigate('CovoiturageMessages')}
              onList={() => navigation.navigate('CovoiturageMyTrips')}
            />
          ),
        })}
      />
      <CovoiturageStackNav.Screen name="CovoiturageMyTrips" component={CovoiturageMyTrips} options={{ title: 'Mes trajets' }} />
      <CovoiturageStackNav.Screen name="CovoiturageMessages" component={CovoiturageMessages} options={{ title: 'Messages' }} />
      <CovoiturageStackNav.Screen name="CovoiturageTripDetails" component={CovoiturageTripDetails} options={{ title: 'Détails' }} />
      <CovoiturageStackNav.Screen name="CovoituragePublish" component={CovoituragePublish} options={{ title: 'Publier un trajet' }} />
    </CovoiturageStackNav.Navigator>
  );
}

function FacturationStack() {
  return (
    <FacturationStackNav.Navigator id={undefined} screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#0b1220' }, headerTintColor: 'white' }}>
      <FacturationStackNav.Screen name="FacturationHome" component={FacturationScreenComplete} options={{ title: 'Facturation' }} />
      <FacturationStackNav.Screen name="Devis" component={DevisScreen} options={{ title: 'Devis' }} />
    </FacturationStackNav.Navigator>
  );
}

function InspectionsStack() {
  return (
    <InspectionsStackNav.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <InspectionsStackNav.Screen name="InspectionsHome" component={InspectionsScreenComplete} />
      <InspectionsStackNav.Screen name="MissionWizard" component={MissionWizardScreen} />
      <InspectionsStackNav.Screen name="InAppNavigation" component={InAppNavigationScreen} />
      <InspectionsStackNav.Screen name="CreateMission" component={CreateMissionScreen} options={{ headerShown: false }} />
    </InspectionsStackNav.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 16);
  const topPad = Platform.OS === 'android' ? 10 : 12;

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#6b7280',
        tabBarBackground: () => (
          <LinearGradient
            colors={['#0b1220', '#0e1930', '#0b1220']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: bottom,
          paddingTop: topPad,
          // Laisse la hauteur auto pour mieux s'adapter aux insets Android
          elevation: 12,
          shadowColor: '#00d9ff',
          shadowOpacity: 0.15,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
        },
        tabBarItemStyle: {
          paddingTop: Platform.OS === 'android' ? 2 : 4,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 0 : 2,
        },
      }}
    >
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceStack}
        options={{
          title: 'Marketplace',
          tabBarLabel: 'Marketplace',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="shopping-bag" color={focused ? '#e5e7eb' : '#9ca3af'} size={size} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Inspections" 
        component={InspectionsStack}
        options={{
          title: 'Inspections',
          tabBarLabel: 'Inspections',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="check-square" color={focused ? '#e5e7eb' : '#9ca3af'} size={size} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Covoiturage" 
        component={CovoiturageStack}
        options={{
          title: 'Covoiturage',
          tabBarLabel: 'Covoiturage',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="users" color={focused ? '#e5e7eb' : '#9ca3af'} size={size} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{
          title: 'Boutique',
          tabBarLabel: 'Boutique',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="shopping-cart" color={focused ? '#e5e7eb' : '#9ca3af'} size={size} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Facturation" 
        component={FacturationStack}
        options={{
          title: 'Facturation',
          tabBarLabel: 'Facturation',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="file-text" color={focused ? '#e5e7eb' : '#9ca3af'} size={size} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              <Feather name="user" color={focused ? '#e5e7eb' : '#9ca3af'} size={size} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { loading, user } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1220' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Chargement...</Text>
      </View>
    );
  }
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
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

// Error Boundary pour capturer les erreurs de rendu
class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; err?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, err: error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Log vers la console pour apparition dans le terminal Metro
    console.error('[ErrorBoundary] Render error:', error?.message, error?.stack, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220', padding: 16 }}>
          <Text style={{ color: '#f87171', fontWeight: '800', fontSize: 16, marginBottom: 8 }}>Une erreur est survenue</Text>
          <Text style={{ color: '#e5e7eb', textAlign: 'center' }}>Vérifiez le terminal pour les détails. Secouez l'appareil pour ouvrir le menu développeur.</Text>
        </View>
      );
    }
    return this.props.children as any;
  }
}

// Gestionnaires globaux pour erreurs JS runtime
(function installGlobalErrorHandlers() {
  try {
    // Erreurs JS non interceptées
    // @ts-ignore
    if (typeof ErrorUtils !== 'undefined' && ErrorUtils?.setGlobalHandler) {
      // @ts-ignore
      const prev = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
      // @ts-ignore
      ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
        console.error('[GlobalError]', { isFatal, message: error?.message, stack: error?.stack });
        if (prev) try { prev(error, isFatal); } catch {}
      });
    }
    // Rejets de promesses non gérés
    const anyGlobal: any = globalThis as any;
    if (anyGlobal?.addEventListener) {
      anyGlobal.addEventListener('unhandledrejection', (event: any) => {
        console.error('[UnhandledPromiseRejection]', event?.reason || event);
      });
    }
    if ((anyGlobal?.process as any)?.on) {
      try {
        (anyGlobal.process as any).on('unhandledRejection', (reason: any) => {
          console.error('[UnhandledRejection(process)]', reason);
        });
      } catch {}
    }
  } catch {}
})();

export default function App() {
  return (
    <>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" backgroundColor="#0b1220" translucent={false} />
      )}
      <SafeAreaProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </AuthProvider>
      </SafeAreaProvider>
      <Toast />
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
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
    padding: Platform.OS === 'android' ? 8 : 10,
    // Supprime la translation pour éviter les chevauchements avec la barre système
  },
  iconWrapperFocused: {
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    borderRadius: 9999,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.75,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    marginTop: 4,
    height: 3,
    width: 16,
    borderRadius: 2,
    backgroundColor: '#06b6d4',
  },
});