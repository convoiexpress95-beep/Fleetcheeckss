import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch, FlatList, Platform, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';
import MapboxAutocomplete, { MapboxSuggestion } from '../components/MapboxAutocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';

const MAPBOX_TOKEN = (Constants?.expoConfig?.extra as any)?.MAPBOX_TOKEN as string | undefined;

interface Suggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

export default function CovoituragePublish({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  const [departureCity, setDepartureCity] = useState('');
  const [departureAddress, setDepartureAddress] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [departureCoord, setDepartureCoord] = useState<[number, number] | null>(null); // [lng, lat]
  const [destinationCoord, setDestinationCoord] = useState<[number, number] | null>(null);

  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [time, setTime] = useState(''); // HH:mm
  const [seats, setSeats] = useState('1');
  const [vehicleModel, setVehicleModel] = useState('');
  const [viaStops, setViaStops] = useState('');
  const [notes, setNotes] = useState('');

  const [luggage, setLuggage] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [musicOk, setMusicOk] = useState(true);
  const [airConditioning, setAirConditioning] = useState(true);
  const [instantBooking, setInstantBooking] = useState(false);

  const [price, setPrice] = useState('');

  const [step, setStep] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [timeObj, setTimeObj] = useState<Date | null>(null);

  // Ajout: gestionnaires des pickers (corrige TS: onChangeDate/onChangeTime)
  const onChangeDate = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (!selected) return;
    setDateObj(selected);
    setDate(selected.toISOString().slice(0, 10));
  };

  const onChangeTime = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!selected) return;
    setTimeObj(selected);
    const hh = String(selected.getHours()).padStart(2, '0');
    const mm = String(selected.getMinutes()).padStart(2, '0');
    setTime(`${hh}:${mm}`);
  };

  // Compat: timers pour anciens handlers (même si non utilisés par le composant Autocomplete)
  const depTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Préférences utilisateur (auto-sauvegarde pour saisis rapides)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('covoiturage_publish_prefs');
        if (!raw) return;
        const prefs = JSON.parse(raw);
        if (prefs?.seats) setSeats(String(prefs.seats));
        if (prefs?.instantBooking !== undefined) setInstantBooking(!!prefs.instantBooking);
        if (prefs?.luggage !== undefined) setLuggage(!!prefs.luggage);
        if (prefs?.musicOk !== undefined) setMusicOk(!!prefs.musicOk);
        if (prefs?.airConditioning !== undefined) setAirConditioning(!!prefs.airConditioning);
        if (prefs?.vehicleModel) setVehicleModel(prefs.vehicleModel);
      } catch {}
    })();
  }, []);

  const savePrefs = async () => {
    try {
      const prefs = {
        seats: Number(seats || 1),
        instantBooking,
        luggage,
        musicOk,
        airConditioning,
        vehicleModel,
      };
      await AsyncStorage.setItem('covoiturage_publish_prefs', JSON.stringify(prefs));
    } catch {}
  };

  // Sélection Mapbox
  const selectDep = (s: MapboxSuggestion) => {
    setDepartureCity(s.text);
    setDepartureAddress(s.place_name);
    setDepartureCoord(s.center);
  };
  const selectDest = (s: MapboxSuggestion) => {
    setDestinationCity(s.text);
    setDestinationAddress(s.place_name);
    setDestinationCoord(s.center);
  };

  const distanceKm = useMemo(() => {
    if (!departureCoord || !destinationCoord) return 0;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const [lng1, lat1] = departureCoord;
    const [lng2, lat2] = destinationCoord;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [departureCoord, destinationCoord]);

  const suggestedPrice = useMemo(() => {
    if (!distanceKm) return price || '';
    // simple: 0.15€/km + base 3€
    const p = Math.max(5, Math.round((3 + 0.15 * distanceKm) / 1) * 1);
    return price || String(p);
  }, [distanceKm, price]);

  const incSeats = () => setSeats((s) => `${Math.max(1, Math.min(6, (parseInt(s || '1', 10) || 1) + 1))}`);
  const decSeats = () => setSeats((s) => `${Math.max(1, Math.min(6, (parseInt(s || '1', 10) || 1) - 1))}`);

  const queryMapbox = async (q: string): Promise<Suggestion[]> => {
    if (!MAPBOX_TOKEN || !q?.trim()) return [];
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?autocomplete=true&language=fr&limit=5&country=FR&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const json = await res.json();
      return (json.features || []).map((f: any) => ({ id: f.id, place_name: f.place_name, text: f.text, center: f.center }));
    } catch {
      return [];
    }
  };

  const onChangeDep = (val: string) => {
    setDepartureCity(val);
    setDepartureCoord(null);
    if (depTimer.current) clearTimeout(depTimer.current);
    depTimer.current = setTimeout(async () => {
      const list = await queryMapbox(val);
      setDepSuggestions(list);
    }, 250);
  };
  const onChangeDest = (val: string) => {
    setDestinationCity(val);
    setDestinationCoord(null);
    if (destTimer.current) clearTimeout(destTimer.current);
    destTimer.current = setTimeout(async () => {
      const list = await queryMapbox(val);
      setDestSuggestions(list);
    }, 250);
  };

  const canContinueStep1 = !!departureCity && !!destinationCity && !!date && !!time;

  const publish = async () => {
    if (!departureCity || !destinationCity) {
      Alert.alert('Champs manquants', 'Départ et destination sont requis.');
      return;
    }
    if (!date || !time) {
      Alert.alert('Date/heure', 'Veuillez saisir la date et l\'heure de départ.');
      return;
    }
    const seatsNum = Number(seats || 1);
    if (Number.isNaN(seatsNum) || seatsNum < 1) {
      Alert.alert('Sièges', 'Le nombre de sièges doit être valide.');
      return;
    }
    const priceNum = Number(price || suggestedPrice || 0);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Prix', 'Le prix doit être un nombre valide.');
      return;
    }

    const payload = {
      departure_city: departureCity,
      departure_address: departureAddress || null,
      departure_coord: departureCoord, // [lng, lat]
      destination_city: destinationCity,
      destination_address: destinationAddress || null,
      destination_coord: destinationCoord,
      date,
      time,
      seats: seatsNum,
      vehicle_model: vehicleModel || null,
      via_stops: viaStops ? viaStops.split(',').map((s) => s.trim()).filter(Boolean) : [],
      notes: notes || null,
      options: { luggage, petsAllowed, smokingAllowed, musicOk, airConditioning, instantBooking },
      price_per_seat: priceNum,
      distance_km: distanceKm,
      debit_credit: 1,
    };

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('covoiturage-publier', { body: payload });
      if (error) throw error;
      Alert.alert('Publié', 'Votre trajet a été publié (1 crédit débité).');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de publier le trajet');
    } finally {
      setLoading(false);
    }
  };

  const next = () => setStep((x) => Math.min(3, x + 1)); // 3 étapes au lieu de 4
  const back = () => setStep((x) => Math.max(1, x - 1));

  // Backward-compat: no-op setters for legacy suggestions removed after refactor
  const setDepSuggestions = (_: any) => {};
  const setDestSuggestions = (_: any) => {};

  // Presets rapides
  const seatPresets = [1, 2, 3, 4, 5];
  const priceNumber = Number(suggestedPrice || price || 0) || 10;
  const pricePresets = [Math.max(5, priceNumber - 5), priceNumber, priceNumber + 5];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publier un trajet (1 crédit)</Text>

      {step === 1 && (
        <>
          <MapboxAutocomplete value={departureCity} onChangeText={setDepartureCity} onSelect={selectDep} placeholder="Ville de départ" />
          <View style={{ height: 10 }} />
          <MapboxAutocomplete value={destinationCity} onChangeText={setDestinationCity} onSelect={selectDest} placeholder="Ville d'arrivée" />

          <View style={styles.row}>
            <TouchableOpacity style={[styles.input, styles.flex, { justifyContent: 'center' }]} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: date ? '#e5e7eb' : '#64748b' }}>{date || 'Date (sélecteur)'}</Text>
            </TouchableOpacity>
            <View style={{ width: 10 }} />
            <TouchableOpacity style={[styles.input, styles.flex, { justifyContent: 'center' }]} onPress={() => setShowTimePicker(true)}>
              <Text style={{ color: time ? '#e5e7eb' : '#64748b' }}>{time || 'Heure (sélecteur)'}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker mode="date" value={dateObj || new Date()} onChange={onChangeDate} display={Platform.OS === 'android' ? 'calendar' : 'inline'} />
          )}
          {showTimePicker && (
            <DateTimePicker mode="time" value={timeObj || new Date()} onChange={onChangeTime} display={Platform.OS === 'android' ? 'clock' : 'inline'} />
          )}

          <TouchableOpacity style={[styles.cta, !canContinueStep1 && styles.ctaDisabled]} onPress={next} disabled={!canContinueStep1}>
            <Text style={styles.ctaText}>Continuer</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.sectionTitle}>Sièges</Text>
          <View style={styles.chipsRow}>
            {seatPresets.map((s) => (
              <TouchableOpacity key={s} onPress={() => setSeats(String(s))} style={[styles.chip, String(s) === seats && styles.chipActive]}>
                <Text style={[styles.chipText, String(s) === seats && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Prix par siège (€)</Text>
          <View style={styles.chipsRow}>
            {pricePresets.map((p) => (
              <TouchableOpacity key={p} onPress={() => setPrice(String(p))} style={[styles.chip, Number(price) === p && styles.chipActive]}>
                <Text style={[styles.chipText, Number(price) === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={[styles.input, { marginTop: 10 }]} keyboardType="numeric" placeholder={suggestedPrice ? `p.ex ${suggestedPrice}` : 'p.ex 25'} placeholderTextColor="#64748b" value={price} onChangeText={setPrice} />
          {!!distanceKm && (<Text style={{ color: '#94a3b8', marginBottom: 10 }}>Distance estimée: ~{distanceKm} km</Text>)}

          <View style={styles.rowAlign}>
            <Text style={styles.label}>Réservation instantanée</Text>
            <Switch value={instantBooking} onValueChange={setInstantBooking} />
          </View>

          <TouchableOpacity style={styles.cta} onPress={next}><Text style={styles.ctaText}>Continuer</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.cta, styles.ctaSecondary]} onPress={back}><Text style={[styles.ctaText, { color: '#e5e7eb' }]}>Retour</Text></TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <TextInput style={styles.input} placeholder="Modèle de véhicule (facultatif)" placeholderTextColor="#64748b" value={vehicleModel} onChangeText={setVehicleModel} />
          <TextInput style={styles.input} placeholder="Étapes (séparées par des virgules)" placeholderTextColor="#64748b" value={viaStops} onChangeText={setViaStops} />

          <TouchableOpacity onPress={() => setShowAdvanced((v) => !v)} style={[styles.chip, { alignSelf: 'flex-start', marginBottom: 8 }]}>
            <Text style={styles.chipText}>{showAdvanced ? 'Masquer options avancées' : 'Options avancées'}</Text>
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Options</Text>
              <Option label="Bagages" value={luggage} onValueChange={setLuggage} />
              <Option label="Animaux" value={petsAllowed} onValueChange={setPetsAllowed} />
              <Option label="Fumeurs" value={smokingAllowed} onValueChange={setSmokingAllowed} />
              <Option label="Musique ok" value={musicOk} onValueChange={setMusicOk} />
              <Option label="Climatisation" value={airConditioning} onValueChange={setAirConditioning} />
            </View>
          )}

          <TextInput style={[styles.input, { height: 90 }]} multiline placeholder="Notes pour les passagers (facultatif)" placeholderTextColor="#64748b" value={notes} onChangeText={setNotes} />

          <TouchableOpacity style={styles.cta} onPress={publish} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Publier (1 crédit)</Text>}</TouchableOpacity>
          <TouchableOpacity style={[styles.cta, styles.ctaSecondary]} onPress={back}><Text style={[styles.ctaText, { color: '#e5e7eb' }]}>Retour</Text></TouchableOpacity>
        </>
      )}
    </View>
  );
}

function Option({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={styles.optRow}>
      <Text style={styles.optLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  input: { backgroundColor: '#0f172a', color: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, borderWidth: 1, borderColor: '#1f2937' },
  row: { flexDirection: 'row' },
  rowAlign: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  flex: { flex: 1 },
  label: { color: '#e5e7eb', fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  stepTxt: { color: '#e5e7eb', fontSize: 18, fontWeight: '800' },
  seatsVal: { color: '#e5e7eb', fontWeight: '800', minWidth: 20, textAlign: 'center' },
  section: { backgroundColor: '#0f172a', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937', marginBottom: 10 },
  sectionTitle: { color: '#e5e7eb', fontWeight: '800', marginBottom: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  optLabel: { color: '#e5e7eb' },
  cta: { backgroundColor: '#06b6d4', borderRadius: 10, alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  ctaText: { color: '#0b1220', fontWeight: '800' },
  note: { color: '#94a3b8', marginTop: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937' },
  chipActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  chipText: { color: '#e5e7eb', fontWeight: '700' },
  chipTextActive: { color: '#0b1220' },
  ctaDisabled: { opacity: 0.5 },
  ctaSecondary: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937' },
});