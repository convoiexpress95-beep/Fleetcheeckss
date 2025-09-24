import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, Platform, Modal, Linking, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import Signature from 'react-native-signature-canvas';
import { supabase, SUPABASE_PROJECT_URL } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

type Step = 'departure' | 'gps' | 'arrival';

interface MissionParams {
  missionId: string;
  title?: string;
  reference?: string;
  pickup_address?: string;
  delivery_address?: string;
  initialStep?: Step;
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default function MissionWizardScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const params: MissionParams = route?.params || {};
  const missionId = params.missionId;

  const [step, setStep] = useState<Step>(() => (params.initialStep || 'departure'));
  const [busy, setBusy] = useState(false);
  const [departureLocked, setDepartureLocked] = useState(false);

  // Departure form
  const [initialMileage, setInitialMileage] = useState('');
  const [initialFuel, setInitialFuel] = useState<'full' | 'three_quarters' | 'half' | 'quarter' | 'empty'>('full');
  const [fuelPercent, setFuelPercent] = useState<number>(100);
  const [keysCount, setKeysCount] = useState<1 | 2 | 3>(2); // 3 == 2+
  const [hasFuelCard, setHasFuelCard] = useState<boolean>(false);
  const [hasBoardDocs, setHasBoardDocs] = useState<boolean>(false);
  const [hasDeliveryReport, setHasDeliveryReport] = useState<boolean>(false);
  const [depNotes, setDepNotes] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [depPhotos, setDepPhotos] = useState<string[]>([]);
  // Angle-based slots for departure photos (keys are labels for clarity)
  const depRequiredAngles = [
    { key: 'front', label: 'Avant', required: true },
    { key: 'right', label: 'Latérale droite', required: true },
    { key: 'left', label: 'Latérale gauche', required: true },
    { key: 'rear', label: 'Arrière', required: true },
    { key: 'dashboard', label: 'Tableau de bord', required: true },
    { key: 'seats', label: 'Banquettes', required: false },
  ] as const;
  const [depAnglePhotos, setDepAnglePhotos] = useState<Record<string, string | null>>({
    front: null, right: null, left: null, rear: null, dashboard: null, seats: null,
  });
  const nextRequiredKey = useMemo(() => {
    const miss = depRequiredAngles.find(s => s.required && !depAnglePhotos[s.key]);
    return miss?.key as string | undefined;
  }, [depAnglePhotos]);
  const angleIcon = (key: string) => {
    switch (key) {
      case 'front': return 'car';
      case 'rear': return 'car-back';
      case 'left': return 'car-side';
      case 'right': return 'car-side';
      case 'dashboard': return 'view-dashboard-outline';
      case 'seats': return 'seat';
      default: return 'camera';
    }
  };
  const [showDepSigClient, setShowDepSigClient] = useState(false);
  const [showDepSigDriver, setShowDepSigDriver] = useState(false);
  const [clientSigDep, setClientSigDep] = useState<string | null>(null); // data URL
  const [driverSigDep, setDriverSigDep] = useState<string | null>(null);
  // Departure wizard steps
  const depSteps = useMemo(() => [
    { key: 'vehicle', label: 'Véhicule', icon: <Ionicons name="speedometer" size={12} color="#9ca3af" /> },
    { key: 'equip', label: 'Équipements', icon: <Ionicons name="briefcase" size={12} color="#9ca3af" /> },
    { key: 'photos', label: 'Photos', icon: <Ionicons name="camera" size={12} color="#9ca3af" /> },
    { key: 'client', label: 'Infos client', icon: <Ionicons name="mail" size={12} color="#9ca3af" /> },
    { key: 'sign', label: 'Signatures', icon: <Ionicons name="pencil" size={12} color="#9ca3af" /> },
  ] as const, []);
  const [depStep, setDepStep] = useState(0);

  // GPS tracking
  const [tracking, setTracking] = useState(false);
  const [positions, setPositions] = useState<{ latitude: number; longitude: number; speed?: number; ts: number }[]>([]);
  const currentPos = positions[positions.length - 1] || null;

  // Arrival form
  const [finalMileage, setFinalMileage] = useState('');
  const [finalFuel, setFinalFuel] = useState<'full' | 'three_quarters' | 'half' | 'quarter' | 'empty'>('full');
  const [arrPhotos, setArrPhotos] = useState<string[]>([]);
  // Arrival angle-based photos (mirror departure)
  const arrRequiredAngles = [
    { key: 'front', label: 'Avant', required: true },
    { key: 'right', label: 'Latérale droite', required: true },
    { key: 'left', label: 'Latérale gauche', required: true },
    { key: 'rear', label: 'Arrière', required: true },
    { key: 'dashboard', label: 'Tableau de bord', required: true },
    { key: 'seats', label: 'Banquettes', required: false },
  ] as const;
  const [arrAnglePhotos, setArrAnglePhotos] = useState<Record<string, string | null>>({
    front: null, right: null, left: null, rear: null, dashboard: null, seats: null,
  });
  const nextArrRequiredKey = useMemo(() => {
    const miss = arrRequiredAngles.find(s => s.required && !arrAnglePhotos[s.key]);
    return miss?.key as string | undefined;
  }, [arrAnglePhotos]);
  const [showArrSig, setShowArrSig] = useState(false);
  const [clientSigArr, setClientSigArr] = useState<string | null>(null);
  // Arrival wizard steps (no equip step)
  const arrSteps = useMemo(() => [
    { key: 'vehicle', label: 'Véhicule', icon: <Ionicons name="speedometer" size={12} color="#9ca3af" /> },
    { key: 'photos', label: 'Photos', icon: <Ionicons name="camera" size={12} color="#9ca3af" /> },
    { key: 'client', label: 'Infos client', icon: <Ionicons name="mail" size={12} color="#9ca3af" /> },
    { key: 'sign', label: 'Signatures', icon: <Ionicons name="pencil" size={12} color="#9ca3af" /> },
  ] as const, []);
  const [arrStep, setArrStep] = useState(0);

