import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCredits } from '../hooks/useCredits';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const stepsTitles = [
  'Informations générales',
  'Véhicule',
  'Départ',
  'Arrivée',
  'Assignation',
  'Revenus',
  'Récapitulatif'
];

export const NewMissionWizard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const { balance, loading: creditsLoading } = useCredits();
  type ContactLite = { id: string; invited_user_id: string | null; name: string | null; email: string; status: string };
  const [contacts, setContacts] = useState<ContactLite[]>([]);
  const [selectedContactUserId, setSelectedContactUserId] = useState<string | null>(null);

  // Etat du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupContactName, setPickupContactName] = useState('');
  const [pickupContactPhone, setPickupContactPhone] = useState('');
  const [pickupContactEmail, setPickupContactEmail] = useState('');
  const [pickupDate, setPickupDate] = useState(''); // YYYY-MM-DD
  const [pickupTime, setPickupTime] = useState(''); // HH:mm
  const [showPickupDate, setShowPickupDate] = useState(false);
  const [showPickupTime, setShowPickupTime] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryContactName, setDeliveryContactName] = useState('');
  const [deliveryContactPhone, setDeliveryContactPhone] = useState('');
  const [deliveryContactEmail, setDeliveryContactEmail] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [showDeliveryDate, setShowDeliveryDate] = useState(false);
  const [showDeliveryTime, setShowDeliveryTime] = useState(false);

  const [assignedTo, setAssignedTo] = useState<'self' | 'contact' | 'none'>('self');

  const [donorEarning, setDonorEarning] = useState('');
  const [driverEarning, setDriverEarning] = useState('');

  const generateReference = () => {
    const now = new Date();
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `FC-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  const combineDateTime = (date: string, time: string) => {
    const dateStr = (date || '').trim();
    const timeStr = (time || '').trim();
    if (!dateStr) return null;
    const mDate = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStr);
    if (!mDate) return null;
    const y = Number(mDate[1]);
    const mo = Number(mDate[2]);
    const d = Number(mDate[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    if (!timeStr) {
      const dt = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0));
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    }
    const mTime = /^([0-9]{2}):([0-9]{2})$/.exec(timeStr);
    if (!mTime) return null;
    const hh = parseInt(mTime[1], 10);
    const mm = parseInt(mTime[2], 10);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    const dt = new Date(Date.UTC(y, mo - 1, d, hh, mm, 0, 0));
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  };

  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.id) return;
  const { data, error } = await supabase
        .from('contacts')
        .select('id, invited_user_id, name, email, status')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
  if (!error) setContacts(((data as any[]) || []) as ContactLite[]);
    };
    loadContacts();
  }, [user?.id]);

  const validateStep = (s: Step): boolean => {
    switch (s) {
      case 0: return !!title.trim();
      case 1: return !!vehicleType.trim();
      case 2: return !!pickupAddress.trim();
      case 3: return !!deliveryAddress.trim();
      case 4: return ['self','none'].includes(assignedTo);
      case 5: return !!donorEarning && !!driverEarning;
      default: return true;
    }
  };

  const next = () => {
    if (!validateStep(step)) {
      Toast.show({ type: 'error', text1: 'Champs requis manquants' });
      return;
    }
    setStep((prev) => (Math.min(6, prev + 1) as Step));
  };

  const prev = () => setStep((prev) => (Math.max(0, prev - 1) as Step));

  const submit = async () => {
    if (!user?.id) return;
    if (!validateStep(5)) {
      Toast.show({ type: 'error', text1: 'Champs requis manquants' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: creditOk, error: creditErr } = await supabase.rpc('consume_credit', {
        _user_id: user.id,
        _mission_id: null,
        _credits: 1,
        _type: 'mission_creation',
        _description: "Création d'une mission (mobile)"
      });
      if (creditErr || !creditOk) throw new Error('Crédits insuffisants');

  const driverId = assignedTo === 'self' ? user.id : (assignedTo === 'contact' ? (selectedContactUserId || null) : null);
  const payload: any = {
        title: title.trim(),
        description: description || null,
        vehicle_type: vehicleType,
        license_plate: licensePlate || null,
        vehicle_brand: vehicleBrand || null,
        vehicle_model: vehicleModel || null,
        vehicle_year: vehicleYear ? Number(vehicleYear) : null,
        pickup_address: pickupAddress || null,
        pickup_contact_name: pickupContactName || null,
        pickup_contact_phone: pickupContactPhone || null,
        pickup_contact_email: pickupContactEmail || null,
        pickup_date: combineDateTime(pickupDate, pickupTime),
        delivery_address: deliveryAddress || null,
        delivery_contact_name: deliveryContactName || null,
        delivery_contact_phone: deliveryContactPhone || null,
        delivery_contact_email: deliveryContactEmail || null,
        delivery_date: combineDateTime(deliveryDate, deliveryTime),
        donor_earning: donorEarning ? Number(donorEarning) : null,
        driver_earning: driverEarning ? Number(driverEarning) : null,
        reference: generateReference(),
        created_by: user.id,
        driver_id: driverId,
  status: 'pending',
  kind: 'inspection',
      };

      const { error } = await supabase.from('missions').insert(payload);
      if (error) throw error;

      Toast.show({ type: 'success', text1: 'Mission créée' });
      // @ts-ignore navigation permissif
      navigation.navigate('Missions');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Création impossible' });
    } finally {
      setSubmitting(false);
    }
  };

  const StepHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>Nouvelle mission</Text>
        <Text style={styles.creditInfo}>
          {creditsLoading ? 'Chargement crédits…' : (balance?.plan_type === 'illimite' ? 'Plan illimité' : `${balance?.credits_remaining ?? 0} crédits`)}
        </Text>
      </View>
      <View style={{ width: 24 }} />
    </View>
  );

  const Progress = () => (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${(step / 6) * 100}%` }]} />
    </View>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.sectionTitle}>{children}</Text>
  );

  const Footer = () => (
    <View style={styles.footer}>
      {step > 0 && (
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={prev}>
          <Text style={styles.btnSecondaryText}>Précédent</Text>
        </TouchableOpacity>
      )}
      {step < 6 ? (
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={next}>
          <Text style={styles.btnPrimaryText}>Suivant</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.btn, styles.btnPrimary, submitting && { opacity: 0.7 }]} onPress={submit} disabled={submitting}>
          <Ionicons name="save" color="#fff" size={18} />
          <Text style={[styles.btnPrimaryText, { marginLeft: 8 }]}>{submitting ? 'Création…' : 'Créer la mission'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StepHeader />
      <Progress />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.stepTitle}>{stepsTitles[step]}</Text>

        {step === 0 && (
          <View>
            <SectionTitle>Infos générales</SectionTitle>
            <TextInput placeholder="Titre *" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} multiline />
          </View>
        )}

        {step === 1 && (
          <View>
            <SectionTitle>Véhicule</SectionTitle>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {['leger','utilitaire','poids_lourd'].map(t => (
                <TouchableOpacity key={t} style={[styles.chip, vehicleType === t && styles.chipActive]} onPress={() => setVehicleType(t)}>
                  <Text style={[styles.chipText, vehicleType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="Immatriculation" value={licensePlate} onChangeText={setLicensePlate} style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput placeholder="Marque" value={vehicleBrand} onChangeText={setVehicleBrand} style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="Modèle" value={vehicleModel} onChangeText={setVehicleModel} style={[styles.input, { flex: 1 }]} />
            </View>
            <TextInput placeholder="Année" value={vehicleYear} onChangeText={setVehicleYear} keyboardType="number-pad" style={styles.input} />
          </View>
        )}

        {step === 2 && (
          <View>
            <SectionTitle>Départ</SectionTitle>
            <TextInput placeholder="Adresse de départ *" value={pickupAddress} onChangeText={setPickupAddress} style={styles.input} />
            <TextInput placeholder="Contact (nom)" value={pickupContactName} onChangeText={setPickupContactName} style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput placeholder="Téléphone" value={pickupContactPhone} onChangeText={setPickupContactPhone} style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="Email" value={pickupContactEmail} onChangeText={setPickupContactEmail} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { flex: 1 }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: 'center' }]} onPress={() => setShowPickupDate(true)}>
                <Text style={{ color: pickupDate ? '#111827' : '#6b7280' }}>{pickupDate || 'Date (YYYY-MM-DD)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: 'center' }]} onPress={() => setShowPickupTime(true)}>
                <Text style={{ color: pickupTime ? '#111827' : '#6b7280' }}>{pickupTime || 'Heure (HH:mm)'}</Text>
              </TouchableOpacity>
            </View>
            {showPickupDate && (
              <DateTimePicker
                value={pickupDate ? new Date(pickupDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_event: any, d?: Date) => {
                  setShowPickupDate(Platform.OS === 'android' ? false : true);
                  if (d) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    setPickupDate(`${y}-${m}-${day}`);
                  }
                }}
              />
            )}
            {showPickupTime && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event: any, d?: Date) => {
                  setShowPickupTime(Platform.OS === 'android' ? false : true);
                  if (d) {
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    setPickupTime(`${hh}:${mm}`);
                  }
                }}
              />
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <SectionTitle>Arrivée</SectionTitle>
            <TextInput placeholder="Adresse d'arrivée *" value={deliveryAddress} onChangeText={setDeliveryAddress} style={styles.input} />
            <TextInput placeholder="Contact (nom)" value={deliveryContactName} onChangeText={setDeliveryContactName} style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput placeholder="Téléphone" value={deliveryContactPhone} onChangeText={setDeliveryContactPhone} style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="Email" value={deliveryContactEmail} onChangeText={setDeliveryContactEmail} autoCapitalize="none" keyboardType="email-address" style={[styles.input, { flex: 1 }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: 'center' }]} onPress={() => setShowDeliveryDate(true)}>
                <Text style={{ color: deliveryDate ? '#111827' : '#6b7280' }}>{deliveryDate || 'Date (YYYY-MM-DD)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: 'center' }]} onPress={() => setShowDeliveryTime(true)}>
                <Text style={{ color: deliveryTime ? '#111827' : '#6b7280' }}>{deliveryTime || 'Heure (HH:mm)'}</Text>
              </TouchableOpacity>
            </View>
            {showDeliveryDate && (
              <DateTimePicker
                value={deliveryDate ? new Date(deliveryDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_event: any, d?: Date) => {
                  setShowDeliveryDate(Platform.OS === 'android' ? false : true);
                  if (d) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    setDeliveryDate(`${y}-${m}-${day}`);
                  }
                }}
              />
            )}
            {showDeliveryTime && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event: any, d?: Date) => {
                  setShowDeliveryTime(Platform.OS === 'android' ? false : true);
                  if (d) {
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    setDeliveryTime(`${hh}:${mm}`);
                  }
                }}
              />
            )}
          </View>
        )}

        {step === 4 && (
          <View>
            <SectionTitle>Assignation</SectionTitle>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['self','contact','none'] as const).map(opt => (
                <TouchableOpacity key={opt} style={[styles.chip, assignedTo === opt && styles.chipActive]} onPress={() => setAssignedTo(opt)}>
                  <Text style={[styles.chipText, assignedTo === opt && styles.chipTextActive]}>
                    {opt === 'self' ? "Me l'assigner" : opt === 'contact' ? 'Assigner à un contact' : 'Non assignée'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {assignedTo === 'contact' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {contacts.length === 0 ? (
                  <Text style={{ color: '#6b7280' }}>Aucun contact accepté. Gérez vos contacts dans l’onglet Contacts.</Text>
                ) : (
                  contacts.map(c => (
                    <TouchableOpacity key={c.id} style={[styles.chip, selectedContactUserId === c.invited_user_id && styles.chipActive]} onPress={() => setSelectedContactUserId(c.invited_user_id || null)}>
                      <Text style={[styles.chipText, selectedContactUserId === c.invited_user_id && styles.chipTextActive]}>{c.name || c.email}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {step === 5 && (
          <View>
            <SectionTitle>Revenus</SectionTitle>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput placeholder="Donneur (€) *" value={donorEarning} onChangeText={setDonorEarning} keyboardType="decimal-pad" style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="Convoyeur (€) *" value={driverEarning} onChangeText={setDriverEarning} keyboardType="decimal-pad" style={[styles.input, { flex: 1 }]} />
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <SectionTitle>Vérification</SectionTitle>
            <Text style={styles.summaryItem}>Titre: <Text style={styles.summaryValue}>{title || '-'}</Text></Text>
            <Text style={styles.summaryItem}>Type: <Text style={styles.summaryValue}>{vehicleType || '-'}</Text></Text>
            <Text style={styles.summaryItem}>Départ: <Text style={styles.summaryValue}>{pickupAddress || '-'}</Text></Text>
            <Text style={styles.summaryItem}>Arrivée: <Text style={styles.summaryValue}>{deliveryAddress || '-'}</Text></Text>
            <Text style={styles.summaryItem}>Assignation: <Text style={styles.summaryValue}>{assignedTo === 'self' ? 'Moi' : 'Aucun'}</Text></Text>
            <Text style={styles.summaryItem}>Revenus: <Text style={styles.summaryValue}>{donorEarning || 0}€ / {driverEarning || 0}€</Text></Text>
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  creditInfo: { fontSize: 12, color: '#6b7280' },
  progressBar: { height: 4, backgroundColor: '#e5e7eb' },
  progressFill: { height: 4, backgroundColor: '#2563eb' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#e5e7eb', borderRadius: 999 },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#111827', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: 'white', fontWeight: '700' },
  btnSecondary: { backgroundColor: '#f3f4f6' },
  btnSecondaryText: { color: '#111827', fontWeight: '700' },
  summaryItem: { color: '#374151', marginBottom: 6 },
  summaryValue: { fontWeight: '700' },
});

export default NewMissionWizard;
