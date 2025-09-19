import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

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
        // Ouvrir la page de paiement Mollie
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
      <Text style={styles.title}>Boutique de crédits</Text>
      <Text style={styles.subtitle}>Achetez des crédits pour le marketplace et les services</Text>

      {(['debutant','pro','expert','entreprise'] as const).map((plan) => (
        <TouchableOpacity key={plan} style={styles.card} onPress={() => createPayment(plan)} disabled={!!loading}>
          <Text style={styles.cardTitle}>{plan.toUpperCase()}</Text>
          {loading === plan ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cardCta}>Acheter avec Mollie</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#94a3b8', marginBottom: 16 },
  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#e5e7eb', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardCta: { color: '#22c55e', fontWeight: '700' },
});