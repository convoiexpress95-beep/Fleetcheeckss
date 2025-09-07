import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MarketplaceScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Hero */}
      <View style={styles.heroRow}>
        <View style={[styles.heroIcon, { backgroundColor: '#2563eb' }]}>
          <Ionicons name="briefcase" size={22} color="#fff" />
        </View>
        <View>
          <Text style={styles.title}>Marketplace des missions</Text>
          <Text style={styles.subtitle}>Chercher une mission ou poster la vôtre</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TouchableOpacity style={[styles.primaryBtn]} onPress={() => nav.navigate('Missions')}>
          <Ionicons name="search" size={16} color="#fff" />
          <Text style={styles.primaryBtnText}>Chercher des missions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryBtn]} onPress={() => nav.navigate('NewMissionWizard') }>
          <Ionicons name="add" size={16} color="#111827" />
          <Text style={styles.secondaryBtnText}>Poster une mission</Text>
        </TouchableOpacity>
      </View>

      {/* Search hint */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          placeholder="Filtrer (titre, référence, lieu…) — redirection vers Liste"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => nav.navigate('Missions')}
        />
      </View>

      {/* Shortcuts */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => nav.navigate('Missions')}>
          <View style={[styles.cardIcon, { backgroundColor: '#0ea5e9' }]}>
            <Ionicons name="list" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Voir toutes les missions</Text>
            <Text style={styles.cardDesc}>Accéder à la liste et filtrer</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => nav.navigate('NewMissionWizard')}>
          <View style={[styles.cardIcon, { backgroundColor: '#10b981' }]}>
            <Ionicons name="add-circle" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Créer une mission</Text>
            <Text style={styles.cardDesc}>Ouvrir l’assistant de création</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  heroIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#475569' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e2e8f0', paddingHorizontal: 12, borderRadius: 12, height: 40, marginVertical: 12 },
  searchInput: { flex: 1, color: '#0f172a' },
  grid: { display: 'flex', gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardDesc: { fontSize: 12, color: '#64748b' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  secondaryBtnText: { color: '#111827', fontWeight: '700' },
});

export default MarketplaceScreen;
