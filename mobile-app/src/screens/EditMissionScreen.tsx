import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMission } from '../hooks/useMissions';
import { supabase } from '../config/supabase';
import Toast from 'react-native-toast-message';

type RouteParams = {
  EditMission: { missionId: string };
};

const EditMissionScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'EditMission'>>();
  const nav = useNavigation<any>();
  const missionId = (route.params as any)?.missionId as string;
  const { data: mission, isLoading } = useMission(missionId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (mission) {
      setTitle(mission.title || '');
      setDescription(mission.description || '');
      setVehicleType(mission.vehicle_type || '');
      setLicensePlate(mission.license_plate || '');
      setVehicleBrand(mission.vehicle_brand || '');
      setVehicleModel(mission.vehicle_model || '');
      setVehicleYear(mission.vehicle_year ? String(mission.vehicle_year) : '');
      setPickupAddress(mission.pickup_address || '');
      setDeliveryAddress(mission.delivery_address || '');
    }
  }, [mission]);

  const save = async () => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({
          title: title.trim(),
          description: description || null,
          vehicle_type: vehicleType || null,
          license_plate: licensePlate || null,
          vehicle_brand: vehicleBrand || null,
          vehicle_model: vehicleModel || null,
          vehicle_year: vehicleYear ? Number(vehicleYear) : null,
          pickup_address: pickupAddress || null,
          delivery_address: deliveryAddress || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Mission mise à jour' });
      nav.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: e?.message || 'Sauvegarde impossible' });
    }
  };

  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Modifier la mission</Text>

      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titre" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Description" multiline />

      <Text style={styles.section}>Véhicule</Text>
      <Text style={styles.label}>Type</Text>
      <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder="Type de véhicule" />
      <Text style={styles.label}>Immatriculation</Text>
      <TextInput style={styles.input} value={licensePlate} onChangeText={setLicensePlate} placeholder="AA-123-BB" />
      <Text style={styles.label}>Marque</Text>
      <TextInput style={styles.input} value={vehicleBrand} onChangeText={setVehicleBrand} placeholder="Marque" />
      <Text style={styles.label}>Modèle</Text>
      <TextInput style={styles.input} value={vehicleModel} onChangeText={setVehicleModel} placeholder="Modèle" />
      <Text style={styles.label}>Année</Text>
      <TextInput style={styles.input} value={vehicleYear} onChangeText={setVehicleYear} placeholder="2021" keyboardType="numeric" />

      <Text style={styles.section}>Logistique</Text>
      <Text style={styles.label}>Adresse départ</Text>
      <TextInput style={styles.input} value={pickupAddress} onChangeText={setPickupAddress} placeholder="Adresse de départ" />
      <Text style={styles.label}>Adresse arrivée</Text>
      <TextInput style={styles.input} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Adresse d'arrivée" />

      <TouchableOpacity style={styles.btnPrimary} onPress={save}>
        <Text style={styles.btnText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#111827' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8, color: '#111827' },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  btnPrimary: { marginTop: 20, backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
});

export default EditMissionScreen;
