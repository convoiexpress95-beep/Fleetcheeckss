import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useMissions } from '../hooks/useMissions';
import MapboxGL from '../config/mapbox';
import { Ionicons } from '@expo/vector-icons';

const TrackingScreen: React.FC = () => {
  const { location, getCurrentLocation, startTracking, stopTracking, isTracking } = useLocation();
  const { data: missions } = useMissions();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const onStart = async () => {
    if (!selectedMissionId) return;
    const sub = await startTracking(selectedMissionId);
    setSubscription(sub);
  };

  const onStop = () => {
    if (subscription?.remove) subscription.remove();
    stopTracking();
    setSubscription(null);
  };

  const center = location ? [location.longitude, location.latitude] as [number, number] : undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suivi temps réel</Text>
      {/* Sélection de mission */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#6b7280', marginBottom: 6 }}>Choisir une mission à suivre</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(missions || []).filter(m => m.status !== 'completed' && m.status !== 'cancelled').slice(0, 6).map(m => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMissionId(m.id)}
              style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selectedMissionId === m.id ? '#2563eb' : '#e5e7eb', backgroundColor: selectedMissionId === m.id ? '#dbeafe' : 'white' }}>
              <Text style={{ color: '#111827', fontWeight: '600' }} numberOfLines={1}>{m.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.mapWrap}>
        {center ? (
          MapboxGL?.MapView ? (
            <MapboxGL.MapView style={{ flex: 1 }} styleURL={MapboxGL.StyleURL?.Street}>
              {MapboxGL?.Camera ? <MapboxGL.Camera zoomLevel={14} centerCoordinate={center} /> : null}
              {MapboxGL?.PointAnnotation ? (
                <MapboxGL.PointAnnotation id="current" coordinate={center}>
                  <View style={{ transform: [{ rotate: '45deg' }] }}>
                    <Ionicons name="navigate" size={28} color="#2563eb" />
                  </View>
                </MapboxGL.PointAnnotation>
              ) : null}
            </MapboxGL.MapView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.subtitle}>Carte Mapbox non disponible sur cette plateforme.</Text>
            </View>
          )
        ) : (
          <Text style={styles.subtitle}>Position en cours d’obtention…</Text>
        )}
      </View>
      <View style={styles.actions}>
        {!isTracking ? (
          <TouchableOpacity disabled={!selectedMissionId} style={[styles.btn, { backgroundColor: selectedMissionId ? '#10b981' : '#9ca3af' }]} onPress={onStart}>
            <Text style={styles.btnText}>Démarrer le suivi</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444' }]} onPress={onStop}>
            <Text style={styles.btnText}>Arrêter le suivi</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280' },
  mapWrap: { height: 320, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb' },
  actions: { marginTop: 12 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
});

export default TrackingScreen;
