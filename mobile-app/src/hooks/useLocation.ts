import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export const useLocation = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        Toast.show({
          type: 'warning',
          text1: 'Permission limitée',
          text2: 'La localisation en arrière-plan n\'est pas autorisée',
        });
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      Toast.show({
        type: 'error',
        text1: 'Erreur de permission',
        text2: err.message,
      });
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      setError(err.message);
      Toast.show({
        type: 'error',
        text1: 'Erreur de localisation',
        text2: err.message,
      });
      return null;
    }
  };

  const startTracking = async (missionId: string) => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setIsTracking(true);
      
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 secondes
          distanceInterval: 10, // 10 mètres
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            speed: location.coords.speed || undefined,
            heading: location.coords.heading || undefined,
          };

          setLocation(locationData);

          // Sauvegarder en base
          if (user?.id) {
            await supabase.from('mission_tracking').insert({
              mission_id: missionId,
              driver_id: user.id,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              speed: locationData.speed,
              heading: locationData.heading,
            });
          }
        }
      );

      return subscription;
    } catch (err: any) {
      setError(err.message);
      setIsTracking(false);
      Toast.show({
        type: 'error',
        text1: 'Erreur de suivi',
        text2: err.message,
      });
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return {
    location,
    isTracking,
    error,
    getCurrentLocation,
    startTracking,
    stopTracking,
    requestPermissions,
  };
};