import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';

// Adaptez aux chemins réels de votre app
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMissions } from '../hooks/useMissions';
import Signature from 'react-native-signature-canvas';

// Types minimaux; remplacez par vos types si disponibles
export type FuelLevel = 'full' | 'three_quarters' | 'half' | 'quarter' | 'empty';
export type CleanLevel = 'very_dirty' | 'dirty' | 'ok' | 'clean' | 'very_clean';

export type Mission = {
  id: string;
  title: string;
  reference?: string | null;
  status: string;
  driver_id?: string | null;
  created_by?: string | null;
  pickup_contact_email?: string | null;
  license_plate?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
};

interface InspectionPhoto {
  id: string;
  uri: string;
  type: 'departure' | 'arrival' | 'receipt' | 'document';
  location?: { latitude: number; longitude: number };
}

const getExtFromUri = (uri: string): 'jpg' | 'jpeg' | 'png' | 'heic' | 'heif' => {
  const q = uri.split('?')[0];
  const dot = q.lastIndexOf('.');
  const ext = dot >= 0 ? q.substring(dot + 1).toLowerCase() : 'jpg';
  if (ext === 'jpeg' || ext === 'jpg') return ext as any;
  if (ext === 'png' || ext === 'heic' || ext === 'heif') return ext as any;
  return 'jpg';
};
const extToMime = (ext: string): string => {
  switch (ext) {
    case 'png': return 'image/png';
    case 'heic': return 'image/heic';
    case 'heif': return 'image/heif';
    case 'jpeg':
    case 'jpg':
    default: return 'image/jpeg';
  }
};