  const minPhotos = 5;
  const maxPhotos = 10;

  const requestPermissions = async () => {
    const { status: cam } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: loc } = await Location.requestForegroundPermissionsAsync();
    if (cam !== 'granted') { Alert.alert('Permissions', "Autorisez l'appareil photo"); return false; }
    if (loc !== 'granted') { Alert.alert('Permissions', "Autorisez la localisation"); return false; }
    return true;
  };

  const takePhoto = async (kind: 'departure' | 'arrival', angleKey?: string) => {
    const ok = await requestPermissions(); if (!ok) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.85 });
    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri; if (!uri) return;
    if (kind === 'departure') {
      if (angleKey) {
        setDepAnglePhotos(prev => ({ ...prev, [angleKey]: uri }));
      } else {
        setDepPhotos(p => (p.length < maxPhotos ? [...p, uri] : p));
      }
    } else if (kind === 'arrival') {
      if (angleKey) {
        setArrAnglePhotos(prev => ({ ...prev, [angleKey]: uri }));
      } else {
        setArrPhotos(p => (p.length < maxPhotos ? [...p, uri] : p));
      }
    }
  };

  const removePhoto = (kind: 'departure' | 'arrival', uri: string) => {
    const rm = (arr: string[]) => arr.filter(u => u !== uri);
    if (kind === 'departure') setDepPhotos(rm);
    if (kind === 'arrival') setArrPhotos(rm);
  };

  // Request a one-time signed upload URL from Edge Function and upload via Storage
  const getSignedUpload = async (folder: 'departure' | 'arrival' | 'receipts' | 'documents' | 'signatures', filename: string, contentType: string) => {
    const { data, error } = await supabase.functions.invoke('issue-mission-photo-url', {
      body: { action: 'upload', missionId, folder, filename, contentType },
    });
    if (error || !data?.token || !data?.path) {
      throw new Error((data as any)?.error || error?.message || 'Signature upload URL failed');
    }
    return data as { path: string; token: string; uploadUrl?: string; contentType?: string };
  };

  const uploadFile = async (localUri: string, targetPath: string, contentType = 'image/jpeg') => {
    const name = targetPath.split('/').pop() || `${Date.now()}.jpg`;
    const folder = (targetPath.includes('/departure/') ? 'departure'
      : targetPath.includes('/arrival/') ? 'arrival'
      : targetPath.includes('/receipts/') ? 'receipts'
      : targetPath.includes('/documents/') ? 'documents'
      : 'documents') as 'departure' | 'arrival' | 'receipts' | 'documents';
    const { path, token } = await getSignedUpload(folder, name, contentType);

    // Read local file and convert to Uint8Array for upload
    let bytes: Uint8Array | null = null;
    try {
      // Preferred: use fetch on the file URI to get a blob/arrayBuffer
      const res = await fetch(localUri);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        bytes = new Uint8Array(ab);
      }
    } catch {}

    if (!bytes) {
      try {
        // Fallback to legacy API for React Native
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - use legacy import path on SDK 54+
        const LegacyFS = await import('expo-file-system/legacy');
        const base64 = await LegacyFS.readAsStringAsync(localUri, { encoding: 'base64' });
        bytes = base64ToUint8Array(base64);
      } catch {
        // Last resort: current FS readAsStringAsync for backward compatibility
        // Note: This method is deprecated in SDK 54+
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' as any });
        bytes = base64ToUint8Array(base64);
      }
    }

    if (!bytes) throw new Error('Unable to read local file for upload');

    const { error } = await supabase.storage.from('mission-photos').uploadToSignedUrl(path, token, bytes, { contentType });
    if (error) throw error;
    return path;
  };

  const uploadDataUrl = async (dataUrl: string, targetPath: string) => {
    const name = targetPath.split('/').pop() || `${Date.now()}.png`;
    const folder: 'signatures' = 'signatures';
    const { path, token } = await getSignedUpload(folder, name, 'image/png');
    // data:image/png;base64,AAAA...
    const base64 = (dataUrl.split('base64,')[1] || '').trim();
    const bytes = base64ToUint8Array(base64);
    const { error } = await supabase.storage.from('mission-photos').uploadToSignedUrl(path, token, bytes, { contentType: 'image/png' });
    if (error) throw error;
    return path;
  };

  function base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) return new Uint8Array();
    // Use Buffer if available
    // @ts-ignore
    if (typeof Buffer !== 'undefined') {
      // @ts-ignore
      const buf = Buffer.from(base64, 'base64');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = [] as number[];
    let bc = 0, bs = 0, buffer: any;
    let idx = 0;
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    while ((buffer = base64.charAt(idx++))) {
      buffer = chars.indexOf(buffer);
      if (~buffer) {
        bs = bc % 4 ? bs * 64 + buffer : buffer;
        if (bc++ % 4) output.push(255 & (bs >> ((-2 * bc) & 6)));
      }
    }
    return new Uint8Array(output);
  }

  const missionBase = useMemo(() => `missions/${missionId}`, [missionId]);

  // Charger les infos véhicule pour l'email départ
  const [vehicleInfo, setVehicleInfo] = useState<{ brand?: string; model?: string; plate?: string } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('missions')
          .select('vehicle_brand, vehicle_model, vehicle_plate')
          .eq('id', missionId)
          .maybeSingle();
        if (data) setVehicleInfo({ brand: (data as any).vehicle_brand, model: (data as any).vehicle_model, plate: (data as any).vehicle_plate });
      } catch {}
    })();
  }, [missionId]);

  const publicUrlFor = (path?: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    let key = path.replace(/^\/+/, '');
    key = key.replace(/^https?:\/\/[^/]+\//i, '');
    const pubPrefix = 'storage/v1/object/public/mission-photos/';
    if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
    if (key.startsWith('mission-photos/')) key = key.slice('mission-photos/'.length);
    const { data } = supabase.storage.from('mission-photos').getPublicUrl(key);
    return data.publicUrl || null;
  };

  const pngUrlFor = (path?: string | null) => {
    if (!path) return null;
    // Normalize key similar to publicUrlFor
    let key = path.replace(/^\/+/, '');
    key = key.replace(/^https?:\/\/[^/]+\//i, '');
    const pubPrefix = 'storage/v1/object/public/mission-photos/';
    if (key.startsWith(pubPrefix)) key = key.slice(pubPrefix.length);
    if (key.startsWith('mission-photos/')) key = key.slice('mission-photos/'.length);
    return `${SUPABASE_PROJECT_URL}/functions/v1/photo-png?path=${encodeURIComponent(key)}`;
  };

  const emailDepartureReportDraft = async () => {
    try {
      const { data: dep } = await supabase
        .from('inspection_departures')
        .select('photos')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const uploadedPaths = Array.isArray(dep?.photos) ? (dep?.photos as unknown as string[]) : [];
  const links = uploadedPaths.map((p, i) => `Photo ${i + 1}: ${pngUrlFor(p)}`).join('\n');
      const plate = vehicleInfo?.plate || '—';
      const model = [vehicleInfo?.brand, vehicleInfo?.model].filter(Boolean).join(' ');
      const subject = encodeURIComponent(`État des lieux départ – ${plate} ${model}`);
      const body = encodeURIComponent(`Bonjour,\n\nVous trouverez ci-dessous l'état des lieux départ pour le véhicule ${plate} ${model}.\n\nLiens photos départ (PNG) :\n${links || '(Aucune photo publiée pour le moment)'}\n\nCordialement`);
      const url = `mailto:?subject=${subject}&body=${body}`;
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Email', e?.message || "Impossible d'ouvrir la messagerie");
    }
  };

  // Navigate to integrated navigation when GPS tab is selected
  useEffect(() => {
    if (step !== 'gps') return;
    const destination = params.delivery_address || params.pickup_address || '';
    if (!destination) {
      Alert.alert('Adresse manquante', "Aucune adresse d'arrivée disponible");
      setStep('arrival');
      return;
    }
    const id = setTimeout(() => {
      navigation.navigate('InAppNavigation', {
        destination,
        title: params.title || 'Navigation',
        reference: params.reference,
        missionId,
        userId: user?.id,
      });
    }, 0);
    return () => clearTimeout(id);
  }, [step]);

  // Preload whether departure is already validated to gate steps
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('inspection_departures')
          .select('id, created_at')
          .eq('mission_id', missionId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          setDepartureLocked(true);
          // If current step isn't departure, keep it; if it is but locked, move to GPS
          if (step === 'departure') setStep('gps');
        } else {
          // Ensure we don't start at gps/arrival without departure
          if (step !== 'departure') setStep('departure');
        }
      } catch {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGps = async () => {
    if (!departureLocked) { Toast.show({ type: 'info', text1: 'Validez le départ', text2: 'GPS accessible après validation du départ' }); return; }
    const ok = await requestPermissions(); if (!ok) return;
    setTracking(true);
  };

  const startExternalNavigation = async () => {
    try {
      const origin = currentPos ? `${currentPos.latitude},${currentPos.longitude}` : undefined;
      const destination = params.delivery_address || params.pickup_address || '';
      if (!destination) {
        Alert.alert('Adresse manquante', "Aucune adresse d'arrivée disponible");
        return;
      }
      const encDest = encodeURIComponent(destination);
      // Try Google Maps app first on Android
      if (Platform.OS === 'android') {
        const gmapsUrl = `google.navigation:q=${encDest}`;
        const canGoogle = await Linking.canOpenURL('google.navigation:q=');
        if (canGoogle) { await Linking.openURL(gmapsUrl); return; }
      }
      // Apple Maps on iOS
      if (Platform.OS === 'ios') {
        const url = `http://maps.apple.com/?daddr=${encDest}${origin?`&saddr=${encodeURIComponent(origin)}`:''}`;
        await Linking.openURL(url);
        return;
      }
      // Fallback to universal Google Maps directions
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encDest}${origin?`&origin=${encodeURIComponent(origin)}`:''}&travelmode=driving`;
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Navigation', e?.message || 'Impossible d\'ouvrir la navigation');
    }
  };

  // Poll current location every 10s and persist
  useInterval(async () => {
    if (!tracking || !missionId || !user?.id) return;
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed || 0, ts: Date.now() };
      setPositions(prev => [...prev, p]);
      await supabase.from('mission_tracking').insert({ mission_id: missionId, driver_id: user.id, latitude: p.latitude, longitude: p.longitude, speed: p.speed });
    } catch {}
  }, tracking ? 10000 : null);

  const handleValidateDeparture = async () => {
    if (!user?.id) return;
    const mileage = parseInt(initialMileage, 10);
    if (!mileage || Number.isNaN(mileage)) {
      Alert.alert('Kilométrage requis', 'Indiquez le kilométrage de départ.');
      return;
    }
    // Build departure photo list from angle slots + extras
    const angleUris = depRequiredAngles
      .map(s => depAnglePhotos[s.key as keyof typeof depAnglePhotos])
      .filter(Boolean) as string[];
    const missing = depRequiredAngles.filter(s => s.required && !depAnglePhotos[s.key]);
    if (missing.length > 0) {
      Alert.alert('Photos manquantes', `Ajoutez: ${missing.map(m => m.label).join(', ')}`);
      return;
    }
    const allDeparturePhotos = [...angleUris, ...depPhotos].slice(0, maxPhotos);
    try {
      setBusy(true);
      // Upload photos
      const uploaded: string[] = [];
      for (const uri of allDeparturePhotos) {
        const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const path = `${missionBase}/departure/${name}`;
        uploaded.push(await uploadFile(uri, path));
      }
      // Upload signatures
      let clientSigPath: string | null = null;
      if (clientSigDep) {
        clientSigPath = `${missionBase}/signatures/departure_client_${Date.now()}.png`;
        await uploadDataUrl(clientSigDep, clientSigPath);
      }
      if (driverSigDep) {
        const p = `${missionBase}/signatures/departure_driver_${Date.now()}.png`;
        await uploadDataUrl(driverSigDep, p);
      }
      // Insert DB row
      const { error: depErr } = await supabase.from('inspection_departures').insert({
        mission_id: missionId,
        driver_id: user.id,
        initial_mileage: mileage,
        initial_fuel: initialFuel,
        fuel_percent: fuelPercent,
        keys_count: keysCount === 3 ? 2 : keysCount, // store 3 as 2 (2+)
        has_fuel_card: hasFuelCard,
        has_board_documents: hasBoardDocs,
        has_delivery_report: hasDeliveryReport,
  photos: uploaded,
        internal_notes: depNotes,
        client_email: clientEmail || null,
        client_signature_url: clientSigPath,
      });
      if (depErr) throw depErr;
      // Update mission status
      await supabase.from('missions').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', missionId);
      // Try to generate PDF now (best-effort)
      try { await supabase.functions.invoke('zip-mission-photos', { body: { missionId } }); } catch {}
      Toast.show({ type: 'success', text1: 'Départ validé', text2: 'Mission en cours' });
      setDepartureLocked(true);
      setStep('gps');
      setTracking(true);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erreur', e?.message || 'Impossible de valider le départ');
    } finally {
      setBusy(false);
    }
  };

  const handleValidateArrival = async () => {
    if (!user?.id) return;
    const mileage = parseInt(finalMileage, 10);
    if (!mileage || Number.isNaN(mileage)) { Alert.alert('Kilométrage requis', 'Indiquez le kilométrage d\'arrivée.'); return; }
    // Build arrival photo list from angle slots + extras
    const angleUris = arrRequiredAngles
      .map(s => arrAnglePhotos[s.key as keyof typeof arrAnglePhotos])
      .filter(Boolean) as string[];
    const missing = arrRequiredAngles.filter(s => s.required && !arrAnglePhotos[s.key]);
    if (missing.length > 0) {
      Alert.alert('Photos manquantes', `Ajoutez: ${missing.map(m => m.label).join(', ')}`);
      return;
    }
    const allArrivalPhotos = [...angleUris, ...arrPhotos].slice(0, maxPhotos);
    try {
      setBusy(true);
      // Upload photos sections
      const upSection = async (uris: string[], folder: 'arrival') => {
        const out: string[] = [];
        for (const uri of uris) {
          const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
          out.push(await uploadFile(uri, `${missionBase}/${folder}/${name}`));
        }
        return out;
      };
      const uploadedArr = await upSection(allArrivalPhotos, 'arrival');
      let clientSigPath: string | null = null;
      if (clientSigArr) {
        clientSigPath = `${missionBase}/signatures/arrival_client_${Date.now()}.png`;
        await uploadDataUrl(clientSigArr, clientSigPath);
      }
      // Insert arrival DB row
      const { error: arrErr } = await supabase.from('inspection_arrivals').insert({
        mission_id: missionId,
        driver_id: user.id,
        final_mileage: mileage,
        final_fuel: finalFuel,
        photos: uploadedArr,
        client_signature_url: clientSigPath,
      });
      if (arrErr) throw arrErr;
      // Mark mission completed
      await supabase.from('missions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', missionId);
      try { await supabase.functions.invoke('zip-mission-photos', { body: { missionId } }); } catch {}
      // Ouvrir un brouillon d'email (pas d'envoi automatique)
      try {
        // Récupère les photos départ pour inclure tous les liens
        const { data: depRow } = await supabase
          .from('inspection_departures')
          .select('photos')
          .eq('mission_id', missionId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        const depPhotos: string[] = Array.isArray(depRow?.photos) ? (depRow?.photos as unknown as string[]) : [];
        const allPhotos: string[] = [...depPhotos, ...uploadedArr];
        const links = allPhotos.map((p, i) => `Photo ${i + 1}: ${pngUrlFor(p)}`).join('\n');
        const zipUrl = `${SUPABASE_PROJECT_URL}/functions/v1/zip-mission-photos?missionId=${encodeURIComponent(missionId)}`;
        const subject = encodeURIComponent(`Rapport de mission ${params.reference || missionId}`);
        const body = encodeURIComponent(`Bonjour,\n\nRapport: ${params.reference || missionId} – ${params.title || ''}\nPDF (bundle photos): ${zipUrl}\n\nLiens photos (PNG):\n${links}\n\nCordialement`);
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
        await Linking.openURL(mailtoUrl);
      } catch {
        // silence: l'ouverture d'email est un plus, l'arrivée reste validée
      }

      Toast.show({ type: 'success', text1: 'Arrivée validée', text2: 'Brouillon e-mail prêt avec liens' });
      navigation.goBack();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erreur', e?.message || 'Impossible de valider l\'arrivée');
    } finally { setBusy(false); }
  };

  // Compute if near destination and confirm if far before starting Arrival
  const haversine = (lat1:number, lon1:number, lat2:number, lon2:number) => {
    const toRad = (x:number)=>x*Math.PI/180;
    const R = 6371000; // meters
    const dLat = toRad(lat2-lat1);
    const dLon = toRad(lon2-lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R*c;
  };

  const attemptOpenArrival = async () => {
    if (!departureLocked) { Toast.show({ type: 'info', text1: 'Validez le départ', text2: 'Arrivée accessible après validation du départ' }); return; }
    try {
      const destText = params.delivery_address || params.pickup_address || '';
      if (!destText) { setStep('arrival'); return; }
      const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geos = await Location.geocodeAsync(destText);
      const dest = geos && geos[0];
      if (!dest) { setStep('arrival'); return; }
      const dist = haversine(cur.coords.latitude, cur.coords.longitude, dest.latitude, dest.longitude);
      const near = dist < 50000; // 50km threshold
      if (near) { setStep('arrival'); return; }
      Alert.alert(
        "Commencer l'arrivée ?",
        "Vous semblez être à plus de 50 km de la destination. Voulez-vous vraiment commencer l'arrivée ?",
        [
          { text: 'Revenir en arrière', style: 'cancel' },
          { text: 'Commencer quand même', style: 'destructive', onPress: () => setStep('arrival') },
        ]
      );
    } catch {
      // If anything fails, fallback to confirmation
      Alert.alert(
        "Commencer l'arrivée ?",
        "Impossible de vérifier la position par rapport à la destination. Voulez-vous commencer quand même ?",
        [
          { text: 'Revenir en arrière', style: 'cancel' },
          { text: 'Commencer quand même', style: 'destructive', onPress: () => setStep('arrival') },
        ]
      );
    }
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#d1d5db" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{params.title || 'Inspection véhicule'}</Text>
        <Text style={styles.headerSub}>Réf: {params.reference || missionId}</Text>
      </View>
    </View>
  );

  const StepTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity style={[styles.tab, step==='departure'&&styles.tabActive]} onPress={() => {
        if (departureLocked && step !== 'departure') { Toast.show({ type: 'info', text1: 'Départ déjà validé' }); return; }
        setStep('departure');
      }}>
        <Text style={[styles.tabText, step==='departure'&&styles.tabTextActive]}>🚀 Départ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, step==='gps'&&styles.tabActive]} onPress={() => {
        if (!departureLocked) { Toast.show({ type: 'info', text1: 'Validez le départ d\'abord' }); return; }
        setStep('gps');
      }}>
        <Text style={[styles.tabText, step==='gps'&&styles.tabTextActive]}>📍 GPS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, step==='arrival'&&styles.tabActive]} onPress={attemptOpenArrival}>
        <Text style={[styles.tabText, step==='arrival'&&styles.tabTextActive]}>✅ Arrivée</Text>
      </TouchableOpacity>
    </View>
  );

  const FuelPicker = ({ value, onChange }: { value: any; onChange: (v:any)=>void }) => (
    <View style={styles.fuelRow}>
      {(['full','three_quarters','half','quarter','empty'] as const).map(v => (
        <TouchableOpacity key={v} style={[styles.fuelChip, value===v&&styles.fuelChipActive]} onPress={()=>onChange(v)}>
          <Text style={[styles.fuelChipText, value===v&&styles.fuelChipTextActive]}>
            {v==='full'?'Plein':v==='three_quarters'?'3/4':v==='half'?'1/2':v==='quarter'?'1/4':'Vide'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const SignaturePad = ({ visible, onOK, onClose }: { visible: boolean; onOK: (dataUrl: string)=>void; onClose: ()=>void }) => (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', padding: 16 }}>Signature</Text>
        <Signature
          onOK={(sig) => { onOK(sig); onClose(); }}
          onEmpty={() => Alert.alert('Signature vide')}
          descriptionText="Signez"
          clearText="Effacer"
          confirmText="Valider"
          webStyle=".m-signature-pad--footer { display: flex; justify-content: space-between; }"
          autoClear={true}
          backgroundColor="#111827"
          penColor="#06b6d4"
        />
        <TouchableOpacity style={styles.closeSigBtn} onPress={onClose}>
          <Text style={styles.closeSigText}>Fermer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <StepTabs />
      {step === 'gps' && (
        // Placeholder: navigation handled via effect below
        <View style={{ flex: 1 }} />
      )}

      {step === 'departure' && (
        <>
          {/* Wizard progress */}
          <View style={styles.wizardChips}>
            {depSteps.map((s, i) => (
              <View key={s.key} style={[styles.wizardChip, i===depStep?styles.wizardChipActive:(i<depStep?styles.wizardChipDone:null)]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {s.icon}
                  <Text style={[styles.wizardChipText, i===depStep?styles.wizardChipTextActive:(i<depStep?styles.wizardChipTextDone:null)]}>{i+1}. {s.label}</Text>
                </View>
              </View>
            ))}
          </View>
          <ScrollView style={styles.content}>
            {depStep === 0 && (
              <>
                <Text style={styles.label}>Kilométrage départ</Text>
                <TextInput style={styles.input} keyboardType="number-pad" value={initialMileage} onChangeText={setInitialMileage} placeholder="ex: 102345" placeholderTextColor="#6b7280" />
                <Text style={styles.label}>Niveau carburant</Text>
                <FuelPicker value={initialFuel} onChange={setInitialFuel} />
                <Text style={styles.label}>Pourcentage carburant</Text>
                <View style={{ paddingHorizontal: 6 }}>
                  <Slider value={fuelPercent} step={5} minimumValue={0} maximumValue={100} minimumTrackTintColor="#06b6d4" maximumTrackTintColor="#1f2937" thumbTintColor="#06b6d4" onValueChange={(v: number) => setFuelPercent(Math.round(v))} />
                  <Text style={{ color: '#93c5fd', fontWeight: '700', textAlign: 'center' }}>{fuelPercent}%</Text>
                </View>
              </>
            )}

            {depStep === 1 && (
              <>
                <Text style={styles.label}>Nombre de clés</Text>
                <View style={styles.fuelRow}>
                  {[1,2,3].map((k) => (
                    <TouchableOpacity key={k} style={[styles.fuelChip, keysCount===k && styles.fuelChipActive]} onPress={() => setKeysCount(k as 1|2|3)}>
                      <Text style={[styles.fuelChipText, keysCount===k && styles.fuelChipTextActive]}>{k===3? '2+': k}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Équipements remis</Text>
                <View style={{ gap: 10 }}>
                  <View style={styles.toggleRow}><Text style={styles.toggleLabel}>Carte carburant</Text><Switch value={hasFuelCard} onValueChange={setHasFuelCard} /></View>
                  <View style={styles.toggleRow}><Text style={styles.toggleLabel}>Documents de bord</Text><Switch value={hasBoardDocs} onValueChange={setHasBoardDocs} /></View>
                  <View style={styles.toggleRow}><Text style={styles.toggleLabel}>PV de livraison</Text><Switch value={hasDeliveryReport} onValueChange={setHasDeliveryReport} /></View>
                </View>
              </>
            )}

            {depStep === 2 && (
              <>
                <Text style={styles.label}>Photos départ</Text>
                <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Vues requises: Avant, Droite, Gauche, Arrière, Tableau de bord (Banquettes optionnel)</Text>
                <View style={styles.anglesGrid}>
                  {depRequiredAngles.map(slot => {
                    const uri = depAnglePhotos[slot.key as keyof typeof depAnglePhotos] || null;
                    const isFirstMissing = nextRequiredKey === slot.key;
                    const allRequiredDone = !nextRequiredKey;
                    const canCapture = slot.required ? isFirstMissing : allRequiredDone;
                    return (
                      <View key={slot.key} style={[styles.angleTile, !canCapture && !uri ? { opacity: 0.5 } : null]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={styles.angleLabel}>{slot.label}{!slot.required ? ' (opt.)' : ''}</Text>
                          <MaterialCommunityIcons name={angleIcon(slot.key) as any} size={18} color={uri ? '#22d3ee' : '#94a3b8'} />
                        </View>
                        {uri ? (
                          <TouchableOpacity onLongPress={() => setDepAnglePhotos(prev => ({ ...prev, [slot.key]: null }))}>
                            <Image source={{ uri }} style={styles.angleImage} />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={[styles.angleAdd, !canCapture ? { borderStyle: 'dashed' as any } : null]} onPress={() => {
                            if (!canCapture) {
                              const next = depRequiredAngles.find(s => s.required && !depAnglePhotos[s.key])?.label || '';
                              Toast.show({ type: 'info', text1: 'Ordre guidé', text2: next ? `Prenez d'abord: ${next}` : 'Étape non disponible' });
                              return;
                            }
                            takePhoto('departure', slot.key);
                          }}>
                            <Ionicons name="camera" size={20} color="#9ca3af" />
                            <Text style={styles.angleAddText}>Prendre</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.label}>Photos complémentaires (optionnel) ({depPhotos.length}/{Math.max(0, maxPhotos - depRequiredAngles.length)})</Text>
                <View style={styles.photosRow}>
                  {depPhotos.map(uri => (
                    <TouchableOpacity key={uri} onLongPress={()=>removePhoto('departure', uri)}>
                      <Image source={{ uri }} style={styles.photo} />
                    </TouchableOpacity>
                  ))}
                  {depPhotos.length + depRequiredAngles.length < maxPhotos && (
                    <TouchableOpacity style={styles.addPhoto} onPress={()=>takePhoto('departure')}>
                      <Ionicons name="camera" size={22} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {depStep === 3 && (
              <>
                <Text style={styles.label}>Notes internes</Text>
                <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} multiline value={depNotes} onChangeText={setDepNotes} placeholder="Observations, rayures, équipements, etc." placeholderTextColor="#6b7280" />
                <Text style={styles.label}>Email du client (pour le rapport)</Text>
                <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={clientEmail} onChangeText={setClientEmail} placeholder="ex: client@mail.com" placeholderTextColor="#6b7280" />
                <TouchableOpacity onPress={emailDepartureReportDraft} style={[styles.secondaryBtn, { marginTop: 10 }]}>
                  <Text style={styles.secondaryBtnText}>Envoyer ce rapport départ par email</Text>
                </TouchableOpacity>
              </>
            )}

            {depStep === 4 && (
              <>
                <Text style={styles.label}>Signatures</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <TouchableOpacity style={styles.sigBtn} onPress={()=>setShowDepSigClient(true)}>
                    <Text style={styles.sigBtnText}>{clientSigDep ? '✅ Signature client' : '✍️ Signature client'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sigBtn} onPress={()=>setShowDepSigDriver(true)}>
                    <Text style={styles.sigBtnText}>{driverSigDep ? '✅ Signature chauffeur' : '✍️ Signature chauffeur'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.primaryBtn, busy&&{ opacity: .7 }]} disabled={busy} onPress={handleValidateDeparture}>
                  <Text style={styles.primaryBtnText}>{busy ? 'Validation…' : 'Valider le départ et démarrer la navigation'}</Text>
                </TouchableOpacity>
              </>
            )}

            {showDepSigClient && (<SignaturePad visible={showDepSigClient} onOK={(d)=>setClientSigDep(d)} onClose={()=>setShowDepSigClient(false)} />)}
            {showDepSigDriver && (<SignaturePad visible={showDepSigDriver} onOK={(d)=>setDriverSigDep(d)} onClose={()=>setShowDepSigDriver(false)} />)}
          </ScrollView>

          {/* Wizard navigation */}
          <View style={styles.wizardNav}>
            {depStep > 0 ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setDepStep(s => Math.max(0, s-1))}><Text style={styles.secondaryBtnText}>Précédent</Text></TouchableOpacity>
            ) : <View />}
            {depStep < depSteps.length - 1 && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                // per-step lightweight validation
                if (depStep === 0) {
                  const mileage = parseInt(initialMileage, 10);
                  if (!mileage || Number.isNaN(mileage)) { Toast.show({ type: 'info', text1: 'Kilométrage requis' }); return; }
                }
                if (depStep === 2) {
                  const missing = depRequiredAngles.filter(s => s.required && !depAnglePhotos[s.key]);
                  if (missing.length) { Toast.show({ type: 'info', text1: 'Photos manquantes', text2: missing.map(m=>m.label).join(', ') }); return; }
                }
                setDepStep(s => Math.min(depSteps.length-1, s+1));
              }}>
                <Text style={styles.primaryBtnText}>Suivant</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {step === 'arrival' && (
        <>
          {/* Arrival wizard progress */}
          <View style={styles.wizardChips}>
            {arrSteps.map((s, i) => (
              <View key={s.key} style={[styles.wizardChip, i===arrStep?styles.wizardChipActive:(i<arrStep?styles.wizardChipDone:null)]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {s.icon}
                  <Text style={[styles.wizardChipText, i===arrStep?styles.wizardChipTextActive:(i<arrStep?styles.wizardChipTextDone:null)]}>{i+1}. {s.label}</Text>
                </View>
              </View>
            ))}
          </View>
          <ScrollView style={styles.content}>
            {arrStep === 0 && (
              <>
                <Text style={styles.label}>Kilométrage arrivée</Text>
                <TextInput style={styles.input} keyboardType="number-pad" value={finalMileage} onChangeText={setFinalMileage} placeholder="ex: 103120" placeholderTextColor="#6b7280" />
                <Text style={styles.label}>Niveau carburant</Text>
                <FuelPicker value={finalFuel} onChange={setFinalFuel} />
              </>
            )}
            {arrStep === 1 && (
              <>
                <Text style={styles.label}>Photos arrivée</Text>
                <Text style={{ color: '#9ca3af', marginBottom: 6 }}>Vues requises: Avant, Droite, Gauche, Arrière, Tableau de bord (Banquettes optionnel)</Text>
                <View style={styles.anglesGrid}>
                  {arrRequiredAngles.map(slot => {
                    const uri = arrAnglePhotos[slot.key as keyof typeof arrAnglePhotos] || null;
                    const isFirstMissing = nextArrRequiredKey === slot.key;
                    const allRequiredDone = !nextArrRequiredKey;
                    const canCapture = slot.required ? isFirstMissing : allRequiredDone;
                    return (
                      <View key={slot.key} style={[styles.angleTile, !canCapture && !uri ? { opacity: 0.5 } : null]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={styles.angleLabel}>{slot.label}{!slot.required ? ' (opt.)' : ''}</Text>
                          <MaterialCommunityIcons name={angleIcon(slot.key) as any} size={18} color={uri ? '#22d3ee' : '#94a3b8'} />
                        </View>
                        {uri ? (
                          <TouchableOpacity onLongPress={() => setArrAnglePhotos(prev => ({ ...prev, [slot.key]: null }))}>
                            <Image source={{ uri }} style={styles.angleImage} />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={[styles.angleAdd, !canCapture ? { borderStyle: 'dashed' as any } : null]} onPress={() => {
                            if (!canCapture) {
                              const next = arrRequiredAngles.find(s => s.required && !arrAnglePhotos[s.key])?.label || '';
                              Toast.show({ type: 'info', text1: 'Ordre guidé', text2: next ? `Prenez d'abord: ${next}` : 'Étape non disponible' });
                              return;
                            }
                            takePhoto('arrival', slot.key);
                          }}>
                            <Ionicons name="camera" size={20} color="#9ca3af" />
                            <Text style={styles.angleAddText}>Prendre</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.label}>Photos complémentaires (optionnel) ({arrPhotos.length}/{Math.max(0, maxPhotos - arrRequiredAngles.length)})</Text>
                <View style={styles.photosRow}>
                  {arrPhotos.map(uri => (
                    <TouchableOpacity key={uri} onLongPress={()=>removePhoto('arrival', uri)}>
                      <Image source={{ uri }} style={styles.photo} />
                    </TouchableOpacity>
                  ))}
                  {arrPhotos.length + arrRequiredAngles.length < maxPhotos && (
                    <TouchableOpacity style={styles.addPhoto} onPress={()=>takePhoto('arrival')}>
                      <Ionicons name="camera" size={22} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
            {arrStep === 2 && (
              <>
                <Text style={styles.label}>Email du client (pour le rapport)</Text>
                <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={clientEmail} onChangeText={setClientEmail} placeholder="ex: client@mail.com" placeholderTextColor="#6b7280" />
              </>
            )}
            {arrStep === 3 && (
              <>
                <Text style={styles.label}>Signatures</Text>
                <TouchableOpacity style={styles.sigBtn} onPress={()=>setShowArrSig(true)}>
                  <Text style={styles.sigBtnText}>{clientSigArr ? '✅ Signature client' : '✍️ Signature client'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, busy&&{ opacity: .7 }]} disabled={busy} onPress={handleValidateArrival}>
                  <Text style={styles.primaryBtnText}>{busy ? 'Validation…' : 'Valider l\'arrivée'}</Text>
                </TouchableOpacity>
              </>
            )}
            {showArrSig && (<SignaturePad visible={showArrSig} onOK={(d)=>setClientSigArr(d)} onClose={()=>setShowArrSig(false)} />)}
          </ScrollView>
          {/* Arrival wizard navigation */}
          <View style={styles.wizardNav}>
            {arrStep > 0 ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setArrStep(s => Math.max(0, s-1))}><Text style={styles.secondaryBtnText}>Précédent</Text></TouchableOpacity>
            ) : <View />}
            {arrStep < arrSteps.length - 1 && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                // per-step validation
                if (arrStep === 0) {
                  const mileage = parseInt(finalMileage, 10);
                  if (!mileage || Number.isNaN(mileage)) { Toast.show({ type: 'info', text1: 'Kilométrage requis' }); return; }
                }
                if (arrStep === 1) {
                  const missing = arrRequiredAngles.filter(s => s.required && !arrAnglePhotos[s.key]);
                  if (missing.length) { Toast.show({ type: 'info', text1: 'Photos manquantes', text2: missing.map(m=>m.label).join(', ') }); return; }
                }
                setArrStep(s => Math.min(arrSteps.length-1, s+1));
              }}>
                <Text style={styles.primaryBtnText}>Suivant</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  backBtn: { marginRight: 8 },
  headerTitle: { color: 'white', fontWeight: '700', fontSize: 16 },
  headerSub: { color: '#9ca3af', fontSize: 12 },
  tabs: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  tab: { flex: 1, borderWidth: 1, borderColor: '#1f2937', paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#0f172a' },
  tabActive: { borderColor: '#06b6d4', backgroundColor: '#0b1220' },
  tabText: { color: '#9ca3af', fontWeight: '600' },
  tabTextActive: { color: '#06b6d4' },
  content: { flex: 1, padding: 16 },
  label: { color: 'white', fontWeight: '600', marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', color: 'white', padding: 12, borderRadius: 10 },
  fuelRow: { flexDirection: 'row', gap: 8 },
  fuelChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9999, borderWidth: 1, borderColor: '#1f2937' },
  fuelChipActive: { borderColor: '#06b6d4', backgroundColor: '#0b1220' },
  fuelChipText: { color: '#9ca3af' },
  fuelChipTextActive: { color: '#06b6d4', fontWeight: '700' },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 84, height: 84, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937' },
  addPhoto: { width: 84, height: 84, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  sigBtn: { backgroundColor: '#1f2937', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginTop: 12, alignSelf: 'flex-start' },
  sigBtnText: { color: 'white', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#06b6d4', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  primaryBtnText: { color: 'white', textAlign: 'center', fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#1f2937', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  secondaryBtnText: { color: 'white', fontWeight: '600' },
  gpsOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16, gap: 8, alignItems: 'center' },
  gpsText: { color: 'white', backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  closeSigBtn: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  closeSigText: { color: 'white', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  toggleLabel: { color: '#e5e7eb', fontWeight: '600' },
  anglesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  angleTile: { width: '48%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, padding: 10 },
  angleLabel: { color: '#cbd5e1', marginBottom: 6, fontSize: 12 },
  angleImage: { width: '100%', height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#1f2937' },
  angleAdd: { height: 100, borderWidth: 1, borderColor: '#1f2937', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220' },
  angleAddText: { color: '#9ca3af', marginTop: 6, fontSize: 12 },
  // Wizard UI
  wizardChips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  wizardChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937' },
  wizardChipActive: { backgroundColor: '#0b1220', borderColor: '#06b6d4' },
  wizardChipDone: { backgroundColor: '#0b1220', borderColor: '#16a34a' },
  wizardChipText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  wizardChipTextActive: { color: '#06b6d4' },
  wizardChipTextDone: { color: '#22c55e' },
  wizardNav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1f2937', backgroundColor: '#0b1220' },
});
