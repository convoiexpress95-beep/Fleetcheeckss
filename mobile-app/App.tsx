import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
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
import ReportsScreen from './src/screens/ReportsScreen';
import { ContactsScreen } from './src/screens/ContactsScreen';
import NewMissionWizard from './src/screens/NewMissionWizard';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { useAuth } from './src/contexts/AuthContext';
import ShopScreen from './src/screens/ShopScreen';
import { CreditsPill } from './src/components/CreditsPill';
import { useNavigation } from '@react-navigation/native';
import theme from './src/theme';

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
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: theme.tokens.colors.card, borderTopColor: theme.tokens.colors?.border ?? '#111827' },
        tabBarActiveTintColor: theme.tokens.colors.primary,
        tabBarInactiveTintColor: '#7a8aa0',
        headerStyle: {
          backgroundColor: theme.tokens.colors.card,
        },
        headerTintColor: theme.tokens.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Inter_600SemiBold',
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
        options={{ 
          title: 'Rapports',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'document' : 'document-outline'} size={size} color={color} />
          )
        }}
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
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{ title: 'Boutique',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="NewMissionWizard"
        component={NewMissionWizard}
        options={{
          title: 'Nouvelle mission',
          tabBarButton: () => null, // onglet masqué
        }}
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
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const paperThemeWithFonts = {
    ...theme.paperTheme,
    fonts: {
      ...theme.paperTheme.fonts,
      bodyLarge: { ...theme.paperTheme.fonts.bodyLarge, fontFamily: 'Inter_400Regular' },
      bodyMedium: { ...theme.paperTheme.fonts.bodyMedium, fontFamily: 'Inter_400Regular' },
      bodySmall: { ...theme.paperTheme.fonts.bodySmall, fontFamily: 'Inter_400Regular' },
      titleLarge: { ...theme.paperTheme.fonts.titleLarge, fontFamily: 'Inter_600SemiBold' },
      titleMedium: { ...theme.paperTheme.fonts.titleMedium, fontFamily: 'Inter_600SemiBold' },
      titleSmall: { ...theme.paperTheme.fonts.titleSmall, fontFamily: 'Inter_600SemiBold' },
      labelLarge: { ...theme.paperTheme.fonts.labelLarge, fontFamily: 'Inter_500Medium' },
      labelMedium: { ...theme.paperTheme.fonts.labelMedium, fontFamily: 'Inter_500Medium' },
      labelSmall: { ...theme.paperTheme.fonts.labelSmall, fontFamily: 'Inter_500Medium' },
      headlineLarge: { ...theme.paperTheme.fonts.headlineLarge, fontFamily: 'Inter_700Bold' },
      headlineMedium: { ...theme.paperTheme.fonts.headlineMedium, fontFamily: 'Inter_700Bold' },
      headlineSmall: { ...theme.paperTheme.fonts.headlineSmall, fontFamily: 'Inter_700Bold' },
    },
  } as const;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperThemeWithFonts}>
        <AuthProvider>
          <NavigationContainer theme={theme.navTheme}>
            <StatusBar style="light" />
            <View style={{ flex: 1, backgroundColor: theme.tokens.colors.background }}>
              {fontsLoaded ? <AppContent /> : null}
            </View>
            <Toast />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}