export function InspectionScreen() {
  const { user } = useAuth();
  const { data: missions } = useMissions();
  const route = useRoute<any>();

  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeStep, setActiveStep] = useState<'departure' | 'conveyance' | 'arrival' | 'costs'>('departure');
  const [uploading, setUploading] = useState(false);

  // Départ
  const [depPlate, setDepPlate] = useState('');
  const [depBrand, setDepBrand] = useState('');
  const [depModel, setDepModel] = useState('');
  const [depMileage, setDepMileage] = useState('');
  const [depFuel, setDepFuel] = useState<FuelLevel>('full');
  const [cleanInt, setCleanInt] = useState<CleanLevel>('ok');
  const [cleanExt, setCleanExt] = useState<CleanLevel>('ok');
  const [hasPapers, setHasPapers] = useState(false);
  const [hasGps, setHasGps] = useState(false);
  const [hasMedia, setHasMedia] = useState(false);
  const [hasSafetyKit, setHasSafetyKit] = useState(false);
  const [hasSpareOrKit, setHasSpareOrKit] = useState(false);
  const [keysCount, setKeysCount] = useState(1);
  const [depClientEmail, setDepClientEmail] = useState('');
  const [depNotes, setDepNotes] = useState('');
  const [depPhotos, setDepPhotos] = useState<InspectionPhoto[]>([]);
  // Signatures Départ
  const [depSigDataUrl, setDepSigDataUrl] = useState<string | null>(null);
  const [depSigOpen, setDepSigOpen] = useState(false);
  const depSigRef = useRef<any>(null);

  // Convoyage
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // Arrivée
  const [arrMileage, setArrMileage] = useState('');
  const [arrFuel, setArrFuel] = useState<FuelLevel>('half');
  const [arrClientNotes, setArrClientNotes] = useState('');
  const [arrDriverNotes, setArrDriverNotes] = useState('');
  const [arrPhotos, setArrPhotos] = useState<InspectionPhoto[]>([]);
  // Signatures Arrivée
  const [arrSigDataUrl, setArrSigDataUrl] = useState<string | null>(null);
  const [arrSigOpen, setArrSigOpen] = useState(false);
  const arrSigRef = useRef<any>(null);

  // Frais & Documents
  const [costItems, setCostItems] = useState<{ type: 'fuel' | 'toll' | 'parking' | 'hotel' | 'meal' | 'other'; amount: string; receipt?: InspectionPhoto }[]>([]);
  const [costNotes, setCostNotes] = useState('');
  const [documents, setDocuments] = useState<{ type: 'PV' | 'delivery_note' | 'other'; name: string; file?: InspectionPhoto }[]>([]);

  const activeMissions: Mission[] = (missions?.filter(m =>
    ['pending', 'inspection_start', 'in_progress', 'inspection_end', 'cost_validation'].includes(m.status)
  ) ?? []) as Mission[];

  const isInvolved = (m: Mission | null, uid?: string | null) => {
    if (!m || !uid) return false;
    return m.driver_id === uid || m.created_by === uid;
  };

  useEffect(() => {
    if (route?.params?.missionId && missions && !selectedMission) {
      const m = missions.find((x: Mission) => x.id === route.params.missionId);
      if (m) {
        setSelectedMission(m);
        setActiveStep('departure');
        setDepClientEmail(m.pickup_contact_email || '');
        setDepPlate(m.license_plate || '');
        setDepBrand(m.vehicle_brand || '');
        setDepModel(m.vehicle_model || '');
      }
    }
  }, [route?.params?.missionId, missions, selectedMission]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission requise', "Autorisez l'appareil photo pour prendre des photos.");
      return false;
    }
    if (locationStatus !== 'granted') {
      Alert.alert('Permission requise', "Autorisez la localisation pour géolocaliser les photos.");
      return false;
    }
    return true;
  };

  const takePhoto = async (type: InspectionPhoto['type']) => {
    if (!selectedMission?.id) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Sélectionnez une mission' });
      return;
    }
    if (type === 'departure' && depPhotos.length >= 10) {
      Toast.show({ type: 'error', text1: 'Limite atteinte', text2: 'Maximum 10 photos pour le départ' });
      return;
    }
    const ok = await requestPermissions();
    if (!ok) return;
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, exif: true });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString(),
          uri: asset.uri,
          type,
          location: { latitude: location.coords.latitude, longitude: location.coords.longitude },
        };
        if (type === 'departure') setDepPhotos(prev => prev.length >= 10 ? prev : [...prev, newPhoto]);
        if (type === 'arrival') setArrPhotos(prev => [...prev, newPhoto]);
        Toast.show({ type: 'success', text1: 'Photo enregistrée' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Caméra indisponible', text2: e?.message || '' });
    }
  };

  const uploadImageToStorage = async (uri: string, path: string) => {
    const ext = getExtFromUri(path);
    const contentType = extToMime(ext);
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) throw new Error('Fichier introuvable');
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('mission-photos').upload(path, blob, { contentType, upsert: false });
      if (error) throw error;
      return path;
    } catch (_) {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const bytes = toByteArray(base64);
      const { error } = await supabase.storage.from('mission-photos').upload(path, bytes, { contentType, upsert: false });
      if (error) throw error;
      return path;
    }
  };

  // Upload d'une signature base64 (data URL)
  const uploadSignatureDataUrl = async (dataUrl: string, path: string) => {
    const prefix = 'base64,';
    const idx = dataUrl.indexOf(prefix);
    const base64 = idx >= 0 ? dataUrl.substring(idx + prefix.length) : dataUrl;
    const bytes = toByteArray(base64);
    const { error } = await supabase.storage
      .from('mission-photos')
      .upload(path, bytes, { contentType: 'image/png', upsert: false });
    if (error) throw error;
    return path;
  };

  const saveDeparture = async () => {
    if (!selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur.' });
      return;
    }
    if (!depPlate.trim()) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Immatriculation ou N° de châssis requis' });
      return;
    }
    if (!depMileage || isNaN(parseFloat(depMileage))) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Kilométrage (nombre) requis' });
      return;
    }
    if (depPhotos.length < 4) {
      Toast.show({ type: 'error', text1: 'Photos requises', text2: 'Ajoutez au moins 4 photos (max 10)' });
      return;
    }
    if (!depSigDataUrl) {
      Toast.show({ type: 'error', text1: 'Signature requise', text2: 'Faites signer le client (départ).' });
      return;
    }
    setUploading(true);
    try {
      // Upload photos départ
      const photoPaths: string[] = [];
      for (const p of depPhotos) {
        const ext = getExtFromUri(p.uri);
        const path = `missions/${selectedMission.id}/departure/${p.id}.${ext}`;
        photoPaths.push(await uploadImageToStorage(p.uri, path));
      }
      // Upload signature départ
      const sigPath = `missions/${selectedMission.id}/signatures/departure-${Date.now()}.png`;
      const uploadedSigPath = await uploadSignatureDataUrl(depSigDataUrl, sigPath);

      const extra = {
        plate_or_vin: depPlate.trim(),
        brand: depBrand || null,
        model: depModel || null,
        cleanliness: { interior: cleanInt, exterior: cleanExt },
        checklist: { papers: hasPapers, gps: hasGps, media: hasMedia, safetyKit: hasSafetyKit, spareOrKit: hasSpareOrKit },
        keysCount,
        comments: depNotes || null,
      };

      const { error } = await supabase.from('inspection_departures').insert({
        mission_id: selectedMission.id,
        driver_id: user?.id,
        initial_mileage: parseFloat(depMileage),
        initial_fuel: depFuel,
        photos: photoPaths,
        internal_notes: JSON.stringify(extra),
        client_email: depClientEmail || null,
        client_signature_url: uploadedSigPath,
      });
      if (error) throw error;
      await supabase.from('missions').update({
        status: 'in_progress',
        updated_at: new Date().toISOString(),
        license_plate: depPlate.trim(),
        vehicle_brand: depBrand || null,
        vehicle_model: depModel || null,
      }).eq('id', selectedMission.id);
      setActiveStep('conveyance');
      Toast.show({ type: 'success', text1: 'Départ enregistré' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Enregistrement impossible' });
    } finally {
      setUploading(false);
    }
  };

  const startTracking = async () => {
    if (tracking || !selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur.' });
      return;
    }
    const ok = await requestPermissions();
    if (!ok) return;
    setTracking(true);
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
      async (pos) => {
        try {
          await supabase.from('mission_tracking').insert({
            mission_id: selectedMission.id,
            driver_id: user?.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed ?? null,
            heading: pos.coords.heading ?? null,
          });
        } catch {}
      }
    );
  };
  const stopTracking = () => { watchRef.current?.remove(); watchRef.current = null; setTracking(false); };
  useEffect(() => () => stopTracking(), []);

  const saveArrival = async () => {
    if (!selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur.' });
      return;
    }
    if (!arrMileage || arrPhotos.length < 1) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: "Kilométrage et au moins 1 photo" });
      return;
    }
    if (!arrSigDataUrl) {
      Toast.show({ type: 'error', text1: 'Signature requise', text2: 'Faites signer le client (arrivée).' });
      return;
    }
    setUploading(true);
    try {
      const photoPaths: string[] = [];
      for (const p of arrPhotos) {
        const ext = getExtFromUri(p.uri);
        const path = `missions/${selectedMission.id}/arrival/${p.id}.${ext}`;
        photoPaths.push(await uploadImageToStorage(p.uri, path));
      }
      // Upload signature arrivée
      const sigPath = `missions/${selectedMission.id}/signatures/arrival-${Date.now()}.png`;
      const uploadedSigPath = await uploadSignatureDataUrl(arrSigDataUrl, sigPath);

      const { error } = await supabase.from('inspection_arrivals').insert({
        mission_id: selectedMission.id,
        driver_id: user?.id,
        final_mileage: parseFloat(arrMileage),
        final_fuel: arrFuel,
        photos: photoPaths,
        client_notes: arrClientNotes || null,
        driver_notes: arrDriverNotes || null,
        client_signature_url: uploadedSigPath,
      });
      if (error) throw error;
      await supabase.from('missions').update({ status: 'inspection_end', updated_at: new Date().toISOString() }).eq('id', selectedMission.id);
      setActiveStep('costs');
      Toast.show({ type: 'success', text1: 'Arrivée enregistrée' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Enregistrement impossible' });
    } finally {
      setUploading(false);
    }
  };

  const addCostItem = () => setCostItems(prev => [...prev, { type: 'fuel', amount: '' }]);
  const removeCostItem = (idx: number) => setCostItems(prev => prev.filter((_, i) => i !== idx));
  const updateCostItem = (idx: number, patch: Partial<{ type: 'fuel' | 'toll' | 'parking' | 'hotel' | 'meal' | 'other'; amount: string; receipt?: InspectionPhoto }>) =>
    setCostItems(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));

  const addDocument = () => setDocuments(prev => [...prev, { type: 'other', name: `doc-${prev.length + 1}.jpg` }]);
  const removeDocument = (idx: number) => setDocuments(prev => prev.filter((_, i) => i !== idx));
  const updateDocument = (idx: number, patch: Partial<{ type: 'PV' | 'delivery_note' | 'other'; name: string; file?: InspectionPhoto }>) =>
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, ...patch } : d));

  const takeReceiptPhoto = async (idx: number) => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, exif: true });
    if (!result.canceled && result.assets && result.assets[0]) updateCostItem(idx, { receipt: { id: Date.now().toString(), uri: result.assets[0].uri, type: 'receipt' } });
  };
  const takeDocumentPhoto = async (idx: number) => {
    const ok = await requestPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, exif: true });
    if (!result.canceled && result.assets && result.assets[0]) updateDocument(idx, { file: { id: Date.now().toString(), uri: result.assets[0].uri, type: 'document' } });
  };

  const completeCostsAndDocuments = async () => {
    if (!selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur.' });
      return;
    }
    setUploading(true);
    try {
      const totals = (type: string) => costItems.filter(c => c.type === type).reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
      const receiptsPaths: string[] = [];
      for (const c of costItems) {
        if (c.receipt) {
          const ext = getExtFromUri(c.receipt.uri);
          const p = await uploadImageToStorage(c.receipt.uri, `missions/${selectedMission.id}/receipts/${c.receipt.id}.${ext}`);
          receiptsPaths.push(p);
        }
      }
      await supabase.from('mission_costs').upsert({
        mission_id: selectedMission.id,
        driver_id: user?.id,
        fuel_costs: totals('fuel'),
        toll_costs: totals('toll'),
        parking_costs: totals('parking'),
        hotel_costs: totals('hotel'),
        meal_costs: totals('meal'),
        other_costs: totals('other'),
        receipts: receiptsPaths,
        cost_notes: costNotes || null,
      });
      for (const d of documents) {
        let url = `missions/${selectedMission.id}/documents/${Date.now()}-${d.name}`;
        if (d.file) {
          const ext = getExtFromUri(d.file.uri);
          url = await uploadImageToStorage(d.file.uri, `missions/${selectedMission.id}/documents/${d.file.id}.${ext}`);
        }
        await supabase.from('mission_documents').insert({
          mission_id: selectedMission.id,
          driver_id: user?.id,
          document_type: d.type,
          document_name: d.name,
          document_url: url,
        });
      }
      await supabase.from('missions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', selectedMission.id);
      Toast.show({ type: 'success', text1: 'Mission finalisée' });
      // Reset
      setActiveStep('departure');
      setSelectedMission(null);
      setDepPlate(''); setDepBrand(''); setDepModel(''); setDepMileage(''); setDepFuel('full'); setCleanInt('ok'); setCleanExt('ok'); setHasPapers(false); setHasGps(false); setHasMedia(false); setHasSafetyKit(false); setHasSpareOrKit(false); setKeysCount(1); setDepClientEmail(''); setDepNotes(''); setDepPhotos([]);
      setArrMileage(''); setArrFuel('half'); setArrClientNotes(''); setArrDriverNotes(''); setArrPhotos([]);
      setCostItems([]); setCostNotes(''); setDocuments([]);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Finalisation impossible' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>État des lieux</Text>
          <Text style={styles.subtitle}>Documentez vos missions avec photos géolocalisées</Text>
        </View>

        {!selectedMission && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sélectionner une mission</Text>
            {activeMissions.map((m) => (
              <TouchableOpacity key={m.id} style={styles.missionCard} onPress={() => { setSelectedMission(m); setActiveStep('departure'); setDepClientEmail(m.pickup_contact_email || ''); }}>
                <View style={styles.missionInfo}>
                  <Text style={styles.missionTitle}>{m.title}</Text>
                  {!!m.reference && <Text style={styles.missionRef}>Réf: {m.reference}</Text>}
                </View>
              </TouchableOpacity>
            ))}
            {activeMissions.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Aucune mission active</Text>
              </View>
            )}
          </View>
        )}

        {selectedMission && (
          <View style={styles.section}>
            <View style={styles.selectedBar}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedTitle}>{selectedMission.title}</Text>
                {!!selectedMission.reference && <Text style={styles.selectedRef}>Réf: {selectedMission.reference}</Text>}
              </View>
              <TouchableOpacity onPress={() => { stopTracking(); setSelectedMission(null); setActiveStep('departure'); }}>
                <Text style={styles.changeMission}>Changer de mission</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stepsRow}>
              {(['departure','conveyance','arrival','costs'] as const).map((s, i) => (
                <View key={s} style={[styles.stepItem, activeStep === s && styles.stepActive]}>
                  <Text style={[styles.stepText, activeStep === s && styles.stepTextActive]}>
                    {i + 1}. {s === 'departure' ? 'Départ' : s === 'conveyance' ? 'Convoyage' : s === 'arrival' ? 'Arrivée' : 'Frais'}
                  </Text>
                </View>
              ))}
            </View>

            {activeStep === 'departure' && (
              <View>
                <Text style={styles.sectionSubtitle}>Inspection de départ</Text>

                <View style={styles.formRow}><Text style={styles.label}>Immatriculation ou N° de châssis *</Text><TextInput value={depPlate} onChangeText={setDepPlate} placeholder="AA-123-BB ou VF3…" style={styles.input} /></View>
                <View style={styles.formRow}><Text style={styles.label}>Marque</Text><TextInput value={depBrand} onChangeText={setDepBrand} placeholder="Renault, Peugeot…" style={styles.input} /></View>
                <View style={styles.formRow}><Text style={styles.label}>Modèle</Text><TextInput value={depModel} onChangeText={setDepModel} placeholder="Clio, 308…" style={styles.input} /></View>
                <View style={styles.formRow}><Text style={styles.label}>Kilométrage en km *</Text><TextInput value={depMileage} onChangeText={setDepMileage} keyboardType="numeric" placeholder="125000" style={styles.input} /></View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Niveau de carburant</Text>
                  <View style={styles.fuelChips}>
                    {(['empty','quarter','half','three_quarters','full'] as FuelLevel[]).map(f => (
                      <TouchableOpacity key={f} style={[styles.chip, depFuel === f && styles.chipActive]} onPress={() => setDepFuel(f)}>
                        <Text style={[styles.chipText, depFuel === f && styles.chipTextActive]}>{f === 'empty' ? 'Vide' : f === 'quarter' ? '1/4' : f === 'half' ? '1/2' : f === 'three_quarters' ? '3/4' : 'Plein'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Propreté intérieur</Text>
                  <View style={styles.fuelChips}>
                    {([
                      { k: 'very_dirty', l: 'Très sale' },
                      { k: 'dirty', l: 'Sale' },
                      { k: 'ok', l: 'Correct' },
                      { k: 'clean', l: 'Propre' },
                      { k: 'very_clean', l: 'Très propre' },
                    ] as const).map(({ k, l }) => (
                      <TouchableOpacity key={k} style={[styles.chipSmall, cleanInt === (k as CleanLevel) && styles.chipActive]} onPress={() => setCleanInt(k as CleanLevel)}>
                        <Text style={[styles.chipText, cleanInt === (k as CleanLevel) && styles.chipTextActive]}>{l}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.formRow}>
                  <Text style={styles.label}>Propreté extérieur</Text>
                  <View style={styles.fuelChips}>
                    {([
                      { k: 'very_dirty', l: 'Très sale' },
                      { k: 'dirty', l: 'Sale' },
                      { k: 'ok', l: 'Correct' },
                      { k: 'clean', l: 'Propre' },
                      { k: 'very_clean', l: 'Très propre' },
                    ] as const).map(({ k, l }) => (
                      <TouchableOpacity key={k} style={[styles.chipSmall, cleanExt === (k as CleanLevel) && styles.chipActive]} onPress={() => setCleanExt(k as CleanLevel)}>
                        <Text style={[styles.chipText, cleanExt === (k as CleanLevel) && styles.chipTextActive]}>{l}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Checklist</Text>
                  {[{ label: 'Papiers du véhicule', val: hasPapers, set: setHasPapers },
                    { label: 'GPS', val: hasGps, set: setHasGps },
                    { label: 'Carte SD / CD / DVD', val: hasMedia, set: setHasMedia },
                    { label: 'Kit sécurité (Gilet + Triangle)', val: hasSafetyKit, set: setHasSafetyKit },
                    { label: 'Roue de secours / Kit anti-crevaison', val: hasSpareOrKit, set: setHasSpareOrKit },
                  ].map((c, idx) => (
                    <View key={idx} style={styles.checkRow}>
                      <Text style={{ color: '#374151', flex: 1 }}>{c.label}</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={[styles.chipSmall, c.val && styles.chipActive]} onPress={() => c.set(true)}>
                          <Text style={[styles.chipText, c.val && styles.chipTextActive]}>Oui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.chipSmall, !c.val && styles.chipActive]} onPress={() => c.set(false)}>
                          <Text style={[styles.chipText, !c.val && styles.chipTextActive]}>Non</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={[styles.formRow, styles.keysRow]}>
                  <Text style={styles.label}>Nombre de clé(s)</Text>
                  <View style={styles.keysCtrls}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setKeysCount(v => Math.max(0, v - 1))}><Ionicons name="remove" size={20} color="#2563eb" /></TouchableOpacity>
                    <Text style={styles.keysText}>{keysCount}</Text>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setKeysCount(v => Math.min(10, v + 1))}><Ionicons name="add" size={20} color="#2563eb" /></TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formRow}><Text style={styles.label}>Email client</Text><TextInput value={depClientEmail} onChangeText={setDepClientEmail} autoCapitalize="none" keyboardType="email-address" placeholder="client@email" style={styles.input} /></View>

                <Text style={styles.label}>Photos (4 à 10)</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity disabled={depPhotos.length >= 10} style={[styles.photoButton, styles.pickupButton, depPhotos.length >= 10 && styles.disabledButton]} onPress={() => takePhoto('departure')}>
                    <Ionicons name="camera" size={22} color="white" />
                    <Text style={styles.photoButtonText}>Ajouter photo ({depPhotos.length}/10)</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.photosGrid}>
                  {depPhotos.map(p => (
                    <View key={p.id} style={styles.photoItem}>
                      <Image source={{ uri: p.uri }} style={styles.photoImage} />
                    </View>
                  ))}
                </View>

                <View style={styles.formRow}><Text style={styles.label}>Commentaires</Text><TextInput value={depNotes} onChangeText={setDepNotes} placeholder="Observations" style={[styles.input, { height: 80 }]} multiline /></View>

                {/* Signature client (Départ) */}
                <View style={styles.formRow}>
                  <Text style={styles.label}>Signature client (départ) *</Text>
                  {!depSigDataUrl ? (
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => setDepSigOpen(true)}>
                      <Ionicons name="pencil" size={20} color="#2563eb" />
                      <Text style={styles.secondaryButtonText}>Faire signer le client</Text>
                    </TouchableOpacity>
                  ) : (
                    <View>
                      <Image source={{ uri: depSigDataUrl }} style={styles.signaturePreview} />
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setDepSigOpen(true)}>
                          <Ionicons name="create" size={20} color="#2563eb" />
                          <Text style={styles.secondaryButtonText}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.secondaryButton]} onPress={() => setDepSigDataUrl(null)}>
                          <Ionicons name="trash" size={20} color="#2563eb" />
                          <Text style={styles.secondaryButtonText}>Effacer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={[styles.primaryButton, uploading && styles.disabledButton]} disabled={uploading} onPress={saveDeparture}>
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>{uploading ? 'Enregistrement...' : 'Commencer le convoyage'}</Text>
                </TouchableOpacity>

                {/* Modal signature Départ */}
                <Modal visible={depSigOpen} transparent animationType="fade" onRequestClose={() => setDepSigOpen(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                      <Text style={[styles.sectionSubtitle, { marginBottom: 8 }]}>Signature du client (départ)</Text>
                      <View style={styles.signatureBox}>
                        <Signature
                          ref={depSigRef}
                          onOK={(sig) => { setDepSigDataUrl(sig); setDepSigOpen(false); }}
                          onEmpty={() => Toast.show({ type: 'error', text1: 'Signature vide' })}
                          webStyle={".m-signature-pad--footer {display: none;} body,html{background:transparent;}"}
                          descriptionText="Signez ci‑dessous"
                          autoClear={false}
                          imageType="image/png"
                        />
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => depSigRef.current?.clearSignature?.()}>
                          <Ionicons name="trash" size={20} color="#2563eb" />
                          <Text style={styles.secondaryButtonText}>Effacer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => depSigRef.current?.readSignature?.()}>
                          <Ionicons name="checkmark" size={20} color="white" />
                          <Text style={styles.primaryButtonText}>Valider la signature</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            )}

            {activeStep === 'conveyance' && (
              <View>
                <Text style={styles.sectionSubtitle}>Convoyage</Text>
                <Text style={styles.helper}>Le suivi GPS enregistre automatiquement votre trajet.</Text>
                <View style={{ height: 12 }} />
                {!tracking ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={startTracking}>
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text style={styles.primaryButtonText}>Démarrer le suivi</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#ef4444' }]} onPress={stopTracking}>
                    <Ionicons name="square" size={20} color="white" />
                    <Text style={styles.primaryButtonText}>Arrêter le suivi</Text>
                  </TouchableOpacity>
                )}
                <View style={{ height: 12 }} />
                <TouchableOpacity style={styles.secondaryButton} onPress={() => { stopTracking(); setActiveStep('arrival'); }}>
                  <Ionicons name="arrow-forward" size={20} color="#2563eb" />
                  <Text style={styles.secondaryButtonText}>Passer à l'arrivée</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeStep === 'arrival' && (
              <View>
                <Text style={styles.sectionSubtitle}>Inspection d'arrivée</Text>
                <View style={styles.formRow}><Text style={styles.label}>Kilométrage final</Text><TextInput value={arrMileage} onChangeText={setArrMileage} keyboardType="numeric" placeholder="126200" style={styles.input} /></View>
                <View style={styles.formRow}>
                  <Text style={styles.label}>Carburant</Text>
                  <View style={styles.fuelChips}>
                    {(['full','three_quarters','half','quarter','empty'] as FuelLevel[]).map(f => (
                      <TouchableOpacity key={f} style={[styles.chip, arrFuel === f && styles.chipActive]} onPress={() => setArrFuel(f)}>
                        <Text style={[styles.chipText, arrFuel === f && styles.chipTextActive]}>{f === 'full' ? 'Plein' : f === 'three_quarters' ? '3/4' : f === 'half' ? '1/2' : f === 'quarter' ? '1/4' : 'Vide'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Text style={styles.label}>Photos</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={[styles.photoButton, styles.deliveryButton]} onPress={() => takePhoto('arrival')}>
                    <Ionicons name="camera" size={22} color="white" />
                    <Text style={styles.photoButtonText}>Ajouter photo</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.photosGrid}>
                  {arrPhotos.map(p => (
                    <View key={p.id} style={styles.photoItem}>
                      <Image source={{ uri: p.uri }} style={styles.photoImage} />
                    </View>
                  ))}
                </View>
                {/* Signature client (Arrivée) */}
                <View style={styles.formRow}>
                  <Text style={styles.label}>Signature client (arrivée) *</Text>
                  {!arrSigDataUrl ? (
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => setArrSigOpen(true)}>
                      <Ionicons name="pencil" size={20} color="#2563eb" />
                      <Text style={styles.secondaryButtonText}>Faire signer le client</Text>
                    </TouchableOpacity>
                  ) : (
                    <View>
                      <Image source={{ uri: arrSigDataUrl }} style={styles.signaturePreview} />
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setArrSigOpen(true)}>
                          <Ionicons name="create" size={20} color="#2563eb" />
                          <Text style={styles.secondaryButtonText}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.secondaryButton]} onPress={() => setArrSigDataUrl(null)}>
                          <Ionicons name="trash" size={20} color="#2563eb" />
                          <Text style={styles.secondaryButtonText}>Effacer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.formRow}><Text style={styles.label}>Notes client</Text><TextInput value={arrClientNotes} onChangeText={setArrClientNotes} placeholder="Remarques" style={[styles.input, { height: 60 }]} multiline /></View>
                <View style={styles.formRow}><Text style={styles.label}>Notes conducteur</Text><TextInput value={arrDriverNotes} onChangeText={setArrDriverNotes} placeholder="Remarques" style={[styles.input, { height: 60 }]} multiline /></View>
                <TouchableOpacity style={[styles.primaryButton, uploading && styles.disabledButton]} disabled={uploading} onPress={saveArrival}>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>{uploading ? 'Enregistrement...' : "Valider l'arrivée"}</Text>
                </TouchableOpacity>

                {/* Modal signature Arrivée */}
                <Modal visible={arrSigOpen} transparent animationType="fade" onRequestClose={() => setArrSigOpen(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                      <Text style={[styles.sectionSubtitle, { marginBottom: 8 }]}>Signature du client (arrivée)</Text>
                      <View style={styles.signatureBox}>
                        <Signature
                          ref={arrSigRef}
                          onOK={(sig) => { setArrSigDataUrl(sig); setArrSigOpen(false); }}
                          onEmpty={() => Toast.show({ type: 'error', text1: 'Signature vide' })}
                          webStyle={".m-signature-pad--footer {display: none;} body,html{background:transparent;}"}
                          descriptionText="Signez ci‑dessous"
                          autoClear={false}
                          imageType="image/png"
                        />
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => arrSigRef.current?.clearSignature?.()}>
                          <Ionicons name="trash" size={20} color="#2563eb" />
                          <Text style={styles.secondaryButtonText}>Effacer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => arrSigRef.current?.readSignature?.()}>
                          <Ionicons name="checkmark" size={20} color="white" />
                          <Text style={styles.primaryButtonText}>Valider la signature</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            )}

            {activeStep === 'costs' && (
              <View>
                <Text style={styles.sectionSubtitle}>Frais & Documents</Text>
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={addCostItem}>
                    <Ionicons name="add" size={20} color="#2563eb" />
                    <Text style={styles.secondaryButtonText}>Ajouter un frais</Text>
                  </TouchableOpacity>
                  {costItems.length === 0 && (<Text style={styles.helper}>Aucun frais pour le moment.</Text>)}
                  {costItems.map((c, idx) => (
                    <View key={idx} style={styles.costRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.smallLabel}>Type</Text>
                        <View style={styles.fuelChips}>
                          {(['fuel','toll','parking','hotel','meal','other'] as const).map(t => (
                            <TouchableOpacity key={t} style={[styles.chipSmall, c.type === t && styles.chipActive]} onPress={() => updateCostItem(idx, { type: t })}>
                              <Text style={[styles.chipText, c.type === t && styles.chipTextActive]}>{t}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      <View style={{ width: 100 }}>
                        <Text style={styles.smallLabel}>Montant €</Text>
                        <TextInput value={c.amount} onChangeText={(v)=>updateCostItem(idx,{ amount: v })} keyboardType="decimal-pad" placeholder="0.00" style={styles.input} />
                      </View>
                      <TouchableOpacity style={styles.iconButton} onPress={() => takeReceiptPhoto(idx)}>
                        <Ionicons name="receipt" size={22} color="#2563eb" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconButton} onPress={() => removeCostItem(idx)}>
                        <Ionicons name="trash" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={addDocument}>
                    <Ionicons name="document" size={20} color="#2563eb" />
                    <Text style={styles.secondaryButtonText}>Ajouter un document</Text>
                  </TouchableOpacity>
                  {documents.map((d, idx) => (
                    <View key={idx} style={styles.costRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.smallLabel}>Type</Text>
                        <View style={styles.fuelChips}>
                          {(['PV','delivery_note','other'] as const).map(t => (
                            <TouchableOpacity key={t} style={[styles.chipSmall, d.type === t && styles.chipActive]} onPress={() => updateDocument(idx, { type: t })}>
                              <Text style={[styles.chipText, d.type === t && styles.chipTextActive]}>{t}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <Text style={styles.smallLabel}>Nom</Text>
                        <TextInput value={d.name} onChangeText={(v)=>updateDocument(idx,{ name: v })} placeholder="nom-fichier.jpg" style={styles.input} />
                      </View>
                      <TouchableOpacity style={styles.iconButton} onPress={() => takeDocumentPhoto(idx)}>
                        <Ionicons name="camera" size={22} color="#2563eb" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconButton} onPress={() => removeDocument(idx)}>
                        <Ionicons name="trash" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <Text style={styles.smallLabel}>Notes sur les frais</Text>
                <TextInput value={costNotes} onChangeText={setCostNotes} placeholder="Détails" style={[styles.input, { height: 70 }]} multiline />

                <TouchableOpacity style={[styles.primaryButton, uploading && styles.disabledButton]} disabled={uploading} onPress={completeCostsAndDocuments}>
                  <Ionicons name="checkmark-done" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>{uploading ? 'Finalisation...' : 'Finaliser la mission'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  section: { margin: 16 },
  sectionSubtitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stepItem: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#e5e7eb' },
  stepActive: { backgroundColor: '#2563eb' },
  stepText: { color: '#111827', fontSize: 12, fontWeight: '600' },
  stepTextActive: { color: 'white' },
  missionCard: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  selectedTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  selectedRef: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  changeMission: { color: '#2563eb', fontWeight: '700' },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  missionRef: { fontSize: 14, color: '#6b7280' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 8 },
  formRow: { marginBottom: 12 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '600' },
  smallLabel: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  fuelChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#e5e7eb', borderRadius: 999 },
  chipSmall: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#e5e7eb', borderRadius: 999, marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#111827', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  keysRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  keysCtrls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  keysText: { minWidth: 24, textAlign: 'center', color: '#111827', fontWeight: '700' },
  photoButtons: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  photoButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, gap: 8 },
  pickupButton: { backgroundColor: '#10b981' },
  deliveryButton: { backgroundColor: '#ef4444' },
  photoButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  photoItem: { width: '48%', aspectRatio: 4/3, borderRadius: 8, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  previewOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },
  previewClose: { position: 'absolute', top: 40, right: 20, zIndex: 2 },
  helper: { color: '#6b7280' },
  primaryButton: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, gap: 8 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, gap: 8 },
  secondaryButtonText: { color: '#2563eb', fontSize: 14, fontWeight: '700' },
  disabledButton: { backgroundColor: '#9ca3af' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginTop: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  signaturePreview: { height: 120, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 520, backgroundColor: 'white', borderRadius: 12, padding: 12 },
  signatureBox: { height: 260, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' },
});