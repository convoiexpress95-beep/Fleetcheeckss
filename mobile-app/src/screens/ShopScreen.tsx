import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const PLANS: Array<{ key: 'debutant'|'pro'|'expert'|'entreprise'; title: string; price: string; perks: string[]; color: string }> = [
  { key: 'debutant', title: 'Débutant', price: '19€ / mois', perks: ['10 crédits', 'Support standard'], color: '#38bdf8' },
  { key: 'pro', title: 'Pro', price: '49€ / mois', perks: ['50 crédits', 'Support prioritaire'], color: '#22d3ee' },
  { key: 'expert', title: 'Expert', price: '99€ / mois', perks: ['120 crédits', 'Support premium'], color: '#34d399' },
  { key: 'entreprise', title: 'Entreprise', price: 'Sur devis', perks: ['Crédits illimités', 'SLA dédié'], color: '#f59e0b' },
];

export default function ShopScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const createPayment = async (planType: 'debutant' | 'pro' | 'expert' | 'entreprise') => {
    if (!user) return;
    setLoading(planType);
    try {
      const { data, error } = await supabase.functions.invoke('create-mollie-payment', {
        body: { planType },
      });
      if (error) throw error;
      if (data?.checkoutUrl) {
        await WebBrowser.openBrowserAsync(data.checkoutUrl);
      }
    } catch (e) {
      console.error('createPayment error', e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boutique</Text>
      <Text style={styles.subtitle}>Choisissez votre offre</Text>

      {PLANS.map((p) => (
        <View key={p.key} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: p.color }]}>{p.title}</Text>
            <Text style={styles.cardPrice}>{p.price}</Text>
          </View>
          <View style={styles.perks}>
            {p.perks.map((perk) => (
              <Text key={perk} style={styles.perk}>• {perk}</Text>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.cta, { borderColor: p.color }]}
            onPress={() => createPayment(p.key)}
            disabled={!!loading}
          >
            {loading === p.key ? (
              <ActivityIndicator color={p.color} />
            ) : (
              <Text style={[styles.ctaText, { color: p.color }]}>Payer avec Mollie</Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#94a3b8', marginBottom: 16 },
  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 14, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  cardPrice: { color: '#e5e7eb', fontWeight: '700' },
  perks: { gap: 6, marginBottom: 10 },
  perk: { color: '#94a3b8' },
  cta: { borderWidth: 2, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  ctaText: { fontWeight: '800' },
});