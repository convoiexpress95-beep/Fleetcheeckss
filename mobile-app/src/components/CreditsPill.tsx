import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCredits } from '../hooks/useCredits';

export const CreditsPill: React.FC<{ onPress?: () => void } > = ({ onPress }) => {
  const { balance, loading } = useCredits();

  const isUnlimited = balance?.plan_type === 'illimite';
  const credits = balance?.credits_remaining ?? 0;

  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} disabled={loading}>
      <View style={styles.left}>
        <Ionicons name={isUnlimited ? 'flash' : 'wallet'} size={14} color="#fff" />
        <Text style={styles.text}>{isUnlimited ? '∞' : credits}</Text>
      </View>
      <Ionicons name="add" size={16} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: { color: '#fff', fontWeight: '700' },
});
