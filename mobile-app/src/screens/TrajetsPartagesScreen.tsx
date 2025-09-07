import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrajetsPartagesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trajets partagés</Text>
      <Text style={styles.subtitle}>Partagez vos trajets avec des clients.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280' },
});

export default TrajetsPartagesScreen;
