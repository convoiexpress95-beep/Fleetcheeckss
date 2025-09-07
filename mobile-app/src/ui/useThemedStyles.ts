import { StyleSheet } from 'react-native';
import { useThemeMode } from '../contexts/ThemeContext';

export const useThemedStyles = () => {
  const { colors } = useThemeMode();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    muted: { color: colors.textMuted },
    mutedSmall: { color: colors.textMuted, fontSize: 12 },
    micro: { color: colors.textMuted, fontSize: 12 },
    card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 12, padding: 12 },
    kpi: { fontSize: 18, fontWeight: '800', color: colors.accent },
    value: { fontWeight: '700', color: colors.text },
    badge: { color: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontWeight: '700', textAlign: 'center' },
    input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 10, padding: 12, color: colors.text, flex: 1 },
  });
  return { colors, styles };
};
