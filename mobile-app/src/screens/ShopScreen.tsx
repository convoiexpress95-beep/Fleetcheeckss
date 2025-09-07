import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCredits } from '../hooks/useCredits';
import { colors } from '../theme';

const creditPacks = [
  { id: 'pack-10', label: 'Pack Découverte', credits: 10, price: '€9.90', color: '#22c55e' },
  { id: 'pack-25', label: 'Pack Pro', credits: 25, price: '€22.90', color: '#3b82f6' },
  { id: 'pack-50', label: 'Pack Business', credits: 50, price: '€39.90', color: '#a855f7' },
];

const plans = [
  { id: 'plan-basic', label: 'Basic', desc: '20 crédits/mois', credits: 20, price: '€14.90/mois', color: '#0ea5e9' },
  { id: 'plan-pro', label: 'Pro', desc: '50 crédits/mois', credits: 50, price: '€29.90/mois', color: '#8b5cf6' },
  { id: 'plan-illimite', label: 'Illimité', desc: 'Crédits illimités', credits: 0, price: '€99.00/mois', color: '#22c55e', plan: 'illimite' },
];

export const ShopScreen: React.FC = () => {
  const { balance, loading, addCredits } = useCredits();

  const onBuyPack = async (pack: (typeof creditPacks)[number]) => {
    await addCredits(pack.credits);
  };

  const onSubscribePlan = async (plan: (typeof plans)[number]) => {
    await addCredits(plan.credits || 0, plan.plan || plan.label.toLowerCase());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Boutique</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.balance}>
            <Ionicons name="flash" size={16} color={colors.accent} />
            <Text style={styles.balanceText}>
              {balance?.plan_type === 'illimite' ? 'Illimité' : `${balance?.credits_remaining ?? 0} crédits`}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Packs de crédits</Text>
      <View style={styles.grid}>
        {creditPacks.map((pack) => (
          <TouchableOpacity key={pack.id} style={[styles.card, { borderLeftColor: pack.color }]} onPress={() => onBuyPack(pack)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{pack.label}</Text>
              <Text style={[styles.price, { color: pack.color }]}>{pack.price}</Text>
            </View>
            <Text style={styles.credits}><Text style={styles.creditsValue}>{pack.credits}</Text> crédits</Text>
            <View style={styles.cardCta}>
              <Ionicons name="cart" size={16} color="#fff" />
              <Text style={styles.cardCtaText}>Acheter</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Abonnements</Text>
      <View style={styles.grid}>
        {plans.map((plan) => (
          <TouchableOpacity key={plan.id} style={[styles.card, { borderLeftColor: plan.color }]} onPress={() => onSubscribePlan(plan)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{plan.label}</Text>
              <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
            </View>
            <Text style={styles.desc}>{plan.desc}</Text>
            <View style={[styles.cardCta, { backgroundColor: plan.color }]}>
              <Ionicons name="flash" size={16} color="#fff" />
              <Text style={styles.cardCtaText}>S'abonner</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, backgroundColor: colors.headerBg, borderBottomWidth: 1, borderBottomColor: colors.tabBorder },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceText: { marginLeft: 6, color: colors.accent, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  grid: { paddingHorizontal: 20, gap: 12, paddingBottom: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  price: { fontSize: 14, fontWeight: '700' },
  credits: { color: colors.textMuted, marginBottom: 10 },
  creditsValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  desc: { color: colors.textMuted, marginBottom: 10 },
  cardCta: { marginTop: 6, backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', gap: 6 },
  cardCtaText: { color: '#fff', fontWeight: '600' },
});

export default ShopScreen;
