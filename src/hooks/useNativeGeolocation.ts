import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks';

interface Position {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export const useNativeGeolocation = () => {
  const [isNative, setIsNative] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  const getCurrentPosition = async (): Promise<Position | null> => {
    if (!isNative) {
      // Fallback pour le web
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject('Géolocalisation non supportée');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const position: Position = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude || undefined,
              speed: pos.coords.speed || undefined,
              heading: pos.coords.heading || undefined,
              timestamp: pos.timestamp,
            };
            resolve(position);
          },
          (err) => reject(err.message),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      });
    }

    try {
      // Demander les permissions
      const permissions = await Geolocation.requestPermissions();
      if (permissions.location !== 'granted') {
        throw new Error('Permission de géolocalisation refusée');
      }

      // Obtenir la position actuelle
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const newPosition: Position = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        altitude: coordinates.coords.altitude || undefined,
        speed: coordinates.coords.speed || undefined,
        heading: coordinates.coords.heading || undefined,
        timestamp: coordinates.timestamp,
      };

      setPosition(newPosition);
      setError(null);
      return newPosition;
    } catch (error: any) {
      console.error('Error getting position:', error);
      setError(error.message);
      toast({
        title: 'Erreur de géolocalisation',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const startTracking = async (callback?: (position: Position) => void) => {
    if (isTracking) return;

    try {
      let id: string;

      if (isNative) {
        // Utiliser l'API Capacitor
        id = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
          },
          (position, err) => {
            if (err) {
              console.error('Error watching position:', err);
              setError(err.message);
              return;
            }

            if (position) {
              const newPosition: Position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                speed: position.coords.speed || undefined,
                heading: position.coords.heading || undefined,
                timestamp: position.timestamp,
              };

              setPosition(newPosition);
              setError(null);
              callback?.(newPosition);
            }
          }
        );
      } else {
        // Fallback pour le web
        id = navigator.geolocation.watchPosition(
          (pos) => {
            const newPosition: Position = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude || undefined,
              speed: pos.coords.speed || undefined,
              heading: pos.coords.heading || undefined,
              timestamp: pos.timestamp,
            };

            setPosition(newPosition);
            setError(null);
            callback?.(newPosition);
          },
          (err) => {
            console.error('Error watching position:', err);
            setError(err.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        ).toString();
      }

      setWatchId(id);
      setIsTracking(true);
    } catch (error: any) {
      console.error('Error starting tracking:', error);
      setError(error.message);
      toast({
        title: 'Erreur de suivi',
        description: 'Impossible de démarrer le suivi GPS',
        variant: 'destructive',
      });
    }
  };

  const stopTracking = async () => {
    if (!isTracking || !watchId) return;

    try {
      if (isNative) {
        await Geolocation.clearWatch({ id: watchId });
      } else {
        navigator.geolocation.clearWatch(parseInt(watchId));
      }

      setWatchId(null);
      setIsTracking(false);
    } catch (error: any) {
      console.error('Error stopping tracking:', error);
      setError(error.message);
    }
  };

  return {
    isNative,
    position,
    isTracking,
    error,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
};