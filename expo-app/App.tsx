import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/lib/auth';

function Gate() {
  const { loading, session } = useAuth();
  if (loading) return <Text className="p-4">Chargement...</Text>;
  if (!session) return <Text className="p-4">Non connecté (TODO: écran login)</Text>;
  return <RootNavigator />;
}
export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }} className="bg-white">
        <Gate />
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}
