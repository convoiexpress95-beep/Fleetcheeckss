import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DevisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devis</Text>
      <Text style={styles.subtitle}>Générez et suivez vos devis (à l'identique du web, version mobile en cours).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#94a3b8' },
});