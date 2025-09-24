import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../config/supabase';

export default function CovoiturageTripDetails({ route }: any) {
  const ride = route?.params?.ride;
  const [loading, setLoading] = useState<'reserve'|'contact'|null>(null);
  const [hasReservation, setHasReservation] = useState<boolean>(false);
  const [reservationStatus, setReservationStatus] = useState<'none'|'pending'|'accepted'|'rejected'>("none");
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-credits');
      if (!error && typeof data?.credits === 'number') setCredits(data.credits);
    } catch {}
  };

  const reserveRide = async () => {
    if (!ride?.id) return;
    setLoading('reserve');
    try {
      // Edge Function: débite 1 crédit, crée la réservation (pending) et renvoie le solde
      const { data, error } = await supabase.functions.invoke('covoiturage-reserver', {
        body: { rideId: ride.id },
      });
      if (error) throw error;
      setHasReservation(true);
      setReservationStatus('pending');
      if (typeof data?.credits === 'number') setCredits(data.credits);
      Alert.alert('Réservation envoyée', "Votre demande est en attente d'acceptation. Si refusée, le crédit sera remboursé automatiquement.");
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || "Impossible d'envoyer la réservation");
    } finally {
      setLoading(null);
    }
  };

  const contactDriver = async () => {
    setLoading('contact');
    try {
      // Optionnel: créer un thread de message si inexistant
      const { error } = await supabase.functions.invoke('covoiturage-contact', {
        body: { rideId: ride?.id },
      });
      if (error) throw error;
      Alert.alert('Message', 'Conversation ouverte avec le conducteur.');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de contacter le conducteur');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du trajet</Text>
      {ride ? (
        <>
          <Text style={styles.field}>De: <Text style={styles.value}>{ride.departure}</Text></Text>
          <Text style={styles.field}>À: <Text style={styles.value}>{ride.destination}</Text></Text>
          <Text style={styles.field}>Prix: <Text style={styles.value}>{ride.price} €</Text></Text>
        </>
      ) : (
        <Text style={styles.empty}>Sélectionnez un trajet pour voir les détails.</Text>
      )}

      <View style={{ height: 12 }} />

      <TouchableOpacity style={styles.primaryBtn} onPress={reserveRide} disabled={loading!==null}>
        {loading==='reserve' ? (
          <ActivityIndicator color="#0ea5e9" />
        ) : (
          <Text style={styles.primaryText}>Réserver (1 crédit)</Text>
        )}
      </TouchableOpacity>

      {hasReservation && (
        <TouchableOpacity style={styles.secondaryBtn} onPress={contactDriver} disabled={loading!==null}>
          {loading==='contact' ? (
            <ActivityIndicator color="#06b6d4" />
          ) : (
            <Text style={styles.secondaryText}>Contacter le conducteur</Text>
          )}
        </TouchableOpacity>
      )}

      {credits!==null && (
        <Text style={styles.credits}>Crédits disponibles: {credits}</Text>
      )}

      {reservationStatus==='pending' && (
        <Text style={styles.info}>Réservation en attente. En cas de refus, remboursement automatique de 1 crédit.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 12 },
  empty: { color: '#9ca3af' },
  field: { color: '#9ca3af', marginTop: 6 },
  value: { color: '#e5e7eb', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  primaryText: { color: 'white', fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#0b3850', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#06b6d4' },
  secondaryText: { color: '#06b6d4', fontWeight: '800' },
  credits: { color: '#e5e7eb', marginTop: 12 },
  info: { color: '#f59e0b', marginTop: 6 },
});