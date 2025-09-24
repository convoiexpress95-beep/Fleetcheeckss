import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function CovoiturageMyTrips() {
  const data = [] as Array<{ id: string; title: string; subtitle?: string }>;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes trajets</Text>
      {data.length === 0 ? (
        <Text style={styles.empty}>Aucun trajet pour le moment.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.cardSubtitle}>{item.subtitle}</Text> : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 12 },
  empty: { color: '#9ca3af' },
  card: { backgroundColor: '#111827', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardTitle: { color: 'white', fontWeight: '600' },
  cardSubtitle: { color: '#9ca3af', marginTop: 2 },
});