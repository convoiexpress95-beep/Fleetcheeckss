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
  Linking,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { toByteArray } from 'base64-js';
import Signature from 'react-native-signature-canvas';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useMissions } from '../hooks/useMissions';
import Toast from 'react-native-toast-message';
import type { Mission } from '../types';
import { useRoute } from '@react-navigation/native';
import { tokens } from '../theme';
import { BRAND_LOGO_URL, BRAND_NAME } from '../branding';

type FuelLevel = 'full' | 'three_quarters' | 'half' | 'quarter' | 'empty';

interface InspectionPhoto {
  id: string;
  uri: string;
  thumbUri?: string;
  type: 'departure' | 'arrival' | 'receipt' | 'document';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const InspectionScreen: React.FC = () => {
  const { user } = useAuth();
  const { data: missions } = useMissions();
  const route = useRoute<any>();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeStep, setActiveStep] = useState<'departure' | 'conveyance' | 'arrival' | 'costs'>('departure');
  const [uploading, setUploading] = useState(false);
  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  // Departure state
  const [depMileage, setDepMileage] = useState('');
  const [depFuel, setDepFuel] = useState<FuelLevel>('full');
  const [depNotes, setDepNotes] = useState('');
  const [depClientEmail, setDepClientEmail] = useState('');
  const [depPhotos, setDepPhotos] = useState<InspectionPhoto[]>([]);
  const [depSignatureDataUrl, setDepSignatureDataUrl] = useState<string | null>(null);
  const depSigRef = useRef<any>(null);

  // Conveyance tracking
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  // Verrouiller l'étape 1 après validation
  const hasStarted = activeStep !== 'departure';
  // Éviter d'ouvrir plusieurs fois la navigation
  const [navOpened, setNavOpened] = useState(false);

  // Arrival state
  const [arrMileage, setArrMileage] = useState('');
  const [arrFuel, setArrFuel] = useState<FuelLevel>('half');
  const [arrClientNotes, setArrClientNotes] = useState('');
  const [arrDriverNotes, setArrDriverNotes] = useState('');
  const [arrPhotos, setArrPhotos] = useState<InspectionPhoto[]>([]);
  const [arrSignatureDataUrl, setArrSignatureDataUrl] = useState<string | null>(null);
  const arrSigRef = useRef<any>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Costs & documents
  const [costItems, setCostItems] = useState<{ type: 'fuel' | 'toll' | 'parking' | 'hotel' | 'meal' | 'other'; amount: string; receipt?: InspectionPhoto }[]>([]);
  const [costNotes, setCostNotes] = useState('');
  const [documents, setDocuments] = useState<{ type: 'PV' | 'delivery_note' | 'other'; name: string; file?: InspectionPhoto }[]>([]);
  const getExtFromUri = (uri: string): 'jpg' | 'jpeg' | 'png' | 'heic' | 'heif' => {
    const q = uri.split('?')[0];
    const dot = q.lastIndexOf('.');
    const ext = dot >= 0 ? q.substring(dot + 1).toLowerCase() : 'jpg';
    if (ext === 'jpeg' || ext === 'jpg') return ext as any;
    if (ext === 'png' || ext === 'heic' || ext === 'heif') return ext as any;
    return 'jpg';
  };

