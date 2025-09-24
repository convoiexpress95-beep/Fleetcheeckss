import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Aucune notification pour le moment.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#94a3b8' },
});