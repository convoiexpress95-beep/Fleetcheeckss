import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useMyFavoriteRides, useRequestRide, useToggleFavoriteRide } from '../hooks/useRides';
import { useThemedStyles } from '../ui/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';

type ParamList = {
  RideDetail: { ride: any };
};

const RideDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<ParamList, 'RideDetail'>>();
  const { styles: t, colors } = useThemedStyles();
  const nav = useNavigation();
  const ride = route.params?.ride;
  const { data: fav } = useMyFavoriteRides();
  const isFav = !!(fav || []).find((r: any) => r.id === ride?.id);
  const toggleFav = useToggleFavoriteRide();
  const requestRide = useRequestRide();

  if (!ride) return null;

  return (
    <View style={[t.container, { padding: 16 }]}> 
      <Text style={t.title}>Trajet</Text>
      <View style={[t.card, { marginTop: 12, gap: 8 }]}> 
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{ride.from} → {ride.to}</Text>
        <Text style={t.mutedSmall}>{ride.date} • {ride.departureTime}{ride.arrivalTime ? ` → ${ride.arrivalTime}` : ''}</Text>
        {ride.durationMin ? (
          <Text style={t.mutedSmall}>Durée: {Math.round(ride.durationMin/60)}h{(ride.durationMin%60).toString().padStart(2,'0')}</Text>
        ) : null}
        <Text style={t.mutedSmall}>Places: {ride.seatsAvailable}/{ride.seats}</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{ride.pricePerSeat}€ / place</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563eb', flex: 1 }]} onPress={() => requestRide.mutate({ ride_id: ride.id, seats_requested: 1 })}>
          <Text style={styles.btnText}>{ride.instant ? 'Réserver' : 'Demander'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: isFav ? '#f59e0b' : '#6b7280' }]} onPress={() => toggleFav.mutate({ ride_id: ride.id, isFav })}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#10b981', marginTop: 12 }]} onPress={() => (nav as any).navigate('RideChat', { ride_id: ride.id, recipient_id: ride.user_id || null })}>
        <Text style={styles.btnText}>Contacter le conducteur</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: { padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
});

export default RideDetailScreen;