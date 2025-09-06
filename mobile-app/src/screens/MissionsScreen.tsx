import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMissions, useUpdateMissionStatus } from '../hooks/useMissions';
import { Mission } from '../types';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { tokens } from '../theme';

export const MissionsScreen: React.FC = () => {
  const { data: missions, isLoading, refetch } = useMissions();
  const updateMissionStatus = useUpdateMissionStatus();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [createVisible, setCreateVisible] = useState(false);
  // Champs similaires au web
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Véhicule
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  // Logistique départ
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupContactName, setPickupContactName] = useState('');
  const [pickupContactPhone, setPickupContactPhone] = useState('');
  const [pickupContactEmail, setPickupContactEmail] = useState('');
  const [pickupDate, setPickupDate] = useState(''); // YYYY-MM-DD
  const [pickupTime, setPickupTime] = useState(''); // HH:mm
  // Logistique arrivée
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryContactName, setDeliveryContactName] = useState('');
  const [deliveryContactPhone, setDeliveryContactPhone] = useState('');
  const [deliveryContactEmail, setDeliveryContactEmail] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  // Assignation
  const [assignedTo, setAssignedTo] = useState<'self' | 'contact'>('self');
  const [contacts, setContacts] = useState<Array<{ id: string; invited_user_id?: string | null; name?: string | null; email: string; status: string }>>([]);
  const [selectedContactUserId, setSelectedContactUserId] = useState<string | null>(null);
  // Revenus
  const [donorEarning, setDonorEarning] = useState('');
  const [driverEarning, setDriverEarning] = useState('');
  const [creating, setCreating] = useState(false);

  const openCreateIfRequested = () => {
    // @ts-ignore: accès permissif aux params
    const params = (navigation as any).getState?.()?.routes?.find((r: any) => r.name === 'Missions')?.params;
    if (params?.openCreate) {
      setCreateVisible(true);
      // Nettoyer le flag pour éviter réouverture
      // @ts-ignore
      (navigation as any).setParams?.({ openCreate: undefined });
    }
  };

  useEffect(() => {
    openCreateIfRequested();
  }, []);

  // Charger contacts acceptés pour l'assignation
  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('contacts')
        .select('id, invited_user_id, name, email, status')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
      if (!error) setContacts(data || []);
    };
    loadContacts();
  }, [user?.id, createVisible]);

  const generateReference = () => {
    const now = new Date();
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `FC-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  // Parsing robuste des dates saisies (YYYY-MM-DD) et heures (HH:mm), en UTC pour éviter les décalages de fuseau
  const combineDateTime = (date: string, time: string) => {
    const dateStr = (date || '').trim();
    const timeStr = (time || '').trim();
    if (!dateStr) return null;

    const mDate = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStr);
    if (!mDate) return null;
    const y = Number(mDate[1]);
    const mo = Number(mDate[2]);
    const d = Number(mDate[3]);
    // Validité simple du calendrier
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

  // Formatage manuel en FR (évite Intl/toLocaleDateString instables sur RN/Hermes)
  const formatDateFR = (isoLike: string | null | undefined) => {
    if (!isoLike) return '';
    const dt = new Date(isoLike);
    if (isNaN(dt.getTime())) return '';
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const dd = dt.getUTCDate();
    const mo = dt.getUTCMonth();
    const hh = String(dt.getUTCHours()).padStart(2, '0');
    const mm = String(dt.getUTCMinutes()).padStart(2, '0');
    return `${dd} ${months[mo]} ${hh}:${mm}`;
  };

  const createMission = async () => {
    if (!user?.id) return;
    if (!title.trim() || !vehicleType.trim() || !donorEarning || !driverEarning) {
      Toast.show({ type: 'error', text1: 'Champs requis manquants', text2: 'Titre, type de véhicule, revenus donneur et convoyeur' });
      return;
    }

    setCreating(true);
    try {
      // Consommer 1 crédit (comme sur le web)
      const { data: creditOk, error: creditErr } = await supabase.rpc('consume_credit', {
        _user_id: user.id,
        _mission_id: null,
        _credits: 1,
        _type: 'mission_creation',
        _description: "Création d'une mission (mobile)"
      });
      if (creditErr || !creditOk) throw new Error('Crédits insuffisants pour créer une mission.');

      // Mapping driver_id
      const driverId = assignedTo === 'self' ? user.id : (selectedContactUserId || null);

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
      };

      const { error } = await supabase.from('missions').insert(payload);
      if (error) throw error;

      setCreateVisible(false);
      // reset
      setTitle(''); setDescription('');
      setVehicleType(''); setLicensePlate(''); setVehicleBrand(''); setVehicleModel(''); setVehicleYear('');
      setPickupAddress(''); setPickupContactName(''); setPickupContactPhone(''); setPickupContactEmail(''); setPickupDate(''); setPickupTime('');
      setDeliveryAddress(''); setDeliveryContactName(''); setDeliveryContactPhone(''); setDeliveryContactEmail(''); setDeliveryDate(''); setDeliveryTime('');
      setAssignedTo('self'); setSelectedContactUserId(null);
      setDonorEarning(''); setDriverEarning('');
      await queryClient.invalidateQueries({ queryKey: ['missions'] });
      Toast.show({ type: 'success', text1: 'Mission créée' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Création impossible' });
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = (missionId: string, newStatus: string) => {
    updateMissionStatus.mutate({ missionId, status: newStatus });
    setModalVisible(false);
  };

  const openMissionDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#2563eb';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const renderMissionItem = ({ item: mission }: { item: Mission }) => (
    <TouchableOpacity
      style={styles.missionCard}
      onPress={() => openMissionDetails(mission)}
    >
      <View style={styles.missionHeader}>
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionRef}>Réf: {mission.reference}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mission.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(mission.status)}</Text>
        </View>
      </View>

      <View style={styles.missionDetails}>
        {mission.pickup_address && (
          <View style={styles.addressRow}>
            <Ionicons name="arrow-up-circle-outline" size={16} color="#10b981" />
            <Text style={styles.addressText} numberOfLines={1}>
              {mission.pickup_address}
            </Text>
          </View>
        )}
        {mission.delivery_address && (
          <View style={styles.addressRow}>
            <Ionicons name="arrow-down-circle-outline" size={16} color="#ef4444" />
            <Text style={styles.addressText} numberOfLines={1}>
              {mission.delivery_address}
            </Text>
          </View>
        )}
      </View>

      {mission.pickup_date && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.dateText}>{formatDateFR(mission.pickup_date)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
  <View style={styles.container}>
      {/* Bouton d'ajout en haut de liste */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
  <TouchableOpacity style={{ alignSelf: 'flex-start', backgroundColor: tokens.colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => {
          // @ts-ignore
          navigation.navigate('NewMissionWizard');
        }}>
          <Ionicons name="add" size={18} color={tokens.colors.onPrimary} />
          <Text style={{ color: tokens.colors.onPrimary, fontWeight: '600' }}>Nouvelle mission</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={missions}
        renderItem={renderMissionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune mission assignée</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedMission && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMission.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalRef}>Référence: {selectedMission.reference}</Text>
              
              {selectedMission.description && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.sectionText}>{selectedMission.description}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Adresses</Text>
                {selectedMission.pickup_address && (
                  <View style={styles.addressDetail}>
                    <Text style={styles.addressLabel}>Enlèvement</Text>
                    <Text style={styles.addressValue}>{selectedMission.pickup_address}</Text>
                  </View>
                )}
                {selectedMission.delivery_address && (
                  <View style={styles.addressDetail}>
                    <Text style={styles.addressLabel}>Livraison</Text>
                    <Text style={styles.addressValue}>{selectedMission.delivery_address}</Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statut actuel</Text>
                <View style={[styles.currentStatus, { backgroundColor: getStatusColor(selectedMission.status) }]}>
                  <Text style={styles.currentStatusText}>
                    {getStatusLabel(selectedMission.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#0ea5e9' }]}
                  onPress={() => {
                    setModalVisible(false);
                    // Naviguer vers l'onglet Inspection avec mission pré‑sélectionnée
                    // @ts-ignore – on n'impose pas de types nav ici
                    navigation.navigate('Inspection', { missionId: selectedMission.id });
                  }}
                >
                  <Text style={styles.actionButtonText}>Ouvrir l'état des lieux</Text>
                </TouchableOpacity>

                {selectedMission.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2563eb' }]}
                    onPress={() => handleStatusUpdate(selectedMission.id, 'in_progress')}
                  >
                    <Text style={styles.actionButtonText}>Démarrer la mission</Text>
                  </TouchableOpacity>
                )}
                
                {selectedMission.status === 'in_progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                    onPress={() => handleStatusUpdate(selectedMission.id, 'completed')}
                  >
                    <Text style={styles.actionButtonText}>Terminer la mission</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>

  {/* Modale remplacée par un wizard dédié (navigation) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  listContainer: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionInfo: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: 4,
  },
  missionRef: {
    fontSize: 14,
    color: tokens.colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  missionDetails: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: tokens.colors.onSurface,
    marginLeft: 8,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: tokens.colors.onSurface,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: tokens.colors.onSurface,
    marginTop: 16,
  },
  formLabel: { fontSize: 14, color: tokens.colors.onSurface, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: tokens.colors.surface, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: 8, padding: 12, marginBottom: 12 },
  createButton: { backgroundColor: tokens.colors.primary, padding: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createButtonText: { color: tokens.colors.onPrimary, fontWeight: '700' },
  sectionMinorTitle: { fontSize: 16, fontWeight: '700', color: tokens.colors.onSurface, marginTop: 8, marginBottom: 8 },
  chipSmall: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: tokens.colors.border, borderRadius: 999 },
  chipActive: { backgroundColor: tokens.colors.primary },
  chipText: { color: tokens.colors.onSurface, fontWeight: '600' },
  chipTextActive: { color: tokens.colors.onPrimary },
  modalContainer: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: tokens.colors.onSurface,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalRef: {
    fontSize: 16,
    color: tokens.colors.onSurface,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.onSurface,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: tokens.colors.onSurface,
    lineHeight: 20,
  },
  addressDetail: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.onSurface,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: tokens.colors.onSurface,
  },
  currentStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currentStatusText: {
  color: tokens.colors.onPrimary,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
  color: tokens.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});