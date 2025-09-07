import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotFoundScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.subtitle}>Cette section n’existe pas sur mobile.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280' },
});

export default NotFoundScreen;