  // Ouvrir la navigation vers l'adresse de livraison avec choix Waze / Maps
  const openNavigation = async () => {
    if (!selectedMission) {
      Toast.show({ type: 'error', text1: 'Aucune mission', text2: 'Sélectionnez une mission' });
      return;
    }
    const destination = selectedMission.delivery_address || selectedMission.pickup_address;
    if (!destination) {
      Toast.show({ type: 'error', text1: 'Adresse manquante', text2: 'Pas d\'adresse de destination' });
      return;
    }
    const encoded = encodeURIComponent(destination);
    const wazeUrl = `waze://?q=${encoded}&navigate=yes`;
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${encoded}`;

    const openUrl = async (url: string) => {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    };

    // Proposer le choix Waze / Maps
    Alert.alert(
      'Navigation',
      'Choisissez votre app de navigation',
      [
        {
          text: 'Waze',
          onPress: async () => {
            const ok = await openUrl(wazeUrl);
            if (!ok) {
              Toast.show({ type: 'info', text1: 'Waze non disponible', text2: 'Ouverture de Maps' });
              if (Platform.OS === 'ios') await openUrl(appleMapsUrl);
              else await openUrl(gmapsUrl);
            }
          },
        },
        {
          text: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
          onPress: async () => {
            if (Platform.OS === 'ios') await openUrl(appleMapsUrl);
            else await openUrl(gmapsUrl);
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
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

  // Style du canvas de signature (WebView interne)
  const signatureWebStyle = `
    body,html { width: 100%; height: 100%; margin:0; padding:0; overflow:hidden; }
    .m-signature-pad { box-shadow: none; border: none; }
    .m-signature-pad--body { border: 2px dashed ${tokens.colors.primary}; border-radius: 8px; height: 180px; }
    .m-signature-pad--footer { display: none; } /* on utilise des boutons natifs RN */
    .description { color: ${tokens.colors.onSurface}; }
    canvas { width: 100% !important; height: 100% !important; touch-action: none; }
  `;


  const activeMissions = missions?.filter(m =>
    ['pending', 'inspection_start', 'in_progress', 'inspection_end', 'cost_validation'].includes(m.status)
  ) || [];

  const isInvolved = (m: Mission | null, uid?: string | null) => {
    if (!m || !uid) return false;
    return m.driver_id === uid || m.created_by === uid;
  };

  // Pré‑sélectionner une mission si on arrive avec un paramètre missionId
  useEffect(() => {
    if (route?.params?.missionId && missions && !selectedMission) {
      const m = missions.find(x => x.id === route.params.missionId);
      if (m) {
        setSelectedMission(m);
        setActiveStep('departure');
        setDepClientEmail(m.pickup_contact_email || '');
      }
    }
  }, [route?.params?.missionId, missions]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à l\'appareil photo est nécessaire pour prendre des photos d\'inspection.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (locationStatus !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à la localisation est nécessaire pour géolocaliser les photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const requestLocationPermissions = async () => {
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à la localisation est nécessaire pour le suivi GPS.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async (type: InspectionPhoto['type']) => {
    if (!selectedMission?.id) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez sélectionner une mission',
      });
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      // Obtenir la localisation
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Prendre la photo
      const result = await ImagePicker.launchCameraAsync({
        // NOTE: MediaTypeOptions est deprecated, mais reste compatible; on garde pour stabilité SDK
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        // Optimiser l'image prise: redimensionner et compresser pour affichage/ upload
        const originalUri = result.assets[0].uri;
        // Grande taille pour upload (max largeur 1600)
        const full = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 1600 } }],
          { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
        );
        // Miniature pour la grille (max largeur 400)
        const thumb = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 400 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString(),
          uri: full.uri,
          thumbUri: thumb.uri,
          type,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };

        if (type === 'departure') setDepPhotos(prev => [...prev, newPhoto]);
        else if (type === 'arrival') setArrPhotos(prev => [...prev, newPhoto]);
        
        Toast.show({
          type: 'success',
          text1: 'Photo prise',
          text2: `Photo ${type === 'departure' ? 'départ' : type === 'arrival' ? 'arrivée' : 'ajoutée'}`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message,
      });
    }
  };

  const uploadImageToStorage = async (uri: string, path: string) => {
    try {
      // Petite aide au debug: taille du fichier
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      if (!info.exists) {
        throw new Error(`Fichier introuvable: ${uri}`);
      }
  // Convertir en Blob via fetch sur l'URI local
      const ext = getExtFromUri(path);
      const contentType = extToMime(ext);
      // Essai 1: fetch(uri) -> Blob
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const { error } = await supabase.storage
          .from('mission-photos')
          .upload(path, blob, { upsert: false, contentType });
        if (error) throw error;
        return path;
      } catch (innerErr) {
        // Essai 2: lire en base64 -> Uint8Array (évite fetch(dataUrl))
        try {
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          const bytes = toByteArray(base64);
          const { error } = await supabase.storage
            .from('mission-photos')
            .upload(path, bytes, { upsert: false, contentType });
          if (error) throw error;
          return path;
        } catch (innerErr2) {
          console.warn('Upload fallback (base64->bytes) failed for', uri, '->', (innerErr2 as any)?.message);
          throw innerErr2;
        }
      }
    } catch (err: any) {
      // Détails supplémentaires pour diagnostiquer les "Network request failed"
      console.warn('Upload error for', uri, '->', err?.message);
      throw err;
    }
  };

  // Limiter le parallélisme des uploads pour accélérer sans saturer le device/réseau
  const uploadInBatches = async <T,>(items: T[], batchSize: number, fn: (item: T) => Promise<string>) => {
    const results: string[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const r = await Promise.all(batch.map(fn));
      results.push(...r);
    }
    return results;
  };

  const saveDeparture = async () => {
    if (!selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur de la mission.' });
      return;
    }
    if (!depMileage || depPhotos.length < 1) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Kilométrage et au moins 1 photo' });
      return;
    }
    setUploading(true);
    try {
      const photoPaths = await uploadInBatches(depPhotos, 3, async (p) => {
        const ext = getExtFromUri(p.uri);
        const fileName = `missions/${selectedMission.id}/departure/${p.id}.${ext}`;
        return uploadImageToStorage(p.uri, fileName);
      });

      // Uploader la signature si présente
      let depSignPath: string | null = null;
      if (depSignatureDataUrl) {
        try {
          const base64 = depSignatureDataUrl.replace(/^data:image\/png;base64,/, '');
          const bytes = toByteArray(base64);
          const fileName = `missions/${selectedMission.id}/signatures/departure-${Date.now()}.png`;
          const { error: upErr } = await supabase.storage
            .from('mission-photos')
            .upload(fileName, bytes, { contentType: 'image/png', upsert: false });
          if (upErr) throw upErr;
          depSignPath = fileName;
        } catch (e) {
          console.warn('Upload signature départ échoué:', (e as any)?.message);
        }
      }

      const { error } = await supabase.from('inspection_departures').insert({
        mission_id: selectedMission.id,
        driver_id: user?.id,
        initial_mileage: parseFloat(depMileage),
        initial_fuel: depFuel,
        photos: photoPaths,
        internal_notes: depNotes,
        client_email: depClientEmail || null,
        client_signature_url: depSignPath,
      });
      if (error) throw error;

      await supabase.from('missions').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', selectedMission.id);
      setActiveStep('conveyance');
  // Démarrer automatiquement le suivi
  try { await startTracking(); } catch {}
      Toast.show({ type: 'success', text1: 'Départ enregistré' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message });
    } finally {
      setUploading(false);
    }
  };

  const startTracking = async () => {
    if (tracking || !selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur de la mission.' });
      return;
    }
  const hasPermissions = await requestLocationPermissions();
    if (!hasPermissions) return;
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

  const stopTracking = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTracking(false);
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopTracking();
    };
  }, []);

  // Sauvegarder automatiquement l'étape courante en passant à la suivante
  const goToStep = async (next: 'conveyance' | 'arrival' | 'costs') => {
    if (uploading) return;
    if (activeStep === 'departure') {
      await saveDeparture();
      return; // saveDeparture gère le passage à 'conveyance'
    }
    if (activeStep === 'arrival' && next === 'costs') {
      await saveArrival();
      return; // saveArrival gère le passage à 'costs'
    }
    setActiveStep(next);
  };

  const saveArrival = async () => {
    if (!selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur de la mission.' });
      return;
    }
    if (!arrMileage || arrPhotos.length < 1) {
      Toast.show({ type: 'error', text1: 'Champs requis', text2: 'Kilométrage et au moins 1 photo' });
      return;
    }
    setUploading(true);
    try {
      const photoPaths = await uploadInBatches(arrPhotos, 3, async (p) => {
        const ext = getExtFromUri(p.uri);
        const fileName = `missions/${selectedMission.id}/arrival/${p.id}.${ext}`;
        return uploadImageToStorage(p.uri, fileName);
      });

      // Uploader la signature si présente
      let arrSignPath: string | null = null;
      if (arrSignatureDataUrl) {
        try {
          const base64 = arrSignatureDataUrl.replace(/^data:image\/png;base64,/, '');
          const bytes = toByteArray(base64);
          const fileName = `missions/${selectedMission.id}/signatures/arrival-${Date.now()}.png`;
          const { error: upErr } = await supabase.storage
            .from('mission-photos')
            .upload(fileName, bytes, { contentType: 'image/png', upsert: false });
          if (upErr) throw upErr;
          arrSignPath = fileName;
        } catch (e) {
          console.warn('Upload signature arrivée échoué:', (e as any)?.message);
        }
      }

      const { error } = await supabase.from('inspection_arrivals').insert({
        mission_id: selectedMission.id,
        driver_id: user?.id,
        final_mileage: parseFloat(arrMileage),
        final_fuel: arrFuel,
        photos: photoPaths,
        client_notes: arrClientNotes || null,
        driver_notes: arrDriverNotes || null,
        client_signature_url: arrSignPath,
      });
      if (error) throw error;

  // Arrêter automatiquement le suivi
  stopTracking();
  await supabase.from('missions').update({ status: 'inspection_end', updated_at: new Date().toISOString() }).eq('id', selectedMission.id);
      setActiveStep('costs');
      Toast.show({ type: 'success', text1: 'Arrivée enregistrée' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message });
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
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1, exif: true });
    if (!result.canceled && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      const full = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 1600 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      const thumb = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 400 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      updateCostItem(idx, { receipt: { id: Date.now().toString(), uri: full.uri, thumbUri: thumb.uri, type: 'receipt' } });
    }
  };

  const takeDocumentPhoto = async (idx: number) => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1, exif: true });
    if (!result.canceled && result.assets[0]) {
      const originalUri = result.assets[0].uri;
      const full = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 1600 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      const thumb = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 400 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      updateDocument(idx, { file: { id: Date.now().toString(), uri: full.uri, thumbUri: thumb.uri, type: 'document' } });
    }
  };

  const completeCostsAndDocuments = async () => {
    if (!selectedMission?.id) return;
    if (!isInvolved(selectedMission, user?.id)) {
      Toast.show({ type: 'error', text1: 'Accès refusé', text2: 'Vous devez être conducteur ou créateur de la mission.' });
      return;
    }
    setUploading(true);
    try {
      // Upsert costs
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

      // Documents
      for (const d of documents) {
        let url = `missions/${selectedMission.id}/documents/${Date.now()}-${d.name}`;
        if (d.file) {
          const ext = getExtFromUri(d.file.uri);
          const path = `missions/${selectedMission.id}/documents/${d.file.id}.${ext}`;
          url = await uploadImageToStorage(d.file.uri, path);
        }
        await supabase.from('mission_documents').insert({
          mission_id: selectedMission.id,
          driver_id: user?.id,
          document_type: d.type,
          document_name: d.name,
          document_url: url,
        });
      }

  // S'assurer que le suivi est arrêté avant de finaliser
  stopTracking();
  await supabase.from('missions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', selectedMission.id);
      Toast.show({ type: 'success', text1: 'Mission finalisée' });
      // Reset wizard
      setActiveStep('departure');
      setSelectedMission(null);
      setDepMileage(''); setDepFuel('full'); setDepNotes(''); setDepClientEmail(''); setDepPhotos([]);
      setArrMileage(''); setArrFuel('half'); setArrClientNotes(''); setArrDriverNotes(''); setArrPhotos([]);
      setCostItems([]); setCostNotes(''); setDocuments([]);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message });
    } finally {
      setUploading(false);
    }
  };

  // Génération PDF / Email en fin d’inspection
  const exportFinalPdf = async () => {
    try {
      // Lazy import pour réduire le poids initial
      const Print = await import('expo-print');
      const Sharing = await import('expo-sharing');
  const logo = BRAND_LOGO_URL;
      const esc = (v: any) => (v == null || v === '' ? '-' : String(v));
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; background: ${tokens.colors.background}; padding: 24px; }
              .frame { background: ${tokens.colors.surface}; border: 4px solid ${tokens.colors.primary}; border-radius: 12px; padding: 20px; }
              .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
              .brand { display:flex; align-items:center; gap: 10px; }
              .brand img { height: 36px; width: auto; border-radius: 10px; }
              .brand .name { font-weight: 800; color:${tokens.colors.primary}; }
              .title { font-size: 22px; font-weight: 700; color: ${tokens.colors.onSurface}; }
              .muted { color: ${tokens.colors.onSurface}; }
            </style>
          </head>
          <body>
            <div class="frame">
              <div class="header">
                <div class="brand"><img src="${logo}" alt="${BRAND_NAME}" /><span class="name">${BRAND_NAME}</span></div>
                <div class="title">Rapport de mission – ${esc(selectedMission?.title)}</div>
                <div class="muted">Réf: ${esc(selectedMission?.reference)}</div>
              </div>
            </div>
          </body>
        </html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
    } catch {}
  };
  const emailFinalReport = async () => {
    try {
      const Print = await import('expo-print');
      const Mail = await import('expo-mail-composer');
  const logo = BRAND_LOGO_URL;
      const esc = (v: any) => (v == null || v === '' ? '-' : String(v));
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; background: ${tokens.colors.background}; padding: 24px; }
              .frame { background: ${tokens.colors.surface}; border: 4px solid ${tokens.colors.primary}; border-radius: 12px; padding: 20px; }
              .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
              .brand { display:flex; align-items:center; gap: 10px; }
              .brand img { height: 36px; width: auto; border-radius: 10px; }
              .brand .name { font-weight: 800; color:${tokens.colors.primary}; }
              .title { font-size: 20px; font-weight: 700; color: ${tokens.colors.onSurface}; }
              .muted { color: ${tokens.colors.onSurface}; }
            </style>
          </head>
          <body>
            <div class="frame">
              <div class="header">
                <div class="brand"><img src="${logo}" alt="${BRAND_NAME}" /><span class="name">${BRAND_NAME}</span></div>
                <div class="title">Rapport ${esc(selectedMission?.reference)}</div>
              </div>
              <div class="muted">${esc(selectedMission?.title)}</div>
            </div>
          </body>
        </html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Mail.composeAsync({ subject: `Rapport ${selectedMission?.reference}`, attachments: [uri] });
    } catch {}
  };

  // Ouvrir automatiquement la navigation à l'entrée dans l'étape "Convoyage"
  useEffect(() => {
    if (activeStep === 'conveyance' && !navOpened) {
      setNavOpened(true);
      // Ne pas bloquer l'UI si l'ouverture échoue
      openNavigation().catch(() => {});
    }
    if (activeStep !== 'conveyance' && navOpened) {
      setNavOpened(false);
    }
  }, [activeStep]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} scrollEnabled={!isSigning} nestedScrollEnabled onScrollBeginDrag={() => setIsSigning(false)}>
      <View style={styles.header}>
        <Text style={styles.title}>État des lieux</Text>
        <Text style={styles.subtitle}>
          Prenez des photos géolocalisées pour documenter vos missions
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sélectionner une mission</Text>
        {activeMissions.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            style={[styles.missionCard, selectedMission?.id === mission.id && styles.selectedMission, hasStarted && styles.missionLocked]}
            disabled={hasStarted}
            onPress={() => {
              if (hasStarted) return; // verrouillé
              setSelectedMission(mission);
              setActiveStep('departure');
              setDepClientEmail(mission.pickup_contact_email || '');
            }}
          >
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionRef}>Réf: {mission.reference}</Text>
            </View>
            {selectedMission?.id === mission.id && (
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            )}
          </TouchableOpacity>
        ))}

        {activeMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune mission active</Text>
          </View>
        )}
      </View>

      {selectedMission && (
        <View style={styles.section}>
          {/* Step indicator */}
          <View style={styles.stepsRow}>
            {(['departure','conveyance','arrival','costs'] as const).map((s, i) => (
              <View key={s} style={[styles.stepItem, activeStep === s && styles.stepActive]}>
                <Text style={[styles.stepText, activeStep === s && styles.stepTextActive]}>
                  {i + 1}. {s === 'departure' ? 'Départ' : s === 'conveyance' ? 'Convoyage' : s === 'arrival' ? 'Arrivée' : 'Frais'}
                </Text>
              </View>
            ))}
          </View>

          {/* Step content */}
          {activeStep === 'departure' && (
            <View>
              <Text style={styles.sectionSubtitle}>Inspection de départ</Text>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Kilométrage initial</Text>
                <TextInput value={depMileage} onChangeText={setDepMileage} keyboardType="numeric" placeholder="125000" style={styles.input} />
              </View>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Carburant</Text>
                <View style={styles.fuelChips}>
                  {(['full','three_quarters','half','quarter','empty'] as FuelLevel[]).map(f => (
                    <TouchableOpacity key={f} style={[styles.chip, depFuel === f && styles.chipActive]} onPress={() => setDepFuel(f)}>
                      <Text style={[styles.chipText, depFuel === f && styles.chipTextActive]}>{
                        f === 'full' ? 'Plein' : f === 'three_quarters' ? '3/4' : f === 'half' ? '1/2' : f === 'quarter' ? '1/4' : 'Vide'
                      }</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Email client</Text>
                <TextInput value={depClientEmail} onChangeText={setDepClientEmail} placeholder="client@email"
                  autoCapitalize="none" keyboardType="email-address" style={styles.input} />
              </View>
              <View style={{ height: 8 }} />
              <Text style={styles.label}>Photos</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={[styles.photoButton, styles.pickupButton]} onPress={() => takePhoto('departure')}>
                  <Ionicons name="camera" size={24} color="white" />
                  <Text style={styles.photoButtonText}>Ajouter photo</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={depPhotos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.photoItem} onPress={() => { setPreviewUri(item.uri); setPreviewVisible(true); }}>
                    <Image source={{ uri: item.thumbUri || item.uri }} style={styles.photoImage} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.photosGrid}
                scrollEnabled={false}
              />
              
              <View style={styles.formRow}>
                <Text style={styles.label}>Signature du client (Départ)</Text>
                <View style={styles.signatureBox}>
                  <Signature
                    ref={depSigRef}
                    onOK={(d: string) => { setDepSignatureDataUrl(d); setIsSigning(false); }}
                    onBegin={() => setIsSigning(true)}
                    onEnd={() => setIsSigning(false)}
                    descriptionText="Signez dans le cadre"
                    webStyle={signatureWebStyle}
                    autoClear={false}
                    imageType="image/png"
                    backgroundColor="#ffffff"
                    penColor="#111827"
                    androidHardwareAccelerationDisabled
                  />
                </View>
                <View style={styles.signatureActions}>
                  <TouchableOpacity style={styles.sigBtn} onPress={() => { depSigRef.current?.readSignature?.(); }}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.sigBtnText}>Enregistrer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.sigBtnOutline, { marginLeft: 8 }]} onPress={() => { depSigRef.current?.clearSignature?.(); setDepSignatureDataUrl(null); }}>
                    <Ionicons name="refresh" size={18} color={tokens.colors.primary} />
                    <Text style={styles.sigBtnOutlineText}>Refaire</Text>
                  </TouchableOpacity>
                </View>
                {depSignatureDataUrl ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.smallLabel}>Aperçu signature</Text>
                    <Image source={{ uri: depSignatureDataUrl }} style={styles.signaturePreview} />
                  </View>
                ) : null}
              </View>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Notes internes</Text>
                <TextInput value={depNotes} onChangeText={setDepNotes} placeholder="Observations" style={[styles.input, { height: 80 }]} multiline />
              </View>
              <TouchableOpacity style={[styles.primaryButton, uploading && styles.disabledButton]} disabled={uploading} onPress={() => goToStep('conveyance')}>
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.primaryButtonText}>{uploading ? 'Enregistrement...' : 'Commencer le convoyage'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeStep === 'conveyance' && (
            <View>
              <Text style={styles.sectionSubtitle}>Convoyage</Text>
              <Text style={styles.helper}>{tracking ? 'Suivi GPS actif (démarré automatiquement)' : 'Initialisation du suivi...'}</Text>
              <View style={{ height: 12 }} />
              <TouchableOpacity style={styles.primaryButton} onPress={async () => { await openNavigation(); }}>
                <Ionicons name="map" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Naviguer vers la destination</Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { goToStep('arrival'); }}>
                <Ionicons name="arrow-forward" size={20} color={tokens.colors.primary} />
                <Text style={styles.secondaryButtonText}>Passer à l'arrivée</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeStep === 'arrival' && (
            <View>
              <Text style={styles.sectionSubtitle}>Inspection d'arrivée</Text>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Kilométrage final</Text>
                <TextInput value={arrMileage} onChangeText={setArrMileage} keyboardType="numeric" placeholder="126200" style={styles.input} />
              </View>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Carburant</Text>
                <View style={styles.fuelChips}>
                  {(['full','three_quarters','half','quarter','empty'] as FuelLevel[]).map(f => (
                    <TouchableOpacity key={f} style={[styles.chip, arrFuel === f && styles.chipActive]} onPress={() => setArrFuel(f)}>
                      <Text style={[styles.chipText, arrFuel === f && styles.chipTextActive]}>{
                        f === 'full' ? 'Plein' : f === 'three_quarters' ? '3/4' : f === 'half' ? '1/2' : f === 'quarter' ? '1/4' : 'Vide'
                      }</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Text style={styles.label}>Photos</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={[styles.photoButton, styles.deliveryButton]} onPress={() => takePhoto('arrival')}>
                  <Ionicons name="camera" size={24} color="white" />
                  <Text style={styles.photoButtonText}>Ajouter photo</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={arrPhotos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.photoItem} onPress={() => { setPreviewUri(item.uri); setPreviewVisible(true); }}>
                    <Image source={{ uri: item.thumbUri || item.uri }} style={styles.photoImage} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.photosGrid}
                scrollEnabled={false}
              />
              
              <View style={styles.formRow}>
                <Text style={styles.label}>Signature du client (Arrivée)</Text>
                <View style={styles.signatureBox}>
                  <Signature
                    ref={arrSigRef}
                    onOK={(d: string) => { setArrSignatureDataUrl(d); setIsSigning(false); }}
                    onBegin={() => setIsSigning(true)}
                    onEnd={() => setIsSigning(false)}
                    descriptionText="Signez dans le cadre"
                    webStyle={signatureWebStyle}
                    autoClear={false}
                    imageType="image/png"
                    backgroundColor="#ffffff"
                    penColor="#111827"
                    androidHardwareAccelerationDisabled
                  />
                </View>
                <View style={styles.signatureActions}>
                  <TouchableOpacity style={styles.sigBtn} onPress={() => { arrSigRef.current?.readSignature?.(); }}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.sigBtnText}>Enregistrer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.sigBtnOutline, { marginLeft: 8 }]} onPress={() => { arrSigRef.current?.clearSignature?.(); setArrSignatureDataUrl(null); }}>
                    <Ionicons name="refresh" size={18} color={tokens.colors.primary} />
                    <Text style={styles.sigBtnOutlineText}>Refaire</Text>
                  </TouchableOpacity>
                </View>
                {arrSignatureDataUrl ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.smallLabel}>Aperçu signature</Text>
                    <Image source={{ uri: arrSignatureDataUrl }} style={styles.signaturePreview} />
                  </View>
                ) : null}
              </View>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Notes client</Text>
                <TextInput value={arrClientNotes} onChangeText={setArrClientNotes} placeholder="Remarques"
                  style={[styles.input, { height: 60 }]} multiline />
              </View>
              <View style={styles.formRow}> 
                <Text style={styles.label}>Notes conducteur</Text>
                <TextInput value={arrDriverNotes} onChangeText={setArrDriverNotes} placeholder="Remarques"
                  style={[styles.input, { height: 60 }]} multiline />
              </View>
              <TouchableOpacity style={[styles.primaryButton, uploading && styles.disabledButton]} disabled={uploading} onPress={() => goToStep('costs')}>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.primaryButtonText}>{uploading ? 'Enregistrement...' : 'Valider l\'arrivée'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeStep === 'costs' && (
            <View>
              <Text style={styles.sectionSubtitle}>Frais & Documents</Text>
              {/* Costs */}
              <View style={{ marginBottom: 12 }}>
                <TouchableOpacity style={styles.secondaryButton} onPress={addCostItem}>
                  <Ionicons name="add" size={20} color={tokens.colors.primary} />
                  <Text style={styles.secondaryButtonText}>Ajouter un frais</Text>
                </TouchableOpacity>
                {costItems.length === 0 && (
                  <Text style={styles.helper}>Aucun frais pour le moment.</Text>
                )}
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
                      <Ionicons name="receipt" size={22} color={tokens.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => removeCostItem(idx)}>
                      <Ionicons name="trash" size={22} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Documents */}
              <View style={{ marginBottom: 12 }}>
                <TouchableOpacity style={styles.secondaryButton} onPress={addDocument}>
                  <Ionicons name="document" size={20} color={tokens.colors.primary} />
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
                      <Ionicons name="camera" size={22} color={tokens.colors.primary} />
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
              <View style={{ height: 8 }} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={exportFinalPdf}>
                  <Ionicons name="document" size={18} color={tokens.colors.primary} />
                  <Text style={styles.secondaryButtonText}>Exporter PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={emailFinalReport}>
                  <Ionicons name="mail" size={18} color={tokens.colors.primary} />
                  <Text style={styles.secondaryButtonText}>Envoyer par e‑mail</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

  {/* Fin du wizard */}
  </ScrollView>

    {/* Aperçu plein écran des photos */}
    {previewVisible && (
      <View style={styles.previewOverlay}>
        <TouchableOpacity style={styles.previewClose} onPress={() => { setPreviewVisible(false); setPreviewUri(null); }}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        {previewUri ? (
          <Image source={{ uri: previewUri! }} style={styles.previewImage} resizeMode="contain" />
        ) : null}
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 20,
    backgroundColor: tokens.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: tokens.colors.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: tokens.colors.onSurface,
  },
  section: {
    margin: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: 12,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: tokens.colors.card,
  },
  stepActive: {
    backgroundColor: tokens.colors.primary,
  },
  stepText: { color: tokens.colors.onSurface, fontSize: 12, fontWeight: '600' },
  stepTextActive: { color: 'white' },
  missionCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionLocked: {
    opacity: 0.6,
  },
  selectedMission: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.card,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: 2,
  },
  missionRef: {
    fontSize: 14,
    color: tokens.colors.onSurface,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: tokens.colors.onSurface,
    marginTop: 8,
  },
  formRow: { marginBottom: 12 },
  label: { fontSize: 14, color: tokens.colors.onSurface, marginBottom: 6, fontWeight: '600' },
  smallLabel: { fontSize: 12, color: tokens.colors.onSurface, marginBottom: 6 },
  input: { backgroundColor: tokens.colors.surface, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: 8, padding: 12, color: tokens.colors.onSurface },
  fuelChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: tokens.colors.card, borderRadius: 999 },
  chipSmall: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: tokens.colors.card, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: tokens.colors.primary },
  chipText: { color: tokens.colors.onSurface, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  pickupButton: {
    backgroundColor: tokens.colors.accent,
  },
  deliveryButton: {
    backgroundColor: '#ef4444',
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 4/3,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  helper: { color: tokens.colors.onSurface },
  primaryButton: { backgroundColor: tokens.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, gap: 8 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: tokens.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, gap: 8 },
  secondaryButtonText: { color: tokens.colors.primary, fontSize: 14, fontWeight: '700' },
  disabledButton: { backgroundColor: '#9ca3af' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: tokens.colors.surface, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: 8, padding: 8, marginTop: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: tokens.colors.border, alignItems: 'center', justifyContent: 'center' },
  signatureBox: { height: 180, backgroundColor: tokens.colors.surface, borderWidth: 2, borderColor: tokens.colors.primary, borderStyle: 'dashed', borderRadius: 8, overflow: 'hidden' },
  signaturePreview: { width: '100%', height: 120, backgroundColor: tokens.colors.surface, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: 8 },
  signatureActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sigBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tokens.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  sigBtnText: { color: '#fff', fontWeight: '700' },
  sigBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: tokens.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  sigBtnOutlineText: { color: tokens.colors.primary, fontWeight: '700' },
});