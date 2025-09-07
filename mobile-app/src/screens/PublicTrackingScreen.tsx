import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { supabase } from '../config/supabase';
import { WEB_BASE_URL } from '../config/app';
import Toast from 'react-native-toast-message';
import { useMissions } from '../hooks/useMissions';

const PublicTrackingScreen: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const { data: missions } = useMissions();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const buildUrl = (token: string) => {
    const base = WEB_BASE_URL || 'https://app.fleetcheck.fr';
    return `${base}/public-tracking/${token}`;
  };

  const open = async () => {
    if (!lastUrl) return;
    await Linking.openURL(lastUrl);
  };

  const shareLink = async () => {
    if (!lastUrl) return;
    await Share.share({ message: lastUrl });
  };

  const generateLink = async () => {
    try {
      setBusy(true);
      if (!selectedMissionId) throw new Error('Sélectionnez une mission');
      const { data, error } = await supabase.functions.invoke('generate-tracking-link', {
        body: { missionId: selectedMissionId },
      });
      if (error) throw error;
      const token = data?.trackingToken as string | undefined;
      if (!token) throw new Error('Token introuvable');
      const url = buildUrl(token);
      setLastUrl(url);
      await Share.share({ message: url });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Génération du lien impossible' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suivi public</Text>
      <Text style={styles.subtitle}>Consultez la position d’une mission via un lien public.</Text>
      {/* Sélection de mission */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#6b7280', marginBottom: 6 }}>Choisir une mission</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(missions || []).filter(m => m.status !== 'completed' && m.status !== 'cancelled').slice(0, 6).map(m => (
            <TouchableOpacity key={m.id} onPress={() => setSelectedMissionId(m.id)} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selectedMissionId === m.id ? '#2563eb' : '#e5e7eb', backgroundColor: selectedMissionId === m.id ? '#dbeafe' : 'white' }}>
              <Text style={{ color: '#111827', fontWeight: '600' }} numberOfLines={1}>{m.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
  <TouchableOpacity style={[styles.btn, { backgroundColor: selectedMissionId ? '#2563eb' : '#9ca3af' }]} onPress={generateLink} disabled={busy || !selectedMissionId}>
        <Text style={styles.btnText}>{busy ? 'Génération…' : 'Générer et partager le lien'}</Text>
      </TouchableOpacity>
      {!!lastUrl && (
        <View style={{ marginTop: 8 }}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#6b7280' }]} onPress={open}>
            <Text style={styles.btnText}>Ouvrir le lien</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280', marginBottom: 12 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
});

export default PublicTrackingScreen;
