import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, Appearance, TextInput } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, LatLng, Camera, MapStyleElement } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useKeepAwake } from 'expo-keep-awake';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { NAV_BG_TASK } from '../navigation/backgroundTasks';

type StepInfo = {
  instruction: string;
  distanceText: string;
  durationText: string;
  polyline: LatLng[];
};

function decodePolyline(encoded: string): LatLng[] {
  let index = 0, lat = 0, lng = 0, points: LatLng[] = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export default function InAppNavigationScreen({ route, navigation }: any) {
  const { destination: rawDestination, title, reference, missionId, userId } = route?.params || ({} as { destination: string; title?: string; reference?: string; missionId?: string; userId?: string });
  const destination = (rawDestination ?? '').toString().trim();
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [currentPos, setCurrentPos] = useState<LatLng | null>(null);
  const [nextStepIdx, setNextStepIdx] = useState(0);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [muted, setMuted] = useState(false);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const [remainingKm, setRemainingKm] = useState<number | null>(null);
  const [arrived, setArrived] = useState(false);
  const [showArrivalPrompt, setShowArrivalPrompt] = useState(false);
  const [lastRecalcAt, setLastRecalcAt] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [follow, setFollow] = useState(true);
  const [destInput, setDestInput] = useState(destination);
  const [showStartPrompt, setShowStartPrompt] = useState(true);
  useKeepAwake();

  // Theme: auto day/night using system scheme and hour of day
  useEffect(() => {
    const compute = () => {
      const scheme = Appearance.getColorScheme();
      const hour = new Date().getHours();
      const nightByTime = hour >= 19 || hour < 7; // 19h-7h
      setIsDark(scheme === 'dark' || nightByTime);
    };
    compute();
    const sub = Appearance.addChangeListener(() => compute());
    const t = setInterval(compute, 5 * 60 * 1000); // re-evaluate every 5 min
    return () => { sub.remove(); clearInterval(t); };
  }, []);

  // Helper to call directions function with fallback
  const fetchDirections = async (origin: string, dest: string) => {
    // Try FR proxy first
    let lastError: any = null;
    for (const fn of ['obtenir-itineraire', 'get-directions'] as const) {
      try {
        const { data, error } = await supabase.functions.invoke(fn, { body: { origin, destination: dest, mode: 'driving', language: 'fr' } });
        if (error) throw error;
        return data as any;
      } catch (err: any) {
        lastError = err;
        const status = err?.context?.status || err?.status;
        const body = err?.context?.body;
        let details = '';
        try {
          if (typeof body === 'string' && body.trim().startsWith('{')) {
            const parsed = JSON.parse(body);
            details = parsed?.error || parsed?.message || body;
          } else if (typeof body === 'string') {
            details = body;
          }
        } catch {}
        console.warn(`[Navigation] ${fn} failed`, { status, details, message: err?.message });
      }
    }
    throw new Error(lastError?.message || 'Erreur itinéraire');
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Localisation', 'Permission refusée'); navigation.goBack(); return; }
        if (!destination) { Alert.alert('Navigation', "Adresse de destination manquante"); navigation.goBack(); return; }
        if (missionId) await AsyncStorage.setItem('nav_current_mission_id', missionId);
        if (userId) await AsyncStorage.setItem('nav_current_user_id', userId);
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCurrentPos({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch (e: any) {
        Alert.alert('Navigation', e?.message || 'Erreur');
        navigation.goBack();
      } finally { setLoading(false); }
    };
    prepare();
    return () => {
      if (watchRef.current) { watchRef.current.remove(); watchRef.current = null; }
      // stop background updates
      Location.hasStartedLocationUpdatesAsync(NAV_BG_TASK).then((started) => { if (started) Location.stopLocationUpdatesAsync(NAV_BG_TASK); }).catch(() => {});
    };
  }, []);

  const startNavigation = async () => {
    try {
      setShowStartPrompt(false);
      setLoading(true);
      // start background updates when navigation starts
      try {
        await Location.startLocationUpdatesAsync(NAV_BG_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
          foregroundService: {
            notificationTitle: 'Navigation en cours',
            notificationBody: 'Guidage actif',
          },
          pausesUpdatesAutomatically: true,
          showsBackgroundLocationIndicator: true,
        });
      } catch {}
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
      setCurrentPos({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const to = (destInput || destination).trim();
      const data = await fetchDirections(origin, to);
      const overview: string | undefined = data?.overview_polyline;
      const apiSteps: any[] = data?.steps || [];
      if (!overview || apiSteps.length === 0) { throw new Error('Itinéraire introuvable'); }
      setRoutePoints(decodePolyline(overview));
      setSteps(apiSteps.map(s => ({
        instruction: s.instruction,
        distanceText: s.distanceText,
        durationText: s.durationText,
        polyline: s.polyline ? decodePolyline(s.polyline) : [],
      })));
      if (typeof data?.routeDistanceMeters === 'number') setRemainingKm(Math.max(0, data.routeDistanceMeters / 1000));
      if (typeof data?.routeDurationSeconds === 'number') setEtaMin(Math.max(0, Math.round(data.routeDurationSeconds / 60)));
      speakInstruction(apiSteps?.[0]?.instruction);
    } catch (e: any) {
      Alert.alert('Navigation', e?.message || 'Erreur itinéraire');
      navigation.goBack();
    } finally { setLoading(false); }
  };

  // Suivre la position et avancer dans les étapes
  useEffect(() => {
    (async () => {
      if (!steps.length) return;
      if (watchRef.current) return;
      const lastRef = { p: null as LatLng | null, t: 0 };
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 3 },
        (pos) => {
          const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCurrentPos(p);
          const hdg = typeof pos.coords.heading === 'number' && isFinite(pos.coords.heading) ? pos.coords.heading : 0;
          setHeading(hdg);
          // Speed (km/h): prefer native, fallback to distance/time with smoothing
          let spKmh = Number.isFinite(pos.coords.speed) ? pos.coords.speed * 3.6 : NaN;
          const nowMs = Date.now();
          if (!Number.isFinite(spKmh)) {
            const last = lastRef.p; const lastT = lastRef.t;
            if (last && lastT) {
              const dt = Math.max(0.5, (nowMs - lastT) / 1000); // sec
              const d = haversineMeters(last, p); // m
              spKmh = (d / dt) * 3.6;
            }
          }
          lastRef.p = p; lastRef.t = nowMs;
          if (Number.isFinite(spKmh)) {
            setCurrentSpeedKmh(prev => {
              const alpha = 0.6; // smoothing
              const val = alpha * spKmh! + (1 - alpha) * (Number.isFinite(prev) ? prev : spKmh!);
              return Math.max(0, Math.round(val * 10) / 10);
            });
          }

          // Camera follow with heading
          if (mapRef.current && follow) {
            const cam: Partial<Camera> = {
              center: p,
              heading: hdg,
              pitch: 50,
              // Use platform-appropriate zoom/altitude for a GPS-like view
              ...(Platform.OS === 'ios' ? { altitude: 500 } : { zoom: 17 }),
            };
            try { mapRef.current.animateCamera(cam as Camera, { duration: 600 }); } catch {}
          }

          // Advance step when close to end of current step
          const next = steps[nextStepIdx];
          if (next && next.polyline.length > 0) {
            const last = next.polyline[next.polyline.length - 1];
            const dToEnd = haversineMeters(p, last);
            if (dToEnd < 30) { // within 30m of step end
              setNextStepIdx((i) => {
                const ni = Math.min(i + 1, steps.length - 1);
                if (ni !== i) speakInstruction(steps[ni]?.instruction);
                return ni;
              });
            }
          }

          // Off-route detection (distance to polyline)
          const off = distanceToPathMeters(p, routePoints) > 80; // 80m off route
          const now = Date.now();
          if (off && now - lastRecalcAt > 15000) { // recalc at most every 15s
            setLastRecalcAt(now);
            recalcFrom(p, (destInput || destination));
          }

          // Arrival detection: close to final route point
          if (routePoints.length) {
            const dest = routePoints[routePoints.length - 1];
            const dToDest = haversineMeters(p, dest);
            if (dToDest < 25 && !arrived) {
              setArrived(true);
              speak("Vous êtes arrivé à destination.");
            }
          }
        }
      );
    })();
  }, [steps, nextStepIdx, routePoints, lastRecalcAt, arrived]);

  // When arrived, show prompt to start arrival inspection
  useEffect(() => {
    if (arrived) setShowArrivalPrompt(true);
  }, [arrived]);

  const speak = (text: string) => {
    if (muted) return;
    try { Speech.speak(text, { language: 'fr-FR', pitch: 1.0 }); } catch {}
  };

  const etaArrivalTime = useMemo(() => {
    if (etaMin === null) return null;
    const d = new Date(Date.now() + etaMin * 60000);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}h${mm}`;
  }, [etaMin]);

  const darkMapStyle: MapStyleElement[] = [
    { elementType: 'geometry', stylers: [{ color: '#0b1220' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ecae6' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1220' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#93c5fd' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  ];
  const lightMapStyle: MapStyleElement[] = [
    { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#1f2937' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
  ];

  const maneuverIconName = (step?: any): string => {
    const g = (step?.maneuver || step?.maneuverType || '').toString();
    const m = (step?.maneuverModifier || '').toString();
    // Google: s.maneuver like 'turn-left', 'turn-right', 'merge', 'roundabout-left'...
    // Mapbox: type/modifier e.g. type='turn', modifier='left'
    if (g.includes('roundabout') || step?.maneuverType === 'roundabout') return 'navigation';
    const key = g || step?.maneuverType || '';
    if (key.includes('left') || m === 'left') return 'arrow-left-bold';
    if (key.includes('right') || m === 'right') return 'arrow-right-bold';
    if (key.includes('uturn') || m === 'uturn') return 'arrow-left-bold';
    if (key.includes('merge')) return 'call-merge';
    if (key.includes('fork')) return 'source-branch';
    if (key.includes('straight') || m === 'straight') return 'arrow-up-bold';
    return 'navigation';
  };

  const cleanHtml = (s: string) => s?.replace(/<[^>]*>?/gm, '') || '';
  const speakInstruction = (html?: string) => {
    const plain = cleanHtml(html || '');
    if (plain) speak(plain);
  };

  const nextStep = steps[nextStepIdx];

  const nextStepDistanceMeters = useMemo(() => {
    if (!currentPos || !nextStep || !nextStep.polyline?.length) return null;
    const last = nextStep.polyline[nextStep.polyline.length - 1];
    return haversineMeters(currentPos, last);
  }, [currentPos, nextStep]);

  const formatShortDistance = (m?: number | null) => {
    if (m == null || !isFinite(m)) return '';
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  const recalc = async (to?: string) => {
    if (!currentPos) return;
    try {
      setLoading(true);
      const origin = `${currentPos.latitude},${currentPos.longitude}`;
      const data = await fetchDirections(origin, (to || destInput || destination));
      const overview: string | undefined = data?.overview_polyline;
      const apiSteps: any[] = data?.steps || [];
      setRoutePoints(overview ? decodePolyline(overview) : []);
      setSteps(apiSteps.map(s => ({
        instruction: s.instruction,
        distanceText: s.distanceText,
        durationText: s.durationText,
        polyline: s.polyline ? decodePolyline(s.polyline) : [],
      })));
      setNextStepIdx(0);
      if (typeof data?.routeDistanceMeters === 'number') setRemainingKm(Math.max(0, data.routeDistanceMeters / 1000));
      if (typeof data?.routeDurationSeconds === 'number') setEtaMin(Math.max(0, Math.round(data.routeDurationSeconds / 60)));
      speakInstruction(apiSteps?.[0]?.instruction);
    } catch (e: any) {
      Alert.alert('Recalcul', e?.message || 'Impossible de recalculer');
    } finally { setLoading(false); }
  };

  const recalcFrom = async (pos: LatLng, to?: string) => {
    try {
      const origin = `${pos.latitude},${pos.longitude}`;
      const data = await fetchDirections(origin, (to || destInput || destination));
      const overview: string | undefined = data?.overview_polyline;
      const apiSteps: any[] = data?.steps || [];
      setRoutePoints(overview ? decodePolyline(overview) : []);
      setSteps(apiSteps.map(s => ({
        instruction: s.instruction,
        distanceText: s.distanceText,
        durationText: s.durationText,
        polyline: s.polyline ? decodePolyline(s.polyline) : [],
      })));
      setNextStepIdx(0);
      if (typeof data?.routeDistanceMeters === 'number') setRemainingKm(Math.max(0, data.routeDistanceMeters / 1000));
      if (typeof data?.routeDurationSeconds === 'number') setEtaMin(Math.max(0, Math.round(data.routeDurationSeconds / 60)));
      speakInstruction(apiSteps?.[0]?.instruction);
    } catch {}
  };

  // Utils
  function haversineMeters(a: LatLng, b: LatLng) {
    const R = 6371000; // m
    const dLat = (b.latitude - a.latitude) * Math.PI / 180;
    const dLon = (b.longitude - a.longitude) * Math.PI / 180;
    const lat1 = a.latitude * Math.PI / 180;
    const lat2 = b.latitude * Math.PI / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon));
    return R * c;
  }

  function distanceToPathMeters(p: LatLng, path: LatLng[]) {
    if (!path.length) return Number.POSITIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < path.length; i += 5) { // sample every ~5 points to save CPU
      min = Math.min(min, haversineMeters(p, path[i]));
    }
    return min;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
          <MapView
            key={isDark ? 'map-dark' : 'map-light'}
            ref={(ref) => { mapRef.current = ref; }}
            style={{ flex: 1 }}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: currentPos?.latitude || 48.8566,
              longitude: currentPos?.longitude || 2.3522,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation
            // minimal UI
            onPanDrag={() => setFollow(false)}
            customMapStyle={isDark ? darkMapStyle : lightMapStyle}
          >
            {currentPos && (
              <Marker
                coordinate={currentPos}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
                rotation={heading || 0}
              >
                <MaterialCommunityIcons name="car" size={26} color="#38bdf8" />
              </Marker>
            )}
            {routePoints.length > 1 && (
              <>
                {/* Outline for better contrast */}
                <Polyline coordinates={routePoints} strokeColor="rgba(0,0,0,0.6)" strokeWidth={7} />
                <Polyline coordinates={routePoints} strokeColor="#06b6d4" strokeWidth={4} />
                {/* Destination marker at the end of the route */}
                <Marker
                  coordinate={routePoints[routePoints.length - 1]}
                  anchor={{ x: 0.5, y: 1.0 }}
                >
                  <MaterialCommunityIcons name="flag-checkered" size={28} color="#f59e0b" />
                </Marker>
              </>
            )}
          </MapView>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une adresse"
              placeholderTextColor="#94a3b8"
              value={destInput}
              onChangeText={setDestInput}
              onSubmitEditing={() => recalc(destInput)}
              returnKeyType="search"
            />
          </View>

          {/* Top instruction banner (minimal + speed) */}
          <View style={styles.topBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name={maneuverIconName(nextStep as any) as any} size={24} color="#e0f2fe" />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.bannerInstruction}>
                  {arrived ? 'Vous êtes arrivé' : steps.length ? (nextStep ? cleanHtml(nextStep.instruction) : (title || 'Navigation')) : 'Démarrer la navigation'}
                </Text>
                {!arrived && (
                  <Text style={styles.bannerSub}>
                    {nextStepDistanceMeters != null ? formatShortDistance(nextStepDistanceMeters) : (nextStep?.distanceText || '')}
                  </Text>
                )}
              </View>
              <View style={styles.speedBadge}><Text style={styles.speedBadgeText}>{Math.round(currentSpeedKmh)} km/h</Text></View>
            </View>
          </View>

          {/* Back FAB */}
          <View style={{ position: 'absolute', top: 12, left: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fab}>
              <Ionicons name="chevron-back" size={20} color="#e5e7eb" />
            </TouchableOpacity>
          </View>

          {/* Confirmation overlay to start navigation */}
          {showStartPrompt && (
            <View style={styles.startOverlay}>
              <View style={styles.startBox}>
                <Text style={styles.startTitle}>Démarrer la navigation ?</Text>
                <Text style={styles.startSub}>Destination: {destination}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>Non</Text></TouchableOpacity>
                  <TouchableOpacity onPress={startNavigation} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Oui</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Bottom ETA/arrival time/remaining km bar */}
          {!showStartPrompt && (
            <View style={styles.bottomBar}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bottomLabel}>Arrivée</Text>
                <Text style={styles.bottomValue}>{etaArrivalTime || '--:--'}</Text>
              </View>
              <View style={styles.bottomDivider} />
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bottomLabel}>Reste</Text>
                <Text style={styles.bottomValue}>{etaMin != null ? `${etaMin} min` : '--'}</Text>
              </View>
              <View style={styles.bottomDivider} />
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bottomLabel}>Distance</Text>
                <Text style={styles.bottomValue}>{remainingKm != null ? `${remainingKm.toFixed(1)} km` : '--'}</Text>
              </View>
            </View>
          )}

          {/* Removed speedometer for minimal UI */}

          {/* Follow/recenter button */}
          {!follow && (
            <View style={{ position: 'absolute', right: 12, bottom: 96 }}>
              <TouchableOpacity
                onPress={() => {
                  setFollow(true);
                  if (currentPos && mapRef.current) {
                    const cam: Partial<Camera> = {
                      center: currentPos,
                      heading: heading || 0,
                      pitch: 50,
                      ...(Platform.OS === 'ios' ? { altitude: 500 } : { zoom: 17 }),
                    };
                    try { mapRef.current.animateCamera(cam as Camera, { duration: 400 }); } catch {}
                  }
                }}
                style={{ backgroundColor: 'rgba(14,165,233,0.9)', padding: 12, borderRadius: 9999 }}
              >
                <Ionicons name="locate" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Loading overlay */}
          {loading && (
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#0ea5e9" />
              <Text style={{ color: '#e5e7eb', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>Calcul de l'itinéraire…</Text>
            </View>
          )}

          {/* Arrival prompt overlay */}
          {showArrivalPrompt && (
            <View style={styles.startOverlay}>
              <View style={styles.startBox}>
                <Text style={styles.startTitle}>Arrivée</Text>
                <Text style={styles.startSub}>Souhaitez-vous commencer l'état des lieux d'arrivée ?</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity onPress={() => setShowArrivalPrompt(false)} style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>Plus tard</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setShowArrivalPrompt(false);
                    try {
                      navigation.navigate('MissionWizard', { missionId, title, reference, initialStep: 'arrival' });
                    } catch {}
                  }} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Commencer</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  // Minimal nav-only UI: no header or meta chips
  // Search bar
  searchBar: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(17,24,39,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  searchInput: { flex: 1, color: '#e5e7eb' },
  // Top banner (Waze-like)
  topBanner: { position: 'absolute', top: 56, left: 12, right: 12, backgroundColor: 'rgba(2,6,23,0.85)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  bannerInstruction: { color: '#e0f2fe', fontSize: 16, fontWeight: '700' },
  bannerSub: { color: '#93c5fd', fontSize: 12, marginTop: 2 },
  speedBadge: { backgroundColor: 'rgba(17,24,39,0.85)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  speedBadgeText: { color: '#e5e7eb', fontWeight: '700' },
  // Floating Action Buttons
  fab: { backgroundColor: 'rgba(17,24,39,0.85)', padding: 10, borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  // Start prompt overlay
  startOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  startBox: { width: '86%', backgroundColor: 'rgba(17,24,39,0.95)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  startTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '800' },
  startSub: { color: '#cbd5e1', marginTop: 6 },
  btnSecondary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnSecondaryText: { color: '#cbd5e1', fontWeight: '600' },
  btnPrimary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0ea5e9' },
  btnPrimaryText: { color: 'white', fontWeight: '700' },
  
  // Legacy panel styles retained (not used in new layout)
  panel: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(17,24,39,0.95)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  stepTitle: { color: '#9ca3af', fontSize: 12, marginBottom: 4 },
  instruction: { color: 'white', fontSize: 15, fontWeight: '600' },
  meta: { color: '#9ca3af', marginTop: 4 },
  // Bottom info bar
  bottomBar: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(2,6,23,0.9)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  bottomLabel: { color: '#93c5fd', fontSize: 12 },
  bottomValue: { color: '#e0f2fe', fontSize: 16, fontWeight: '800' },
  bottomDivider: { width: 1, height: 24, backgroundColor: 'rgba(148,163,184,0.3)' },
});
